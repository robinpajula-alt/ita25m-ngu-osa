/* WANDERER'S FOLLY — game.js v2 */

/* -DATA- */
var TILE_SIZE = 116;
var VIEW_COLS = 17;
var VIEW_ROWS = 13;

/* ── TREE OVERSCAN ──────────────────────────────────────────────────────────
   Controls how wide/tall tree sprites extend beyond their tile boundary.
   1.0 = exactly one tile (no overlap with neighbours).
   1.6 = canopy is 60% wider than one tile  (recommended: 1.2 – 2.0).
   3.2 = tree height spans 3.2 tile-heights (recommended: 2.0 – 4.0).
   These are read by buildGrid() so a page refresh applies changes.         */
var TREE_WIDTH_SCALE  = 1.6;   /* canopy width  in tile-widths  */
var TREE_HEIGHT_SCALE = 3.2;   /* canopy height in tile-heights */

var SKIN_COLORS   = ["#FDDBB4","#E8B88A","#C68642","#8D5524","#4A2912"];
var HAIR_COLORS   = ["#2C1810","#8B4513","#DAA520","#C0C0C0","#CC0000"];
var OUTFIT_COLORS = ["#2E4A7A","#7A2E2E","#2E7A4A","#6B2E7A","#4A4A2E"];

var CLASSES = {
  knight:{ hp:120, atk:15, def:20, spd:8  },
  rogue: { hp:80,  atk:22, def:10, spd:18 },
  mage:  { hp:70,  atk:28, def:8,  spd:12 }
};

var SHOP_DATA = {
  weapons:[
    {id:"w1",name:"Rusty Dagger",      icon:"🗡️",type:"Light Weapon",desc:"Better than nothing. Barely.",     slot:"weapon",price:30, stats:{atk:5}},
    {id:"w2",name:"Iron Sword",        icon:"⚔️",type:"Sword",       desc:"Reliable. Heavy. Honest.",         slot:"weapon",price:80, stats:{atk:12}},
    {id:"w3",name:"Shadow Blade",      icon:"🌑",type:"Cursed Blade",desc:"Whispers sweet nothings at night.",slot:"weapon",price:200,stats:{atk:22,spd:5}},
    {id:"w4",name:"Gilded Broadsword", icon:"🏅",type:"Greatsword",  desc:"Flashy. Very expensive. Worth it.",slot:"weapon",price:350,stats:{atk:30,def:5}},
    {id:"w5",name:"Staff of Confusion",icon:"🔮",type:"Magic Staff", desc:"Confuses enemies. And you.",       slot:"weapon",price:160,stats:{atk:18,spd:-2}},
    {id:"w6",name:"Shortbow",          icon:"🏹",type:"Ranged",      desc:"For cowards. Efficient cowards.",  slot:"weapon",price:120,stats:{atk:14,spd:4}}
  ],
  armor:[
    {id:"a1",name:"Leather Vest",     icon:"🧥",type:"Light Armor", desc:"Smells of adventure. Or goat.",   slot:"chest", price:50, stats:{def:8}},
    {id:"a2",name:"Chain Mail",       icon:"🛡️",type:"Medium Armor",desc:"Jingles when you walk. Tactical?",slot:"chest", price:140,stats:{def:16,spd:-2}},
    {id:"a3",name:"Plate Armor",      icon:"🦾",type:"Heavy Armor", desc:"A steel embrace. Very tight.",    slot:"chest", price:300,stats:{def:26,hp:20,spd:-5}},
    {id:"a4",name:"Robe of Vagueness",icon:"👘",type:"Magic Robe",  desc:"What is it? Nobody knows.",       slot:"chest", price:180,stats:{def:10,atk:8}},
    {id:"h1",name:"Iron Helm",        icon:"⛑️",type:"Helmet",      desc:"Slightly dents your ego.",        slot:"helmet",price:70, stats:{def:8,hp:10}},
    {id:"h2",name:"Wizard Hat",       icon:"🧙",type:"Magic Hat",   desc:"It's pointy. That matters.",      slot:"helmet",price:120,stats:{atk:10,def:4}},
    {id:"b1",name:"Worn Boots",       icon:"👢",type:"Boots",       desc:"One hole. Character building.",   slot:"boots", price:40, stats:{spd:4}},
    {id:"b2",name:"Swift Treads",     icon:"👟",type:"Light Boots", desc:"Go fast. Trip gracefully.",       slot:"boots", price:130,stats:{spd:10}}
  ],
  items:[
    {id:"i1",name:"Health Potion",    icon:"🧪",type:"Consumable",desc:"Tastes of regret. Heals 40 HP.",  slot:"item",price:25,stats:{hp:40},consumable:true},
    {id:"i2",name:"Big Health Potion",icon:"🫙",type:"Consumable",desc:"For bigger regrets. Heals 80 HP.",slot:"item",price:55,stats:{hp:80},consumable:true},
    {id:"i3",name:"Lucky Charm",      icon:"🍀",type:"Passive",   desc:"Nothing happens. Feel better.",   slot:"item",price:90,stats:{spd:3,atk:3}},
    {id:"i4",name:"Ancient Map",      icon:"🗺️",type:"Key Item",  desc:"Shows where you are. Useless.",   slot:"item",price:15,stats:{}}
  ]
};
var ALL_ITEMS = SHOP_DATA.weapons.concat(SHOP_DATA.armor).concat(SHOP_DATA.items);

var NPCS = {
  elder:{
    icon:"🧙", name:"Elder Morthis",
    lines:[
      "Four hundred years in this village. You'd think I'd run out of things to worry about. I have not.",
      "The Dark Forest was planted by someone who wanted to be left alone. It worked.",
      "The desert to the south isn't trying to kill you. It simply doesn't care if you live. There's a difference.",
      "I remember when this forest was just... forest. Before it started answering back.",
      "If you find anything glowing near the old shrine — don't touch it with bare hands. I learned that the expensive way.",
      "The village has survived seven wanderers this year. You look like you could make it eight."
    ],
    questOffer:"q1",
    questOfferLines:[
      "Wait — before you wander into something you'll regret, I have a problem.",
      "My herb satchel. Brown leather, brass clasp, smells of rosemary and old mistakes. Somewhere in the forest east of here.",
      "I'd fetch it myself but my knees have opinions about that. Find it, bring it back. I'll make it worth your while."
    ],
    questActiveLines:[
      "The satchel is still out there. Brown bag, brass clasp. It won't come to you.",
      "My back is reminding me hourly that you haven't returned yet. Please hurry."
    ],
    questReturnLines:[
      "You actually found it. I'll admit — you have the look of someone who loses things, not finds them.",
      "The herbs are intact. Remarkable.",
      "Here, take this gold. And this — a Forest Fragment. I pulled it from the roots of an old oak forty years ago and never understood it.",
      "Something tells me it belongs with you now."
    ],
    questMemoryLines:[
      "The herbs are back where they belong. My back has forgiven you. My knees remain sceptical.",
      "Four hundred years and I still misplace things. You'd think I'd learn. I haven't.",
      "I've been thinking about that Fragment. Do you feel it pulling? I used to, from across the village.",
      "You found the satchel. I gave you the Fragment. Whatever happens next — that part is yours."
    ]
  },
  merchant:{
    icon:"🏪", name:"Merda the Merchant",
    lines:[
      "Browse, buy, or move along. This isn't a library.",
      "Everything here is priced fairly. Fairly for me, anyway.",
      "The cursed items are clearly labelled. Mostly. Check the fine print.",
      "I've been at this crossroads eleven years. The road brings everyone eventually.",
      "That sword? Good steel. The previous owner just... didn't need it anymore. Don't ask why."
    ],
    opensShop:true
  },
  guard:{
    icon:"💂", name:"Guard Borvald",
    lines:[
      "Halt! ...You can pass. I just like the sound of it.",
      "Three rules in this village: no running, no unsolicited philosophy, and absolutely no running while philosophising.",
      "The Dark Forest path is east. Three adventurers went in last month. Two came back. The third came back... changed.",
      "I've guarded this gate six years. Nothing bad has happened on my watch. Probably a coincidence.",
      "You've got that look — like you're about to do something inadvisable. I've seen it before. Usually ends with paperwork.",
      "The innkeeper makes decent stew. Don't ask what's in it. She'll tell you and you'll regret asking."
    ]
  },
  hermit:{
    icon:"🧝", name:"Hermit Zel",
    lines:[
      "Oh. A visitor. I'd say unexpected but I've been expecting someone for years. It's exhausting.",
      "The Dark Forest and I have an understanding. I leave it alone. It leaves me mostly alone.",
      "Don't follow the lights in the forest at night. They're not trying to guide you. They're just curious what you'll do.",
      "I've lived out here long enough to know the difference between silence and something being very quiet.",
      "The desert? I went once. The heat rearranges your thoughts. Some of them don't come back.",
      "If the forest starts feeling smaller — it is. Keep moving."
    ],
    questOffer:"q2",
    questOfferLines:[
      "Since you're here and capable of walking — I need something.",
      "Darkwood. Three pieces. Black-barked logs from the dead trees deep in the eastern forest.",
      "My fire won't take anything else. Regular wood just... weeps. It's unpleasant for everyone.",
      "Bring me three pieces and I'll pay you well. And tell you something worth knowing."
    ],
    questActiveLines:[
      "Darkwood. Three pieces. Black bark, heavier than it looks. Eastern forest, near the dead trees.",
      "The forest won't make it easy. It never does. But you look like someone it'll tolerate."
    ],
    questReturnLines:[
      "Three pieces. You actually managed it.",
      "The fire's been cold for a week. I was starting to think in straight lines. Horrible.",
      "Here — gold, as promised.",
      "And this: a Dark Fragment. I found it in the roots of a dead tree years ago. It hummed whenever the forest went quiet.",
      "I don't know what it's for. But it reacted when you walked up. So. Yours now."
    ],
    questMemoryLines:[
      "The fire's been burning well. Whatever Darkwood does — it works.",
      "You carried three pieces through that forest. It notices things like that, you know.",
      "The Dark Fragment is yours now. Don't lose it. The forest remembers who has it.",
      "I've been thinking. That fragment — it hummed louder after you left. I think it's looking for the others."
    ]
  },
  innkeeper:{
    icon:"🍺", id:"innkeeper", name:"Innkeeper Greta",
    lines:[
      "The beds are clean. The dreams are your own problem.",
      "Stew's on. I don't know what's in it today. Neither does the cook. We've stopped asking.",
      "You look like you've been walking too long. There's a bed inside — find it, use it.",
      "Sleep heals more than potions and costs less. That's not advice, that's accounting.",
      "We've had all sorts through here. Knights, mages, one very confused goat. You fit right in.",
      "The inn has stood two hundred years. Something about wanderers needing a place to fall apart quietly."
    ]
  },
  nomad:{
    icon:"🏜️", name:"Rael, Desert Nomad",
    lines:[
      "You came from the north. I can tell — you're still walking like the ground will be soft.",
      "The desert isn't empty. It's that what lives here doesn't want to be seen.",
      "I've crossed this desert forty-seven times. Every crossing is different. The desert remembers.",
      "Sun Stones form after storms — where lightning meets sand, something crystallises. Gold-coloured, warm to the touch.",
      "The old shrine north of here... I've felt it pulling for years. Something wants to wake up.",
      "Water, shade, and knowing when to stop. That's everything the desert will teach you, if you survive the lesson."
    ],
    questOffer:"q3",
    questOfferLines:[
      "Hold on — I've been waiting for someone heading deeper into the desert.",
      "I'm looking for a Sun Stone. Gold crystal, warm to the touch — forms where lightning strikes sand after a storm.",
      "I've searched three years and found nothing. But a fresh pair of eyes might have better luck.",
      "Find one and bring it to me, and I'll trade you a Desert Fragment in return. Ancient thing, part of something larger.",
      "The stone for the Fragment. That's the deal, if you want it."
    ],
    questActiveLines:[
      "The Sun Stone is out there — gold crystal, warm to the touch. Look where the sand is scorched.",
      "Still searching? Take your time. Rushing the desert is how people disappear."
    ],
    questReturnLines:[
      "You have it. I can feel the warmth from here — that's the one.",
      "Three years I looked. You found it in — actually, don't tell me how long it took. It'll sting.",
      "Here. The Desert Fragment, as promised. And gold — enough that this doesn't feel like charity.",
      "Three fragments, an old shrine, a purpose you haven't fully remembered yet. That's all I know.",
      "The desert told me someone would come. I assumed it was being dramatic.",
      "It wasn't."
    ],
    questMemoryLines:[
      "The Sun Stone is where it belongs now. I won't tell you where. It's better you don't know.",
      "Three years searching. You found it in a day or two. The desert has opinions about people, apparently.",
      "You carry the Desert Fragment. I can feel it from here. The shrine is north — you know that already, don't you.",
      "Funny thing — since the trade, the desert's been quieter. I don't know what that means. I'm choosing not to worry about it."
    ]
  }
};

/* ── Quest System ── */
var QUESTS = {
  q1:{ id:"q1", title:"The Herbalist's Satchel", desc:"Elder Morthis lost his herb satchel somewhere in the forest.", steps:["Find the lost satchel in the forest","Return it to Elder Morthis"], step:0, done:false, locked:false, reward:{gold:40,fragment:"forest_fragment"} },
  q2:{ id:"q2", title:"Darkwood for the Hermit", desc:"Hermit Zel needs 3 pieces of Darkwood from the dark forest.", steps:["Collect 3 Darkwood pieces (0/3)","Bring them to Hermit Zel"], step:0, done:false, locked:false, reward:{gold:60,fragment:"dark_fragment"} },
  q3:{ id:"q3", title:"The Nomad's Price", desc:"Find a Sun Stone in the desert and trade it with the Desert Nomad.", steps:["Find a Sun Stone in the desert","Trade it with the Desert Nomad"], step:0, done:false, locked:false, reward:{gold:80,fragment:"desert_fragment"} },
  qFinal:{ id:"qFinal", title:"The Spirit Shrine", desc:"Bring all 3 Spirit Fragments to the Shrine and restore your memory.", steps:["Collect all 3 Spirit Fragments","Activate the Spirit Shrine"], step:0, done:false, locked:true, reward:{gold:0} }
};

var questState = { active:{}, completed:{}, inventory:[], collect:{} };

/* ── ITEM SPRITE FILENAMES ─────────────────────────────────────────────────
   To use a custom image for an item marker, set useSprite:true and set the
   src to the filename of your image inside the assets/ folder.
   e.g. put "log.png" in your assets/ folder and set src:"assets/log.png"   */
var ITEM_SPRITES = {
  darkwood: { src: "assets/log.png"      },
  satchel:  { src: "assets/satchel.png"  },
  sunstone: { src: "assets/sunstone.png" }
};

var MAP_ITEMS = [
  {r:8,  c:15,  id:"satchel",  label:"📦", useSprite:true, found:false},
  {r:9, c:19, id:"darkwood", label:"🪵", useSprite:true, found:false},
  {r:3, c:35, id:"darkwood", label:"🪵", useSprite:true, found:false},
  {r:12, c:36, id:"darkwood", label:"🪵", useSprite:true, found:false},
  {r:23, c:30,  id:"sunstone", label:"💎", useSprite:true, found:false},
  {r:9,  c:30, id:"shrine",   label:"✨", found:false, isShrine:true}
];

function getMapItem(r,c){
  for(var i=0;i<MAP_ITEMS.length;i++){ if(MAP_ITEMS[i].r===r&&MAP_ITEMS[i].c===c) return MAP_ITEMS[i]; }
  return null;
}

/* -MAP-
  T=forest tree  #=dark tree  .=grass walkable  G=plain grass (never darkened)
  P=path  V=village  S=sand  D=desert walkable
  NE/NG/NM/NI/NH/NN = NPC spawns
  Border of map is always trees/walls                    */
