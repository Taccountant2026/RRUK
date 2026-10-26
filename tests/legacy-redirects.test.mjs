import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {legacyDestination} from '../lib/legacy.mjs';
import {collections,browseFilters,browseProducts} from '../lib/browse.mjs';
import {sourceOrderCatalogue} from '../lib/source-orders.mjs';
import {journal} from '../lib/journal.mjs';

const products=sourceOrderCatalogue(JSON.parse(fs.readFileSync(new URL('../lib/sourcing-catalogue.json',import.meta.url))));
const aliases=[
  [['pages','ps2-fat-vs-ps2-slim'],'/blog/ps2-fat-vs-slim'],
  [['collections','handheld-consoles'],'/collections/handhelds'],
  [['collections','n64'],'/shop?collection=nintendo&q=nintendo+64'],
  [['collections','japanese-imports'],'/shop?q=japanese+import'],
  [['pages','why-buy-from-retroreplay-uk'],'/why-rruk'],
  [['pages','retro-gaming-setup-guides'],'/blog'],
  [['sitemap_products_1.xml'],'/sitemap.xml'],
  [['sitemap_collections_1.xml'],'/sitemap.xml'],
];
test('the migrated PS2 comparison has a genuine current editorial equivalent',()=>{
  const article=journal.find(article=>article.slug==='ps2-fat-vs-slim');
  assert.ok(article);
  assert.match(article.title,/PS2 Fat or Slim/);
  assert.ok(article.sections.length>=3);
  for(const slug of ['best-ps2-games','best-original-xbox-games']){
    assert.equal(legacyDestination(['pages',slug],products),null);
  }
});
for(const [segments,target]of aliases){
  test(`exact legacy destination: /${segments.join('/')}`,()=>assert.equal(legacyDestination(segments,products),target));
  test(`same migration from an old French URL: /fr/${segments.join('/')}`,()=>assert.equal(legacyDestination(['fr',...segments],products),target));
}
test('filtered collection destinations contain relevant current source-catalogue choices',()=>{
  for(const [segments,target]of aliases.filter(([,t])=>t.startsWith('/shop?'))){
    const params=Object.fromEntries(new URL(target,'https://retroreplay.uk').searchParams);
    const matches=browseProducts(products,browseFilters(params));
    assert.ok(matches.length>0,segments.join('/'));
    if(segments[1]==='n64')assert.ok(matches.every(p=>p.title.includes('Nintendo 64')));
    if(segments[1]==='japanese-imports')assert.ok(matches.every(p=>/japanese import/i.test(p.title)));
  }
  assert.ok(collections.some(c=>c.slug==='handhelds'));
});
test('destinations correspond to current page/collection/sitemap sources',()=>{
  for(const path of ['app/shop/page.tsx','app/blog/page.tsx','app/why-rruk/page.tsx','app/collections/[slug]/page.tsx','app/sitemap.ts'])assert.ok(fs.existsSync(new URL('../'+path,import.meta.url)),path);
  const sitemap=fs.readFileSync(new URL('../app/sitemap.ts',import.meta.url),'utf8');
  assert.match(sitemap,/collections\.map/);assert.match(sitemap,/products\.filter/);
  const catchall=fs.readFileSync(new URL('../app/[...legacy]/page.tsx',import.meta.url),'utf8');
  assert.match(catchall,/permanentRedirect\(destination\)/);assert.match(catchall,/notFound\(\)/);
});
test('removed products, modded packs and unavailable offers keep their missing-page result',()=>{
  for(const path of [
    ['collections','custom-modded-packs'],['collections','ready-to-ship'],['collections','snes'],
    ['pages','gift-vouchers'],['products','sony-playstation-2-ps2-eyetoy-silver-usb-camera-tested-working'],
    ['products','nintendo-console-custom-build-configure-your-system-storage-accessories'],
    ['products','nintendo-gamecube-purple-console-only-with-power-av-cable-pal-uk-tested-lot02'],
  ])assert.equal(legacyDestination(path,products),null,path.join('/'));
});
test('old museum and homebrew articles are not redirected to unrelated buying guides',()=>{
  for(const path of [
    ['blogs','news','sega-game-gear-colour-backlit-battery-hungry-retroreplay-museum'],
    ['blogs','retro-software-homebrew','ps2-network-adapter-guide'],
    ['blogs','retro-software-homebrew','grimdoomer-projects-guide'],
    ['blogs','news','sony-playstation-2-the-console-that-changed-everything-retroreplay-museum'],
  ])assert.equal(legacyDestination(path,products),null,path.join('/'));
});
test('old product photos cannot be replaced with representative illustrations',()=>{
  for(const name of ['Main_PS2.png','ps2-frost-white.png','Included.png','REDACTED.jpg'])assert.equal(legacyDestination(['cdn','shop','files',name],products),null);
});
test('extra segments do not turn an unrelated path into a migrated page',()=>{
  for(const [parts]of aliases)assert.equal(legacyDestination([...parts,'unrelated'],products),null);
  assert.equal(legacyDestination(['products',products[0].slug,'unrelated'],products),null);
});
test('unknown and unsafe input never creates an external redirect',()=>{
  for(const parts of [null,'/shop',['pages','constructor'],['pages','__proto__'],['pages','toString'],['..','shop'],['fr','..','shop'],['https:','evil.test'],['//evil.test'],['pages','contact?next=https://evil.test'],['pages','%2f%2fevil.test']])assert.equal(legacyDestination(parts,products),null);
  for(const [parts]of aliases){const destination=legacyDestination(parts,products);assert.equal(new URL(destination,'https://retroreplay.uk').origin,'https://retroreplay.uk');assert.notEqual(destination,'/');}
});

