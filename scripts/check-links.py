"""Read-only audit of public RRUK pages, redirects and assets.

Usage: python scripts/check-links.py https://retroreplay.uk /absolute/report.json
Never follows redirects automatically or requests another origin. Authentication
boundaries are recorded without visiting them. No form, checkout or API writes.
"""
import concurrent.futures
import datetime
import html.parser
import json
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = (sys.argv[1] if len(sys.argv) > 1 else 'https://retroreplay.uk').rstrip('/')
OUTPUT = Path(sys.argv[2]) if len(sys.argv) > 2 else None
HOST = urllib.parse.urlsplit(ORIGIN).netloc
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; RRUKLinkCheck/1.0)', 'Cache-Control': 'no-cache'}
EXCLUDED = ('/api/', '/order/', '/signin', '/signout', '/sign-in', '/sign-out', '/auth/', '/.well-known/', '/admin')


class Document(html.parser.HTMLParser):
    def __init__(self, body):
        super().__init__(convert_charrefs=True)
        self.links, self.assets, self.ids = set(), set(), set()
        self.feed(body)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.add(a['href'])
        if tag in ('img', 'script', 'source') and a.get('src'):
            self.assets.add(a['src'])
        if tag == 'link' and a.get('href') and set(a.get('rel', '').split()) & {'stylesheet', 'icon', 'preload', 'modulepreload'}:
            self.assets.add(a['href'])


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def internal(href, current='/'):
    url = urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN + current, href))
    if url.scheme != 'https' or url.netloc != HOST or url.path.startswith(EXCLUDED):
        return None
    query = urllib.parse.urlencode([(k, v) for k, v in urllib.parse.parse_qsl(url.query) if not k.startswith('utm_')])
    return url.path + ('?' + query if query else '')


def fetch(path):
    url = urllib.parse.urljoin(ORIGIN + '/', path)
    if internal(url) is None:
        return {'path': path, 'status': 0, 'error': 'Outside public RRUK audit scope', 'body': b'', 'mime': ''}
    try:
        request = urllib.request.Request(url, headers=HEADERS)
        try:
            response = urllib.request.build_opener(NoRedirect).open(request, timeout=12)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            location = response.headers.get('Location', '')
            # Never retain external authentication query strings or request external redirects.
            if location and internal(location, path) is None:
                loc = urllib.parse.urlsplit(urllib.parse.urljoin(url, location))
                location = urllib.parse.urlunsplit((loc.scheme, loc.netloc, loc.path, '', ''))
            body = b''
            if response.status == 200:
                deadline = time.monotonic() + 25
                while time.monotonic() < deadline and len(body) < 3_000_000:
                    chunk = response.read1(65536)
                    if not chunk:
                        break
                    body += chunk
                    if response.headers.get_content_type() == 'text/html' and b'</html>' in body:
                        break
            return {'path': path, 'status': response.status, 'mime': response.headers.get_content_type(), 'location': location, 'body': body}
    except Exception as error:
        return {'path': path, 'status': 0, 'error': str(error), 'body': b'', 'mime': ''}


inventory = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import fs from 'node:fs'; import {legacyRedirectEntries} from './lib/legacy.mjs'; import {sourceOrderCatalogue} from './lib/source-orders.mjs'; const products=sourceOrderCatalogue(JSON.parse(fs.readFileSync('./lib/sourcing-catalogue.json'))); console.log(JSON.stringify(legacyRedirectEntries(products)));"], cwd=ROOT, text=True))
config = (ROOT / 'next.config.ts').read_text()
inventory = dict(inventory + re.findall(r'\["(/[^"\n]+)", "(/[^"\n]+)"\]', config))
inventory.update({'/catalog': '/shop', '/collections/accessories': '/collections/controllers-cables', '/collections/original-xbox': '/collections/xbox', '/pages/community-setup-of-the-month': '/community', '/pages/shipping-delivery': '/delivery'})
for locale in ['fr', 'de', 'es', 'it', 'en', 'en-gb']:
    for old in ['/pages/warranty-information', '/collections/playstation-2', '/pages/ps2-fat-vs-ps2-slim', '/about.html']:
        inventory['/' + locale + old] = inventory[old]

report = {'origin': ORIGIN, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'failures': [], 'pages': [], 'redirects': [], 'external_links': [], 'authentication_boundaries': [], 'excluded': 'Other origins, authentication, private APIs, order-token URLs, forms and checkout submission'}
pending = {'/', '/sitemap.xml', '/robots.txt', '/feed.xml', '/shop?q=ps2'} | set(inventory)
seen, assets, externals, fragments, documents = {}, set(), set(), set(), {}