var MAP_DEF = [
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T"],
  ["T","NE","T","T","T","","","","","","","","","","","T","T","T","T","T","T","T","T","#","#","#","#","#","T","T","T","T","T","T","T","T","T","T","T","T"],
  ["T","","T","T","","","V","NI","V",".",".",".",".",".",".","","T","T","T","T","#","#","#",".",".",".",".","#","#","#","#","#","#","#","#","#","T","T","T","T"],
  ["T","","T","","",".","V","V","V",".",".",".",".",".",".","","T","T","#","#","#",".",".",".",".",".",".",".",".",".","#","#","#","#",".",".","T","T","T","T"],
  ["T","","T","",".",".",".",".",".",".",".",".",".",".",".","","T","#","#",".",".",".",".",".",".",".",".",".",".",".",".","#","#",".",".",".","T","T","T","T"],
  ["T","","",".",".",".","","","","","","","V","NG",".",".","","",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".",".","T","T","T","T"],
  ["T","",".","",".",".","","V","V","V","V","V","V","V","","","T","T","#",".",".","#","#",".",".",".",".","#","#","#",".",".",".",".","#","#","T","T","T","T"],
  ["T","",".",".",".","","","V","V","NM","V","V","V","V","",".","","T","#",".","#","#","#","#",".",".","#","#","#","#","#",".",".",".","#","#","T","T","T","T"],
  ["T","",".",".",".","","","V","V","V","V","V","V","V",".",".","","#","#",".","#","#","#","#",".",".","#","#","#","#","#","#",".",".",".","#","T","T","T","T"],
  ["T","",".",".",".","","","V","V","V","V","V","V","V",".",".","","#","#",".","#","#","#","#",".",".","#","#","#","#",".","#",".",".",".",".","T","T","T","T"],
  ["T","",".",".",".",".","","","","","","",".",".",".","","T","#","#",".","#","#","#","#",".",".","#","#","#","#",".",".",".",".",".",".","#","T","T","T"],
  ["T","",".",".",".",".",".",".",".",".",".",".",".",".","","","T","#","#",".","#","#","#",".",".",".",".","#","#","#",".",".",".","#",".",".",".","#","T","T"],
  ["T","",".",".",".",".",".",".",".",".",".",".",".",".","","T","T","#","#","#","#","#","V","V","V","NH",".","#","#","#","#","#","#","#",".",".",".","#","#","T"],
  ["T","T","",".",".",".",".",".",".",".",".",".",".","","T","T","T","T","T","#","#","#","V","V","V","V","V","#","#","#","#","#","#","#",".",".",".","#","#","#"],
  ["T","T","T","",".",".",".",".",".",".",".",".","","T","T","T","T","T","T","T","T","#","#","#","V","V","V","#","#","#","#","#","#","#",".",".",".","#","#","#"],
  ["T","T","T","T","",".",".",".",".",".",".",".","","T","T","T","T","T","T","T","T","T","T","#","#","#","#","#","#","#","#","#","#","S","S","S","S","#","#","#"],
  ["T","%","%","%","%","","","","","","","","","T","T","T","T","T","T","T","T","T","T","T","T","T","#","#","#","#","#","#","S","S","S","S","S","S","#","#"],
  ["T","S","S","S","S","S","S","S","S","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","#","S","S","S","S","S","S","S","S","S","S","S","#"],
  ["T","S","S","S","S","S","S","S","S","S","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","S","S","S","S","S","S","S","S","S","S","S","S","T"],
  ["T","S","S","S","S","S","S","S","S","S","S","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","#","S","S","S","S","S","S","S","S","S","S","S","S","T"],
  ["T","S","NN","S","S","S","S","S","S","S","S","S","T","T","T","T","T","T","#","#","#","#","#","#","#","#","S","S","S","S","S","S","S","S","S","S","S","S","T","T"],
  ["T","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","T","T"],
  ["T","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","T","T"],
  ["T","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","S","T","S","S","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","S","S","S","S","S","T","T","T","S","NI","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","S","S","S","T","T","T","T","S","S","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T"],
  ["T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T","T"]
];
var GRID_H = MAP_DEF.length;
var GRID_W = MAP_DEF[0].length;
var NPC_CODES = {NE:"elder",NG:"guard",NM:"merchant",NI:"innkeeper",NH:"hermit",NN:"nomad"};

/* -AUDIO- */
var Audio = (function(){
  var ctx=null,masterGain=null,musicGain=null,sfxGain=null;
  var currentMusic=null,musicEnabled=true,sfxEnabled=true,stepPhase=0;

  function init(){
    try{
      ctx=new(window.AudioContext||window.webkitAudioContext)();
      masterGain=ctx.createGain(); masterGain.gain.value=0.7;
      musicGain =ctx.createGain(); musicGain.gain.value =0.28;
      sfxGain   =ctx.createGain(); sfxGain.gain.value   =0.55;
      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      masterGain.connect(ctx.destination);
    }catch(e){ctx=null;}
  }
  function resume(){ if(ctx&&ctx.state==="suspended") ctx.resume(); }
  function osc(type,freq,gain,start,dur,dest){
    if(!ctx) return;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,start);
    g.gain.setValueAtTime(gain,start);
    g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
    o.connect(g); g.connect(dest||sfxGain);
    o.start(start); o.stop(start+dur+0.01);
  }
  function sweep(type,f0,f1,gain,start,dur,dest){
    if(!ctx) return;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;
    o.frequency.setValueAtTime(f0,start);
    o.frequency.exponentialRampToValueAtTime(f1,start+dur);
    g.gain.setValueAtTime(gain,start);
    g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
    o.connect(g); g.connect(dest||sfxGain);
    o.start(start); o.stop(start+dur+0.01);
  }
  function noise(gain,start,dur,lpFreq,dest){
    if(!ctx) return;
    var len=Math.ceil(ctx.sampleRate*Math.min(dur+0.05,1));
    var buf=ctx.createBuffer(1,len,ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
    var src=ctx.createBufferSource(); src.buffer=buf;
    var lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=lpFreq||800;
    var g=ctx.createGain();
    g.gain.setValueAtTime(gain,start);
    g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
    src.connect(lp); lp.connect(g); g.connect(dest||sfxGain);
    src.start(start); src.stop(start+dur+0.05);
  }

  function sfxStep(biome){
    if(!ctx||!sfxEnabled) return; resume();
    var t=ctx.currentTime; stepPhase=1-stepPhase;
    var pm=stepPhase?1.0:0.92;
    if(biome==="desert"){ noise(0.18,t,0.08,400*pm); noise(0.08,t+0.04,0.06,200); }
    else if(biome==="dark_forest"){ noise(0.22,t,0.10,300*pm); sweep("sine",120*pm,60,0.12,t,0.12); }
    else if(biome==="village"){ sweep("triangle",260*pm,140,0.14,t,0.10); noise(0.07,t,0.06,1200); }
    else{ noise(0.14,t,0.09,600*pm); sweep("sine",100*pm,55,0.10,t,0.10); }
  }
  function sfxDialogOpen(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; osc("sine",880,0.18,t,0.40); osc("sine",1320,0.09,t+0.02,0.35); osc("sine",1760,0.05,t+0.05,0.30); }
  function sfxDialogNext(){ if(!ctx||!sfxEnabled) return; resume(); sweep("sine",420,380,0.10,ctx.currentTime,0.06); }
  function sfxDialogClose(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; sweep("sine",660,440,0.12,t,0.18); sweep("sine",440,330,0.06,t+0.08,0.15); }
  function sfxShopOpen(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [523,659,784,1047].forEach(function(f,i){osc("triangle",f,0.14,t+i*0.07,0.25);}); }
  function sfxBuy(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [523,659,784,1047,1319].forEach(function(f,i){osc("triangle",f,0.16-i*0.02,t+i*0.06,0.3-i*0.03);}); osc("sine",2093,0.06,t+0.20,0.40); }
  function sfxBuyFail(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; sweep("square",220,130,0.10,t,0.12); sweep("square",180,110,0.08,t+0.10,0.12); }
  function sfxBiomeChange(biome){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; var tones={forest:[330,495],dark_forest:[220,277],desert:[440,330],village:[523,659]}; var pair=tones[biome]||[330,495]; osc("sine",pair[0],0.10,t+0.15,0.50); osc("sine",pair[1],0.06,t+0.25,0.40); }
  function sfxGameStart(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [262,330,392,523,659,784].forEach(function(f,i){ osc("triangle",f,0.18,t+i*0.08,0.45); if(i===5) osc("sine",f*2,0.07,t+i*0.08,0.6); }); }
  function sfxMenuHover(){ if(!ctx||!sfxEnabled) return; resume(); sweep("sine",600,700,0.05,ctx.currentTime,0.06); }
  function sfxMenuClick(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; osc("triangle",880,0.12,t,0.10); osc("sine",1320,0.06,t+0.05,0.10); }

  function makeDroneLayers(g,defs){
    var nodes=[];
    defs.forEach(function(d){
      var o=ctx.createOscillator(),og=ctx.createGain();
      o.type=d.type; o.frequency.value=d.freq; og.gain.value=d.gain;
      var lfo=ctx.createOscillator(),lfog=ctx.createGain();
      lfo.frequency.value=0.04+Math.random()*0.06; lfog.gain.value=0.08;
      lfo.connect(lfog); lfog.connect(og.gain); lfo.start();
      o.connect(og); og.connect(g); o.start();
      nodes.push(o); nodes.push(lfo);
    });
    return nodes;
  }

  function stopMusic(fadeDur){
    if(!currentMusic) return;
    var cm=currentMusic; currentMusic=null;
    var ft=fadeDur||1.2;
    if(ctx&&cm.gainNode){ cm.gainNode.gain.setValueAtTime(cm.gainNode.gain.value,ctx.currentTime); cm.gainNode.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+ft); }
    setTimeout(function(){try{cm.stop();}catch(e){}},( ft+0.2)*1000);
  }

  function musicMenu(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[{type:"sine",freq:82.4,gain:0.35},{type:"sine",freq:110,gain:0.22},{type:"triangle",freq:164.8,gain:0.15}]);
    var arpNotes=[220,262,196,165,220,330,262,196,196,247,330,196,165,220,247,330],arpIdx=0;
    var arpIv=setInterval(function(){ if(!ctx||!musicEnabled) return; osc("triangle",arpNotes[arpIdx%arpNotes.length],0.07,ctx.currentTime,0.55); arpIdx++; },700);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+2.0);
    return{gainNode:g,_name:"menu",stop:function(){clearInterval(arpIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }
  function musicForest(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[{type:"sine",freq:110,gain:0.50},{type:"sine",freq:165,gain:0.30},{type:"triangle",freq:220,gain:0.18},{type:"sine",freq:55,gain:0.40}]);
    var birdIv=setInterval(function(){ if(!ctx||!musicEnabled) return; var t=ctx.currentTime; var bf=[1200,1400,1600,1800][Math.floor(Math.random()*4)]; sweep("sine",bf,bf*1.3,0.06,t,0.07); sweep("sine",bf*1.3,bf,0.04,t+0.10,0.06); if(Math.random()>0.5) sweep("sine",bf*0.8,bf*1.1,0.03,t+0.22,0.08); },2800+Math.random()*2000);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+2.0);
    return{gainNode:g,_name:"forest",stop:function(){clearInterval(birdIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }
  function musicDarkForest(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=[];
    [{type:"sawtooth",freq:55,gain:0.22},{type:"square",freq:58.3,gain:0.10},{type:"sine",freq:110,gain:0.28},{type:"sine",freq:27.5,gain:0.18}].forEach(function(d){
      var o=ctx.createOscillator(),og=ctx.createGain(),lp=ctx.createBiquadFilter();
      o.type=d.type; o.frequency.value=d.freq; lp.type="lowpass"; lp.frequency.value=400; og.gain.value=d.gain;
      var lfo=ctx.createOscillator(),lfog=ctx.createGain();
      lfo.frequency.value=0.03+Math.random()*0.04; lfog.gain.value=0.12;
      lfo.connect(lfog); lfog.connect(og.gain); lfo.start();
      o.connect(lp); lp.connect(og); og.connect(g); o.start();
      nodes.push(o); nodes.push(lfo);
    });
    var eerieIv=setInterval(function(){ if(!ctx||!musicEnabled) return; var t=ctx.currentTime; sweep("sine",180,140,0.07,t,0.8); sweep("sine",200,170,0.04,t+0.4,0.8); },5000+Math.random()*3000);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+2.5);
    return{gainNode:g,_name:"dark_forest",stop:function(){clearInterval(eerieIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }
  function musicDesert(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[{type:"sine",freq:138.6,gain:0.35},{type:"sine",freq:185,gain:0.22},{type:"triangle",freq:277.2,gain:0.14},{type:"sine",freq:69.3,gain:0.38}]);
    var wBuf=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate);
    var wd=wBuf.getChannelData(0); for(var i=0;i<wd.length;i++) wd[i]=Math.random()*2-1;
    var wSrc=ctx.createBufferSource(); wSrc.buffer=wBuf; wSrc.loop=true;
    var wLp=ctx.createBiquadFilter(); wLp.type="bandpass"; wLp.frequency.value=300; wLp.Q.value=0.5;
    var wg=ctx.createGain(); wg.gain.value=0.04;
    var wlfo=ctx.createOscillator(),wlfog=ctx.createGain(); wlfo.frequency.value=0.04; wlfog.gain.value=0.03;
    wlfo.connect(wlfog); wlfog.connect(wg.gain); wlfo.start();
    wSrc.connect(wLp); wLp.connect(wg); wg.connect(g); wSrc.start();
    nodes.push(wlfo);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+3.0);
    return{gainNode:g,_name:"desert",stop:function(){nodes.forEach(function(n){try{n.stop();}catch(e){}});try{wSrc.stop();}catch(e){}}};
  }
  function musicVillage(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[{type:"triangle",freq:196,gain:0.25},{type:"sine",freq:294,gain:0.16},{type:"sine",freq:98,gain:0.30}]);
    var melody=[392,440,392,330,294,330,392,440,494,440,392,330,294,262,294,330],mIdx=0;
    var melIv=setInterval(function(){ if(!ctx||!musicEnabled) return; var t=ctx.currentTime; var f=melody[mIdx%melody.length]; osc("triangle",f,0.12,t,0.22); osc("triangle",f*2,0.04,t,0.18); mIdx++; },320);
    var kickIv=setInterval(function(){ if(!ctx||!musicEnabled) return; sweep("sine",150,55,0.22,ctx.currentTime,0.18); },640);
    var hatIv=setInterval(function(){ if(!ctx||!musicEnabled) return; noise(0.05,ctx.currentTime,0.04,6000); },320);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+1.5);
    return{gainNode:g,_name:"village",stop:function(){clearInterval(melIv);clearInterval(kickIv);clearInterval(hatIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }

  /* rain music — melodic, gentle, minor-key piano-like arpeggios + soft drone */
  function musicRain(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[
      {type:"sine",freq:73.4,gain:0.30},{type:"sine",freq:110,gain:0.18},
      {type:"triangle",freq:146.8,gain:0.12}
    ]);
    /* gentle reverb simulation via two delayed echoes */
    var delay1=ctx.createDelay(); delay1.delayTime.value=0.22;
    var delay2=ctx.createDelay(); delay2.delayTime.value=0.44;
    var dg1=ctx.createGain(); dg1.gain.value=0.18;
    var dg2=ctx.createGain(); dg2.gain.value=0.09;
    g.connect(delay1); delay1.connect(dg1); dg1.connect(musicGain);
    g.connect(delay2); delay2.connect(dg2); dg2.connect(musicGain);

    /* Am pentatonic arpeggios — slow and melancholic */
    var arpNotes=[220,261.6,329.6,392,440,523.2,659.2,784,659.2,523.2,440,392,329.6,261.6];
    var arpIdx=0;
    var arpIv=setInterval(function(){
      if(!ctx||!musicEnabled) return;
      var t=ctx.currentTime;
      var f=arpNotes[arpIdx%arpNotes.length];
      /* soft sine + triangle blend for piano-like tone */
      osc("sine",f,0.11,t,0.55);
      osc("triangle",f,0.06,t,0.45);
      /* occasional low octave bass note */
      if(arpIdx%7===0) osc("sine",f/2,0.09,t,0.80);
      arpIdx++;
    },520);

    /* soft rain-drop plinks */
    var plingIv=setInterval(function(){
      if(!ctx||!musicEnabled) return;
      if(Math.random()>0.55) return;
      var t=ctx.currentTime;
      var f=[880,1046,1174,1318,1568][Math.floor(Math.random()*5)];
      osc("sine",f,0.04,t,0.18);
    },300);

    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+3.0);
    return{gainNode:g,_name:"rain",stop:function(){clearInterval(arpIv);clearInterval(plingIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }

  function musicInn(){
    var g=ctx.createGain(); g.gain.value=0.0001; g.connect(musicGain);
    var nodes=makeDroneLayers(g,[
      {type:"sine",freq:220,gain:0.20},
      {type:"triangle",freq:330,gain:0.14},
      {type:"sine",freq:165,gain:0.18}
    ]);
    /* slow, warm lullaby-like melody */
    var melody=[523,494,440,392,440,494,523,587,523,494,440,392,330,392,440,494],mIdx=0;
    var melIv=setInterval(function(){
      if(!ctx||!musicEnabled) return;
      var t=ctx.currentTime; var f=melody[mIdx%melody.length];
      osc("triangle",f,0.09,t,0.7);
      osc("sine",f*0.5,0.05,t,0.8);
      mIdx++;
    },900);
    /* soft crackling fire */
    var fireIv=setInterval(function(){
      if(!ctx||!musicEnabled) return;
      noise(0.03,ctx.currentTime,0.12,600);
    },200);
    g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+2.0);
    return{gainNode:g,_name:"inn",stop:function(){clearInterval(melIv);clearInterval(fireIv);nodes.forEach(function(n){try{n.stop();}catch(e){}});}};
  }

  /* ── CUSTOM MUSIC SLOTS ────────────────────────────────────────────────────
     Drop your own audio files into the assets/ folder and set the src here.
     Supported formats: mp3, ogg, wav, m4a — anything the browser can decode.
     Leave src as "" (empty string) to use the original procedural music.
     Volume (0.0 – 1.0) lets you balance loud tracks against the game SFX.   */
  var CUSTOM_TRACKS = {
    forest:      { src: "", volume: 0.8 },
    dark_forest: { src: "", volume: 0.8 },
    desert:      { src: "", volume: 0.8 },
    village:     { src: "", volume: 0.8 },
    inn:         { src: "", volume: 0.8 }
  };

  /* Cached MediaElementSourceNodes — one per track name so we don't create
     a new node each time the same biome is re-entered (browsers allow only
     one MediaElementSource per HTMLAudioElement).                            */
  var customSourceCache = {};

  /* Tries to play a custom audio file for `name`.
     Returns a music-object on success, null if the slot is empty or errors. */
  function makeAudioEl(src){
    /* Try every known way to construct an HTMLAudioElement */
    var el;
    try{ el = new window.Audio(src); } catch(e){}
    if(!el){ try{ el = document.createElement("audio"); el.src=src; } catch(e){} }
    return el || null;
  }

  function tryPlayCustom(name){
    var slot = CUSTOM_TRACKS[name];
    if(!slot || !slot.src || slot._broken) return null;
    if(!ctx) return null;

    try{
      var cached = customSourceCache[name];

      if(!cached){
        var el = makeAudioEl(slot.src);
        if(!el){
          console.warn("[CustomMusic] Could not create audio element for: "+slot.src);
          slot._broken = true; return null;
        }
        el.crossOrigin = "anonymous";
        el.loop        = true;
        el.preload     = "auto";
        el.addEventListener("error", function(){
          console.warn("[CustomMusic] Failed to load: "+slot.src+" — falling back to procedural music.");
          slot._broken = true;
        });
        var sourceNode = ctx.createMediaElementSource(el);
        cached = { el:el, sourceNode:sourceNode };
        customSourceCache[name] = cached;
      }

      if(slot._broken) return null;

      var g = ctx.createGain();
      g.gain.value = 0.0001;
      cached.sourceNode.connect(g);
      g.connect(musicGain);
      g.gain.linearRampToValueAtTime(slot.volume, ctx.currentTime + 2.0);

      if(cached.el.ended || cached.el.currentTime === 0) cached.el.currentTime = 0;

      var playPromise = cached.el.play();
      if(playPromise){
        playPromise.catch(function(err){
          console.warn("[CustomMusic] play() blocked for '"+name+"': "+err.message);
        });
      }

      return {
        gainNode:  g,
        _name:     name,
        _isCustom: true,
        stop: function(){
          try{ cached.el.pause(); }catch(e){}
          try{ cached.sourceNode.disconnect(); }catch(e){}
          try{ g.disconnect(); }catch(e){}
        }
      };
    } catch(e){
      console.warn("[CustomMusic] Web Audio error for '"+name+"': "+e.message+" — falling back.");
      return null;
    }
  }

  function playMusic(name){
    if(!ctx||!musicEnabled) return;
    if(currentMusic&&currentMusic._name===name) return;
    stopMusic(1.2);
    /* Try custom file first; fall back to procedural if slot is empty/broken */
    var t = tryPlayCustom(name);
    if(!t){
      if     (name==="menu")        t=musicMenu();
      else if(name==="forest")      t=musicForest();
      else if(name==="dark_forest") t=musicDarkForest();
      else if(name==="desert")      t=musicDesert();
      else if(name==="village")     t=musicVillage();
      else if(name==="inn")         t=musicInn();
      else if(name==="rain")        t=musicRain();
    }
    if(t) currentMusic=t;
  }

  function sfxTypeChar(){ if(!ctx||!sfxEnabled) return; resume(); osc("square",1800+Math.random()*400,0.022,ctx.currentTime,0.028); }
  function sfxItemFind(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [660,880,1100,1320].forEach(function(f,i){osc("sine",f,0.14,t+i*0.07,0.28);}); }
  function sfxQuestComplete(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [392,523,659,784,1047].forEach(function(f,i){osc("triangle",f,0.16,t+i*0.09,0.4);}); osc("sine",2093,0.08,t+0.5,0.6); }
  function sfxSleep(){ if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime; [330,294,262,220].forEach(function(f,i){osc("sine",f,0.12,t+i*0.3,0.5);}); }

  function sfxShrine(){
    if(!ctx||!sfxEnabled) return; resume(); var t=ctx.currentTime;
    /* rising harmonic sweep — otherworldly */
    [110,165,220,330,440,660,880].forEach(function(f,i){
      sweep("sine",f,f*2,0.12,t+i*0.18,1.2);
    });
    /* shimmer on top */
    setTimeout(function(){
      if(!ctx) return; var t2=ctx.currentTime;
      [1760,2093,2637].forEach(function(f,i){ osc("sine",f,0.06,t2+i*0.1,0.8); });
    },800);
  }

  /* Explosive flash boom — used at the white-out moment of the outro */
  function sfxExplosion(){
    if(!ctx||!sfxEnabled) return; resume();
    var t=ctx.currentTime;

    /* ── SUB FOUNDATION: two massive sine bombs drop simultaneously ── */
    [[60,12,1.6,2.4],[42,8,1.2,2.8]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sine"; o.frequency.setValueAtTime(p[0],t); o.frequency.exponentialRampToValueAtTime(p[1],t+2.5);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(p[2],t+0.008);
      g.gain.exponentialRampToValueAtTime(0.0001,t+p[3]);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t+p[3]+0.1);
    });

    /* ── INITIAL SHOCKWAVE: stacked noise layers, each filtered differently ── */
    [[1.8,0,0.06,9000],[1.4,0.01,0.20,4000],[1.1,0.03,0.55,1800],
     [0.8,0.08,1.20,700],[0.5,0.30,2.00,300],[0.3,0.80,2.50,120]].forEach(function(p){
      noise(p[0],t+p[1],p[2],p[3]);
    });

    /* ── TEARING APART: sawtooth sweeps — like reality ripping at the seams ── */
    [[280,18,0.5],[220,14,0.6],[340,20,0.45],[160,10,0.7],[400,22,0.4]].forEach(function(p,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(p[0],t+i*0.04);
      o.frequency.exponentialRampToValueAtTime(p[1],t+i*0.04+p[2]);
      g.gain.setValueAtTime(0.5,t+i*0.04); g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.04+p[2]+0.05);
      o.connect(g); g.connect(sfxGain); o.start(t+i*0.04); o.stop(t+i*0.04+p[2]+0.1);
    });

    /* ── STONE CRACKING: square wave mid-impacts scattered in time ── */
    [[180,0,0.28],[260,0.05,0.22],[140,0.09,0.35],[320,0.13,0.18],[200,0.20,0.30],[380,0.28,0.20]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="square"; o.frequency.setValueAtTime(p[0],t+p[1]);
      o.frequency.exponentialRampToValueAtTime(p[0]*0.25,t+p[1]+p[2]);
      g.gain.setValueAtTime(0.38,t+p[1]); g.gain.exponentialRampToValueAtTime(0.0001,t+p[1]+p[2]);
      o.connect(g); g.connect(sfxGain); o.start(t+p[1]); o.stop(t+p[1]+p[2]+0.05);
    });

    /* ── GLASS SHATTER CASCADE: high freqs staggered across 0.8 seconds ── */
    [3400,5200,7800,9600,11200,4600,6800,8400,10400,12800].forEach(function(f,i){
      var delay=i*0.07+Math.random()*0.06;
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sawtooth"; o.frequency.value=f*(0.85+Math.random()*0.3);
      g.gain.setValueAtTime(0,t+delay); g.gain.linearRampToValueAtTime(0.20,t+delay+0.004);
      g.gain.exponentialRampToValueAtTime(0.0001,t+delay+0.08+Math.random()*0.14);
      o.connect(g); g.connect(sfxGain); o.start(t+delay); o.stop(t+delay+0.3);
    });

    /* ── CHAOS POPS: random debris hits scattered over 2.5 seconds ── */
    for(var d=0;d<18;d++){
      (function(i){
        var delay=Math.random()*2.5;
        var freq=200+Math.random()*6000;
        noise(0.15+Math.random()*0.35, t+delay, 0.025+Math.random()*0.08, freq);
      })(d);
    }

    /* ── WIND HOWL: the void rushing in ── */
    [[0.5,t+0.1,1.8,80],[0.4,t+0.3,1.4,60],[0.3,t+0.6,1.2,50]].forEach(function(p){
      noise(p[0],p[1],p[2],p[3]);
    });

    /* ── METALLIC RING: pitched distorted tones — world structure groaning ── */
    [[110,0.7,55,0,1.8],[165,0.5,40,0.1,1.4],[88,0.6,30,0.05,2.0]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="triangle"; o.frequency.setValueAtTime(p[0],t+p[3]);
      o.frequency.exponentialRampToValueAtTime(p[2],t+p[3]+p[4]);
      g.gain.setValueAtTime(0,t+p[3]); g.gain.linearRampToValueAtTime(p[1],t+p[3]+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+p[3]+p[4]);
      o.connect(g); g.connect(sfxGain); o.start(t+p[3]); o.stop(t+p[3]+p[4]+0.1);
    });

    /* ── FINAL COLLAPSE: slow heavy crunch at 1 second in ── */
    [[70,10,0.9],[50,8,1.0],[90,12,0.8]].forEach(function(p,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(p[0],t+1.0+i*0.06);
      o.frequency.exponentialRampToValueAtTime(p[1],t+1.0+i*0.06+p[2]);
      g.gain.setValueAtTime(0.55,t+1.0+i*0.06); g.gain.exponentialRampToValueAtTime(0.0001,t+1.0+i*0.06+p[2]);
      o.connect(g); g.connect(sfxGain); o.start(t+1.0+i*0.06); o.stop(t+1.0+i*0.06+p[2]+0.1);
    });
    noise(0.7,t+1.0,1.2,600); noise(0.5,t+1.1,1.0,200); noise(0.4,t+1.3,0.8,100);
  }

  return{
    init,resume,
    _ctx:function(){ return ctx; },
    sfxStep,sfxTypeChar,sfxDialogOpen,sfxDialogNext,sfxDialogClose,
    sfxShopOpen,sfxBuy,sfxBuyFail,sfxBiomeChange,
    sfxGameStart,sfxMenuHover,sfxMenuClick,sfxItemFind,sfxQuestComplete,sfxSleep,sfxShrine,sfxExplosion,
    playMusic,stopMusic,
    toggleMusic:function(){ musicEnabled=!musicEnabled; if(!musicEnabled) stopMusic(0.4); else { var n=currentMap==="inn"?"inn":isRaining?"rain":lastBiome||"forest"; playMusic(n); } return musicEnabled; },
    toggleSfx:function(){ sfxEnabled=!sfxEnabled; return sfxEnabled; }
  };
})();