const newMigrations=[
  [['pages','warranty-information'],'/warranty'],
  [['pages','warranty'],'/warranty'],
  [['pages','find-my-console'],'/console-finder'],
  [['collections','playstation-2'],'/collections/playstation'],
  [['collections','gamecube'],'/collections/nintendo'],
  [['collections','xbox-360'],'/collections/xbox'],
  [['collections','atari'],'/collections/sega-atari'],
  [['collections','collector-s-vault'],'/collections/consoles'],
  [['collections','memory-cards-storage'],'/collections/controllers-cables'],
  [['policies','refund-policy'],'/returns'],
  [['policies','shipping-policy'],'/delivery'],
  [['search'],'/shop'],
  [['cart'],'/basket'],
];
test('new Shopify migration routes and locale paths resolve to current relevant content',()=>{
  for(const [segments,target] of newMigrations){
    assert.equal(legacyDestination(segments,products),target,segments.join('/'));
    assert.equal(legacyDestination(['fr',...segments],products),target,'fr/'+segments.join('/'));
  }
});
test('routing config has permanent redirects without loops or retired modded/ready-to-ship routes',()=>{
  const source=fs.readFileSync(new URL('../next.config.ts',import.meta.url),'utf8');
  const routes=[...source.matchAll(/\["(\/[^"]+)", "(\/[^"]+)"\]/g)];
  assert.ok(routes.length>=50,'expected an explicit legacy URL migration table');
  const seen=new Set();
  for(const [,from,to] of routes){
    assert.ok(!seen.has(from),'duplicate legacy redirect: '+from);
    assert.notEqual(from,to,'self redirect: '+from);
    seen.add(from);
  }
  assert.ok(seen.has('/collections/playstation-2'));
  assert.ok(seen.has('/pages/warranty-information'));
  assert.ok(!seen.has('/collections/ready-to-ship'));
  assert.ok(!seen.has('/collections/custom-modded-packs'));
  assert.match(source,/permanent: true/);
});

const historicFlatAliases = [
  [['about.html'], '/our-story'],
  [['about.htm'], '/our-story'],
  [['branding.html'], '/our-story'],
  [['checkout.html'], '/basket'],
  [['delivery.html'], '/delivery'],
  [['faq.html'], '/support'],
  [['privacy.html'], '/privacy'],
  [['returns.html'], '/returns'],
  [['terms.html'], '/terms'],
  [['services.html'], '/how-it-works'],
  [['shop.html'], '/shop'],
  [['ps2.html'], '/collections/playstation'],
  [['sourcing-request.html'], '/console-hunt'],
  [['atari','index.html'], '/collections/sega-atari'],
  [['sega','index.html'], '/collections/sega-atari'],
  [['xbox','index.html'], '/collections/xbox'],
  [['playstation','products','ps2-fat.html'], '/collections/playstation'],
  [['fr','collections','under-100'], '/shop?max=100'],
  [['fr','collections','source-to-order'], '/shop?orderable=1'],
];
test('old HTML site and Shopify CSV addresses resolve to matching current pages',()=>{
  for (const [segments, destination] of historicFlatAliases)
    assert.equal(legacyDestination(segments, products),destination,segments.join('/'));
});
test('specific policy page route includes redirect before 404',()=>{
  const route=fs.readFileSync(new URL('../app/[page]/page.tsx',import.meta.url),'utf8');
  assert.match(route,/legacyDestination\(\[page\]\)/);
  assert.match(route,/permanentRedirect\(redirect\)/);
});
