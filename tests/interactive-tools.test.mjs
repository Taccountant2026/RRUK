import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sourceOrderCatalogue } from '../lib/source-orders.mjs';
import { orderLimit } from '../lib/commerce.mjs';
import { consoleProfile, findConsoles } from '../lib/console-finder.mjs';
import { createReplayDeck, replayFlip, replaySymbols } from '../lib/replay-game.mjs';

const products = sourceOrderCatalogue(JSON.parse(readFileSync(new URL('../lib/sourcing-catalogue.json', import.meta.url))));

test('console shortlist respects every budget/setup/era combination and real purchase eligibility', () => {
  for (const play of ['home','handheld','any']) for (const era of ['classic','millennium','any']) for (const budget of ['10000','15000','25000','0']) {
    const answers = {play,era,budget}, results = findConsoles(products, answers);
    assert(results.length <= 3);
    assert.equal(new Set(results.map(r => r.profile.family)).size, results.length);
    for (const {product:p,profile} of results) {
      assert(orderLimit(p) > 0); assert.equal(p.catalogueOnly,false); assert.equal(p.category,'consoles');
      assert(!Number(budget) || p.pricePence <= Number(budget));
      assert(play === 'any' || profile.play === play); assert(era === 'any' || profile.era === era);
    }
    assert.deepEqual(results.map(r=>r.product.pricePence),results.map(r=>r.product.pricePence).sort((a,b)=>a-b));
  }
});

test('finder never relaxes an impossible budget or treats source-only enquiry bundles as a purchase', () => {
  assert.deepEqual(findConsoles(products,{play:'home',era:'classic',budget:'10000'}),[]);
  const enquiry = products.find(p=>p.catalogueOnly && p.category==='consoles');
  assert(enquiry);assert.deepEqual(findConsoles([enquiry],{play:'any',era:'any',budget:'0'}),[]);
  assert.equal(consoleProfile(products.find(p=>p.category==='accessories')),null);
  assert.deepEqual(findConsoles(products,{play:'any',era:'any',budget:'-1'}),[]);
});

test('finder reacts to active state, price changes and real stock without changing the products', () => {
  const answers={play:'home',era:'millennium',budget:'15000'};
  const p=products.find(p=>p.slug==='sony-playstation-2-fat-scph-50003-console-bundle');
  assert(p);assert.equal(findConsoles([p],answers).length,1,'Sourced orders do not require a held-stock count');
  assert.deepEqual(findConsoles([{...p,active:false}],answers),[]);
  assert.deepEqual(findConsoles([{...p,pricePence:15001}],answers),[]);
  assert.deepEqual(findConsoles([{...p,saleMode:undefined,stock:0}],answers),[]);
  assert.equal(findConsoles([{...p,saleMode:undefined,stock:1}],answers).length,1);
  assert.equal(p.pricePence,12349);
});

test('memory rounds contain exactly two of each symbol after shuffling', () => {
  const deck=createReplayDeck(()=>0.37);
  assert.equal(deck.length,12);assert.equal(new Set(deck.map(t=>t.id)).size,12);
  for(const symbol of replaySymbols)assert.equal(deck.filter(t=>t.symbol===symbol).length,2);
});

test('memory turns reject self-matches, a third card, invalid positions and already matched pairs', () => {
  const deck=createReplayDeck(()=>0.37), first=replayFlip(deck,[],[],0);
  assert.equal(first.move,0);assert.equal(replayFlip(deck,first.open,[],0),null);
  const different=deck.findIndex(t=>t.symbol!==deck[0].symbol);
  const miss=replayFlip(deck,first.open,[],different);
  assert.equal(miss.move,1);assert.equal(miss.pair,false);assert.equal(replayFlip(deck,miss.open,[],2),null);
  const pair=deck.findIndex((t,i)=>i!==0&&t.symbol===deck[0].symbol);
  const hit=replayFlip(deck,first.open,[],pair);
  assert.equal(hit.pair,true);assert.deepEqual(hit.open,[]);assert.equal(replayFlip(deck,[],hit.matched,pair),null);
  assert.equal(replayFlip(deck,[],[],-1),null);assert.equal(replayFlip(deck,[],[],100),null);
});

test('a completed memory round counts six distinct pairs in six successful moves', () => {
  const deck=createReplayDeck(()=>0.72);let open=[],matched=[],moves=0;
  for(const symbol of replaySymbols)for(const [i,tile]of deck.entries())if(tile.symbol===symbol){const next=replayFlip(deck,open,matched,i);assert(next);open=next.open;matched=next.matched;moves+=next.move;}
  assert.equal(matched.length,6);assert.equal(moves,6);assert.deepEqual(open,[]);
});