def checkpoint():
    if OUTPUT:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(json.dumps({**report, 'result': 'in-progress', 'requests_checked': len(seen)}, indent=2) + '\n')


print(json.dumps({'starting_public_urls': len(pending), 'automatic_redirect_following': False}), flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    while pending:
        batch = sorted(pending - seen.keys())
        pending.clear()
        if not batch:
            break
        if len(seen) + len(batch) > 600:
            raise RuntimeError('Unexpectedly unbounded navigation')
        futures = [pool.submit(fetch, path) for path in batch]
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            path = result['path']
            seen[path] = {k: v for k, v in result.items() if k != 'body'}
            if len(seen) % 25 == 0:
                checkpoint()
                print(json.dumps({'public_requests_checked': len(seen), 'failures': len(report['failures'])}), flush=True)
            if result['status'] in (301, 302, 303, 307, 308):
                target = internal(result.get('location', ''), path)
                if target:
                    seen[path]['target'] = target
                    if target not in seen:
                        pending.add(target)
                    report['redirects'].append(seen[path])
                else:
                    report['authentication_boundaries'].append(seen[path])
                continue
            if result['status'] != 200:
                report['failures'].append(seen[path])
            else:
                body = result['body'].decode('utf-8', 'replace')
                if result['mime'] in ('application/xml', 'text/xml'):
                    try:
                        for loc in ET.fromstring(body).findall('.//{*}loc'):
                            target = internal(loc.text or '')
                            if target and target not in seen:
                                pending.add(target)
                    except ET.ParseError as error:
                        report['failures'].append({'path': path, 'error': str(error)})
                if result['mime'] == 'text/html':
                    doc = Document(body)
                    documents[path] = doc
                    for href in doc.links:
                        target = internal(href, path)
                        if target:
                            if target not in seen:
                                pending.add(target)
                            fragment = urllib.parse.urlsplit(href).fragment
                            if fragment:
                                fragments.add((target, urllib.parse.unquote(fragment), path))
                        elif href.startswith(('http://', 'https://')) and urllib.parse.urlsplit(href).netloc != HOST:
                            externals.add(href)
                    assets.update(target for asset in doc.assets if (target := internal(asset, path)))
                    report['pages'].append({'path': path, 'links': len(doc.links)})
        checkpoint()
        print(json.dumps({'public_requests_checked': len(seen), 'pending': len(pending - seen.keys()), 'failures': len(report['failures'])}), flush=True)
    asset_results = list(pool.map(fetch, sorted(assets)))
    for result in asset_results:
        if result['status'] == 200 and result['mime'] == 'text/css':
            for href in re.findall(r'url\([\'"]?([^\)\'\"]+)', result['body'].decode('utf-8', 'replace')):
                if (target := internal(href, result['path'])) and target not in assets:
                    assets.add(target)
    already = {result['path'] for result in asset_results}
    asset_results.extend(pool.map(fetch, sorted(assets - already)))
    report['assets_checked'] = len(asset_results)
    report['failures'].extend({k: v for k, v in result.items() if k != 'body'} for result in asset_results if result['status'] != 200)


def terminal(path):
    visited = set()
    while path not in visited and len(visited) < 8:
        visited.add(path)
        result = seen.get(path, {})
        if result.get('status') == 200:
            return path
        if not result.get('target'):
            return None
        path = result['target']
    return None


for old, expected in inventory.items():
    result = seen.get(old, {})
    expected_path = internal(expected)
    if result.get('status') not in (301, 308) or result.get('target') != expected_path or terminal(old) is None:
        report['failures'].append({'path': old, 'expected_permanent_redirect': expected, 'actual': result})
for target, fragment, source in sorted(fragments):
    resolved = terminal(target)
    if resolved in documents and fragment not in documents[resolved].ids and not fragment.startswith(':~:text='):
        report['failures'].append({'path': source, 'broken_fragment': target + '#' + fragment})
report['pages_and_redirects_checked'] = len(seen)
report['legacy_redirects_checked'] = len(inventory)
report['external_links'] = sorted(externals)
report['result'] = 'passed' if not report['failures'] else 'failed'
if OUTPUT:
    OUTPUT.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: report[k] for k in ['result', 'pages_and_redirects_checked', 'legacy_redirects_checked', 'assets_checked', 'failures', 'external_links', 'authentication_boundaries']}), flush=True)
sys.exit(bool(report['failures']))
