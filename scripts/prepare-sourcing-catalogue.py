"""Prepare an enquiry-only catalogue from an owner-supplied eBay active-listings CSV.

Usage: python scripts/prepare-sourcing-catalogue.py /absolute/path/to/export.csv
Quantities in the export are deliberately never treated as website stock.
Review titles, provenance and guide prices before deploying a refreshed catalogue.
"""
import csv
import json
import re
import sys
from decimal import Decimal
from pathlib import Path

TITLES = {
 '397830727026':'Sony PlayStation 2 Fat SCPH-50003 console bundle',
 '397830754792':'Atari 2600 PAL console bundle',
 '397830756703':'Sony PlayStation 2 Frost White — Japanese import',
 '397830756798':'Sony PlayStation 2 Toys R Us edition — Japanese import',
 '397830756898':'Sony PlayStation 2 Aqua Blue — PAL edition',
 '397830756996':'Sony PlayStation 2 Gundam edition — Japanese import',
 '397830763276':'Sony PlayStation 2 Fat console bundle',
 '397830763378':'Sony PlayStation console with controller & memory card',
 '397830763562':'Sega Master System II console bundle',
 '397830763607':'Original Xbox console with cables',
 '397830763639':'Microsoft Xbox 360 console with power cable',
 '397830763677':'Sony PlayStation 2 DualShock 2 controller',
 '397830763713':'Sony PlayStation 2 official 8 MB memory card',
 '397830763741':'Bitfunx OSSC HW V1.8 scan converter',
 '397830763783':'Sony PlayStation DualShock controller',
 '397830763819':'Nintendo 64 PAL console — boxed',
 '397830763856':'Nintendo GameCube official controller',
 '397830763957':'Super Nintendo SNES official controller',
 '397830764112':'Sega Dreamcast controller & VMU',
 '397832653902':'Sony PlayStation 2 Fat Silver — PAL console',
 '397832655606':'Sony PlayStation 2 PAL console — boxed',
 '397836279300':'Original Xbox official controller',
 '397836279498':'Xbox 360 official wireless controller',
 '397836282437':'Nintendo Wii Remote & Nunchuck',
 '397836282634':'Sega Saturn official controller',
 '397865874577':'Sony PlayStation 2 EyeToy USB camera — silver',
 '397865876242':'Sony PlayStation 2 EyeToy USB camera — black',
 '397865896836':'Sega Master System official controller — model 3020',
 '397865902591':'High-speed HDMI cable — 1 m, black',
 '397865909573':'UK figure-of-eight C7 power lead',
 '397865940787':'PlayStation composite AV cable — 1.8 m',
 '397869668444':'Atari 2600 official joystick',
 '397880409889':'Arrow keycap set — yellow, black & red',
 '397880431145':'RetroScaler2x AV to HDMI line doubler',
 '397880446596':'Three-way RCA AV switch with cable',
 '397880470862':'PlayStation 2 to HDMI adapter',
 '397880505209':'PS2 wireless vibration controller',
 '397880519090':'PlayStation 2 empty replacement game case',
 '397880536323':'Xbox & Xbox 360 empty replacement game cases',
 '397880543981':'Nintendo Wii empty replacement game cases',
 '397880553571':'PS2 Fat SATA hard-drive adapter',
 '397880577019':'Paladone PlayStation-shaped ceramic mug',
 '397883641774':'AF Smart Wipes — ten cleaning sachets',
 '397883652845':'SOULWIT cable holder clips — pack of three',
 '397883666967':'Nintendo Switch Joy-Con thumb grips — four-piece set',
 '397883680431':'PlayStation light-up gaming desk mat',
 '397885612218':'Sony PSP-3003 Mystic Silver — boxed bundle',
 '397885643130':'Sega Dreamcast official controller — boxed',
 '397885675185':'Sony PlayStation PAL console — boxed',
 '397885691886':'Xbox 360 Kinect sensor',
 '397885707780':'Nintendo Game Boy DMG-01 — grey',
 '397885734029':'Microsoft Xbox 360 Arcade — black, HDMI model',
 '397885783901':'Sega Dreamcast PAL console — boxed bundle',
 '397885788130':'Nintendo Game Boy Advance — white bundle',
 '397885808647':'Nintendo Game Boy Advance SP — silver Tribal edition',
 '397885841575':'Nintendo GameCube — purple console with leads',
 '397885844900':'Nintendo GameCube — purple console with leads',
 '397885851463':'Nintendo DS — silver handheld bundle',
 '397959743933':'Xbox & Xbox 360 empty replacement game cases',
 '397967656808':'Nintendo Wii to HDMI adapter',
 '397967754902':'Original Xbox HDMI adapter',
 '397967770003':'Xbox 360 HDMI optical audio adapter cable',
}
CONSOLES = set('397830727026 397830754792 397830756703 397830756798 397830756898 397830756996 397830763276 397830763378 397830763562 397830763607 397830763639 397830763819 397832653902 397832655606 397885612218 397885675185 397885707780 397885734029 397885783901 397885788130 397885808647 397885841575 397885844900 397885851463'.split())
CASES = set('397880519090 397880536323 397880543981 397959743933'.split())
HANDHELDS = set('397885612218 397885707780 397885788130 397885808647 397885851463'.split())
# Duplicate selling lots become one sourcing choice; both export references remain.
MERGE = {'397885844900':'397885841575', '397959743933':'397880536323'}

