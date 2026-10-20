'use client';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Gamepad2, RotateCcw } from 'lucide-react';
import Link from './SiteLink';
import { ProductCards } from './Storefront';
import { useShop } from './ShopContext';
import { consoleQuestions, findConsoles } from '@/lib/console-finder.mjs';
import type { Product } from '@/lib/shop';

type Answers = { play:string; era:string; budget:string };
export function ConsoleFinder() {
  const { products } = useShop();
  const [answers, setAnswers] = useState<Answers>({ play:'', era:'', budget:'' });
  const [step, setStep] = useState(0), [showResults, setShowResults] = useState(false);
  const questionRef = useRef<HTMLLegendElement>(null), resultRef = useRef<HTMLHeadingElement>(null), interacted = useRef(false);
  const question = consoleQuestions[step];
  const chosen = answers[question.id as keyof Answers];
  const matches = useMemo(() => findConsoles(products, answers), [products, answers]);
  useEffect(() => { if (interacted.current) { if (showResults) resultRef.current?.focus(); else questionRef.current?.focus(); } }, [step, showResults]);
  function next(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!chosen) return; interacted.current = true;
    if(step===0)window.dispatchEvent(new CustomEvent('business-metric',{detail:{event:'start_tool'}}));
    if (step < consoleQuestions.length - 1) setStep(step + 1); else {setShowResults(true);window.dispatchEvent(new CustomEvent('business-metric',{detail:{event:'complete_tool'}}));}
  }
  function adjust() { interacted.current = true; setShowResults(false); setStep(0); }
  return <div className="console-finder">
    <div className="finder-topline"><span className="eyebrow"><Gamepad2 size={19}/> YOUR NEXT CLASSIC</span><span>{showResults ? 'YOUR SHORTLIST' : `${step + 1} / ${consoleQuestions.length}`}</span></div>
    <ol className="finder-progress" aria-label="Console finder steps">{consoleQuestions.map((q, i) => <li key={q.id} aria-current={!showResults && step === i ? 'step' : undefined} className={showResults || i < step ? 'complete' : ''}><span>{showResults || i < step ? <Check size={14}/> : i + 1}</span>{['Your setup', 'Your chapter', 'Your budget'][i]}</li>)}</ol>
    {!showResults ? <div className="finder-question-layout"><form onSubmit={next}>
      <fieldset className="finder-question"><legend ref={questionRef} tabIndex={-1}>{question.title}</legend><p>{question.detail}</p><div className="finder-choices">{question.choices.map(option => <label className={'finder-choice' + (chosen === option.value ? ' selected' : '')} key={option.value}><input type="radio" name={question.id} value={option.value} checked={chosen === option.value} required onChange={() => setAnswers({ ...answers, [question.id]: option.value })}/><span><strong>{option.label}</strong><small>{option.detail}</small></span></label>)}</div></fieldset>
      <div className="finder-actions">{step > 0 && <button className="button outline" type="button" onClick={() => { interacted.current = true; setStep(step - 1); }}><ArrowLeft size={16}/> Back</button>}<button className="button navy" type="submit" disabled={!chosen}>{step === 2 ? 'Find my classics' : 'Next question'}<ArrowUpRight size={17}/></button></div>
    </form><aside className="finder-note"><span className="tiny-pixel"/><h2>A little direction.<br/>A lot of nostalgia.</h2><p>Three questions. A shortlist from the real RRUK catalogue, with a different console family in each spot.</p><p>Open each listing to check the model, condition, game region and included items. Use Console Checker to gather your TV and connection details.</p><Link href="/console-checker" className="text-link">Check a setup<ArrowUpRight size={16}/></Link></aside></div> : <div className="finder-results">
      <div className="section-heading"><div><h2 ref={resultRef} tabIndex={-1}>{matches.length ? 'Your next chapter could start here.' : 'A little more exploring, perhaps.'}</h2><p role="status">{matches.length ? `${matches.length} ${matches.length === 1 ? 'console family fits' : 'console families fit'} your choices, shown by item price.` : 'There is no direct-purchase console matching all three choices right now. Try another budget or chapter, or tell us what you are looking for.'}</p></div><button className="button outline" onClick={adjust}><RotateCcw size={16}/> Adjust my answers</button></div>
      <dl className="finder-answer-summary">{consoleQuestions.map(q => <div key={q.id}><dt>{({play:'Setup',era:'Chapter',budget:'Maximum item price'} as Record<string,string>)[q.id]}</dt><dd>{q.choices.find(c => c.value === answers[q.id as keyof Answers])?.label}</dd></div>)}</dl>
      {matches.length > 0 && <><ProductCards products={matches.map((match:{product:Product}) => match.product)}/><p className="small-print">Results follow active, orderable listings and your item-price limit. Sourced-to-order goods are sourced after purchase. Games, controllers, cables and power equipment are included only when named in the listing; check import requirements where stated.</p></>}
      <div className="finder-actions"><Link href="/shop?category=consoles&orderable=1" className="text-link">Explore all orderable consoles<ArrowUpRight size={16}/></Link><Link href="/personal-shopper?route=returning-player" className="button navy">Help with my console shortlist<ArrowUpRight size={16}/></Link><Link href="/console-hunt?route=collector" className="text-link">Start a free Console Hunt<ArrowUpRight size={16}/></Link></div>
    </div>}
    <p className="finder-privacy">Your answers stay on this page. <Link href="/collections">Browse the collections any time.</Link></p>
    <noscript><p>Enable JavaScript to use the finder, or <a href="/shop?category=consoles&amp;orderable=1">browse orderable consoles</a>.</p></noscript>
  </div>;
}
