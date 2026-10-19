import { orderLimit } from './commerce.mjs';

export const consoleQuestions = [
  { id: 'play', title: 'Where do you want to play?', detail: 'Pick the kind of setup you have in mind.', choices: [
    { value: 'home', label: 'On the big screen', detail: 'A home console for your TV setup.' },
    { value: 'handheld', label: 'In the palm of my hand', detail: 'A handheld to make your own.' },
    { value: 'any', label: 'Keep my options open', detail: 'Show me both kinds of console.' },
  ] },
  { id: 'era', title: 'Which chapter brings you back?', detail: 'A starting point for browsing, whether you were there or are discovering it now.', choices: [
    { value: 'classic', label: 'The earlier classics', detail: 'Atari, Master System, PlayStation, N64 and original Game Boy.' },
    { value: 'millennium', label: 'Around the millennium', detail: 'PS2, Xbox, GameCube, Dreamcast, PSP and Game Boy Advance.' },
    { value: 'any', label: 'Surprise me', detail: 'Explore across the generations.' },
  ] },
  { id: 'budget', title: 'What is your maximum item price?', detail: 'This is the console price. Each listing shows its delivery charge and exact contents.', choices: [
    { value: '10000', label: 'Up to £100', detail: 'A smaller starting point.' },
    { value: '15000', label: 'Up to £150', detail: 'A little more room to explore.' },
    { value: '25000', label: 'Up to £250', detail: 'A wider choice of classics.' },
    { value: '0', label: 'Show every price', detail: 'I will compare the listings.' },
  ] },
];

const profiles = [
  [/game-boy-advance/, 'gba', 'Game Boy Advance', 'handheld', 'millennium'],
  [/game-boy/, 'gameboy', 'Game Boy', 'handheld', 'classic'],
  [/psp-/, 'psp', 'PSP', 'handheld', 'millennium'],
  [/nintendo-ds-/, 'ds', 'Nintendo DS', 'handheld', 'millennium'],
  [/playstation-2/, 'ps2', 'PlayStation 2', 'home', 'millennium'],
  [/playstation/, 'ps1', 'PlayStation', 'home', 'classic'],
  [/xbox-360/, 'xbox360', 'Xbox 360', 'home', 'millennium'],
  [/original-xbox/, 'xbox', 'Original Xbox', 'home', 'millennium'],
  [/nintendo-64/, 'n64', 'Nintendo 64', 'home', 'classic'],
  [/gamecube/, 'gamecube', 'GameCube', 'home', 'millennium'],
  [/dreamcast/, 'dreamcast', 'Dreamcast', 'home', 'millennium'],
  [/master-system/, 'master-system', 'Master System', 'home', 'classic'],
  [/atari-2600/, 'atari', 'Atari 2600', 'home', 'classic'],
];

export function consoleProfile(product) {
  if (product?.category !== 'consoles') return null;
  const found = profiles.find(([pattern]) => pattern.test(String(product.slug || '')));
  if (!found) return null;
  return { family: found[1], name: found[2], play: found[3], era: found[4] };
}

export function findConsoles(products, answers) {
  if (!consoleQuestions.every(q => q.choices.some(c => c.value === answers?.[q.id]))) return [];
  const budget = Number(answers.budget);
  const seen = new Set();
  return products.map(product => ({ product, profile: consoleProfile(product) }))
    .filter(({ product: p, profile }) => profile && orderLimit(p) > 0 && !p.priceOnRequest && Number.isSafeInteger(p.pricePence) && p.pricePence >= 50
      && (!budget || p.pricePence <= budget) && (answers.play === 'any' || profile.play === answers.play)
      && (answers.era === 'any' || profile.era === answers.era))
    .sort((a, b) => a.product.pricePence - b.product.pricePence || a.product.slug.localeCompare(b.product.slug))
    .filter(({ profile }) => { if (seen.has(profile.family)) return false; seen.add(profile.family); return true; })
    .slice(0, 3);
}