/* -STATE- */
var player = {
  name:"Wanderer", cls:"knight",
  skinIdx:0, hairIdx:0, outfitIdx:0,
  x:6, y:5,
  hp:120, maxHp:120,
  atk:15, def:20, spd:8,
  gold:50,
  equipment:{weapon:null,chest:null,helmet:null,boots:null,item:null},
  owned:[]
};
var gameMap    = [];
var npcPos     = {};
var shopTab    = "weapons";
var gameActive = false;
var lastBiome  = "";
var playerCanvas = null;
var moveTimer    = null;
var dialogState  = {npc:null,lines:[],idx:0,pendingQuestOffer:null,pendingQuestReturn:null};
var isSleeping   = false;  /* blocks input during sleep/fade sequence */

/* day system */
var dayNumber   = 1;
var stepCount   = 0;
var STEPS_PER_DAY = 40;
var isRaining   = false;
var rainDrops   = [];
var rainAnimId  = null;

/* camera */
var camX = 0, camY = 0;

/* -UTILS- */
function G(id){ return document.getElementById(id); }

function showScreen(name){
  ["menu","avatar","game"].forEach(function(s){
    var el=G("screen-"+s);
    el.style.display=(s===name)?"flex":"none";
  });
}

function spriteOrEmoji(id,fallback,size){
  var info=ITEM_SPRITES[id]; if(!info) return fallback;
  return '<img src="'+info.src+'" style="width:'+(size||20)+'px;height:'+(size||20)+'px;image-rendering:pixelated;vertical-align:middle;margin-right:4px;" onerror="this.outerHTML=\''+fallback+'\'">';
}
function showToast(msg){
  var old=document.querySelector(".toast"); if(old) old.remove();
  var t=document.createElement("div"); t.className="toast";
  if(msg.indexOf("<img")!==-1) t.innerHTML=msg; else t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){if(t.parentNode)t.remove();},2700);
}

/* -BUILD MAP- */
function buildMap(){
  gameMap=[]; npcPos={};
  for(var r=0;r<GRID_H;r++){
    gameMap[r]=[];
    for(var c=0;c<GRID_W;c++){
      var cell=MAP_DEF[r][c];
      var t={type:"grass",blocked:false,biome:"forest",npc:null,cssClass:""};

      if(cell==="T"){
        t.type="tree"; t.blocked=true; t.biome="forest";
        /* check if adjacent to dark forest */
        t.cssClass="tile-tree";
      } else if(cell==="#"){
        t.type="tree"; t.blocked=true; t.biome="dark_forest";
        t.cssClass="tile-dark-tree";
      } else if(cell==="V"){
        t.type="village"; t.biome="village"; t.cssClass="tile-village";
      } else if(cell==="P"){
        t.type="path"; t.biome="village"; t.cssClass="tile-path";
      } else if(cell==="S"){
        t.type="sand"; t.biome="desert";
        /* alternate for variety */
        t.cssClass=((c+r)%3===0)?"tile-sand-dark":"tile-sand";
      } else if(cell==="G"){
        /* plain grass — never auto-darkened at tree edges */
        t.type="grass"; t.biome="forest"; t.cssClass="tile-grass-plain";
      } else if(cell==="."){
        /* determine biome by position */
        if(r>=17)      { t.biome="desert"; t.cssClass="tile-desert-floor"; }
        else if(c>=18) { t.biome="dark_forest"; t.cssClass="tile-grass-edge"; }
        else           { t.biome="forest";
          /* edge tiles of the walkable forest area get darker shade */
          t.cssClass="tile-grass";
        }
      } else if(NPC_CODES[cell]){
        t.npc=NPC_CODES[cell]; t.blocked=true;
        t.biome=(r>=17)?"desert":(c>=18)?"dark_forest":(c>=5)?"village":"forest";
        if(t.biome==="village")      t.cssClass="tile-village";
        else if(t.biome==="desert")  t.cssClass="tile-sand";
        else if(t.biome==="dark_forest") t.cssClass="tile-grass-edge";
        else                         t.cssClass="tile-grass";
        npcPos[c+","+r]=t.npc;
      }
      gameMap[r][c]=t;
    }
  }
  /* second pass: mark grass edge tiles */
  for(var r=0;r<GRID_H;r++){
    for(var c=0;c<GRID_W;c++){
      var t=gameMap[r][c];
      if(t.type==="grass"&&t.biome==="forest"&&t.cssClass==="tile-grass"){
        /* if any neighbour is a tree, mark as edge */
        var isEdge=false;
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){
          var nr=r+d[1],nc=c+d[0];
          if(nr>=0&&nr<GRID_H&&nc>=0&&nc<GRID_W&&gameMap[nr][nc].type==="tree") isEdge=true;
        });
        if(isEdge) t.cssClass="tile-grass-edge";
      }
    }
  }
}

