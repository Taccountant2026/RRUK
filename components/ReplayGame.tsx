'use client';
import { useEffect, useRef, useState } from 'react';
import { Disc3, Gamepad2, Heart, Monitor, Package, RotateCcw, Star } from 'lucide-react';
import { createReplayDeck, replayFlip } from '@/lib/replay-game.mjs';
import { SharePage } from './SharePage';

type Tile = { id:string; symbol:string };
const symbols:Record<string,{name:string;icon:typeof Heart}> = { controller:{name:'Controller',icon:Gamepad2}, cartridge:{name:'Cartridge',icon:Package}, arcade:{name:'Arcade screen',icon:Monitor}, disc:{name:'Game disc',icon:Disc3}, heart:{name:'Pixel heart',icon:Heart}, star:{name:'Bonus star',icon:Star} };
export function ReplayGame() {
  const [deck, setDeck] = useState<Tile[]>([]), [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<string[]>([]), [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Match the six pairs. Take your time and enjoy a little pause in the Replay Room.');
  const board = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open.length !== 2) return; const timeout = setTimeout(() => setOpen([]), 1100); return () => clearTimeout(timeout); }, [open, deck]);
  useEffect(() => { if (deck.length) board.current?.querySelector('button')?.focus(); }, [deck]);
  function start() { setDeck(createReplayDeck()); setOpen([]); setMatched([]); setMoves(0); setMessage('Round started. Choose two cards to look for a pair.'); }
  function flip(index:number) {
    const next = replayFlip(deck, open, matched, index); if (!next) return;
    setOpen(next.open); setMatched(next.matched); setMoves(n => n + next.move);
    const name = symbols[deck[index].symbol].name;
    setMessage(next.matched.length === 6 ? `Six pairs found in ${moves + next.move} moves. A little memory unlocked!` : next.pair ? `${name} pair found. Choose your next card.` : next.open.length === 2 ? `Two different symbols. The cards will turn back; then try another pair.` : `${name} revealed. Choose a second card.`);
  }
  return <section className="section replay-game-section" id="play"><div className="container replay-game-layout"><div className="replay-game-copy"><div className="eyebrow">A LITTLE REPLAY ROUND</div><h2>One more turn?<br/><span>We know the feeling.</span></h2><p>A small memory game for a room full of gaming memories. Find the six matching pairs; each two-card turn counts as one move.</p><p>Use a mouse, touch, or Tab and Enter. Your round stays on this page.</p><div className="finder-actions"><button className="button navy" onClick={start}>{deck.length ? <><RotateCcw size={17}/> Start a new round</> : <>Press start<Gamepad2 size={18}/></>}</button><a href="#share" className="text-link">Share a favourite gaming memory →</a></div>{matched.length === 6 && <SharePage title={`I matched the Replay Room's six pairs in ${moves} moves. Your turn?`}/>}</div><div className="replay-console"><div className="replay-score"><span>PAIRS <strong>{matched.length} / 6</strong></span><span>MOVES <strong>{moves}</strong></span></div>{deck.length ? <div className="replay-board" ref={board} role="group" aria-label="Twelve memory cards. Find six matching pairs.">{deck.map((tile,index) => { const up = open.includes(index) || matched.includes(tile.symbol), done = matched.includes(tile.symbol), item = symbols[tile.symbol], Icon = item.icon; return <button key={tile.id} type="button" className={'replay-tile' + (up ? ' face-up' : '') + (done ? ' matched' : '')} aria-label={`Card ${index + 1}: ${up ? item.name + (done ? ', pair matched' : ', revealed') : 'face down'}`} aria-disabled={done || open.length === 2 || open.includes(index)} onClick={() => flip(index)}>{up ? <><Icon size={30}/><span>{item.name}</span>{done && <small>PAIR FOUND</small>}</> : <><span className="tile-question" aria-hidden="true">?</span><span className="sr-only">Reveal card {index + 1}</span></>}</button>; })}</div> : <div className="replay-attract" aria-hidden="true"><Gamepad2 size={54}/><strong>MEMORY<br/>UNLOCKED.</strong><span>PRESS START FOR A LITTLE NOSTALGIA</span></div>}<p className="replay-status" role="status" aria-live="polite" aria-atomic="true">{message}</p><noscript><p>Enable JavaScript to play this round. The stories and memory form below are ready to explore.</p></noscript></div></div></section>;
}
