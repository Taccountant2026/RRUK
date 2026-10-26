"""Audit published navigation, assets and the archived RRUK URL inventory using GET only.

Usage: python scripts/check-links.py https://retroreplay.uk /absolute/report.json
Does not submit forms, start checkout, sign in/out or call private APIs.
"""
import concurrent.futures
import datetime
import html.parser
import json
from pathlib import Path
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = (sys.argv[1] if len(sys.argv) > 1 else 'https://retroreplay.uk').rstrip('/')
OUTPUT = Path(sys.argv[2]) if len(sys.argv) > 2 else None
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; RRUKLinkCheck/1.0)', 'Cache-Control': 'no-cache'}
HOST = urllib.parse.urlsplit(ORIGIN).netloc


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


class Redirects(urllib.request.HTTPRedirectHandler):
    def __init__(self):
        self.hops = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.hops.append({'status': code, 'to': newurl})
        if len(self.hops) > 8:
            raise ValueError('Redirect loop or excessive chain')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(path):
    url = urllib.parse.urljoin(ORIGIN + '/', path)
    handler = Redirects()
    try:
        request = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.build_opener(handler).open(request, timeout=25) as response:
            data = response.read()
            return {'path': path, 'status': response.status, 'url': response.geturl(), 'mime': response.headers.get_content_type(), 'hops': handler.hops, 'body': data}
    except urllib.error.HTTPError as error:
        return {'path': path, 'status': error.code, 'url': error.geturl(), 'mime': error.headers.get_content_type(), 'hops': handler.hops, 'body': error.read()}
    except Exception as error:
        return {'path': path, 'status': 0, 'url': url, 'hops': handler.hops, 'error': str(error), 'body': b'', 'mime': ''}


def internal(href, current='/'):
    url = urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN + current, href))
    if url.scheme not in ('http', 'https') or url.netloc != HOST:
        return None
    if url.path.startswith(('/api/', '/order/', '/signin', '/signout', '/.well-known/')):
        return None
    # Campaign attribution must not create duplicate crawl branches.
    query = urllib.parse.urlencode([(key, value) for key, value in urllib.parse.parse_qsl(url.query) if not key.startswith('utm_')])
    return url.path + ('?' + query if query else '')


inventory = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import fs from 'node:fs'; import {legacyRedirectEntries} from './lib/legacy.mjs'; import {sourceOrderCatalogue} from './lib/source-orders.mjs'; const products=sourceOrderCatalogue(JSON.parse(fs.readFileSync('./lib/sourcing-catalogue.json'))); console.log(JSON.stringify(legacyRedirectEntries(products)));"], cwd=ROOT, text=True))
# Config redirects and dedicated route aliases must also be checked at the HTTP entrypoint.
config = (ROOT / 'next.config.ts').read_text()
inventory = dict(inventory + re.findall(r'\["(/[^"\n]+)", "(/[^"\n]+)"\]', config))
inventory.update({'/catalog': '/shop', '/collections/accessories': '/collections/controllers-cables', '/collections/original-xbox': '/collections/xbox', '/pages/community-setup-of-the-month': '/community', '/pages/shipping-delivery': '/delivery'})
for locale in ['fr', 'de', 'es', 'it', 'en', 'en-gb']:
    for old in ['/pages/warranty-information', '/collections/playstation-2', '/pages/ps2-fat-vs-ps2-slim', '/about.html']:
        inventory['/' + locale + old] = inventory[old]

report = {'origin': ORIGIN, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'failures': [], 'pages': [], 'redirects': [], 'external_links': [], 'excluded': 'Private APIs, order-token URLs, sign-in/out actions, forms and checkout submission'}
pending = {'/', '/sitemap.xml', '/robots.txt', '/feed.xml', '/shop?q=ps2'} | set(inventory)
seen, assets, externals, fragments, documents = {}, set(), set(), set(), {}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    while pending:
        batch = sorted(pending - seen.keys())
        pending.clear()
        if not batch:
            break
        if len(seen) + len(batch) > 600:
            raise RuntimeError('Unexpectedly unbounded navigation')
        for result in pool.map(fetch, batch):
            path = result['path']
            seen[path] = {key: value for key, value in result.items() if key != 'body'}
            if result['status'] != 200:
                report['failures'].append(seen[path])
                continue
            if path in inventory:
                target = urllib.parse.urljoin(ORIGIN, inventory[path])
                if result['url'] != target or not result['hops'] or result['hops'][0]['status'] not in (301, 308):
                    report['failures'].append({'path': path, 'expected_permanent_redirect': target, 'actual': seen[path]})
                report['redirects'].append(seen[path])
            body = result['body'].decode('utf-8', 'replace')
            if result['mime'] in ('application/xml', 'text/xml'):
                try:
                    for loc in ET.fromstring(body).findall('.//{*}loc'):
                        target = internal(loc.text or '')
                        if target and target not in seen:
                            pending.add(target)
                except ET.ParseError as error:
                    report['failures'].append({'path': path, 'error': str(error)})
            if result['mime'] != 'text/html':
                continue
            doc = Document(body)
            documents[path] = doc
            current = internal(result['url']) or path
            for href in doc.links:
                target = internal(href, current)
                if target:
                    if target not in seen:
                        pending.add(target)
                    fragment = urllib.parse.urlsplit(href).fragment
                    if fragment:
                        fragments.add((target, urllib.parse.unquote(fragment), path))
                elif href.startswith(('http://', 'https://')) and urllib.parse.urlsplit(href).netloc != HOST:
                    externals.add(href)
            for asset in doc.assets:
                target = internal(asset, current)
                if target:
                    assets.add(target)
            report['pages'].append({'path': path, 'links': len(doc.links)})
        print(json.dumps({'pages_and_redirects_checked': len(seen), 'pending': len(pending - seen.keys()), 'failures': len(report['failures'])}), flush=True)
    asset_results = list(pool.map(fetch, sorted(assets)))
    # Fonts and images referenced from CSS belong to the same deployed asset graph.
    for result in asset_results:
        if result['status'] == 200 and result['mime'] == 'text/css':
            for href in re.findall(r'url\([\'"]?([^\)\'\"]+)', result['body'].decode('utf-8', 'replace')):
                target = internal(href, result['path'])
                if target and target not in assets:
                    assets.add(target)
    already = {result['path'] for result in asset_results}
    asset_results.extend(pool.map(fetch, sorted(assets - already)))
    report['assets_checked'] = len(asset_results)
    report['failures'].extend({key: value for key, value in result.items() if key != 'body'} for result in asset_results if result['status'] != 200)

for target, fragment, source in sorted(fragments):
    if target in documents and fragment not in documents[target].ids and not fragment.startswith(':~:text='):
        report['failures'].append({'path': source, 'broken_fragment': target + '#' + fragment})
report['pages_and_redirects_checked'] = len(seen)
report['legacy_redirects_checked'] = len(inventory)
report['external_links'] = sorted(externals)
report['result'] = 'passed' if not report['failures'] else 'failed'
if OUTPUT:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({key: report[key] for key in ['result', 'pages_and_redirects_checked', 'legacy_redirects_checked', 'assets_checked', 'failures', 'external_links']}), flush=True)
sys.exit(bool(report['failures']))