with open(sys.argv[1], encoding='utf-8-sig', newline='') as f:
 rows = list(csv.DictReader(f))
items = {}
for row in rows:
 source_id = row['Item number']
 if source_id not in TITLES:
  raise ValueError(f'Unreviewed source listing: {source_id}')
 variation = row['Variation details']
 if ';' in variation:
  continue  # Parent aggregate: do not duplicate the six colour options.
 colour = variation.split('=',1)[1].strip().title() if variation else ''
 key = MERGE.get(source_id, source_id) + ('-'+re.sub('[^a-z0-9]+','-',colour.lower()).strip('-') if colour else '')
 price = int(Decimal(row['Current price'])*100) if row['Current price'] else 0
 if key in items:
  items[key]['sourceItemIds'].append(source_id)
  if price:
   items[key]['guidePriceMaxPence'] = max(price, items[key]['pricePence'])
   items[key]['pricePence'] = min(price, items[key]['pricePence'])
  continue
 category = 'consoles' if source_id in CONSOLES else 'accessories'
 art = 'handhelds' if source_id in HANDHELDS else 'consoles' if source_id in CONSOLES else 'cases' if source_id in CASES else 'accessories'
 title = TITLES[source_id] + (' — '+colour if colour else '')
 slug = re.sub('[^a-z0-9]+','-',title.lower()).strip('-')
 description = f'Looking for {title}? Request availability and we’ll check sourcing options for you. We confirm the specific item, its condition, photos and final price before you choose whether to buy.'
 compatibility = 'Tell us your console model and intended use. We confirm the exact model, connections, region and any extra parts needed before payment.'
 if source_id in CONSOLES:
  compatibility = 'We confirm the model, video connection, game region and suitable UK power supply for the exact unit. A controller, cables, games, box or manuals are included only as confirmed in your quote.'
 if 'Japanese import' in title:
  compatibility = 'Japanese import: game-region restrictions, video output and power requirements may differ from a UK console. We confirm these, and any suitable UK power equipment required, before you pay. Do not connect an unsuitable supply.'
 if source_id in CASES:
  description = 'Give your physical collection a fresh home. Ask us to source empty replacement cases for this platform. We confirm the case style, colour, exact number of cases, condition and total price before you buy. Games, cover artwork and manuals are not included unless expressly agreed.'
  compatibility = 'Confirm the console platform, disc size and preferred case style in your request. The quantity field counts requested packs; tell us how many individual cases you need, and we’ll confirm the pack contents before quoting.'
 if source_id == '397830764112':
  description += ' This request is for a controller and VMU, not a Dreamcast console.'
 if source_id == '397885851463':
  compatibility = 'The exact Nintendo DS model, region, charger and any physical game are confirmed before payment. This is a DS-family request, not a Game Boy model.'
 if source_id in {'397880470862','397967656808','397967754902','397830763741','397880431145'}:
  compatibility = 'Adapters are not universal. Tell us the exact console and television models. We confirm supported video modes, connections and required leads or power; an HDMI connection does not itself guarantee upscaling or compatibility.'
 if source_id == '397880553571':
  compatibility = 'For compatible PS2 Fat models only; exact console and drive compatibility must be checked. Do not assume network functionality from the adapter name. No hard drive, software or game library is included unless specifically agreed.'
 if source_id == '397880409889':
  compatibility = 'Keycaps only, not a keyboard. Confirm switch stem, layout, key size and keycap profile before ordering.'
 if source_id == '397865909573':
  compatibility = 'A power lead is not a power supply or voltage converter. Confirm the appliance inlet, required rating, plug and electrical suitability for your exact equipment before buying.'
 items[key] = dict(id='source-'+key,slug=slug,title=title,category=category,description=description,
  condition='To be confirmed',conditionNotes='We’ll confirm the cosmetic condition, checks, known wear or repairs and photos for the specific item before you pay. No current unit or grade is promised by this catalogue illustration.',
  pricePence=price,stock=0,active=True,images=[f'/assets/catalogue/{art}.png'],
  includes=['Exact contents and any accessories will be confirmed in your quote.'],compatibility=compatibility,
  shippingPence=0,deliveryEstimate='Sourcing and tracked UK delivery cost and timing confirmed before payment.',
  warrantyMonths=6 if category=='consoles' else 0,catalogueOnly=True,priceOnRequest=not price or source_id in CASES,
  artKind=art,sourceItemIds=[source_id])
output = Path(__file__).resolve().parents[1]/'lib/sourcing-catalogue.json'
output.write_text(json.dumps(list(items.values()),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert len(items)==65, len(items)
assert sum(len(p['sourceItemIds']) for p in items.values())==67
print(f'{len(items)} enquiry-only catalogue entries; 67 source options; no sale stock imported.')
