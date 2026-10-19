import { ShopError } from './commerce.mjs';

export const sourceOrderDefaults = {
  shippingPence: 0,
  deliveryEstimate: 'Delivered within 30 calendar days of your order, unless another period is agreed before you order.',
  items: {},
};

// Product contents come from the owner's 19 October eBay export. No listed
// quantity is treated as held stock. Ambiguous packs/game bundles stay quote-only.
const details = {
  '397830727026': { includes: ['PlayStation 2 Fat SCPH-50003 console', 'Console cables', 'Controller', 'Memory card'] },
  '397830754792': { includes: ['Atari 2600 PAL console', 'Joystick controller'] },
  '397830756703': { includes: ['Frost White PlayStation 2 console — Japanese import'] },
  '397830756798': { includes: ['Toys R Us edition PlayStation 2 console — Japanese import'] },
  '397830756898': { includes: ['Aqua Blue PlayStation 2 PAL console'] },
  '397830756996': { includes: ['Gundam edition PlayStation 2 console — Japanese import'] },
  '397830763276': { includes: ['PlayStation 2 Fat console', 'Controller', 'Console cables'] },
  '397830763378': { includes: ['PlayStation console', 'Controller', 'Memory card'] },
  '397830763562': { quoteReason: 'Confirm the six included game titles and contents before ordering.' },
  '397830763607': { includes: ['Original Xbox console', 'Console cables'] },
  '397830763639': { includes: ['Xbox 360 PAL console', 'Power cable'] },
  '397830763819': { includes: ['Nintendo 64 PAL console', 'Retail box'] },
  '397830764112': { includes: ['Official Dreamcast controller', 'VMU memory unit'] },
  '397832653902': { includes: ['Silver PlayStation 2 Fat PAL console'] },
  '397832655606': { includes: ['PlayStation 2 PAL console', 'Retail box'] },
  '397865902591': { includes: ['One 1 m black HDMI cable'], isNew: true },
  '397865909573': { includes: ['One UK three-pin to C7 figure-of-eight power lead'], isNew: true },
  '397865940787': { includes: ['One 1.8 m PlayStation composite AV cable'], isNew: true },
  '397880409889': { includes: ['Four arrow keycaps in yellow, black and red'], isNew: true },
  '397880446596': { includes: ['Three-way RCA AV switch', 'AV cable'], isNew: true },
  '397880577019': { includes: ['One Paladone PlayStation-shaped ceramic mug'], isNew: true },
  '397883641774': { includes: ['Ten individually packed AF Smart Wipes cleaning sachets'], isNew: true },
  '397883652845': { includes: ['Three SOULWIT cable-holder clips'], isNew: true },
  '397883666967': { includes: ['Four Nintendo Switch Joy-Con thumb grips'], isNew: true },
  '397885612218': { includes: ['PSP-3003 Mystic Silver console', 'Charger', 'Carry case', 'Manuals', 'Retail box'] },
  '397885643130': { includes: ['Official Dreamcast controller', 'Retail box'] },
  '397885675185': { includes: ['PlayStation PAL console', 'Controller', 'Console cables', 'Retail box'] },
  '397885707780': { includes: ['Grey Game Boy DMG-01 handheld'] },
  '397885734029': { includes: ['Black Xbox 360 Arcade HDMI console'] },
  '397885783901': { includes: ['Dreamcast PAL console', 'Controller', 'Console cables', 'Retail box'] },
  '397885788130': { quoteReason: 'Confirm the included games, case and bundle contents before ordering.' },
  '397885808647': { includes: ['Silver Tribal edition Game Boy Advance SP handheld'] },
  '397885841575': { includes: ['Purple GameCube PAL console', 'Power lead', 'AV lead'] },
  '397885851463': { quoteReason: 'Confirm the DS model and included game before ordering.' },
};
const newIds = new Set(['397830763741','397880431145','397880470862','397880505209','397880553571','397883680431','397967656808','397967754902','397967770003']);

