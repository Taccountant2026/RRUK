import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import * as browse from '../lib/browse.mjs';
import * as legacy from '../lib/legacy.mjs';

const require=createRequire(import.meta.url);
const navigation={
  permanentRedirect(destination){throw Object.assign(new Error('redirect'),{kind:'redirect',destination});},
  notFound(){throw Object.assign(new Error('not-found'),{kind:'not-found'});},
};
const Catalogue=()=>null;
function loadRoute(path){
  const code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX},
  }).outputText;
  const module={exports:{}};
  const mocks={'next/navigation':navigation,'@/components/Storefront':{Catalogue},'@/lib/browse.mjs':browse,'@/lib/legacy.mjs':legacy,'@/lib/catalogue-server':{getProducts:async()=>[]}};
  runInNewContext(code,{module,exports:module.exports,Response,require(name){
    if(Object.hasOwn(mocks,name))return mocks[name];
    if(name==='react/jsx-runtime')return require(name);
    throw new Error('Unexpected route dependency: '+name);
  }});
  return module.exports;
}
const collection=loadRoute('app/collections/[slug]/page.tsx').default;
const request=slug=>({params:Promise.resolve({slug}),searchParams:Promise.resolve({})});
const legacyPage=loadRoute('app/[...legacy]/page.tsx').default;
test('actual legacy page handler migrates only the exact PS2 comparison and supported locale forms',async()=>{
  for(const prefix of [[],['fr'],['de'],['es'],['it'],['en'],['en-gb']]){
    const params=Promise.resolve({legacy:[...prefix,'pages','ps2-fat-vs-ps2-slim']});
    await assert.rejects(legacyPage({params}),error=>error.kind==='redirect'&&error.destination==='/blog/ps2-fat-vs-slim');
  }
});
test('actual legacy page handler keeps unmatched comparisons and unsafe extensions missing',async()=>{
  for(const segments of [
    ['pages','ps2-fat-vs-ps2-slim','unrelated'],
    ['pages','no-such-guide'],
    ['pages','ps2-fat-vs-ps2-slim?next=https://unrelated.example'],
    ['pages','constructor'],
  ]){
    await assert.rejects(legacyPage({params:Promise.resolve({legacy:segments})}),error=>error.kind==='not-found');
  }
});
for(const [slug,destination] of [
  ['handheld-consoles','/collections/handhelds'],
  ['n64','/shop?collection=nintendo&q=nintendo+64'],
  ['japanese-imports','/shop?q=japanese+import'],
])test('actual collection handler redirects legacy slug: '+slug,async()=>{
  await assert.rejects(collection(request(slug)),error=>error.kind==='redirect'&&error.destination===destination);
});
test('actual current collection renders without a self redirect',async()=>{
  const result=await collection(request('handhelds'));
  assert.equal(result.type,Catalogue);
  assert.equal(result.props.collectionSlug,'handhelds');
});
test('actual established collection alias stays intact',async()=>{
  await assert.rejects(collection(request('all')),error=>error.kind==='redirect'&&error.destination==='/shop');
});
test('actual unknown and inherited collection names keep their missing-page result',async()=>{
  for(const slug of ['no-such-collection','constructor','__proto__','//unrelated.example']){
    await assert.rejects(collection(request(slug)),error=>error.kind==='not-found');
  }
});
for(const name of ['sitemap_products_1.xml','sitemap_collections_1.xml'])test('actual exact XML handler redirects before the generic page route: '+name,()=>{
  const response=loadRoute('app/'+name+'/route.ts').GET();
  assert.equal(response.status,308);
  assert.equal(response.headers.get('location'),'/sitemap.xml');
  assert.equal(response.body,null);
});

test('actual legacy article handler recovers the exact PS2 games list and supported locale forms',async()=>{
  for(const prefix of [[],['fr'],['de'],['es'],['it'],['en'],['en-gb']]){
    const legacy=[...prefix,'blogs','retro-software-homebrew','best-ps2-games-of-all-time-the-ultimate-playstation-2-game-list'];
    await assert.rejects(legacyPage({params:Promise.resolve({legacy})}),error=>error.kind==='redirect'&&error.destination==='/blog/ps2-games-shortlist');
  }
});
test('PS2 games recovery retains unrelated articles, photo gaps and unsafe paths as missing',async()=>{
  for(const legacy of [
    ['blogs','retro-software-homebrew','best-ps2-games-of-all-time-the-ultimate-playstation-2-game-list','extra'],
    ['blogs','retro-software-homebrew','best-ps2-games-of-all-time-the-ultimate-playstation-2-game-list?next=https://unrelated.example'],
    ['blogs','retro-software-homebrew','best-ps2-games-of-all-time-the-ultimate-playstation-2-game-list-extra'],
    ['blogs','news','best-ps2-games-of-all-time-the-ultimate-playstation-2-game-list'],
    ['blogs','retro-software-homebrew','swiss-gamecube-guide'],
    ['blogs','retro-software-homebrew','ps2-hdd-size-comparison-500gb-vs-1tb-vs-2tb-which-is-right-for-you'],
    ['cdn','shop','files','20260412_181701_1.jpg'],
    ['pages','no-such-guide'],
  ]){
    await assert.rejects(legacyPage({params:Promise.resolve({legacy})}),error=>error.kind==='not-found');
  }
});