/* -NPC PORTRAITS- */
function drawNpcPortrait(canvas, npcId){
  if(!canvas) return;
  var c=canvas.getContext("2d");
  var W=canvas.width, H=canvas.height;
  c.clearRect(0,0,W,H);
  function px(x,y,w,h,col){ c.fillStyle=col; c.fillRect(x,y,w,h); }
  switch(npcId){
    case "elder":
      px(0,0,W,H,"#1a1228");
      px(10,26,28,22,"#3a2070"); px(6,28,8,20,"#3a2070"); px(34,28,8,20,"#3a2070");
      px(16,22,16,14,"#d8d8d8"); px(18,30,12,8,"#c0c0c0");
      px(16,10,16,16,"#C68642");
      px(18,15,4,3,"#fff"); px(26,15,4,3,"#fff");
      px(19,16,2,2,"#2244aa"); px(27,16,2,2,"#2244aa");
      px(17,13,5,2,"#d8d8d8"); px(26,13,5,2,"#d8d8d8");
      px(16,2,16,10,"#2a1060"); px(20,0,8,4,"#2a1060");
      px(12,10,24,4,"#3a2080"); px(23,4,2,2,"#f0c840");
      break;
    case "merchant":
      px(0,0,W,H,"#1a120a");
      px(10,26,28,22,"#7a5020"); px(16,28,16,20,"#8a6030");
      px(6,28,8,20,"#c09050"); px(34,28,8,20,"#c09050");
      px(16,10,16,16,"#E8B88A");
      px(18,15,4,3,"#fff"); px(26,15,4,3,"#fff");
      px(19,16,2,2,"#553322"); px(27,16,2,2,"#553322");
      px(17,13,5,2,"#553322"); px(26,13,5,2,"#553322");
      px(14,8,20,6,"#6a3a10"); px(12,12,4,6,"#6a3a10"); px(32,12,4,6,"#6a3a10");
      px(34,34,10,10,"#c9a84c"); px(36,36,6,6,"#e8c96a");
      break;
    case "guard":
      px(0,0,W,H,"#0a0e18");
      px(8,26,32,22,"#4a5a6a"); px(4,28,8,20,"#4a5a6a"); px(36,28,8,20,"#4a5a6a");
      px(12,28,24,16,"#5a6a7a"); px(14,30,20,4,"#8a9aaa");
      px(16,10,16,16,"#FDDBB4");
      px(18,15,4,3,"#fff"); px(26,15,4,3,"#fff");
      px(19,16,2,2,"#334466"); px(27,16,2,2,"#334466");
      px(17,13,5,2,"#443322"); px(26,13,5,2,"#443322");
      px(13,6,22,10,"#4a5a6a"); px(11,10,26,6,"#5a6a7a"); px(15,4,18,6,"#4a5a6a");
      px(16,14,16,4,"#1a2030");
      break;
    case "hermit":
      px(0,0,W,H,"#0e1a0e");
      px(10,26,28,22,"#2a4a20"); px(6,28,8,20,"#2a4a20"); px(34,28,8,20,"#2a4a20");
      px(16,10,16,16,"#8D5524");
      px(18,14,4,3,"#fff"); px(26,14,4,3,"#fff");
      px(19,15,2,2,"#2a4a20"); px(27,15,2,2,"#2a4a20");
      px(12,6,24,8,"#443322"); px(10,12,6,10,"#443322"); px(32,12,6,10,"#443322");
      px(14,22,4,8,"#443322"); px(26,22,8,6,"#443322");
      px(2,20,4,28,"#6a4a20");
      break;
    case "innkeeper":
      px(0,0,W,H,"#1a0e0a");
      px(8,26,32,22,"#8a3a20"); px(4,28,8,20,"#8a3a20"); px(36,28,8,20,"#8a3a20");
      px(14,30,20,18,"#d8c8a8"); px(16,32,16,14,"#e8d8b8");
      px(16,10,16,16,"#FDDBB4");
      px(18,15,4,3,"#fff"); px(26,15,4,3,"#fff");
      px(19,16,2,2,"#553322"); px(27,16,2,2,"#553322");
      px(14,6,20,8,"#8a3a10"); px(12,10,4,8,"#8a3a10"); px(32,10,4,8,"#8a3a10");
      px(20,4,8,6,"#8a3a10"); px(20,20,8,2,"#8a5a4a");
      break;
    case "nomad":
      px(0,0,W,H,"#1a1208");
      px(8,26,32,22,"#c8a860"); px(4,28,8,20,"#c8a860"); px(36,28,8,20,"#c8a860");
      px(16,10,16,16,"#4A2912");
      px(18,15,4,3,"#e8d8a8"); px(26,15,4,3,"#e8d8a8");
      px(19,16,2,2,"#1a0e04"); px(27,16,2,2,"#1a0e04");
      px(12,4,24,10,"#e8c860"); px(10,10,28,6,"#c8a840"); px(12,2,20,4,"#e8c860");
      px(14,20,20,6,"#c8a840"); px(2,14,4,34,"#8a6030");
      break;
    default:
      px(0,0,W,H,"#1a1a26");
      px(16,10,16,16,"#C68642");
      px(18,15,4,3,"#fff"); px(26,15,4,3,"#fff");
      break;
  }
}

/* -BED SPRITE- */
function drawBedSprite(canvas){
  if(!canvas) return;
  var c=canvas.getContext("2d"); var W=canvas.width,H=canvas.height;
  function px(x,y,w,h,col){ c.fillStyle=col; c.fillRect(x,y,w,h); }
  c.clearRect(0,0,W,H);
  px(2,2,W-4,H-4,"#5a3a18");
  px(6,10,W-12,H-18,"#d4c0a0");
  px(8,12,W-16,14,"#f0e8d8"); px(10,14,W-20,10,"#ffffff");
  px(8,28,W-16,H-36,"#6a3a8a");
  px(10,30,W-20,4,"#7a4a9a"); px(10,36,W-20,2,"#7a4a9a");
  px(2,H-8,6,6,"#3a2010"); px(W-8,H-8,6,6,"#3a2010");
  px(2,8,6,6,"#3a2010"); px(W-8,8,6,6,"#3a2010");
  px(4,2,W-8,8,"#7a4a20");
  px(8,3,4,6,"#5a3010"); px(W-12,3,4,6,"#5a3010");
}

/* -ENERGY SYSTEM- */
var ENERGY_MAX=120, energy=120;
function updateEnergyBar(){
  var bar=G("energyBar"), txt=G("energyText"); if(!bar) return;
  var pct=Math.max(0,energy/ENERGY_MAX*100);
  bar.style.width=pct+"%";
  bar.style.background=pct>50?"#50c080":pct>25?"#e0c050":"#e05050";
  if(txt) txt.textContent=Math.ceil(energy)+"/"+ENERGY_MAX;
}
function consumeEnergy(){
  if(energy>0){ energy=Math.max(0,energy-1); updateEnergyBar(); }
  if(energy===0) showToast("⚠️ Exhausted! Find a bed to rest.");
}

/* -INN SYSTEM- */
var currentMap="world";
/* Tracks which innkeeper tile (col, row) the player entered the inn from,
   so we can place them correctly on exit. */
var innEntryNpcPos={c:7,r:2}; /* default: forest innkeeper */
var INN_MAP_DEF=[
  ["W","W","W","W","W","W","W","W","W","W","W","W"],
  ["W","F","F","F","F","F","F","F","F","F","F","W"],
  ["W","F","B","B","F","F","F","F","F","F","F","W"],
  ["W","F","B","B","F","R","R","R","F","F","F","W"],
  ["W","F","F","F","F","R","T","R","F","C","F","W"],
  ["W","F","F","F","F","R","R","R","F","F","F","W"],
  ["W","F","F","F","F","F","F","F","F","F","F","W"],
  ["W","F","F","F","F","F","F","F","F","F","F","W"],
  ["W","W","W","W","W","D","W","W","W","W","W","W"]
];
var INN_H=INN_MAP_DEF.length, INN_W=INN_MAP_DEF[0].length;
var innMap=[];

function buildInnMap(){
  innMap=[];
  for(var r=0;r<INN_H;r++){
    innMap[r]=[];
    for(var c=0;c<INN_W;c++){
      var cell=INN_MAP_DEF[r][c];
      var t={type:"floor",blocked:false,biome:"inn",cssClass:"inn-floor",special:null};
      if(cell==="W"){ t.type="wall"; t.blocked=true; t.cssClass="inn-wall"; }
      else if(cell==="B"){ t.type="bed"; t.blocked=true; t.cssClass="inn-bed"; t.special="bed"; }
      else if(cell==="D"){ t.type="door"; t.blocked=false; t.cssClass="inn-door"; t.special="exit"; }
      else if(cell==="R"){ t.cssClass="inn-rug"; }
      else if(cell==="T"){ t.blocked=true; t.cssClass="inn-table"; }
      else if(cell==="C"){ t.blocked=true; t.cssClass="inn-chair"; }
      innMap[r][c]=t;
    }
  }
}

function buildInnGrid(){
  var grid=G("worldGrid"); grid.innerHTML="";
  grid.style.gridTemplateColumns="repeat("+INN_W+","+TILE_SIZE+"px)";
  grid.style.gridTemplateRows="repeat("+INN_H+","+TILE_SIZE+"px)";
  grid.style.width=(INN_W*TILE_SIZE)+"px";
  grid.style.height=(INN_H*TILE_SIZE)+"px";
  grid.style.willChange="transform";

  for(var r=0;r<INN_H;r++){
    for(var c=0;c<INN_W;c++){
      var tile=innMap[r][c];
      var el=document.createElement("div");
      el.className="tile "+(tile.cssClass||"inn-floor");
      el.style.zIndex=r;
      /* bed sprite on top-left of 2x2 bed */
      if(tile.special==="bed"&&r===2&&c===2){
        var bedC=document.createElement("canvas");
        bedC.width=TILE_SIZE*2; bedC.height=TILE_SIZE*2;
        bedC.style.cssText="position:absolute;left:0;top:0;width:"+(TILE_SIZE*2)+"px;height:"+(TILE_SIZE*2)+"px;image-rendering:pixelated;z-index:3;pointer-events:none;";
        drawBedSprite(bedC);
        el.appendChild(bedC);
      }
      if(tile.special==="exit"){
        var arrow=document.createElement("div");
        arrow.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;z-index:3;";
        arrow.textContent="🚪"; el.appendChild(arrow);
      }
      grid.appendChild(el);
    }
  }

  playerCanvas=document.createElement("canvas");
  playerCanvas.width=40; playerCanvas.height=48;
  playerCanvas.className="player-sprite";
  playerCanvas.style.cssText="position:absolute;z-index:10000;image-rendering:pixelated;pointer-events:none;";
  grid.appendChild(playerCanvas);
  drawAvatar(playerCanvas);

  playerCanvas.style.left=(player.x*TILE_SIZE+Math.round((TILE_SIZE-40)/2))+"px";
  playerCanvas.style.top=(player.y*TILE_SIZE+Math.round((TILE_SIZE-48)/2))+"px";

  /* center inn in viewport */
  var viewW=G("worldContainer").clientWidth;
  var viewH=G("worldContainer").clientHeight;
  camX=Math.round(Math.max(-(INN_W*TILE_SIZE-viewW),(viewW-(INN_W*TILE_SIZE))/2));
  camY=Math.round(Math.max(-(INN_H*TILE_SIZE-viewH),(viewH-(INN_H*TILE_SIZE))/2));
  grid.style.transition="none";
  grid.style.transform="translate("+camX+"px,"+camY+"px)";
}

function fadeOut(cb){
  var el=G("fadeOverlay"); if(!el){cb();return;}
  el.style.transition="opacity 0.5s ease"; el.style.opacity="1";
  setTimeout(cb,550);
}
function fadeIn(){
  var el=G("fadeOverlay"); if(!el) return;
  el.style.transition="opacity 0.5s ease"; el.style.opacity="0";
}

