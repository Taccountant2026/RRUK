"""Read-only HTTP audit. No checkout session or submission is created."""
import concurrent.futures, html.parser, json, re, sys, urllib.error, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
ORIGIN=(sys.argv[1] if len(sys.argv)>1 else 'https://retroreplay.uk').rstrip('/')
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; RRUKStoreAudit/2.0)','Cache-Control':'no-cache'}
class Page(html.parser.HTMLParser):
    def __init__(self,text):
        super().__init__();self.links=set();self.images=set();self.scripts=set();self.h1=[];self.text=[];self.hidden=0;self.heading=False;self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','style'):self.hidden+=1
        if tag=='h1':self.heading=True
        if tag=='a' and a.get('href'):self.links.add(a['href'])
        if tag=='img' and a.get('src'):self.images.add(a['src'])
        if tag=='script' and a.get('src'):self.scripts.add(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet' and a.get('href'):self.scripts.add(a['href'])
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.hidden=max(0,self.hidden-1)
        if tag=='h1':self.heading=False
    def handle_data(self,data):
        if not self.hidden:
            self.text.append(data)
            if self.heading:self.h1.append(data)
def get(path,headers=None):
    req=urllib.request.Request(ORIGIN+path,headers={**HEADERS,**(headers or {})})
    try:
        with urllib.request.urlopen(req,timeout=25) as r:return path,r.status,r.headers.get('Content-Type',''),r.read().decode('utf-8','replace'),r.geturl()
    except urllib.error.HTTPError as e:return path,e.code,e.headers.get('Content-Type',''),e.read().decode('utf-8','replace'),ORIGIN+path
def internal(href,current='/'):
    u=urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN+current,href))
    if u.netloc!=urllib.parse.urlsplit(ORIGIN).netloc:return None
    if u.path.startswith(('/api/','/order/','/admin','/signin-','/signout-','/_next/','/assets/')):return None
    if u.path=='/feed.xml':return None
    return u.path+('?'+u.query if u.query else '')
report={'origin':ORIGIN,'pages':[],'failures':[]}
_,status,_,raw,_=get('/api/catalogue');assert status==200
products=json.loads(raw)['products'];assert len(products)==65 and sum(not p.get('catalogueOnly') for p in products)==59
pending={'/','/start','/shop','/shop?page=2','/shop?page=3','/blog','/community','/contact','/console-hunt','/console-checker','/how-it-works','/order-help'}
seen=set();discovered=set();assets=set();doms={}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    while pending:
        batch=sorted(pending-seen);pending=set()
        if not batch:break
        assert len(seen)+len(batch)<=180,'Unbounded navigation'
        for path,status,mime,body,final in pool.map(get,batch):
            seen.add(path)
            if status!=200:report['failures'].append({'path':path,'status':status});continue
            if 'text/html' not in mime:continue
            page=Page(body);doms[path]=page
            if not page.h1:report['failures'].append({'path':path,'error':'missing visible h1'})
            for href in page.links:
                target=internal(href,path)
                if target:
                    discovered.add(target)
                    if target not in seen:pending.add(target)
            for src in page.images|page.scripts:
                if src.startswith('/'):assets.add(src)
            assets.update(re.findall(r'/_next/static/chunks/[a-zA-Z0-9_.-]+\.js',body))
            report['pages'].append({'path':path,'heading':''.join(page.h1),'links':len(page.links)})
        print(json.dumps({'crawled':len(seen),'next':len(pending),'failures':len(report['failures'])}),flush=True)
    expected={'/product/'+p['slug'] for p in products};report['discoveredProducts']=len(expected&discovered)
    assert expected<=discovered,sorted(expected-discovered)
    for p in products:
        key='/product/'+p['slug'];page=doms.get(key)
        assert page and p['title'] in ''.join(page.h1),(key,'visible title missing')
        text=' '.join(page.text)
        assert ('Request availability.' in text if p.get('catalogueOnly') else 'Add to basket' in text),(key,'purchase path missing')
        assert not re.search(r'\b\d+\s+(?:in stock|units remaining)\b',text,re.I),(key,'public stock count')
    bad=[]
    for path,status,mime,body,final in pool.map(get,sorted(assets)):
        if status!=200 or path.endswith('.js') and 'javascript' not in mime:bad.append({'path':path,'status':status,'mime':mime})
    report['assetsChecked']=len(assets);report['assetFailures']=bad;assert not bad,bad
search=get('/shop?q=ps2');assert search[1]==200
assert any('/product/' in h for h in Page(search[3]).links)
p=next(p for p in products if not p.get('catalogueOnly'))
cart=urllib.parse.quote(json.dumps([{'id':p['id'],'quantity':1}]))
basket=get('/basket',{'Cookie':'rruk_cart='+cart});assert basket[1]==200 and p['title'] in ' '.join(Page(basket[3]).text),'SSR basket cookie did not persist'
report['serverBasketPersisted']=True
for old,new in [('/products/playstation-2-memory-card-8mb-official','/product/sony-playstation-2-official-8-mb-memory-card'),('/fr/pages/console-hunt','/console-hunt'),('/blogs/retro-console-buying-advice/ps2-fat-vs-ps2-slim-which-should-you-buy','/blog/ps2-fat-vs-slim')]:
    r=get(old);assert r[1]==200 and r[4]==ORIGIN+new,(old,r[1],r[4])
assert get('/product/a-genuinely-missing-item')[1]==404
assert get('/missing-level/a-genuinely-missing-page')[1]==404
assert get('/api/admin/community')[1]==403
feed=get('/feed.xml');assert feed[1]==200;assert len(ET.fromstring(feed[3]).findall('.//item'))==8
site=get('/sitemap.xml');assert site[1]==200
urls={x.text for x in ET.fromstring(site[3]).findall('.//{*}loc')};assert {ORIGIN+p for p in expected}<=urls
report['sitemapUrls']=len(urls);assert not report['failures'],report['failures']
report['result']='passed';report['scope']='HTTP DOM, routes, assets, search, basket persistence, feed and sitemap. No interactive browser or real payment test.'
print(json.dumps(report,ensure_ascii=False),flush=True)
