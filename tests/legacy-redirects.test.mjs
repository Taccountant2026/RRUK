import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {legacyDestination} from '../lib/legacy.mjs';
import {collections,browseFilters,browseProducts} from '../lib/browse.mjs';
import {sourceOrderCatalogue} from '../lib/source-orders.mjs';

const products=sourceOrderCatalogue(JSON.parse(fs.readFileSync(new URL('../lib/sourcing-catalogue.json',import.meta.url))));
const aliases=[
  [['collections','handheld-consoles'],'/collections/handhelds'],
  [['collections','n64'],'/shop?collection=nintendo&q=nintendo+64'],
  [['collections','japanese-imports'],'/shop?q=japanese+import'],
  [['pages','why-buy-from-retroreplay-uk'],'/why-rruk'],
  [['pages','retro-gaming-setup-guides'],'/blog'],
  [['sitemap_products_1.xml'],'/sitemap.xml'],
  [['sitemap_collections_1.xml'],'/sitemap.xml'],
];
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
