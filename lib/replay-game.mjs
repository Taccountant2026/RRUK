export const replaySymbols = ['controller', 'cartridge', 'arcade', 'disc', 'heart', 'star'];

export function createReplayDeck(random = Math.random) {
  const deck = replaySymbols.flatMap(symbol => [0, 1].map(copy => ({ id: `${symbol}-${copy}`, symbol })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function replayFlip(deck, open, matched, index) {
  if (!Number.isInteger(index) || !deck[index] || open.length >= 2 || open.includes(index) || matched.includes(deck[index].symbol)) return null;
  const next = [...open, index];
  const pair = next.length === 2 && deck[next[0]].symbol === deck[next[1]].symbol;
  return { open: pair ? [] : next, matched: pair ? [...matched, deck[index].symbol] : [...matched], move: next.length === 2 ? 1 : 0, pair };
}
