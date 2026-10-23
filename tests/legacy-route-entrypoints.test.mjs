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
  const mocks={'next/navigation':navigation,'@/components/Storefront':{Catalogue},'@/lib/browse.mjs':browse,'@/lib/legacy.mjs':legacy};
  runInNewContext(code,{module,exports:module.exports,Response,require(name){
    if(Object.hasOwn(mocks,name))return mocks[name];
    if(name==='react/jsx-runtime')return require(name);
    throw new Error('Unexpected route dependency: '+name);
  }});
  return module.exports;
}
const collection=loadRoute('app/collections/[slug]/page.tsx').default;
const request=slug=>({params:Promise.resolve({slug}),searchParams:Promise.resolve({})});
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