function enterInn(){
  /* Find the innkeeper NPC tile the player is adjacent to, so we can
     return them to the correct position when they leave. */
  var dirs=[{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
  for(var d=0;d<dirs.length;d++){
    var nc=player.x+dirs[d].dx, nr=player.y+dirs[d].dy;
    if(nr>=0&&nr<GRID_H&&nc>=0&&nc<GRID_W&&gameMap[nr][nc].npc==="innkeeper"){
      innEntryNpcPos={c:nc,r:nr};
      break;
    }
  }
  fadeOut(function(){
    currentMap="inn"; player.x=5; player.y=7;
    buildInnGrid(); Audio.playMusic("inn"); updateHUD();
    setTimeout(fadeIn,80);
    showToast("Walk to the bed to sleep and save.");
  });
}
function exitInn(){
  /* Place the player relative to the innkeeper they entered from:
     - Forest innkeeper (row 2, col 7): player appears BELOW (row 3, col 7)
     - Desert innkeeper (row 24, col 37): player appears ABOVE (row 23, col 37) */
  var isDesertInn=(innEntryNpcPos.r>=17);
  var exitX, exitY;
  if(isDesertInn){
    /* above the desert innkeeper */
    exitX=innEntryNpcPos.c;
    exitY=innEntryNpcPos.r-1;
  } else {
    /* below the forest innkeeper */
    exitX=innEntryNpcPos.c;
    exitY=innEntryNpcPos.r+1;
  }
  fadeOut(function(){
    currentMap="world";
    player.x=exitX; player.y=exitY;
    buildGrid();
    var tile=gameMap[player.y]&&gameMap[player.y][player.x];
    if(isRaining) Audio.playMusic("rain");
    else Audio.playMusic(tile?tile.biome:"forest");
    updateHUD(); setTimeout(fadeIn,80);
  });
}
function sleepInBed(){
  if(isSleeping) return;
  isSleeping=true;
  Audio.sfxSleep&&Audio.sfxSleep();
  fadeOut(function(){
    dayNumber++; energy=ENERGY_MAX;
    player.hp=Math.min(player.maxHp,player.hp+30);
    /* rain chance — 1 in 3 days */
    var willRain=Math.random()<0.33;
    if(willRain!==isRaining){ isRaining=willRain; }
    var msg=G("sleepMsg");
    if(msg){
      msg.querySelector(".sleep-day").textContent="Day "+dayNumber+(isRaining?" 🌧":"");
      msg.style.display="flex";
      setTimeout(function(){
        msg.style.display="none";
        player.x=5; player.y=6;
        buildInnGrid(); updateHUD(); updateEnergyBar();
        /* apply rain after waking — but keep inn music */
        if(isRaining) toggleRain(true);
        else toggleRain(false);
        showDayBanner("Day "+dayNumber+(isRaining?" — Rain falls upon the land.":" — You feel rested."));
        setTimeout(function(){ fadeIn(); isSleeping=false; },80);
      },2200);
    } else {
      player.x=5; player.y=6;
      buildInnGrid(); updateHUD(); updateEnergyBar();
      if(isRaining) toggleRain(true); else toggleRain(false);
      showDayBanner("Day "+dayNumber+" — You feel rested.");
      setTimeout(function(){ fadeIn(); isSleeping=false; },80);
    }
  });
}

/* -AVATAR DRAWING- */
function drawAvatar(canvas){
  if(!canvas) return;
  var c=canvas.getContext("2d");
  var W=canvas.width,H=canvas.height;
  var skin  =SKIN_COLORS[player.skinIdx]   ||SKIN_COLORS[0];
  var hair  =HAIR_COLORS[player.hairIdx]   ||HAIR_COLORS[0];
  var outfit=OUTFIT_COLORS[player.outfitIdx]||OUTFIT_COLORS[0];
  c.clearRect(0,0,W,H);

  if(W>=100){
    c.fillStyle=hair;    c.fillRect(38,12,44,16); c.fillRect(36,18,10,22); c.fillRect(74,18,10,22);
    c.fillStyle=skin;    c.fillRect(40,20,40,36);
    c.fillStyle="#333";  c.fillRect(48,31,6,6); c.fillRect(66,31,6,6);
    c.fillStyle="#9a5a5a"; c.fillRect(52,46,16,4);
    c.fillStyle=skin;    c.fillRect(52,56,16,10);
    c.fillStyle=outfit;  c.fillRect(30,66,60,44); c.fillRect(16,66,18,36); c.fillRect(86,66,18,36);
    c.fillStyle=skin;    c.fillRect(16,100,18,14); c.fillRect(86,100,18,14);
    c.fillStyle="#1a1a2e"; c.fillRect(34,110,22,42); c.fillRect(62,110,22,42);
    c.fillStyle="#3a2a1a"; c.fillRect(30,148,28,10); c.fillRect(60,148,28,10);
    if(player.cls==="knight"){ c.fillStyle="#aaa"; c.fillRect(30,66,60,7); }
    else if(player.cls==="mage")  { c.fillStyle="#5030a0"; c.fillRect(38,12,44,8); c.fillRect(52,0,16,16); }
    else if(player.cls==="rogue") { c.fillStyle="#111"; c.fillRect(36,18,8,42); c.fillRect(76,18,8,42); }
  } else {
    var s=Math.min(W,H);
    var hY=Math.floor(s*.04),hH=Math.floor(s*.30);
    var bY=Math.floor(s*.38),bH=Math.floor(s*.34);
    var lH=Math.floor(s*.24);
    c.fillStyle=hair;   c.fillRect(Math.floor(s*.28),hY,Math.floor(s*.44),Math.floor(hH*.4));
    c.fillStyle=skin;   c.fillRect(Math.floor(s*.30),hY+Math.floor(hH*.1),Math.floor(s*.40),hH);
    c.fillStyle=outfit; c.fillRect(Math.floor(s*.18),bY,Math.floor(s*.64),bH);
    c.fillStyle="#1a1a2e"; c.fillRect(Math.floor(s*.22),bY+bH,Math.floor(s*.24),lH); c.fillRect(Math.floor(s*.54),bY+bH,Math.floor(s*.24),lH);
    c.fillStyle="#3a2a1a"; c.fillRect(Math.floor(s*.20),bY+bH+lH,Math.floor(s*.27),Math.floor(lH*.3)); c.fillRect(Math.floor(s*.53),bY+bH+lH,Math.floor(s*.27),Math.floor(lH*.3));
  }
}

/* -AVATAR EDITOR- */
function initAvatarEditor(){
  G("classPicker").addEventListener("click",function(e){
    var card=e.target.closest(".class-card"); if(!card) return;
    document.querySelectorAll(".class-card").forEach(function(c){c.classList.remove("active");});
    card.classList.add("active");
    player.cls=card.dataset.class;
    updateStatBars(); drawAvatar(G("avatarCanvas"));
  });
  G("skinPicker").addEventListener("click",function(e){
    var dot=e.target.closest("[data-skin]"); if(!dot) return;
    G("skinPicker").querySelectorAll(".color-dot").forEach(function(d){d.classList.remove("active");});
    dot.classList.add("active");
    player.skinIdx=parseInt(dot.dataset.skin,10);
    drawAvatar(G("avatarCanvas"));
  });
  G("hairPicker").addEventListener("click",function(e){
    var dot=e.target.closest("[data-hair]"); if(!dot) return;
    G("hairPicker").querySelectorAll(".color-dot").forEach(function(d){d.classList.remove("active");});
    dot.classList.add("active");
    player.hairIdx=parseInt(dot.dataset.hair,10);
    drawAvatar(G("avatarCanvas"));
  });
  G("outfitPicker").addEventListener("click",function(e){
    var dot=e.target.closest("[data-outfit]"); if(!dot) return;
    G("outfitPicker").querySelectorAll(".color-dot").forEach(function(d){d.classList.remove("active");});
    dot.classList.add("active");
    player.outfitIdx=parseInt(dot.dataset.outfit,10);
    drawAvatar(G("avatarCanvas"));
  });
  G("charName").addEventListener("input",function(){
    G("previewName").textContent=G("charName").value.trim()||"Wanderer";
  });
  updateStatBars();
  drawAvatar(G("avatarCanvas"));
}

function updateStatBars(){
  var cls=CLASSES[player.cls]||CLASSES.knight;
  G("previewClass").textContent=player.cls.charAt(0).toUpperCase()+player.cls.slice(1);
  G("statHp").style.width =(cls.hp /120*100)+"%"; G("statHpVal").textContent =cls.hp;
  G("statAtk").style.width=(cls.atk/35 *100)+"%"; G("statAtkVal").textContent=cls.atk;
  G("statDef").style.width=(cls.def/30 *100)+"%"; G("statDefVal").textContent=cls.def;
  G("statSpd").style.width=(cls.spd/20 *100)+"%"; G("statSpdVal").textContent=cls.spd;
}

/* -BUILD GRID- */
function buildGrid(){
  var grid=G("worldGrid");
  grid.innerHTML="";
  grid.style.gridTemplateColumns="repeat("+GRID_W+","+TILE_SIZE+"px)";
  grid.style.gridTemplateRows   ="repeat("+GRID_H+","+TILE_SIZE+"px)";
  grid.style.width =(GRID_W*TILE_SIZE)+"px";
  grid.style.height=(GRID_H*TILE_SIZE)+"px";
  grid.style.willChange="transform";

  for(var r=0;r<GRID_H;r++){
    for(var c=0;c<GRID_W;c++){
      var tile=gameMap[r][c];
      var el=document.createElement("div");
      el.className="tile "+(tile.cssClass||"tile-grass");
      /* Only tree tiles get a z-index — this lets their ::after canopy
         paint above surrounding ground tiles without being clipped.
         Non-tree tiles have no z-index so they don't create stacking
         contexts that would trap the tree canopy.                     */
      if(tile.type==="tree"){
        el.style.zIndex = (r * 10) + 5;
        el.style.setProperty("--tree-w", (TREE_WIDTH_SCALE*100).toFixed(0)+"%");
        el.style.setProperty("--tree-h", (TREE_HEIGHT_SCALE*100).toFixed(0)+"%");
        el.style.setProperty("--tree-z", "2");
      }
      if(!tile.blocked) el.classList.add("tile-walkable");
      if(tile.npc){
        el.classList.add("tile-npc");
        el.setAttribute("title",NPCS[tile.npc]?NPCS[tile.npc].name:"NPC");
        /* pixel portrait on tile */
        var pc=document.createElement("canvas");
        pc.width=48; pc.height=48;
        pc.className="npc-portrait-tile";
        drawNpcPortrait(pc, tile.npc);
        el.appendChild(pc);
      }
      /* item markers */
      var item=getMapItem(r,c);
      if(item&&!item.found){
        var dot=document.createElement("div");
        dot.className="item-marker";
        dot.setAttribute("data-item-r",r);
        dot.setAttribute("data-item-c",c);
        var spriteInfo=item.useSprite&&ITEM_SPRITES[item.id];
        if(spriteInfo){
          var img=document.createElement("img");
          img.src=spriteInfo.src;
          img.style.cssText="width:100%;height:100%;image-rendering:pixelated;display:block;";
          img.onerror=function(){ this.parentNode.textContent=item.label||"✦"; };
          dot.appendChild(img);
          dot.style.width="32px"; dot.style.height="32px"; dot.style.fontSize="0";
        } else {
          dot.textContent=item.label||"✦";
        }
        el.appendChild(dot);
      }
      grid.appendChild(el);
    }
  }

  /* player canvas */
  playerCanvas=document.createElement("canvas");
  playerCanvas.width =40;
  playerCanvas.height=48;
  playerCanvas.className="player-sprite";
  playerCanvas.style.position="absolute";
  playerCanvas.style.zIndex= (player.y * 10) + 2;
  playerCanvas.style.imageRendering="pixelated";
  playerCanvas.style.pointerEvents="none";
  grid.appendChild(playerCanvas);

  drawAvatar(playerCanvas);
  updateCamera(false);
}

/* -CAMERA- */
function updateCamera(animate){
  /* ideal camera: center on player */
  var viewW=G("worldContainer").clientWidth;
  var viewH=G("worldContainer").clientHeight;
  var worldW=GRID_W*TILE_SIZE;
  var worldH=GRID_H*TILE_SIZE;

  /* target: player centered */
  var targetX=-(player.x*TILE_SIZE+(TILE_SIZE/2))+(viewW/2);
  var targetY=-(player.y*TILE_SIZE+(TILE_SIZE/2))+(viewH/2);

  /* clamp so world edges don't show black */
  var minX=-(worldW-viewW); var maxX=0;
  var minY=-(worldH-viewH); var maxY=0;

  /* if world is smaller than viewport (shouldn't happen but safe) */
  if(minX>maxX){ minX=0; maxX=0; }
  if(minY>maxY){ minY=0; maxY=0; }

  camX=Math.max(minX,Math.min(maxX,targetX));
  camY=Math.max(minY,Math.min(maxY,targetY));

  var grid=G("worldGrid");
  grid.style.transition=animate?"transform .13s linear":"none";
  grid.style.transform="translate("+camX+"px,"+camY+"px)";

  /* position player sprite within the grid (grid-relative) */
  if(playerCanvas){
    playerCanvas.style.left=(player.x*TILE_SIZE+Math.round((TILE_SIZE-40)/2))+"px";
    playerCanvas.style.top =(player.y*TILE_SIZE+Math.round((TILE_SIZE-48)/2))+"px";
    /* z-index: sit between tree rows — above row (y-1) trees, below row y trees */
    playerCanvas.style.zIndex = (player.y * 10) + 2;
  }
}

/* -HUD- */
function updateHUD(){
  G("hudName").textContent=player.name;
  G("hudHpFill").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";
  G("hudHpText").textContent=player.hp+"/"+player.maxHp;
  G("hudGold").textContent=player.gold;
  G("hudDay").textContent="Day "+dayNumber+(isRaining?" · 🌧 Raining":"");

  var tile=gameMap[player.y]&&gameMap[player.y][player.x];
  if(!tile||currentMap==="inn"){
    G("hudBiome").textContent=currentMap==="inn"?"Inn":"...";
    return;
  }
  var names={forest:"Forest",dark_forest:"Dark Forest",desert:"Desert",village:"Village"};
  G("hudBiome").textContent=names[tile.biome]||tile.biome;

  if(tile.biome!==lastBiome){
    var prevBiome=lastBiome;
    lastBiome=tile.biome;
    var msgs={forest:"You enter the Forest. Pine and poor decisions.",dark_forest:"The Dark Forest swallows the light. Something hums.",desert:"The Desert. Endless sand. Endless existential dread.",village:"The Village. Civilisation! Sort of."};
    if(msgs[tile.biome]) showToast(msgs[tile.biome]);
    Audio.sfxBiomeChange(tile.biome);
    if(isRaining && tile.biome==="desert"){
      /* rain doesn't follow you into the desert — fade it out visually */
      var rCanvas=G("rainCanvas"); var rTint=document.querySelector(".rain-tint");
      rCanvas.classList.remove("active"); if(rTint) rTint.classList.remove("active");
      /* wait for the 1.5s CSS opacity transition before killing the animation */
      setTimeout(function(){ stopRain(); },1600);
      Audio.playMusic("desert");
    } else if(isRaining && prevBiome==="desert" && tile.biome!=="desert"){
      /* leaving the desert while rain is active — restore rain visuals */
      var rCanvas=G("rainCanvas"); var rTint=document.querySelector(".rain-tint");
      rCanvas.classList.add("active"); if(rTint) rTint.classList.add("active");
      startRain();
      Audio.playMusic("rain");
    } else if(!isRaining){
      Audio.playMusic(tile.biome);
    }
  }

  /* mini avatar */
  var wrap=G("hudAvatarMini");
  var mc=wrap.querySelector("canvas");
  if(!mc){ mc=document.createElement("canvas"); mc.width=36; mc.height=36; wrap.appendChild(mc); }
  drawAvatar(mc);
}

/* -DAY SYSTEM- */
function advanceStep(){
  stepCount++;
  checkRandomEncounter();
}

/* -RANDOM ENCOUNTERS- */
var ENCOUNTER_COOLDOWN = 0;   /* steps before next encounter can fire */
var ENCOUNTER_MIN_STEPS = 8;  /* minimum steps between any encounter   */

var ENCOUNTERS = {
  forest:[
    { w:8,  fn: function(){ showEncounterToast("🍄","You nearly step on a cluster of red-capped mushrooms. They smell faintly of burnt wood and bad ideas."); } },
    { w:7,  fn: function(){ showEncounterToast("🪶","A black feather drifts down from the canopy and lands at your feet. There's nothing above you. There are no birds."); } },
    { w:6,  fn: function(){ showEncounterToast("📜","A scrap of paper is pinned to a tree with a rusted knife. It reads: 'Turn back.' Someone has crossed that out and written: 'No, seriously.'"); } },
    { w:5,  fn: function(){ showEncounterToast("🐾","You find tracks in the mud. Four-toed, large. Whatever made them was walking in a very deliberate straight line."); } },
    { w:4,  fn: function(){ showEncounterToast("🌿","The trees thin for a moment and you see something in the distance. Then the trees close again. You're not sure what you saw."); } },
    { w:3,  fn: function(){ goldFind(5,12,"💰","You find a small purse half-buried in moss."); } },
    { w:2,  fn: function(){ hpFind(10,20,"🍃","You chew on some leaves out of curiosity. Surprisingly, your wounds feel a little better. Please don't make a habit of this."); } },
    { w:2,  fn: function(){ showEncounterToast("🔍","Someone has carved an arrow into a tree trunk. It points north. There is nothing north but more trees. You understand completely."); } }
  ],
  dark_forest:[
    { w:8,  fn: function(){ showEncounterToast("🌑","The darkness here feels deliberate. Like it's watching what you do with it."); } },
    { w:7,  fn: function(){ showEncounterToast("📝","A note nailed to a dead tree: 'The hermit is lying about the fire.' No signature. The ink is still wet."); } },
    { w:6,  fn: function(){ showEncounterToast("🦴","You find a boot. Just one. In good condition. You don't pick it up."); } },
    { w:6,  fn: function(){ showEncounterToast("🔔","Something chimes. Once. You stop walking. It doesn't happen again."); } },
    { w:5,  fn: function(){ showEncounterToast("👁️","You have the very strong feeling you are being counted."); } },
    { w:4,  fn: function(){ showEncounterToast("🪵","A piece of Darkwood sits in the middle of the path. There are no trees nearby. It's already cut to size."); } },
    { w:3,  fn: function(){ goldFind(8,18,"💰","A coin pouch hangs from a low branch, swaying with no wind."); } },
    { w:2,  fn: function(){ showEncounterToast("🌀","You walk in what you are certain is a straight line. You end up exactly where you started. You decide not to think about it."); } }
  ],
  desert:[
    { w:8,  fn: function(){ showEncounterToast("☀️","The heat does something to distances. That rock has been getting further away for ten minutes."); } },
    { w:7,  fn: function(){ showEncounterToast("🦴","Bleached bones half-buried in sand. A sword hilt protrudes nearby. The sword is gone. The hilt remains, as a warning or a formality."); } },
    { w:6,  fn: function(){ showEncounterToast("📜","A scrap of cloth with a single sentence: 'The nomad has walked this desert more times than he admits. Ask him why he keeps coming back.'"); } },
    { w:5,  fn: function(){ showEncounterToast("💧","You find a sealed waterskin half-buried in the sand. It's empty. But it's a nice waterskin."); } },
    { w:5,  fn: function(){ showEncounterToast("🌵","Something is carved into the sand, elaborate and deliberate. The wind takes it before you finish reading."); } },
    { w:4,  fn: function(){ goldFind(10,22,"💰","A small lockbox, unlocked, half-buried — the gold inside is sun-warm."); } },
    { w:3,  fn: function(){ hpFind(8,15,"🌵","You find a desert plant with waxy leaves. You eat some. Questionable decision. Your body seems fine with it."); } },
    { w:2,  fn: function(){ showEncounterToast("👣","Your own footprints lead directly back to you. You haven't turned around once."); } }
  ],
  village:[
    { w:9,  fn: function(){ showEncounterToast("🐔","A chicken stares at you with unusual intensity. You break eye contact first."); } },
    { w:7,  fn: function(){ showEncounterToast("👧","A child points at you and says something to another child. They both laugh. You'll never know what it was."); } },
    { w:6,  fn: function(){ showEncounterToast("🍎","Someone has left a basket of apples by the road with a sign: 'Free. No, really.' You don't trust it. Probably wise."); } },
    { w:5,  fn: function(){ showEncounterToast("📋","A wanted poster on a wall. The sketch looks like you, but vaguer. The crime is listed as 'General Wandering.'"); } },
    { w:4,  fn: function(){ showEncounterToast("🎶","Someone nearby is humming a tune you almost recognise. By the time you place it, they're gone."); } },
    { w:3,  fn: function(){ goldFind(3,8,"💰","A coin rolls out from between cobblestones and stops at your foot."); } },
    { w:2,  fn: function(){ hpFind(12,25,"🥣","A villager hands you a bowl of stew without explanation and walks away. It's warm. You feel better."); } }
  ]
};

function showEncounterToast(icon, msg){
  var old=document.querySelector(".encounter-toast"); if(old) old.remove();
  var t=document.createElement("div");
  t.className="encounter-toast";
  t.innerHTML='<span class="enc-icon">'+icon+'</span><span class="enc-msg">'+msg+'</span>';
  document.body.appendChild(t);
  setTimeout(function(){ t.classList.add("enc-visible"); }, 30);
  setTimeout(function(){ t.classList.remove("enc-visible"); setTimeout(function(){ if(t.parentNode) t.remove(); }, 500); }, 5500);
}

function goldFind(min, max, icon, msg){
  var amount=min+Math.floor(Math.random()*(max-min+1));
  player.gold+=amount;
  updateHUD();
  showEncounterToast(icon, msg+" (+"+amount+"g)");
}

function hpFind(min, max, icon, msg){
  var amount=min+Math.floor(Math.random()*(max-min+1));
  player.hp=Math.min(player.maxHp, player.hp+amount);
  updateHUD();
  showEncounterToast(icon, msg+" (+"+amount+" HP)");
}

function checkRandomEncounter(){
  if(!gameActive||currentMap!=="world") return;
  if(ENCOUNTER_COOLDOWN>0){ ENCOUNTER_COOLDOWN--; return; }
  var tile=gameMap[player.y]&&gameMap[player.y][player.x];
  if(!tile) return;
  var biome=tile.biome;
  var pool=ENCOUNTERS[biome]; if(!pool) return;
  /* ~1 in 14 chance per step */
  if(Math.random()>0.01) return;
  /* weighted pick */
  var total=0; pool.forEach(function(e){ total+=e.w; });
  var roll=Math.random()*total;
  var cum=0;
  for(var i=0;i<pool.length;i++){
    cum+=pool[i].w;
    if(roll<cum){ pool[i].fn(); break; }
  }
  ENCOUNTER_COOLDOWN=ENCOUNTER_MIN_STEPS;
}

function showDayBanner(msg){
  var old=document.querySelector(".day-banner");
  if(old) old.remove();
  var b=document.createElement("div");
  b.className="day-banner"; b.textContent=msg;
  document.body.appendChild(b);
  setTimeout(function(){if(b.parentNode) b.remove();},3600);
}

/* -RAIN- */
function toggleRain(on){
  var canvas=G("rainCanvas");
  var tint  =document.querySelector(".rain-tint");
  if(on){
    canvas.classList.add("active");
    if(tint) tint.classList.add("active");
    startRain();
    /* don't override inn music — rain is just visual inside the inn */
    if(currentMap!=="inn") Audio.playMusic("rain");
  } else {
    canvas.classList.remove("active");
    if(tint) tint.classList.remove("active");
    stopRain();
    /* resume appropriate music */
    if(currentMap==="inn"){
      Audio.playMusic("inn");
    } else {
      var tile=gameMap[player.y]&&gameMap[player.y][player.x];
      var biome=tile?tile.biome:"forest";
      Audio.playMusic(biome);
    }
  }
}

function startRain(){
  var canvas=G("rainCanvas");
  /* size to viewport */
  function resize(){
    canvas.width =G("worldContainer").clientWidth;
    canvas.height=G("worldContainer").clientHeight;
  }
  resize();
  rainDrops=[];
  for(var i=0;i<180;i++){
    rainDrops.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      len:8+Math.random()*14,
      speed:6+Math.random()*8,
      opacity:0.3+Math.random()*0.5
    });
  }
  if(rainAnimId) cancelAnimationFrame(rainAnimId);
  function frame(){
    if(!isRaining){ return; }
    rainAnimId=requestAnimationFrame(frame);
    var c=canvas.getContext("2d");
    c.clearRect(0,0,canvas.width,canvas.height);
    c.strokeStyle="#a0c8e0";
    c.lineWidth=1;
    for(var i=0;i<rainDrops.length;i++){
      var d=rainDrops[i];
      c.globalAlpha=d.opacity;
      c.beginPath();
      c.moveTo(d.x,d.y);
      c.lineTo(d.x-d.len*0.2,d.y+d.len);
      c.stroke();
      d.y+=d.speed;
      d.x-=d.speed*0.2;
      if(d.y>canvas.height){
        d.y=-d.len; d.x=Math.random()*canvas.width;
      }
    }
    c.globalAlpha=1;
  }
  frame();
}

