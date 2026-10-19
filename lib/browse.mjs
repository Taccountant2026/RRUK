export const collections = [
  { slug: 'playstation', name: 'PlayStation', label: 'THE ORIGINAL PLAYERS', description: 'PlayStation, PS2 and PSP. From living-room legends to pocket-sized favourites.', art: 'consoles', tone: 'blue', mark: 'PS' },
  { slug: 'nintendo', name: 'Nintendo', label: 'A LITTLE EVERYDAY MAGIC', description: 'Game Boy, GameCube, Nintendo 64 and the accessories that keep play going.', art: 'consoles', tone: 'coral', mark: 'N' },
  { slug: 'xbox', name: 'Xbox', label: 'BACK TO THE BIG GREEN BUTTON', description: 'Original Xbox and Xbox 360 consoles, controllers and connections.', art: 'accessories', tone: 'mint', mark: 'X' },
  { slug: 'sega-atari', name: 'Sega & Atari', label: 'WHERE ANOTHER LEVEL BEGAN', description: 'Dreamcast, Master System, Atari and the controllers you remember.', art: 'consoles', tone: 'gold', mark: 'SEGA' },
  { slug: 'consoles', name: 'Home consoles', label: 'MAKE ROOM FOR A CLASSIC', description: 'Choose the machine at the heart of your next setup.', art: 'consoles', tone: 'blue', mark: 'PLAY' },
  { slug: 'handhelds', name: 'Handhelds', label: 'BIG MEMORIES. SMALL SCREENS.', description: 'Game Boy, GBA, DS and PSP adventures for a little time to yourself.', art: 'consoles', tone: 'coral', mark: 'GO' },
  { slug: 'controllers-cables', name: 'Controllers & connections', label: 'COMPLETE THE SETUP', description: 'Controllers, memory cards, leads and adapters. Check the exact model before ordering.', art: 'accessories', tone: 'mint', mark: 'P2' },
  { slug: 'cases', name: 'Replacement game cases', label: 'A HOME FOR YOUR FAVOURITES', description: 'Empty replacement cases for physical collections. Confirm pack contents before payment.', art: 'cases', tone: 'gold', mark: 'KEEP' },
  { slug: 'gifts-essentials', name: 'Gifts & little essentials', label: 'SMALL THINGS. BIG PERSONALITY.', description: 'Gaming desk details, a favourite mug and the small things that make a setup yours.', art: 'accessories', tone: 'coral', mark: '1UP' },
];

export function inCollection(product, slug) {
  const t = product.title.toLowerCase();
  if (slug === 'all' || !slug) return true;
  if (slug === 'playstation') return /playstation|\bps[12]\b|\bpsp\b/.test(t);
  if (slug === 'nintendo') return /nintendo|game boy|gamecube|\bsnes\b|joy-con/.test(t);
  if (slug === 'xbox') return /xbox|kinect/.test(t);
  if (slug === 'sega-atari') return /sega|dreamcast|atari/.test(t);
  if (slug === 'handhelds') return product.category === 'consoles' && /game boy|\bds\b|\bpsp\b/.test(t);
  if (slug === 'consoles') return product.category === 'consoles' && !inCollection(product, 'handhelds');
  if (slug === 'cases') return product.artKind === 'cases' || /empty.*case/.test(t);
  if (slug === 'gifts-essentials') return /mug|keycap|wipes|holder clips|thumb grips|desk mat/.test(t);
  if (slug === 'controllers-cables') return product.category === 'accessories' && !inCollection(product, 'cases') && !inCollection(product, 'gifts-essentials');
  return false;
}
export function browseFilters(params = {}) {
  const first = key => typeof params[key] === 'string' ? params[key].trim() : '';
  return {
    q: first('q').slice(0, 100),
    collection: collections.some(c => c.slug === first('collection')) ? first('collection') : 'all',
    category: ['consoles','games','accessories'].includes(first('category')) ? first('category') : '',
    sort: ['featured','price-low','price-high','name'].includes(first('sort')) ? first('sort') : 'featured',
    max: /^\d{1,5}$/.test(first('max')) && Number(first('max')) > 0 ? first('max') : '',
    orderable: first('orderable') === '1',
    page: /^\d{1,4}$/.test(first('page')) ? Math.max(1, Number(first('page'))) : 1,
  };
}
const featuredIds = ['source-397830727026','source-397885841575','source-397885707780','source-397885783901','source-397885612218','source-397830763607'];
function searchText(value) {
  return value.toLowerCase().replace(/\bps2\b/g,'playstation 2').replace(/\bps1\b/g,'playstation').replace(/\bn64\b/g,'nintendo 64').replace(/\bgameboy\b/g,'game boy');
}
export function browseProducts(products, filters) {
  const words = searchText(filters.q).split(/\s+/).filter(Boolean);
  return products.filter(p =>
    inCollection(p, filters.collection) && (!filters.category || p.category === filters.category) &&
    (!filters.orderable || p.active && !p.catalogueOnly) &&
    (!filters.max || !p.catalogueOnly && p.pricePence <= Number(filters.max) * 100) &&
    words.every(word => searchText(p.title + ' ' + p.description + ' ' + p.compatibility).includes(word))
  ).sort((a,b) => {
    if (filters.sort === 'name') return a.title.localeCompare(b.title);
    if (filters.sort.startsWith('price-')) {
      if (Boolean(a.catalogueOnly) !== Boolean(b.catalogueOnly)) return a.catalogueOnly ? 1 : -1;
      return filters.sort === 'price-low' ? a.pricePence-b.pricePence : b.pricePence-a.pricePence;
    }
    const rank = p => p.active ? featuredIds.includes(p.id) ? featuredIds.indexOf(p.id) : p.catalogueOnly ? 100 : 10 : 200;
    return rank(a)-rank(b) || a.title.localeCompare(b.title);
  });
}
export function browseUrl(filters, changes = {}, base = '/shop') {
  const values = {...filters,...changes}, q = new URLSearchParams();
  for (const key of ['q','collection','category','sort','max','page']) {
    if (values[key] && !(key==='collection' && values[key]==='all') && !(key==='sort' && values[key]==='featured') && !(key==='page' && values[key]===1)) q.set(key,String(values[key]));
  }
  if(values.orderable)q.set('orderable','1');
  return base+(q.size?'?'+q.toString():'');
}
export function relatedProducts(product, products, limit = 4) {
  const platform=collections.slice(0,4).find(c=>inCollection(product,c.slug));
  return products.filter(p=>p.id!==product.id&&p.active&&(platform?inCollection(p,platform.slug):p.category===product.category))
    .sort((a,b)=>Number(Boolean(a.catalogueOnly))-Number(Boolean(b.catalogueOnly))||Number(a.category===product.category)-Number(b.category===product.category)).slice(0,limit);
}
