const ps2Manual = { label: 'Sony: PS2 SCPH-90002 / SCPH-90003 instruction manual', href: 'https://www.playstation.com/content/dam/global_pdc/en/corporate/support/manuals/ps2-docs/scph-90004/SCPH-90002CB_90003CB_PS2_UG_EN.pdf' };
const manuals = { label: 'PlayStation: official manuals library', href: 'https://www.playstation.com/en-gb/support/hardware/manuals/' };
const nintendoCare = { label: 'Nintendo: looking after your Nintendo Switch', href: 'https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Tips-on-How-to-Keep-the-Nintendo-Switch-Console-in-Good-Working-Condition-1986856.html' };
export const journal = [
  {
    slug: 'choose-your-first-retro-console', title: 'Start with the game. Find your console.',
    category: 'Buying guides', mark: 'START', tone: 'blue', collection: 'consoles', minutes: 5,
    summary: 'A practical way back into retro gaming: one favourite game, the right machine and a setup you will actually use.',
    sections: [
      { heading: 'Begin with a memory, not a shopping list', paragraphs: [
        'The best first retro console is the one that gets switched on. Think of the game you would play this evening if you could: the soundtrack you still know, the racing game you shared, or the adventure you never finished. Write down its full title and the platform you remember.',
        'A little uncertainty is normal. Different versions of a game can have different features, and a familiar name does not guarantee the version you want. If you need help identifying a title, use Console Hunt and describe what you remember. You do not need to know the technical language.',
      ]},
      { heading: 'Make a complete setup budget', paragraphs: [
        'Set a comfortable total for the console, the physical game, a controller, saving your progress and connecting to your display. Compare the whole basket rather than just the largest price on the page. A cheap machine is not a complete bargain if the parts you need are missing.',
        'Read the included-items list line by line. A boxed console, a console bundle and a console-only offer are different things. Original packaging is lovely for a collection, but it is not necessary for enjoying the game. Spend on what matters to your own way of playing.',
      ]},
      { heading: 'Check the room you will play in', paragraphs: [
        'Look at the inputs on your television, the space around it and how far away you sit. Check the exact console model, game region and connection requirements. An adapter needs to suit the equipment at both ends; a familiar plug shape is not enough information.',
        'Our listings state the model and written contents. Sourced-to-order offers use representative brand illustrations, so pictured extras do not become part of your order. Ask a compatibility question before paying if anything is unclear.',
      ]},
      { heading: 'Choose playability over a perfect shelf', paragraphs: [
        'Honest cosmetic wear can be a sensible choice when your aim is playing. Read the condition description and decide which marks would bother you. If you need a particular colour, edition or level of presentation, make that part of the conversation before ordering.',
        'Start with one machine and one game. Leave room to enjoy the first evening before planning an entire collection. The next classic will still be there when you are ready.',
      ]},
    ], sources: [],
  },
  {
    slug: 'ps2-fat-vs-slim', title: 'PS2 Fat or Slim? Five questions before you choose.',
    category: 'Buying guides', mark: 'PS2', tone: 'coral', collection: 'playstation', minutes: 5,
    summary: 'Look beyond the silhouette. Model, region, included equipment and your own setup matter more than a blanket winner.',
    sections: [
      { heading: '1. Which exact model are you comparing?', paragraphs: [
        'Fat and Slim are useful descriptions of a shape, but they are not a complete specification. Ask for the model number and use the matching Sony manual. Do not assume that every console in the same family has identical connections or power equipment.',
        'A description such as SCPH-50003 is more useful than a general photograph. Our sourced listings define the model or edition in writing, and we will not silently substitute a different model or materially different condition.',
      ]},
      { heading: '2. Which games and region do you want?', paragraphs: [
        'Keep the intended physical games in mind. Check the game region and the console listing together. A Japanese collector edition deserves particular attention if your existing collection is made up of UK releases.',
        'Do not assume a special colour makes a console suitable for every game, television or power supply. If the listing says Japanese import, ask about the exact equipment and software you plan to use before ordering.',
      ]},
      { heading: '3. What is actually in the box?', paragraphs: [
        'A controller, the correct leads and suitable storage for your saves can matter more on the first evening than the case size. Read the written bundle contents rather than counting objects in a brand illustration.',
        'Sony’s model-specific instructions are the reference for connections and accessories. For example, the SCPH-90002/90003 manual identifies its rear AV MULTI OUT and AC IN connections; that is a description of those models, not a universal PS2 power specification.',
      ]},
      { heading: '4. Where will it live?', paragraphs: [
        'Consider shelf space, disc access, ventilation and how you will reach the controls and cables. Choose a sensible position before deciding that one shape is automatically better for your room.',
        'Avoid buying a stand or accessory based only on appearance. Use the correct model information and manufacturer instructions. A stable, uncluttered setup is more useful than squeezing in one extra display piece.',
      ]},
      { heading: '5. Are you collecting an edition or coming back to play?', paragraphs: [
        'A particular colour or original box might be the point of your collection. For a regular evening of games, clear condition details and the right included parts may deserve more of your budget.',
        'Neither route needs defending. Compare the actual offers, ask the remaining questions and choose the console that fits your reason for buying. Our standard console offers are for physical games; a preloaded game library is not included.',
      ]},
    ], sources: [ps2Manual,manuals],
  },
  {
    slug: 'retro-console-modern-tv-checklist', title: 'Old console. Modern TV. Make the right connection.',
    category: 'Setup & care', mark: 'SIGNAL', tone: 'mint', collection: 'controllers-cables', minutes: 4,
    summary: 'A five-minute checklist before buying leads, converters or a console for your current television.',
    sections: [
      { heading: 'Read the labels at both ends', paragraphs: [
        'Start with your console model and your TV model. Look up the available outputs and inputs in their own manuals. Take clear photographs of the labels if you are asking for help, keeping serial numbers or personal information out of a public post.',
        'Older equipment may have several connection choices. The SCPH-90002/90003 PS2 manual, for example, illustrates a supplied AV cable with yellow video and white/red audio connections. It describes that console and connection, not every retro system.',
      ]},
      { heading: 'Check what the adapter promises', paragraphs: [
        'A cable and a converter are not interchangeable descriptions. Before buying, confirm the supported source, the output connection, any power requirement and the intended display. Do not treat the presence of an HDMI-shaped port as proof of compatibility.',
        'For an adapter enquiry, tell us the console, the connection currently in use, the television and any equipment between them. That is enough to start a useful conversation without collecting a drawer full of speculative purchases.',
      ]},
      { heading: 'Keep the first test simple', paragraphs: [
        'Follow the manufacturer’s connection sequence. Select the matching TV input and use one known game. Avoid changing several settings or adding multiple splitters at the same time; it makes a connection problem harder to describe.',
        'If the picture or sound is wrong, note exactly what happens. A blank screen, an intermittent image and missing audio are different symptoms. A short description of the sequence is more helpful than “it does not work”.',
      ]},
      { heading: 'Ask before you complete the setup', paragraphs: [
        'Read each product’s compatibility and included-items list. A console illustration can contain props and an adapter listing can require equipment you already own; neither should be guessed from a picture.',
        'Use Console Checker for a guided list of the details to collect. It is a preparation tool, not an automated diagnosis or a guarantee of compatibility. We can review your question before you order.',
      ]},
    ], sources: [ps2Manual,manuals],
  },
  {
    slug: 'understanding-pre-owned-condition', title: 'Pre-owned, properly explained.',
    category: 'Buying guides', mark: 'HONEST', tone: 'gold', collection: 'consoles', minutes: 4,
    summary: 'How to read a condition description, distinguish a bundle from an illustration, and decide what matters to you.',
    sections: [
      { heading: 'A condition word is the beginning', paragraphs: [
        'A short label cannot describe every mark on a console that has been enjoyed for years. Use the condition notes, the included-items list and any compatibility information together.',
        'Our sourced pre-owned offers describe working equipment with age-related cosmetic wear. They do not promise a mint collector specimen. If presentation is especially important, tell us before ordering so we can clarify what you need.',
      ]},
      { heading: 'Know which kind of image you are viewing', paragraphs: [
        'Our sourced-to-order catalogue uses labelled generated brand illustrations. Those images create a consistent RetroReplay UK feel; they are not photographs of a particular unit.',
        'Your order is defined by the written model, condition and included items. Optional one-off stock listings can use photographs of the specific item. The distinction should be clear before you pay.',
      ]},
      { heading: 'Separate packaging from contents', paragraphs: [
        'Boxed does not mean sealed or unused. An empty replacement game case does not contain a game. A console-only description does not promise a controller just because one appears in the illustration.',
        'Some of our old-store packs and game bundles need exact contents confirming first. Those listings offer a free details request rather than an uncertain purchase. You can decide after the final contents and total are clear.',
      ]},
      { heading: 'Make a small list of deal-breakers', paragraphs: [
        'You might care about a particular colour, an original controller or a complete manual. Someone else might be happy with visible wear and only want a reliable evening of play. Both are reasonable.',
        'Ask specific questions and keep the agreed information with your order. We will discuss a materially different item before dispatch rather than silently changing what you ordered. Our condition guide, delivery information and returns policy explain the next steps.',
      ]},
    ], sources: [],
  },
  {
    slug: 'gifts-for-retro-gamers', title: 'A gift that says “I remember”.',
    category: 'Replay culture', mark: '1UP', tone: 'coral', collection: 'gifts-essentials', minutes: 4,
    summary: 'Find a thoughtful retro gift without guessing the wrong machine, region or missing accessory.',
    sections: [
      { heading: 'Start a very small investigation', paragraphs: [
        'Ask which console they loved, which game they still mention and whether they already have a working setup. The answer can turn a broad shopping idea into a personal gift.',
        'If you are keeping the surprise, a photograph of their current equipment can help you identify it. Keep private details out of anything you share publicly, and ask us privately if you need to confirm a model.',
      ]},
      { heading: 'Do not build a surprise out of assumptions', paragraphs: [
        'A controller has to suit the intended machine. A physical game needs the right platform and region. A console needs the parts listed for the chosen setup. Check those details before choosing wrapping paper.',
        'Read what is included and what is being sourced. Generated artwork is representative, so it is not a shopping list for every object shown. A details-request listing is a good place to ask about a particular bundle before paying.',
      ]},
      { heading: 'Small can still feel personal', paragraphs: [
        'A gaming mug, a detail for the desk or a replacement for a familiar worn accessory can make a thoughtful present. Choose something that connects with their habits rather than trying to guess the most expensive collectible.',
        'If you are buying for someone who already collects, it can be better to ask which gap they actually want to fill. The pleasure is often in getting the exact version right.',
      ]},
      { heading: 'Work back from the date', paragraphs: [
        'Read the complete delivery period before ordering, particularly for sourced items. The current default is delivery within 30 calendar days unless another period is agreed before purchase; it is not a next-day gift service.',
        'For a fixed birthday or celebration, contact us before payment to ask whether an appropriate plan can be agreed. We would rather give you a clear answer than let an illustration become an assumed arrival promise.',
      ]},
    ], sources: [],
  },
  {
    slug: 'build-a-collection-you-play', title: 'Build a collection you actually play.',
    category: 'Replay culture', mark: 'PLAY', tone: 'blue', collection: 'handhelds', minutes: 4,
    summary: 'A shelf with a purpose: fewer impulse buys, more finished games and a collection that feels like yours.',
    sections: [
      { heading: 'Give the collection a reason', paragraphs: [
        'Choose a theme that makes you want to sit down and play. It might be the games you borrowed as a child, one handheld family or the local multiplayer favourites your friends still talk about.',
        'A personal theme makes it easier to leave a tempting purchase behind. You are building something you enjoy, not passing an exam in how many consoles you own.',
      ]},
      { heading: 'Keep a simple record', paragraphs: [
        'A note with the title, platform, region, condition and missing parts can prevent duplicate purchases. Add where the save data lives and which controller or cable belongs with each machine.',
        'For a game you want to buy, record the exact version. “I own it” and “I own the edition I want to keep” can mean different things, but you should decide that deliberately.',
      ]},
      { heading: 'Make the next session easy', paragraphs: [
        'Keep the equipment you use accessible, with the right leads and somewhere sensible to put controllers after a session. A setup that takes half an hour to assemble is easy to admire and harder to enjoy.',
        'Choose one game for your next session before choosing the next five purchases. A finished level, a shared match or a remembered soundtrack can be a better milestone than another parcel.',
      ]},
      { heading: 'Share the story, not the price tag', paragraphs: [
        'Your first console does not have to be rare to be worth talking about. The memory of who played alongside you is often the interesting part.',
        'The Replay Room welcomes those stories. Tell us about a favourite game, a small setup or a project you are proud of. There is no minimum collection size and no need to pretend it is all immaculate.',
      ]},
    ], sources: [],
  },
  {
    slug: 'look-after-your-retro-setup', title: 'A little care between “one more goes”.',
    category: 'Setup & care', mark: 'CARE', tone: 'mint', collection: 'controllers-cables', minutes: 4,
    summary: 'Make care part of the routine, using the instructions for your own equipment rather than a universal cleaning trick.',
    sections: [
      { heading: 'Keep the right instructions close', paragraphs: [
        'Look up the manufacturer’s guidance for the exact console and accessory. Advice for a modern handheld, an old optical-disc console and a cartridge connector should not be treated as one interchangeable cleaning recipe.',
        'Nintendo’s Switch care guidance specifically warns against forcing incompatible cables into ports and against putting cleaning swabs inside its game-card slot. Follow the instructions for your own model rather than transferring a method from an unrelated machine.',
      ]},
      { heading: 'Give the setup some breathing room', paragraphs: [
        'Use the location and ventilation guidance in the console manual. Keep drinks away from the play area and avoid a cable arrangement that can pull equipment off a shelf.',
        'Look at the room before buying another organiser. A small, clear place for each lead and controller can be enough. Your setup should be easy to use and easy to put away.',
      ]},
      { heading: 'Notice changes and describe them', paragraphs: [
        'If a controller disconnects, a screen changes or an unfamiliar sound appears, write down when it happens and what was connected. That record makes a support conversation much more useful.',
        'Do not keep repeatedly trying a damaged power connection. Follow the manufacturer’s safety guidance and seek appropriate support. Our Console Checker helps you gather information; it does not tell you to open equipment or work on a power supply.',
      ]},
      { heading: 'Protect the next session', paragraphs: [
        'Keep physical games in suitable cases and store the manual with the equipment if you have it. Check that you have not mixed leads or adapters between systems after moving things around.',
        'For an RRUK order issue, contact us with the order reference before attempting a repair. We can explain the support or returns route and what information would help.',
      ]},
    ], sources: [nintendoCare,manuals],
  },
  {
    slug: 'welcome-to-the-replay-room', title: 'There is always room for player two.',
    category: 'Inside RRUK', mark: 'P2', tone: 'gold', collection: 'all', minutes: 3,
    summary: 'Why we are building the Replay Room: a place for the memories, questions and people behind the hardware.',
    sections: [
      { heading: 'A familiar feeling, a fresh home', paragraphs: [
        'RetroReplay UK is an independent shop, but the things that make retro gaming special do not fit on a price label. They are the games you borrowed, the machine you saved for and the person who always won the second round.',
        'The Replay Room is a place to collect those stories alongside practical buying and setup guides. We want it to feel welcoming whether you own a room full of consoles or are thinking about your very first one.',
      ]},
      { heading: 'Real contributions, carefully shared', paragraphs: [
        'You can send a gaming memory or a story about your setup through the community page. Choose a display name, keep private information out of the story and tell us that you are happy for it to be published.',
        'Every contribution is reviewed before it appears. We will not fill the room with invented members, copied testimonials or made-up conversations. If the community wall is quiet at the beginning, it is because it is new.',
      ]},
      { heading: 'Helpful beats gatekeeping', paragraphs: [
        'There is room for collectors, occasional players and people returning after a long break. Ask questions plainly. Give advice kindly. Respect original games, creative work and each other.',
        'Public stories are not the place to post order details, private contact information, piracy links or advertisements. Support questions have a separate route so we can help without putting your details on a public page.',
      ]},
      { heading: 'Help shape the next chapter', paragraphs: [
        'Tell us which guides would help you, what console you would like to understand and which memory still makes you smile. A useful brand is built through consistent care, not by claiming a community already exists.',
        'For us, “The classics. Back in play.” is an invitation: enjoy something familiar, find something new to you and leave space for the next player.',
      ]},
    ], sources: [],
  },
];
export const getArticle = slug => journal.find(a => a.slug === slug);