function stopRain(){
  if(rainAnimId){ cancelAnimationFrame(rainAnimId); rainAnimId=null; }
  var canvas=G("rainCanvas");
  var c=canvas.getContext("2d");
  c.clearRect(0,0,canvas.width,canvas.height);
}

/* -MOVEMENT- */
var MOVE_KEYS={
  ArrowUp:{dx:0,dy:-1},w:{dx:0,dy:-1},
  ArrowDown:{dx:0,dy:1},s:{dx:0,dy:1},
  ArrowLeft:{dx:-1,dy:0},a:{dx:-1,dy:0},
  ArrowRight:{dx:1,dy:0},d:{dx:1,dy:0}
};
var playerMoving=false;

function handleKeyDown(e){
  if(!gameActive) return;
  if(isSleeping) return;
  var introOv=G("introOverlay"); if(introOv&&introOv.style.display!=="none") return;
  if(G("dialogOverlay").style.display!=="none"){
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); advanceDialog(); }
    return;
  }
  if(G("shopOverlay").style.display!=="none") return;
  if(G("invOverlay").style.display !=="none") return;
  var ov=G("questOverlay"); if(ov&&ov.style.display!=="none") return;

  var mv=MOVE_KEYS[e.key];
  if(!mv) return;
  e.preventDefault();
  if(playerMoving) return;

  /* ── HOME MOVEMENT (post-ending room, nothing interacts) ── */
  if(currentMap==="home"){
    var nx=player.x+mv.dx, ny=player.y+mv.dy;
    if(nx<0||nx>=HOME_W||ny<0||ny>=HOME_H) return;
    if(homeMap[ny][nx].blocked) return;
    playerMoving=true;
    player.x=nx; player.y=ny;
    drawAvatar(playerCanvas);
    playerCanvas.classList.add("walking");
    playerCanvas.style.transition="left 0.13s linear,top 0.13s linear";
    playerCanvas.style.left=(player.x*TILE_SIZE+Math.round((TILE_SIZE-40)/2))+"px";
    playerCanvas.style.top =(player.y*TILE_SIZE+Math.round((TILE_SIZE-48)/2))+"px";
    Audio.sfxStep&&Audio.sfxStep("village");
    clearTimeout(moveTimer);
    moveTimer=setTimeout(function(){ playerMoving=false; playerCanvas.classList.remove("walking"); },140);
    return;
  }

  /* ── INN MOVEMENT ── */
  if(currentMap==="inn"){
    var nx=player.x+mv.dx, ny=player.y+mv.dy;
    if(nx<0||nx>=INN_W||ny<0||ny>=INN_H) return;
    var itile=innMap[ny][nx];
    if(itile.special==="exit"){ exitInn(); return; }
    if(itile.special==="bed"||itile.type==="bed"){ sleepInBed(); return; }
    if(itile.blocked) return;
    playerMoving=true;
    player.x=nx; player.y=ny;
    drawAvatar(playerCanvas);
    playerCanvas.classList.add("walking");
    playerCanvas.style.transition="left 0.13s linear,top 0.13s linear";
    playerCanvas.style.left=(player.x*TILE_SIZE+Math.round((TILE_SIZE-40)/2))+"px";
    playerCanvas.style.top=(player.y*TILE_SIZE+Math.round((TILE_SIZE-48)/2))+"px";
    Audio.sfxStep("village");
    consumeEnergy();
    clearTimeout(moveTimer);
    moveTimer=setTimeout(function(){ playerMoving=false; playerCanvas.classList.remove("walking"); },140);
    return;
  }

  /* ── WORLD MOVEMENT ── */
  var nx=player.x+mv.dx, ny=player.y+mv.dy;
  if(nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
  var target=gameMap[ny][nx];

  /* innkeeper tile = inn entrance */
  if(target.npc==="innkeeper"){ startDialog("innkeeper"); return; }
  if(target.npc){ startDialog(target.npc); return; }
  if(target.blocked) return;

  /* check item on destination */
  var item=getMapItem(ny,nx);
  if(item&&!item.found&&!item.isShrine){
    item.found=true;
    Audio.sfxItemFind&&Audio.sfxItemFind();
    var markers=document.querySelectorAll("[data-item-r='"+ny+"'][data-item-c='"+nx+"']");
    markers.forEach(function(m){if(m.parentNode)m.parentNode.removeChild(m);});
    questState.inventory.push(item.id);
    questState.collect[item.id]=(questState.collect[item.id]||0)+1;
    checkItemPickup(item);
  }
  if(item&&item.isShrine){ handleShrine(); return; }

  playerMoving=true;
  player.x=nx; player.y=ny;
  drawAvatar(playerCanvas);
  playerCanvas.classList.add("walking");
  updateCamera(true);
  Audio.sfxStep(gameMap[ny][nx].biome);
  advanceStep();
  consumeEnergy();

  var moveDelay=energy>0?140:400;
  clearTimeout(moveTimer);
  moveTimer=setTimeout(function(){
    playerMoving=false;
    playerCanvas.classList.remove("walking");
    updateHUD();
  },moveDelay);
}

/* -DIALOG- */
function startDialog(npcKey){
  var npc=NPCS[npcKey]; if(!npc) return;

  /* quest-aware lines */
  var lines=npc.lines.slice();
  dialogState.pendingQuestOffer=null; dialogState.pendingQuestReturn=null;
  if(npc.questOffer){
    var q=QUESTS[npc.questOffer];
    if(q&&!questState.active[q.id]&&!questState.completed[q.id]){
      /* quest not yet offered — lead with first idle line then pitch */
      lines=npc.lines.slice(0,1).concat(npc.questOfferLines||[]);
      dialogState.pendingQuestOffer=q.id;
    } else if(q&&questState.active[q.id]){
      /* quest active — check if player can return */
      var canReturn=false;
      if(q.id==="q1"&&questState.inventory.indexOf("satchel")!==-1) canReturn=true;
      if(q.id==="q2"&&(questState.collect.darkwood||0)>=3) canReturn=true;
      if(q.id==="q3"&&questState.inventory.indexOf("sunstone")!==-1) canReturn=true;
      if(canReturn){
        lines=npc.questReturnLines||npc.lines.slice();
        dialogState.pendingQuestReturn=q.id;
      } else if(npc.questActiveLines&&npc.questActiveLines.length){
        /* still hunting — give a nudge line, rotate through them */
        if(!npc._activeIdx) npc._activeIdx=0;
        lines=[npc.questActiveLines[npc._activeIdx%npc.questActiveLines.length]];
        npc._activeIdx++;
      }
    } else if(q&&questState.completed[q.id]){
      /* quest done — first few visits use memory lines, then rotate idle */
      if(!npc._memIdx) npc._memIdx=0;
      var memPool=npc.questMemoryLines&&npc.questMemoryLines.length?npc.questMemoryLines:npc.lines;
      if(npc._memIdx<memPool.length){
        lines=[memPool[npc._memIdx]]; npc._memIdx++;
      } else {
        if(!npc._idleIdx) npc._idleIdx=0;
        var idlePool=npc.lines; var idleI=npc._idleIdx%idlePool.length;
        lines=[idlePool[idleI]]; npc._idleIdx++;
      }
    }
  } else {
    /* NPCs with no quest also rotate lines on repeat visits */
    if(!npc._idleIdx) npc._idleIdx=0;
    var idlePool=npc.lines; var idleI=npc._idleIdx%idlePool.length;
    lines=[idlePool[idleI]]; npc._idleIdx++;
  }

  dialogState.npc=npc; dialogState.lines=lines; dialogState.idx=0;

  /* portrait canvas */
  var portraitEl=G("dialogPortrait"); portraitEl.innerHTML="";
  var pc=document.createElement("canvas"); pc.width=72; pc.height=72;
  pc.style.imageRendering="pixelated";
  drawNpcPortrait(pc,npcKey);
  portraitEl.appendChild(pc);

  G("dialogSpeaker").textContent=npc.name;
  G("dialogOverlay").style.display="flex";
  Audio.sfxDialogOpen();
  renderDialogLine();
}

function checkItemPickup(item){
  if(item.id==="satchel"){ showToast(spriteOrEmoji("satchel","📦",20)+" Found the Herbalist's Satchel!"); if(questState.active["q1"]) QUESTS.q1.step=1; }
  else if(item.id==="darkwood"){ var ct=questState.collect.darkwood||0; showToast(spriteOrEmoji("darkwood","🪵",20)+" Darkwood collected! ("+ct+"/3)"); if(questState.active["q2"]){QUESTS.q2.steps[0]="Collect 3 Darkwood ("+ct+"/3)"; if(ct>=3)QUESTS.q2.step=1;} }
  else if(item.id==="sunstone"){ showToast(spriteOrEmoji("sunstone","💎",20)+" Found a Sun Stone!"); if(questState.active["q3"]) QUESTS.q3.step=1; }
  renderQuestLog();
}

/* ═══════════════════════ SHRINE / OUTRO ═══════════════════════ */
function handleShrine(){
  var frags=["forest_fragment","dark_fragment","desert_fragment"].filter(function(f){
    return questState.inventory.indexOf(f)!==-1;
  }).length;
  if(frags<3){ showToast("The shrine hums... "+frags+"/3 fragments needed."); return; }

  /* ── Step 1: Spirit dialog ── */
  gameActive=false; /* block movement during outro sequence */
  Audio.sfxQuestComplete&&Audio.sfxQuestComplete();

  /* Play rising shrine sound */
  Audio.sfxShrine&&Audio.sfxShrine();

  /* Set up spirit dialog — last line triggers dissolve */
  var portraitEl=G("dialogPortrait");
  portraitEl.innerHTML="<span style='font-size:2.8rem;filter:drop-shadow(0 0 12px #ffd080);'>🌟</span>";
  dialogState.npc={name:"The Spirit", isSpirit:true};
  dialogState.lines=[
    "The shrine blazes to life.",
    "Three fragments orbit the pillar — singing in a language older than words.",
    "You have gathered the fragments.",
    "A voice fills the clearing. Not sound... but memory.",
    "You remember a name. A home. A reason you left.",
    "The debt is paid. You are free."
  ];
  dialogState.idx=0;
  G("dialogSpeaker").textContent="✦ The Spirit ✦";
  G("dialogSpeaker").style.cssText+="color:#ffd080;text-shadow:0 0 12px #ffd080;";
  G("dialogOverlay").style.display="flex";
  renderDialogLine();
}

/* Called after the last spirit dialog line is dismissed */
function beginDissolveSequence(){
  G("dialogOverlay").style.display="none";
  Audio.sfxDialogClose&&Audio.sfxDialogClose();

  /* Eerie dissolve sound — low rumble + high tone */
  if(Audio._ctx&&Audio._ctx()){
    var ctx2=Audio._ctx();
    var t=ctx2.currentTime;
    /* low rumble */
    var o1=ctx2.createOscillator(),g1=ctx2.createGain();
    o1.type="sawtooth"; o1.frequency.setValueAtTime(40,t); o1.frequency.exponentialRampToValueAtTime(80,t+3);
    g1.gain.setValueAtTime(0,t); g1.gain.linearRampToValueAtTime(0.3,t+0.5);
    g1.gain.linearRampToValueAtTime(0,t+3.5);
    o1.connect(g1); g1.connect(ctx2.destination); o1.start(t); o1.stop(t+3.6);
    /* eerie high shimmer */
    [1200,1400,1600,1800,2000].forEach(function(f,i){
      var o=ctx2.createOscillator(),g=ctx2.createGain();
      o.type="sine"; o.frequency.value=f;
      g.gain.setValueAtTime(0,t+i*0.2);
      g.gain.linearRampToValueAtTime(0.04,t+i*0.2+0.3);
      g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.2+2.5);
      o.connect(g); g.connect(ctx2.destination); o.start(t+i*0.2); o.stop(t+i*0.2+2.6);
    });
  }

  /* Create dissolve overlay */
  var dov=document.createElement("div"); dov.id="dissolveOverlay";
  dov.style.cssText="position:fixed;inset:0;z-index:250;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.8s ease;pointer-events:all;";
  document.body.appendChild(dov);

  /* The dissolve text — Undertale-style: white, glitchy, raw */
  var dtxt=document.createElement("div"); dtxt.id="dissolveText";
  dtxt.style.cssText=[
    "font-family:'Courier New',Courier,monospace",
    "font-size:clamp(1rem,3vw,1.6rem)",
    "color:#ffffff",
    "text-align:center",
    "max-width:600px",
    "padding:32px",
    "line-height:2",
    "letter-spacing:0.15em",
    "text-shadow:0 0 8px #fff, 0 0 2px #aef",
    "white-space:pre-wrap"
  ].join(";");
  dov.appendChild(dtxt);

  var hint=document.createElement("div");
  hint.style.cssText="position:absolute;bottom:40px;color:rgba(255,255,255,0.35);font-family:'Courier New',monospace;font-size:0.75rem;letter-spacing:3px;";
  hint.textContent="[ press enter to continue ]";
  dov.appendChild(hint);

  /* Fade in the black overlay first */
  requestAnimationFrame(function(){
    dov.style.opacity="1";
    setTimeout(function(){
      typeDissolveText(dtxt, hint, dov);
    }, 900);
  });
}