export function sourceOrderCatalogue(catalogue, options = sourceOrderDefaults) {
  return catalogue.map(base => {
    const id=base.sourceItemIds[0], d=details[id]||{}, override=options.items?.[base.id]||{};
    const controller=id==='397880505209';
    const quoteReason=d.quoteReason||(base.artKind==='cases'?'Confirm the number of empty cases, condition and exact pack contents before ordering.':'');
    const price=controller?(base.title.endsWith('Black')?1499:2499):base.pricePence;
    const isNew=d.isNew||newIds.has(id)||controller;
    const includes=d.includes||[base.title];
    const compatibility=base.compatibility
      .replace(/We confirm these, and any suitable UK power equipment required, before you pay\./g,'Check the required game region and power equipment with us before ordering. Only the contents listed below are included.')
      .replace(/We confirm the model, video connection, game region and suitable UK power supply for the exact unit\. A controller, cables, games, box or manuals are included only as confirmed in your quote\./g,'Check the listed model, game region and power requirements before ordering. Controllers, cables, games, boxes and manuals are included only when named in the included-items list.')
      .replace(/before (?:you pay|payment)/g,'before ordering');
    return {...base,saleMode:'source',imageKind:'illustration',stock:0,active:override.active??true,
      catalogueOnly:Boolean(quoteReason),quoteReason,priceOnRequest:Boolean(quoteReason),
      pricePence:override.pricePence??price,guidePriceMaxPence:undefined,
      condition:isNew?'New':'Pre-owned',
      description:quoteReason?`${base.title}. ${quoteReason} Send a free availability request and we’ll confirm the details and total before payment.`:`${base.title}, sourced to order by RetroReplay UK. Order at the price shown and we source the described item, check it and arrange tracked UK delivery. The included-items list defines your order; illustrated extras are not included.`,
      conditionNotes:isNew?'Supplied unused. The illustration is representative and does not show a particular unit. Any material difference from the ordered description will be discussed with you before dispatch.':'Supplied in working condition with age-related cosmetic wear. We check hardware before dispatch. Appearance may vary between pre-owned units; we will not substitute a different model, colour or materially different condition without your agreement.',
      includes,compatibility,shippingPence:options.shippingPence,deliveryEstimate:options.deliveryEstimate,
    };
  });
}

export function parseSourceOptions(input, catalogue) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw new ShopError('Please check the catalogue settings.');
  if(!Number.isInteger(input.shippingPence)||input.shippingPence<0||input.shippingPence>50000)throw new ShopError('Enter a valid UK delivery charge.');
  const deliveryEstimate=typeof input.deliveryEstimate==='string'?input.deliveryEstimate.trim():'';
  if(!deliveryEstimate||deliveryEstimate.length>300||/[\u0000-\u001f\u007f]/.test(deliveryEstimate))throw new ShopError('Enter the delivery timing customers will see before ordering.');
  if(!input.items||typeof input.items!=='object'||Array.isArray(input.items)||Object.keys(input.items).length>catalogue.length)throw new ShopError('Please check the active items.');
  const ids=new Set(catalogue.map(p=>p.id)), items={};
  for(const [id,value] of Object.entries(input.items)){
    if(!ids.has(id)||!value||typeof value!=='object'||typeof value.active!=='boolean'||!Number.isInteger(value.pricePence)||value.pricePence<0||value.pricePence>1000000)throw new ShopError('Please check each item’s status and price.');
    const base=catalogue.find(p=>p.id===id), quoted=Boolean(details[base.sourceItemIds[0]]?.quoteReason||base.artKind==='cases');
    if(!quoted&&value.pricePence<50)throw new ShopError('An orderable item needs a price of at least £0.50.');
    items[id]={active:value.active,pricePence:value.pricePence};
  }
  return {shippingPence:input.shippingPence,deliveryEstimate,items};
}