function typeDissolveText(el, hint, overlay){
  var fullText = "The world around you begins to dissolve..";
  var i=0;
  var glitchChars="█▓▒░▄▀■□▪▫";
  var iv=setInterval(function(){
    if(i>=fullText.length){
      clearInterval(iv);
      /* show hint and wait for input */
      hint.style.opacity="1";
      hint.style.transition="opacity 1s ease";
      /* flicker the hint */
      var flickerCount=0;
      var flickIv=setInterval(function(){
        flickerCount++;
        hint.style.opacity=(flickerCount%2===0)?"1":"0.2";
        if(flickerCount>10) clearInterval(flickIv);
      },400);

      function onDissolveAdvance(e){
        if(e.key==="Enter"||e.key===" "||e.type==="click"){
          e.preventDefault();
          document.removeEventListener("keydown",onDissolveAdvance);
          overlay.removeEventListener("click",onDissolveAdvance);
          clearInterval(flickIv);
          /* fade out dissolve text, then start cutscene */
          overlay.style.transition="opacity 0.6s ease";
          overlay.style.opacity="0";
          setTimeout(function(){
            if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
            startOutro();
          }, 700);
        }
      }
      document.addEventListener("keydown",onDissolveAdvance);
      overlay.addEventListener("click",onDissolveAdvance);
      return;
    }
    /* glitch effect: occasionally show random char then correct char */
    var ch=fullText[i];
    if(Math.random()<0.3 && ch!==" " && ch!=="."){
      el.textContent+=glitchChars[Math.floor(Math.random()*glitchChars.length)];
      setTimeout(function(){ el.textContent=el.textContent.slice(0,-1)+ch; },60);
    } else {
      el.textContent+=ch;
    }
    i++;
    /* brief screen flicker every ~7 chars */
    if(i%7===0 && Math.random()<0.4){
      el.style.opacity="0.3";
      setTimeout(function(){ el.style.opacity="1"; },80);
    }
  }, 85);
}

/* ═══════════════════════ OUTRO CUTSCENE ═══════════════════════ */
var HOME_MAP_DEF=[
  ["W","W","W","W","W","W","W","W","W","W","W","W","W","W"],
  ["W","F","F","F","F","F","F","F","F","F","F","F","F","W"],
  ["W","F","BD","BD","F","F","F","F","F","F","F","F","F","W"],
  ["W","F","BD","BD","F","F","F","F","F","F","F","F","F","W"],
  ["W","F","F","F","F","SH","SH","SH","F","F","F","F","F","W"],
  ["W","F","F","F","F","SH","PC","SH","F","F","F","F","F","W"],
  ["W","F","F","F","F","SH","SH","SH","F","F","F","F","F","W"],
  ["W","F","F","F","F","F","F","F","F","F","DK","DK","F","W"],
  ["W","F","F","F","F","F","F","F","F","F","DK","DK","F","W"],
  ["W","W","W","W","W","W","W","W","W","W","W","W","W","W"]
];
var HOME_H=HOME_MAP_DEF.length, HOME_W=HOME_MAP_DEF[0].length;
var homeMap=[];

function buildHomeMap(){
  homeMap=[];
  for(var r=0;r<HOME_H;r++){
    homeMap[r]=[];
    for(var c=0;c<HOME_W;c++){
      var cell=HOME_MAP_DEF[r][c];
      var t={type:"floor",blocked:false,biome:"home",cssClass:"home-floor",special:null};
      if(cell==="W")  { t.type="wall";  t.blocked=true; t.cssClass="inn-wall"; }
      else if(cell==="BD"){ t.type="bed"; t.blocked=true; t.cssClass="home-bed"; t.special="bed"; }
      else if(cell==="SH"){ t.type="shelf"; t.blocked=true; t.cssClass="home-shelf"; }
      else if(cell==="PC"){ t.type="desk";  t.blocked=true; t.cssClass="home-desk"; }
      else if(cell==="DK"){ t.type="desk2"; t.blocked=true; t.cssClass="home-desk2"; }
      homeMap[r][c]=t;
    }
  }
}

function buildHomeGrid(){
  var grid=G("worldGrid"); grid.innerHTML="";
  grid.style.gridTemplateColumns="repeat("+HOME_W+","+TILE_SIZE+"px)";
  grid.style.gridTemplateRows   ="repeat("+HOME_H+","+TILE_SIZE+"px)";
  grid.style.width =(HOME_W*TILE_SIZE)+"px";
  grid.style.height=(HOME_H*TILE_SIZE)+"px";
  grid.style.willChange="transform";

  for(var r=0;r<HOME_H;r++){
    for(var c=0;c<HOME_W;c++){
      var tile=homeMap[r][c];
      var el=document.createElement("div");
      el.className="tile "+(tile.cssClass||"home-floor");
      el.style.zIndex=r;
      if(tile.type==="bed"&&r===2&&c===2){
        var bedC=document.createElement("canvas");
        bedC.width=TILE_SIZE*2; bedC.height=TILE_SIZE*2;
        bedC.style.cssText="position:absolute;left:0;top:0;width:"+(TILE_SIZE*2)+"px;height:"+(TILE_SIZE*2)+"px;image-rendering:pixelated;z-index:3;pointer-events:none;";
        drawBedSprite(bedC); el.appendChild(bedC);
      }
      if(tile.type==="desk"){
        var lbl=document.createElement("div");
        lbl.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.8rem;z-index:3;";
        lbl.textContent="🖥️"; el.appendChild(lbl);
      }
      if(tile.type==="shelf"&&r===4&&c===5){
        var lbl2=document.createElement("div");
        lbl2.style.cssText="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.8rem;z-index:3;";
        lbl2.textContent="📚"; el.appendChild(lbl2);
      }
      grid.appendChild(el);
    }
  }
  playerCanvas=document.createElement("canvas");
  playerCanvas.width=40; playerCanvas.height=48;
  playerCanvas.className="player-sprite";
  playerCanvas.style.cssText="position:absolute;z-index:50;image-rendering:pixelated;pointer-events:none;";
  grid.appendChild(playerCanvas);
  drawAvatar(playerCanvas);
  playerCanvas.style.left=(player.x*TILE_SIZE+Math.round((TILE_SIZE-40)/2))+"px";
  playerCanvas.style.top =(player.y*TILE_SIZE+Math.round((TILE_SIZE-48)/2))+"px";

  /* center home in viewport */
  var viewW=G("worldContainer").clientWidth;
  var viewH=G("worldContainer").clientHeight;
  camX=Math.round(Math.max(-(HOME_W*TILE_SIZE-viewW),(viewW-(HOME_W*TILE_SIZE))/2));
  camY=Math.round(Math.max(-(HOME_H*TILE_SIZE-viewH),(viewH-(HOME_H*TILE_SIZE))/2));
  var gridEl=G("worldGrid"); gridEl.style.transition="none";
  gridEl.style.transform="translate("+camX+"px,"+camY+"px)";
}

function startOutro(){
  /* Overlay canvas for cutscene effects — sits above the world grid */
  var cut=document.createElement("div"); cut.id="outroCutscene";
  cut.style.cssText="position:fixed;inset:0;z-index:300;pointer-events:none;overflow:hidden;";
  document.body.appendChild(cut);

  var cc=document.createElement("canvas");
  cc.style.cssText="position:absolute;inset:0;width:100%;height:100%;";
  cc.width=window.innerWidth; cc.height=window.innerHeight;
  cut.appendChild(cc);
  var ctx=cc.getContext("2d");

  /* Title card — invisible until phase 4 */
  var card=document.createElement("div");
  card.style.cssText="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;opacity:0;transition:opacity 1.2s ease;pointer-events:none;";
  cut.appendChild(card);

  function addLine(txt,style){
    var d=document.createElement("div"); d.style.cssText=style; d.textContent=txt; card.appendChild(d); return d;
  }
  addLine("✦  THE WANDERER RETURNS  ✦","font-family:'Cinzel',serif;font-size:clamp(1rem,3vw,2rem);color:#fff;letter-spacing:4px;text-shadow:0 0 24px #fff,0 0 8px #adf;");
  addLine(player.name+" remembered everything.","font-family:'Crimson Text',serif;font-style:italic;font-size:clamp(.8rem,2vw,1.2rem);color:#c8e8ff;letter-spacing:2px;text-shadow:0 0 12px #adf;");
  addLine("","font-size:.5rem;");
  addLine("You are home.","font-family:'Cinzel',serif;font-size:clamp(1rem,2.5vw,1.6rem);color:#ffd080;letter-spacing:6px;text-shadow:0 0 20px #ffd080;");

  /* Particles for phase 0 */
  var particles=[];
  for(var i=0;i<120;i++){
    particles.push({
      x:Math.random()*cc.width, y:Math.random()*cc.height,
      vx:(Math.random()-0.5)*3, vy:-(1+Math.random()*4),
      r:2+Math.random()*4, life:1, decay:0.005+Math.random()*0.008,
      hue:Math.random()<0.5?55:200
    });
  }

  /*
    PHASE 0  (120 frames): rings + particles orbit centre + screen shake
    PHASE 1  (35 frames):  white flash fills screen; explosion SFX fires on first frame
    PHASE 2  (1 frame):    swap to home map while fully white; home is now behind white
    PHASE 3  (60 frames):  fade white OUT, revealing the home map beneath
    PHASE 4  (340 frames): show title card over the now-visible home map
    PHASE 5  (50 frames):  fade card + canvas overlay out; re-enable movement
  */
  var phase=0, phaseT=0, animId;
  var shakeAmt=0;
  var explosionFired=false;
  var homeSwapped=false;

  function frame(){
    animId=requestAnimationFrame(frame);
    phaseT++;
    ctx.clearRect(0,0,cc.width,cc.height);

    /* Screen shake — applied to world grid during phase 0 */
    if(shakeAmt>0.2){
      var sx=(Math.random()-0.5)*shakeAmt*2, sy=(Math.random()-0.5)*shakeAmt*2;
      var grd=G("worldGrid"); if(grd) grd.style.transform="translate("+(camX+sx)+"px,"+(camY+sy)+"px)";
      shakeAmt*=0.85;
    }

    /* ── PHASE 0: rings + particles charging toward centre + growing shake ── */
    if(phase===0){
      var progress=phaseT/120;
      shakeAmt=progress*22;
      var cx2=cc.width/2, cy2=cc.height/2;
      for(var ri=0;ri<3;ri++){
        var rr=(phaseT*2.5+ri*50)%200;
        ctx.beginPath(); ctx.arc(cx2,cy2,rr,0,Math.PI*2);
        ctx.strokeStyle="rgba(255,220,80,"+(0.5*(1-rr/200))+")";
        ctx.lineWidth=2.5; ctx.stroke();
      }
      for(var pi=0;pi<particles.length;pi++){
        var p=particles[pi];
        if(phaseT>60){ var dx=cx2-p.x,dy=cy2-p.y,dist=Math.sqrt(dx*dx+dy*dy)||1; p.vx+=dx/dist*0.4; p.vy+=dy/dist*0.4; }
        p.x+=p.vx; p.y+=p.vy; p.life-=p.decay*0.4;
        if(p.life<=0){ p.x=Math.random()*cc.width; p.y=Math.random()*cc.height; p.life=1; p.vx=(Math.random()-0.5)*3; p.vy=-(1+Math.random()*4); }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
        ctx.fillStyle="hsla("+p.hue+",100%,80%,"+p.life+")"; ctx.fill();
      }
      if(phaseT>=120){ phase=1; phaseT=0; shakeAmt=0; }
    }

    /* ── PHASE 1: white flash — explosion SFX fires on very first frame ── */
    else if(phase===1){
      if(!explosionFired){
        explosionFired=true;
        Audio.sfxExplosion&&Audio.sfxExplosion();
      }
      var wOpacity=Math.min(1, phaseT/18);
      ctx.fillStyle="rgba(255,255,220,"+wOpacity+")";
      ctx.fillRect(0,0,cc.width,cc.height);
      /* At full white (frame 18+) swap to home map so it's ready behind the white */
      if(phaseT>=18 && !homeSwapped){
        homeSwapped=true;
        buildHomeMap(); currentMap="home";
        player.x=6; player.y=5;
        buildHomeGrid(); updateHUD();
        Audio.stopMusic&&Audio.stopMusic(0.1);
        setTimeout(function(){ Audio.playMusic&&Audio.playMusic("inn"); },600);
      }
      /* Hold fully white for ~2 seconds (18 ramp-up + 120 hold ≈ 2.3s at 60fps) */
      if(phaseT>=138){ phase=3; phaseT=0; }
    }

    /* ── PHASE 3: fade white OUT revealing the home map beneath ── */
    else if(phase===3){
      var wFade=Math.max(0, 1-(phaseT/60));
      ctx.fillStyle="rgba(255,255,220,"+wFade+")";
      ctx.fillRect(0,0,cc.width,cc.height);
      if(phaseT>=60){ phase=4; phaseT=0; }
    }

    /* ── PHASE 4: hold — show title card over the home map ── */
    else if(phase===4){
      /* canvas is now transparent so home map shows through */
      if(phaseT===20) card.style.opacity="1";
      if(phaseT>=340){ phase=5; phaseT=0; card.style.transition="opacity 0.8s ease"; card.style.opacity="0"; }
    }

    /* ── PHASE 5: fade out canvas overlay, re-enable movement ── */
    else if(phase===5){
      var fo=Math.max(0,1-phaseT/50);
      if(fo<=0){
        cancelAnimationFrame(animId);
        if(cut.parentNode) cut.parentNode.removeChild(cut);
        var grd2=G("worldGrid"); if(grd2) grd2.style.transform="translate("+camX+"px,"+camY+"px)";
        gameActive=true;
        setTimeout(showEndScreen,400);
        return;
      }
      /* slight dark vignette while fading — canvas is otherwise clear */
      ctx.fillStyle="rgba(0,0,0,"+fo+")"; ctx.fillRect(0,0,cc.width,cc.height);
    }
  }
  frame();
}

function showEndScreen(){
  var el=document.createElement("div"); el.id="endScreen";
  el.style.cssText="position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;";
  el.innerHTML='<div style="font-family:Cinzel,serif;font-size:clamp(1.2rem,4vw,2.8rem);color:#ffd080;letter-spacing:6px;text-shadow:0 0 24px #ffd080;">✦  THE END  ✦</div>'
    +'<div style="font-family:\'Crimson Text\',serif;font-style:italic;color:#c0d8ff;font-size:clamp(.9rem,2vw,1.3rem);text-align:center;max-width:480px;line-height:1.8;">'+player.name+' made it home.<br>The Wanderer\'s Folly is complete.</div>'
    +'<div style="color:#666;font-size:.8rem;letter-spacing:2px;margin-top:8px;">Thank you for playing.</div>'
    +'<button onclick="location.reload()" style="margin-top:24px;padding:12px 32px;font-family:Cinzel,serif;font-size:1rem;letter-spacing:3px;background:transparent;border:1px solid #ffd080;color:#ffd080;cursor:pointer;" onmouseover="this.style.background=\'#ffd08022\'" onmouseout="this.style.background=\'transparent\'">Play Again</button>';
  document.body.appendChild(el);
}

function renderQuestLog(){
  var panel=G("questLogPanel"); if(!panel) return; panel.innerHTML="";
  [QUESTS.q1,QUESTS.q2,QUESTS.q3,QUESTS.qFinal].forEach(function(q){
    if(q.locked&&!questState.active[q.id]&&!questState.completed[q.id]) return;
    var el=document.createElement("div"); el.className="quest-entry"+(questState.completed[q.id]?" quest-done":questState.active[q.id]?" quest-active":"");
    var status=questState.completed[q.id]?"✓ Complete":questState.active[q.id]?"● Active":"○ Not started";
    var stepText=questState.active[q.id]?q.steps[Math.min(q.step,q.steps.length-1)]||"":"";
    el.innerHTML='<div class="quest-title">'+q.title+'</div><div class="quest-status">'+status+'</div>'+(stepText?'<div class="quest-step">→ '+stepText+'</div>':'')+(questState.active[q.id]?'<div class="quest-desc">'+q.desc+'</div>':'');
    panel.appendChild(el);
  });
  if(!panel.children.length) panel.innerHTML='<div style="color:var(--text-dim);font-style:italic;padding:10px">No quests yet. Talk to NPCs.</div>';
}
function renderDialogLine(){
  var text=dialogState.lines[dialogState.idx]||"";
  G("dialogChoices").innerHTML="";
  var isLast=(dialogState.idx>=dialogState.lines.length-1);
  G("dialogNext").textContent=isLast?"Farewell ▶":"Continue ▶";

  /* typewriter effect */
  G("dialogText").textContent="";
  var i=0;
  clearInterval(renderDialogLine._iv);
  renderDialogLine._iv=setInterval(function(){
    if(i>=text.length){ clearInterval(renderDialogLine._iv); addDialogChoices(isLast); return; }
    G("dialogText").textContent+=text[i];
    i++;
    if(text[i-1]!==" ") Audio.sfxTypeChar&&Audio.sfxTypeChar();
  },28);
}

function addDialogChoices(isLast){
  if(isLast&&dialogState.npc&&dialogState.npc.opensShop){
    var btn=document.createElement("button");
    btn.className="dialog-choice-btn"; btn.textContent="Browse your wares";
    btn.addEventListener("click",function(){closeDialog();openShop();});
    G("dialogChoices").appendChild(btn);
  }
  if(isLast&&dialogState.npc&&dialogState.npc.id==="innkeeper"){
    var btn2=document.createElement("button");
    btn2.className="dialog-choice-btn"; btn2.textContent="Enter the inn";
    btn2.addEventListener("click",function(){closeDialog();enterInn();});
    G("dialogChoices").appendChild(btn2);
  }
}
function advanceDialog(){
  /* if still typing, skip to end first */
  if(renderDialogLine._iv){
    clearInterval(renderDialogLine._iv);
    renderDialogLine._iv=null;
    var text=dialogState.lines[dialogState.idx]||"";
    G("dialogText").textContent=text;
    addDialogChoices(dialogState.idx>=dialogState.lines.length-1);
    return;
  }
  dialogState.idx++;
  if(dialogState.idx>=dialogState.lines.length){
    var wasInnkeeper = dialogState.npc && dialogState.npc.id==="innkeeper";
    var wasSpirit    = dialogState.npc && dialogState.npc.isSpirit;
    if(dialogState.pendingQuestOffer){ questState.active[dialogState.pendingQuestOffer]=true; QUESTS[dialogState.pendingQuestOffer].step=1; showToast("📜 New Quest: "+QUESTS[dialogState.pendingQuestOffer].title); renderQuestLog(); dialogState.pendingQuestOffer=null; }
    if(dialogState.pendingQuestReturn){
      var qid=dialogState.pendingQuestReturn; var q=QUESTS[qid];
      questState.completed[qid]=true; delete questState.active[qid]; q.done=true;
      player.gold+=q.reward.gold||0;
      if(q.reward.fragment){ questState.inventory.push(q.reward.fragment); checkFinalQuest(); }
      if(qid==="q1"){ var si=questState.inventory.indexOf("satchel"); if(si!==-1)questState.inventory.splice(si,1); }
      if(qid==="q2") questState.collect.darkwood=0;
      if(qid==="q3"){ var si=questState.inventory.indexOf("sunstone"); if(si!==-1)questState.inventory.splice(si,1); }
      Audio.sfxQuestComplete&&Audio.sfxQuestComplete();
      showToast("✨ Quest Complete: "+q.title+"!");
      updateHUD(); renderQuestLog(); dialogState.pendingQuestReturn=null;
    }
    closeDialog();
    if(wasSpirit){ beginDissolveSequence(); return; }
    if(wasInnkeeper){ enterInn(); }
  } else { Audio.sfxDialogNext(); renderDialogLine(); }
}

function checkFinalQuest(){
  var frags=["forest_fragment","dark_fragment","desert_fragment"];
  if(frags.every(function(f){return questState.inventory.indexOf(f)!==-1;})&&!questState.active["qFinal"]&&!questState.completed["qFinal"]){
    QUESTS.qFinal.locked=false; questState.active["qFinal"]=true;
    showToast("🌟 All fragments collected! Find the Spirit Shrine!"); renderQuestLog();
  }
}
function closeDialog(){
  G("dialogOverlay").style.display="none";
  Audio.sfxDialogClose();
  dialogState.npc=null;
}

/* -SHOP- */
function openShop(){
  G("shopGoldDisplay").textContent=player.gold;
  G("shopOverlay").style.display="flex";
  renderShop(shopTab);
}
function renderShop(tab){
  shopTab=tab;
  document.querySelectorAll(".shop-tab").forEach(function(t){ t.classList.toggle("active",t.dataset.tab===tab); });
  var container=G("shopItems"); container.innerHTML="";
  var items=SHOP_DATA[tab]; if(!items) return;
  items.forEach(function(item){
    var owned=player.owned.indexOf(item.id)!==-1;
    var canBuy=player.gold>=item.price;
    var badges="";
    Object.keys(item.stats).forEach(function(k){ var v=item.stats[k]; if(!v) return; var cl=(k==="atk")?"atk":(k==="def")?"def":(k==="hp")?"hp":"spd"; badges+='<span class="stat-badge '+cl+'">'+k.toUpperCase()+" "+(v>0?"+":"")+v+"</span>"; });
    var action=owned?'<div class="owned-badge">✓ Owned</div>':'<button class="buy-btn"'+(canBuy?"":" disabled")+' data-id="'+item.id+'">Buy</button>';
    var el=document.createElement("div");
    el.className="shop-item"+(owned?" owned":"");
    el.innerHTML='<div class="shop-item-top"><div class="shop-item-icon">'+item.icon+'</div><div class="shop-item-info"><div class="shop-item-name">'+item.name+'</div><div class="shop-item-type">'+item.type+'</div></div></div><div class="shop-item-desc">'+item.desc+'</div><div class="shop-item-stats">'+badges+'</div><div class="shop-item-footer"><div class="shop-item-price">💰 '+item.price+'</div>'+action+'</div>';
    container.appendChild(el);
  });
  container.querySelectorAll(".buy-btn:not([disabled])").forEach(function(btn){ btn.addEventListener("click",function(){buyItem(btn.dataset.id);}); });
}
function buyItem(id){
  var item=null;
  for(var i=0;i<ALL_ITEMS.length;i++){ if(ALL_ITEMS[i].id===id){item=ALL_ITEMS[i];break;} }
  if(!item||player.gold<item.price){ Audio.sfxBuyFail(); return; }
  player.gold-=item.price;
  if(item.consumable){ player.hp=Math.min(player.maxHp,player.hp+(item.stats.hp||0)); Audio.sfxBuy(); showToast("Used "+item.name+"! HP restored."); }
  else { if(player.owned.indexOf(item.id)===-1) player.owned.push(item.id); player.equipment[item.slot]=item; recalcStats(); Audio.sfxBuy(); showToast("Equipped: "+item.name); }
  updateHUD(); G("shopGoldDisplay").textContent=player.gold; renderShop(shopTab);
}
function recalcStats(){
  var base=CLASSES[player.cls];
  player.atk=base.atk; player.def=base.def; player.spd=base.spd;
  var hpBonus=0;
  ["weapon","chest","helmet","boots","item"].forEach(function(s){ var eq=player.equipment[s]; if(!eq) return; player.atk+=(eq.stats.atk||0); player.def+=(eq.stats.def||0); player.spd+=(eq.stats.spd||0); hpBonus+=(eq.stats.hp||0); });
  player.maxHp=base.hp+hpBonus;
  if(player.hp>player.maxHp) player.hp=player.maxHp;
}

/* -INVENTORY- */
function openInventory(){
  var container=G("invSlots"); container.innerHTML="";
  [{key:"weapon",label:"Weapon"},{key:"chest",label:"Chest"},{key:"helmet",label:"Helmet"},{key:"boots",label:"Boots"},{key:"item",label:"Item"}].forEach(function(s){
    var eq=player.equipment[s.key];
    var el=document.createElement("div"); el.className="inv-slot";
    el.innerHTML='<div class="inv-slot-label">'+s.label+'</div><div class="inv-slot-item">'+(eq?'<div class="inv-slot-icon">'+eq.icon+'</div><div class="inv-slot-name">'+eq.name+'</div>':'<div class="inv-slot-empty">— Empty —</div>')+'</div>';
    container.appendChild(el);
  });
  var stats=document.createElement("div"); stats.className="inv-slot"; stats.style.gridColumn="span 2";
  stats.innerHTML='<div class="inv-slot-label">Stats</div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;"><span class="stat-badge hp">HP '+player.hp+'/'+player.maxHp+'</span><span class="stat-badge atk">ATK '+player.atk+'</span><span class="stat-badge def">DEF '+player.def+'</span><span class="stat-badge spd">SPD '+player.spd+'</span><span style="color:var(--gold);font-family:var(--font-title);font-size:.8rem;">💰 '+player.gold+'</span></div>';
  container.appendChild(stats);
  G("invOverlay").style.display="flex";
}

/* -PARTICLES (menu)- */
function spawnParticles(){
  var c=G("menuParticles");
  for(var i=0;i<30;i++){
    var p=document.createElement("div"); p.className="particle";
    p.style.left=(Math.random()*100)+"%";
    p.style.bottom=(Math.random()*20)+"%";
    p.style.setProperty("--dur",(4+Math.random()*6)+"s");
    p.style.setProperty("--delay",(Math.random()*6)+"s");
    c.appendChild(p);
  }
}

/* -INTRO SEQUENCE- */
var INTRO_LINES = [
  "Somewhere between a bad decision and a worse one, you found yourself here.",
  "The forest stretches in every direction. Your boots are muddy. Your memory is not entirely reliable.",
  "You have a name — "+"{name}"+" — and a vague sense that something important was left unfinished.",
  "The village to the east looks inhabited. The dark trees to the north do not look friendly.",
  "Whatever happened before, it starts again now.",
  "✦  Welcome to Wanderer's Folly  ✦"
];
var introIdx = 0;
var introIv  = null;

function showIntro(isNewGame){
  if(!isNewGame) return; /* skip for Continue */
  var overlay = G("introOverlay");
  var textEl  = G("introText");
  if(!overlay||!textEl) return;
  introIdx = 0;
  overlay.style.display = "flex";
  typeIntroLine();

  function typeIntroLine(){
    clearInterval(introIv);
    var raw  = INTRO_LINES[introIdx]||"";
    var text = raw.replace("{name}", player.name);
    textEl.textContent = "";
    var i = 0;
    introIv = setInterval(function(){
      if(i>=text.length){ clearInterval(introIv); introIv=null; return; }
      textEl.textContent += text[i];
      if(text[i]!==" ") Audio.sfxTypeChar&&Audio.sfxTypeChar();
      i++;
    },22);
  }

  function advanceIntro(){
    /* if still typing, skip to end */
    if(introIv){ clearInterval(introIv); introIv=null; textEl.textContent=INTRO_LINES[introIdx].replace("{name}",player.name); return; }
    introIdx++;
    if(introIdx>=INTRO_LINES.length){
      overlay.style.display="none";
      setTimeout(function(){ showToast("Welcome, "+player.name+". Try not to die."); },200);
      document.removeEventListener("keydown",introKeyHandler);
      return;
    }
    typeIntroLine();
  }

  function introKeyHandler(e){
    if(e.key===" "||e.key==="Enter"){ e.preventDefault(); advanceIntro(); }
  }
  document.addEventListener("keydown",introKeyHandler);
  /* also allow clicking the overlay */
  overlay.onclick = function(){ advanceIntro(); };
}

/* -START- */
function startGame(isNewGame){
  gameActive=true; lastBiome="";
  /* add rain tint div if not present */
  var container=G("worldContainer");
  if(!container.querySelector(".rain-tint")){
    var tint=document.createElement("div"); tint.className="rain-tint"; container.appendChild(tint);
  }
  buildMap(); buildInnMap(); buildHomeMap(); buildGrid();
  showScreen("game");
  /* resize rain canvas to match container */
  var rc=G("rainCanvas");
  rc.width =container.clientWidth;
  rc.height=container.clientHeight;
  /* re-center camera now that the container has real pixel dimensions */
  updateCamera(false);
  updateHUD(); updateEnergyBar();
  Audio.sfxGameStart();
  if(isRaining){ toggleRain(true); }
  else { Audio.playMusic("forest"); }
  showIntro(true);
}

/* -INIT- */
document.addEventListener("DOMContentLoaded",function(){
  spawnParticles();
  Audio.init();
  showScreen("menu");
  Audio.playMusic("menu");
  initAvatarEditor();

  G("btnNewGame").addEventListener("click",function(){
    Audio.sfxMenuClick(); showScreen("avatar");
  });

  G("btnEnterWorld").addEventListener("click",function(){
    Audio.sfxMenuClick();
    /* read all avatar values fresh */
    var activeCard=document.querySelector(".class-card.active");
    if(activeCard) player.cls=activeCard.dataset.class||"knight";
    var activeSkin=document.querySelector("#skinPicker .color-dot.active");
    if(activeSkin) player.skinIdx=parseInt(activeSkin.dataset.skin,10)||0;
    var activeHair=document.querySelector("#hairPicker .color-dot.active");
    if(activeHair) player.hairIdx=parseInt(activeHair.dataset.hair,10)||0;
    var activeOutfit=document.querySelector("#outfitPicker .color-dot.active");
    if(activeOutfit) player.outfitIdx=parseInt(activeOutfit.dataset.outfit,10)||0;

    var cls=CLASSES[player.cls]||CLASSES.knight;
    player.name =G("charName").value.trim()||"Wanderer";
    player.hp   =cls.hp; player.maxHp=cls.hp;
    player.atk  =cls.atk; player.def=cls.def; player.spd=cls.spd;
    player.gold =50; player.x=6; player.y=5;
    player.owned=[]; player.equipment={weapon:null,chest:null,helmet:null,boots:null,item:null};
    dayNumber=1; stepCount=0; isRaining=false; energy=ENERGY_MAX;
    questState={active:{},completed:{},inventory:[],collect:{}};
    MAP_ITEMS.forEach(function(m){m.found=false;});
    Object.keys(QUESTS).forEach(function(k){ QUESTS[k].step=0; QUESTS[k].done=false; if(k!=="qFinal") QUESTS[k].locked=false; else QUESTS[k].locked=true; });
    startGame(true);
  });

  G("btnBackMenu").addEventListener("click",function(){
    Audio.sfxMenuClick(); Audio.playMusic("menu"); showScreen("menu");
  });

  G("dialogNext").addEventListener("click",function(){ Audio.sfxDialogNext(); advanceDialog(); });

  G("btnOpenShop").addEventListener("click",function(){ Audio.sfxShopOpen(); openShop(); });
  G("btnCloseShop").addEventListener("click",function(){ G("shopOverlay").style.display="none"; });
  document.querySelectorAll(".shop-tab").forEach(function(tabEl){ tabEl.addEventListener("click",function(){ renderShop(tabEl.dataset.tab); }); });

  G("btnOpenInventory").addEventListener("click",openInventory);
  G("btnCloseInv").addEventListener("click",function(){ G("invOverlay").style.display="none"; });

  var btnQ=G("btnOpenQuests"); if(btnQ) btnQ.addEventListener("click",function(){ var ov=G("questOverlay"); if(ov){ov.style.display="flex"; renderQuestLog();} });
  var btnCQ=G("btnCloseQuests"); if(btnCQ) btnCQ.addEventListener("click",function(){ var ov=G("questOverlay"); if(ov) ov.style.display="none"; });

  G("btnToggleMusic").addEventListener("click",function(){
    var on=Audio.toggleMusic();
    G("btnToggleMusic").textContent=on?"♫":"♩";
    showToast(on?"Music: On":"Music: Off");
  });
  G("btnToggleSfx").addEventListener("click",function(){
    var on=Audio.toggleSfx();
    G("btnToggleSfx").textContent=on?"♪":"–";
    showToast(on?"SFX: On":"SFX: Off");
  });

  document.querySelectorAll(".menu-btn").forEach(function(btn){ btn.addEventListener("mouseenter",function(){ Audio.sfxMenuHover(); }); });

  document.addEventListener("keydown",handleKeyDown);
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape") return;
    if(G("dialogOverlay").style.display!=="none"){ closeDialog(); return; }
    if(G("shopOverlay").style.display  !=="none"){ G("shopOverlay").style.display="none"; return; }
    if(G("invOverlay").style.display   !=="none"){ G("invOverlay").style.display ="none"; return; }
    var ov=G("questOverlay"); if(ov&&ov.style.display!=="none"){ ov.style.display="none"; return; }
  });

  /* resize rain canvas on window resize */
  window.addEventListener("resize",function(){
    if(!gameActive) return;
    var container=G("worldContainer");
    var rc=G("rainCanvas");
    rc.width =container.clientWidth;
    rc.height=container.clientHeight;
    updateCamera(false);
  });
});