'use strict';

// ============================================================
// Fishing Aquarium — Pond Village integrated HTML prototype v2
// Data-driven prototype designed to map cleanly to Unity systems.
// ============================================================

const CONFIG = Object.freeze({
  canvasW: 960,
  canvasH: 540,
  tile: 32,
  worldCols: 64,
  worldRows: 40,
  worldW: 64 * 32,
  worldH: 40 * 32,
  fixedStep: 1 / 60,
  maxFrameDelta: 0.25,
  dayRealSeconds: 24 * 60,
  gameMinutesPerRealSecond: 1,
  playerSpeed: 150,
  castMinDistance: 54,
  castMaxDistance: 330,
  interactDistance: 76,
  biteMin: 1.2,
  biteMax: 3.4,
  saveVersion: 2,
  saveKey: 'fishingAquarium_v2',
  legacyCollectionKey: 'aquariumFishingCollection_v1',
  legacyEconomyKey: 'aquariumFishingEconomy_v1',
  legacyAquariumKey: 'aquariumFishingAquarium_v1',
});

const BAR_ACCEL = Object.freeze({
  releaseStartSpeed: 0.01785 * 60,
  pressStartSpeed: 0.01785 * 60,
  maxSpeed: 0.0396 * 60,
  pressTurnAccel: 0.00135 * 60 * 60,
  releaseTurnAccel: 0.00135 * 60 * 60,
  pressHoldAccel: 0.00026 * 60 * 60,
  releaseHoldAccel: 0.00026 * 60 * 60,
});

const WEATHER = Object.freeze({
  sunny: { id:'sunny', name:'맑음', icon:'☀', weight:50 },
  cloudy:{ id:'cloudy',name:'흐림', icon:'☁', weight:30 },
  rain:  { id:'rain',  name:'봄비', icon:'☂', weight:20 },
});

const DEPTH = Object.freeze({
  near: { id:'near', name:'근거리', label:'얕은 물', color:'#7fcac1' },
  mid:  { id:'mid',  name:'중거리', label:'중간 수심', color:'#559fb2' },
  far:  { id:'far',  name:'원거리', label:'깊은 물', color:'#376f91' },
});

const SPECIES = Object.freeze({
  minnow:{id:'minnow',name:'피라미',rarity:'일반',difficulty:1,price:10,weight:24,depths:['near','mid','far'],weather:['sunny','cloudy','rain'],time:'all',size:[6,15],pattern:'minnow',icon:'🐟'},
  loach:{id:'loach',name:'미꾸라지',rarity:'일반',difficulty:1,price:12,weight:20,depths:['near'],weather:['sunny','cloudy','rain'],time:'all',size:[8,22],pattern:'loach',icon:'〰'},
  crucian:{id:'crucian',name:'붕어',rarity:'일반',difficulty:1,price:15,weight:22,depths:['near','mid','far'],weather:['sunny','cloudy','rain'],time:'all',size:[10,36],pattern:'crucian',icon:'🐟'},
  snail:{id:'snail',name:'우렁이',rarity:'일반',difficulty:1,price:18,weight:15,depths:['near'],weather:['rain'],time:'all',size:[2,6],pattern:'snail',icon:'🐌'},
  waterBug:{id:'waterBug',name:'물장군',rarity:'일반',difficulty:2,price:22,weight:12,depths:['near','mid'],weather:['sunny'],time:'all',size:[4,8],pattern:'waterBug',icon:'◆'},
  frog:{id:'frog',name:'개구리',rarity:'일반',difficulty:2,price:24,weight:10,depths:['near','mid','far'],weather:['rain'],time:'all',size:[4,10],pattern:'frog',icon:'🐸'},
  carp:{id:'carp',name:'잉어',rarity:'일반',difficulty:2,price:25,weight:14,depths:['mid','far'],weather:['sunny','cloudy','rain'],time:'all',size:[18,58],pattern:'carp',icon:'🐟'},
  shrimp:{id:'shrimp',name:'민물새우',rarity:'고급',difficulty:2,price:28,weight:9,depths:['near','mid'],weather:['sunny','cloudy','rain'],time:'all',size:[2,8],pattern:'shrimp',icon:'🦐'},
  divingBeetle:{id:'divingBeetle',name:'물방개',rarity:'고급',difficulty:2,price:32,weight:8,depths:['near','mid'],weather:['sunny','cloudy','rain'],time:'night',size:[2,5],pattern:'beetle',icon:'⬟'},
  goldfish:{id:'goldfish',name:'금붕어',rarity:'고급',difficulty:2,price:40,weight:4,depths:['mid','far'],weather:['sunny','cloudy','rain'],time:'all',size:[7,24],pattern:'goldfish',icon:'🐠'},
  salamander:{id:'salamander',name:'도롱뇽',rarity:'고급',difficulty:3,price:36,weight:5,depths:['near','mid'],weather:['rain'],time:'all',size:[5,18],pattern:'salamander',icon:'≋'},
  softshell:{id:'softshell',name:'자라',rarity:'고급',difficulty:3,price:38,weight:6,depths:['mid'],weather:['sunny','cloudy','rain'],time:'all',size:[12,42],pattern:'softshell',icon:'🐢'},
  snakehead:{id:'snakehead',name:'가물치',rarity:'고급',difficulty:3,price:40,weight:7,depths:['far'],weather:['sunny','cloudy'],time:'all',size:[25,72],pattern:'snakehead',icon:'🐟'},
  bullhead:{id:'bullhead',name:'동자개',rarity:'고급',difficulty:3,price:45,weight:5,depths:['mid','far'],weather:['sunny','cloudy','rain'],time:'night',size:[12,38],pattern:'bullhead',icon:'🐟'},
});

const ITEMS = Object.freeze({
  wideBait:{id:'wideBait',name:'와이드 미끼',type:'bait',price:3,sell:1,stack:99,icon:'◯',description:'Catch Bar 크기 +20%'},
  curiosityBait:{id:'curiosityBait',name:'호기심 미끼',type:'bait',price:3,sell:1,stack:99,icon:'✦',description:'고급 생물 가중치 증가'},
  iceBomb:{id:'iceBomb',name:'얼음 폭탄',type:'active',price:80,sell:40,stack:20,icon:'❄',description:'낚시 중 약 3초 동안 생물 이동 둔화'},
});

const RODS = Object.freeze({
  basic:{id:'basic',name:'기본 낚싯대',barMult:1,buy:0,sell:40,description:'튼튼한 기본 낚싯대'},
  wide:{id:'wide',name:'와이드 낚싯대',barMult:1.5,buy:250,sell:150,description:'Catch Bar 기본 크기 +50%'},
});

const BOBBERS = Object.freeze({
  basic:{id:'basic',name:'기본 찌',biteMult:1,controlMult:1,description:'표준형 찌'},
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const fishingCanvas = document.getElementById('fishingCanvas');
const fctx = fishingCanvas.getContext('2d');
fctx.imageSmoothingEnabled = false;

const dom = Object.freeze({
  worldLayer:document.getElementById('worldLayer'),
  locationText:document.getElementById('locationText'),
  clockText:document.getElementById('clockText'),
  weatherText:document.getElementById('weatherText'),
  moneyText:document.getElementById('moneyText'),
  pendingRevenueText:document.getElementById('pendingRevenueText'),
  bagUsage:document.getElementById('bagUsage'),
  bagMiniGrid:document.getElementById('bagMiniGrid'),
  castGaugeWrap:document.getElementById('castGaugeWrap'),
  castGaugeFill:document.getElementById('castGaugeFill'),
  castGaugeMarker:document.getElementById('castGaugeMarker'),
  castHint:document.getElementById('castHint'),
  toast:document.getElementById('toast'),
  modalLayer:document.getElementById('modalLayer'),
  modalContent:document.getElementById('modalContent'),
  modalClose:document.getElementById('modalClose'),
  fishingOverlay:document.getElementById('fishingOverlay'),
  fishingSpecies:document.getElementById('fishingSpecies'),
  fishingDifficulty:document.getElementById('fishingDifficulty'),
  catchGaugeFill:document.getElementById('catchGaugeFill'),
  iceBombButton:document.getElementById('iceBombButton'),
  iceBombCount:document.getElementById('iceBombCount'),
  resetButton:document.getElementById('resetButton'),
});

const input = {
  keys:new Set(),
  pointerDown:false,
  pointerX:0,
  pointerY:0,
  pointerWorldX:0,
  pointerWorldY:0,
};

const defaultState = () => ({
  version:CONFIG.saveVersion,
  day:1,
  gameMinute:8*60,
  weather:'sunny',
  lastWeatherDay:1,
  money:0,
  pendingRevenue:0,
  lastSettlement:null,
  scene:'village',
  player:{x:7.5*CONFIG.tile,y:7.5*CONFIG.tile,dir:'down'},
  inventory:{capacity:9,fish:{},items:{wideBait:0,curiosityBait:0,iceBomb:0}},
  equipment:{rod:'basic',bobber:'basic',bait:null,active:'iceBomb',ownedRods:{basic:1,wide:0}},
  codex:{},
  aquarium:{displayed:{},tankCapacity:10,ticketPrice:5,isOpen:false,totalVisitors:0,turnedAway:0,todayVisitors:0,todayTicketRevenue:0,reputation:0},
  story:{stage:0,firstTankRepaired:false,localReopening:false},
  stats:{caught:0},
});

let state = defaultState();
let ui = {modal:null,toastTimer:0,shopTab:'buy'};
let camera = {x:0,y:0};
let cast = {mode:'idle',value:0,dir:1,landing:null,biteTimer:0,bobberPulse:0,depth:null};
let fishing = null;
let saveTimer = 0;
let rainDrops = Array.from({length:90},()=>({x:Math.random()*CONFIG.canvasW,y:Math.random()*CONFIG.canvasH,speed:260+Math.random()*220,len:7+Math.random()*8}));

const pond = {cx:37*CONFIG.tile,cy:24*CONFIG.tile,rx:16.7*CONFIG.tile,ry:9.4*CONFIG.tile};
const bridge = {x:35*CONFIG.tile,y:23.1*CONFIG.tile,w:5.4*CONFIG.tile,h:1.4*CONFIG.tile};
const villageObjects = [
  {id:'aquarium',type:'building',tx:9,ty:4,tw:9,th:6,label:'낡은 아쿠아리움',roof:'#6c776d',wall:'#d9c49a',door:{x:13.4,y:9.4}},
  {id:'shop',type:'building',tx:23,ty:5,tw:7,th:5,label:'마르코 상점',roof:'#a85d55',wall:'#dfbd78',door:{x:26.5,y:9.6}},
  {id:'workshop',type:'building',tx:34,ty:5,tw:7,th:5,label:'브루노 작업장',roof:'#7c5d49',wall:'#c99f69',door:{x:37.5,y:9.6}},
  {id:'house1',type:'building',tx:45,ty:6,tw:6,th:5,label:'연못마을 주택',roof:'#9a5e5c',wall:'#e0bd82',door:{x:48,y:10.6}},
  {id:'house2',type:'building',tx:53,ty:7,tw:6,th:5,label:'연못마을 주택',roof:'#866253',wall:'#dbb978',door:{x:56,y:11.6}},
];

const aquariumObjects = [
  {id:'tank',type:'tank',tx:10,ty:4,tw:12,th:5,label:'메인 수조'},
  {id:'managerRoom',type:'room',tx:23,ty:3,tw:6,th:7,label:'관리자 외 출입금지'},
  {id:'desk',type:'desk',tx:25,ty:5,tw:2,th:2,label:'관리자 장부'},
  {id:'exitAquarium',type:'door',tx:3,ty:13,tw:2,th:2,label:'연못 마을로'},
];

function tileRect(obj){return {x:obj.tx*CONFIG.tile,y:obj.ty*CONFIG.tile,w:obj.tw*CONFIG.tile,h:obj.th*CONFIG.tile};}
function dist(a,b,c,d){return Math.hypot(a-c,b-d);}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function lerp(a,b,t){return a+(b-a)*t;}
function smoothstep(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function normalizeAngle(a){const tau=Math.PI*2;return ((a%tau)+tau)%tau;}
function angleDifference(a,b){let d=Math.abs(normalizeAngle(a)-normalizeAngle(b));return Math.min(d,Math.PI*2-d);}
function rand(min,max){return min+Math.random()*(max-min);}
function weightedChoice(entries){
  const total=entries.reduce((s,e)=>s+e.weight,0);
  if(total<=0)return null;
  let r=Math.random()*total;
  for(const e of entries){r-=e.weight;if(r<=0)return e.value;}
  return entries.at(-1)?.value??null;
}
function formatTime(m){m=((Math.floor(m)%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}
function isNight(){return state.gameMinute>=20*60||state.gameMinute<4*60;}
function currentWeather(){return WEATHER[state.weather]||WEATHER.sunny;}
function currentSceneObjects(){return state.scene==='village'?villageObjects:aquariumObjects;}

function getFacingVector(){
  return state.player.dir==='up'?{x:0,y:-1}:state.player.dir==='down'?{x:0,y:1}:state.player.dir==='left'?{x:-1,y:0}:{x:1,y:0};
}

function pondNorm(x,y){
  const nx=(x-pond.cx)/pond.rx,ny=(y-pond.cy)/pond.ry;
  return Math.sqrt(nx*nx+ny*ny);
}
function getWaterDepth(x,y){
  if(state.scene!=='village')return null;
  const n=pondNorm(x,y);
  if(n>1)return null;
  // Bridge physically covers the water and blocks a landing.
  if(x>=bridge.x&&x<=bridge.x+bridge.w&&y>=bridge.y&&y<=bridge.y+bridge.h)return null;
  if(n>0.78)return 'near';
  if(n>0.51)return 'mid';
  return 'far';
}
function isWater(x,y){return !!getWaterDepth(x,y);}

function sceneBounds(){
  if(state.scene==='village')return {w:CONFIG.worldW,h:CONFIG.worldH};
  return {w:32*CONFIG.tile,h:18*CONFIG.tile};
}

function rectContains(r,x,y,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad;}
function circleRectHit(x,y,r,rect){
  const qx=clamp(x,rect.x,rect.x+rect.w),qy=clamp(y,rect.y,rect.y+rect.h);
  return (x-qx)**2+(y-qy)**2<r*r;
}
function isSolidAt(x,y,r=10){
  const b=sceneBounds();
  if(x-r<0||y-r<0||x+r>b.w||y+r>b.h)return true;
  if(state.scene==='village'){
    if(pondNorm(x,y)<1.01 && !(x>=bridge.x-8&&x<=bridge.x+bridge.w+8&&y>=bridge.y-7&&y<=bridge.y+bridge.h+7))return true;
    for(const o of villageObjects){if(circleRectHit(x,y,r,tileRect(o)))return true;}
    // Bus shelter and rock clusters.
    const solids=[{x:3*32,y:5*32,w:4*32,h:2*32},{x:52*32,y:25*32,w:2*32,h:2*32},{x:20*32,y:29*32,w:2*32,h:2*32}];
    if(solids.some(s=>circleRectHit(x,y,r,s)))return true;
  }else{
    for(const o of aquariumObjects){
      if(o.id==='exitAquarium'||o.id==='desk'||o.id==='managerRoom')continue;
      if(circleRectHit(x,y,r,tileRect(o)))return true;
    }
    // Outer walls.
    if(x<2*32||x>30*32||y<2*32||y>16*32)return true;
  }
  return false;
}

function canPlaceObject(obj,tx,ty,rotation=0){
  const tw=rotation%2?obj.th:obj.tw,th=rotation%2?obj.tw:obj.th;
  const test={x:tx*CONFIG.tile,y:ty*CONFIG.tile,w:tw*CONFIG.tile,h:th*CONFIG.tile};
  const b=sceneBounds();
  if(test.x<0||test.y<0||test.x+test.w>b.w||test.y+test.h>b.h)return false;
  return !currentSceneObjects().some(o=>{
    if(o.id===obj.id)return false;
    const r=tileRect(o);
    return !(test.x+test.w<=r.x||test.x>=r.x+r.w||test.y+test.h<=r.y||test.y>=r.y+r.h);
  });
}

// ============================================================
// Grid pathfinding for NPCs (player remains continuous/free).
// ============================================================
function tileKey(x,y){return `${x},${y}`;}
function npcTileBlocked(tx,ty){
  const x=(tx+.5)*CONFIG.tile,y=(ty+.5)*CONFIG.tile;
  if(state.scene!=='village')return false;
  if(pondNorm(x,y)<1.03 && !rectContains({x:bridge.x,y:bridge.y,w:bridge.w,h:bridge.h},x,y,3))return true;
  for(const o of villageObjects){if(rectContains(tileRect(o),x,y))return true;}
  return tx<0||ty<0||tx>=CONFIG.worldCols||ty>=CONFIG.worldRows;
}
function findPath(start,end,maxNodes=900){
  const sx=Math.floor(start.x/CONFIG.tile),sy=Math.floor(start.y/CONFIG.tile),ex=Math.floor(end.x/CONFIG.tile),ey=Math.floor(end.y/CONFIG.tile);
  if(npcTileBlocked(ex,ey))return [];
  const open=[{x:sx,y:sy,g:0,f:Math.abs(ex-sx)+Math.abs(ey-sy)}],came=new Map(),best=new Map([[tileKey(sx,sy),0]]);
  let visited=0;
  while(open.length&&visited++<maxNodes){
    open.sort((a,b)=>a.f-b.f);const cur=open.shift();
    if(cur.x===ex&&cur.y===ey){
      const path=[];let k=tileKey(ex,ey),node={x:ex,y:ey};
      while(!(node.x===sx&&node.y===sy)){
        path.push({x:(node.x+.5)*CONFIG.tile,y:(node.y+.5)*CONFIG.tile});
        const p=came.get(k);if(!p)break;node=p;k=tileKey(node.x,node.y);
      }
      return path.reverse();
    }
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cur.x+dx,ny=cur.y+dy;if(npcTileBlocked(nx,ny))continue;
      const ng=cur.g+1,nk=tileKey(nx,ny);if(ng>=(best.get(nk)??Infinity))continue;
      best.set(nk,ng);came.set(nk,{x:cur.x,y:cur.y});
      open.push({x:nx,y:ny,g:ng,f:ng+Math.abs(ex-nx)+Math.abs(ey-ny)});
    }
  }
  return [];
}

const npcs = [
  {id:'rohan',name:'로한',x:31*32,y:17*32,home:{x:31*32,y:17*32},palette:['#43342d','#315a64','#d7a47b'],role:'fisher',path:[],pathIndex:0,speed:44,wait:2},
  {id:'yotri',name:'요트리',x:45*32,y:16*32,home:{x:45*32,y:16*32},palette:['#3c314e','#775b8f','#e2b28f'],role:'nightPond',path:[],pathIndex:0,speed:48,wait:1},
  {id:'luka',name:'루카',x:7*32,y:9*32,home:{x:7*32,y:9*32},palette:['#6f4d2e','#4e78a1','#e4ae80'],role:'bus',path:[],pathIndex:0,speed:52,wait:2},
  {id:'marco',name:'마르코',x:27*32,y:11*32,home:{x:27*32,y:11*32},palette:['#4c392b','#4d766d','#d2a171'],role:'shop',path:[],pathIndex:0,speed:40,wait:4},
  {id:'bruno',name:'브루노',x:38*32,y:11*32,home:{x:38*32,y:11*32},palette:['#55443a','#8a6946','#d2a077'],role:'repair',path:[],pathIndex:0,speed:42,wait:3},
  {id:'resident1',name:'주민',x:18*32,y:14*32,home:{x:18*32,y:14*32},palette:['#503a35','#6c8872','#daa87c'],role:'resident',path:[],pathIndex:0,speed:40,wait:0},
  {id:'resident2',name:'주민',x:51*32,y:15*32,home:{x:51*32,y:15*32},palette:['#3c3b45','#9b715e','#dba67d'],role:'resident',path:[],pathIndex:0,speed:45,wait:0},
];

function scheduleTarget(npc){
  const h=state.gameMinute/60;
  if(npc.id==='yotri'&&isNight())return {x:43*32,y:29*32};
  if(npc.id==='luka')return {x:7*32,y:9*32};
  if(npc.id==='rohan')return {x:33*32,y:18*32};
  if(npc.id==='marco')return {x:27*32,y:11*32};
  if(npc.id==='bruno')return {x:38*32,y:11*32};
  const seed=(Math.floor(h*2)+Number(npc.id.at(-1)||0))%4;
  return [{x:20*32,y:14*32},{x:28*32,y:14*32},{x:48*32,y:14*32},{x:16*32,y:23*32}][seed];
}
function updateNpcs(dt){
  if(state.scene!=='village'||fishing||ui.modal)return;
  for(const npc of npcs){
    npc.wait-=dt;
    if((!npc.path.length||npc.pathIndex>=npc.path.length)&&npc.wait<=0){
      const target=scheduleTarget(npc);
      if(dist(npc.x,npc.y,target.x,target.y)>20)npc.path=findPath({x:npc.x,y:npc.y},target);
      npc.pathIndex=0;npc.wait=4+Math.random()*5;
    }
    const p=npc.path[npc.pathIndex];if(!p)continue;
    const dx=p.x-npc.x,dy=p.y-npc.y,d=Math.hypot(dx,dy);
    if(d<3){npc.pathIndex++;continue;}
    npc.x+=dx/d*npc.speed*dt;npc.y+=dy/d*npc.speed*dt;
  }
}

// ============================================================
// Inventory, codex, equipment and migration.
// ============================================================
function fishCount(id){return state.inventory.fish[id]||0;}
function itemCount(id){return state.inventory.items[id]||0;}
function uniqueBagStacks(){
  return Object.entries(state.inventory.fish).filter(([,q])=>q>0).length + Object.entries(state.inventory.items).filter(([,q])=>q>0).length;
}
function bagHasSpaceFor(kind,id){
  const group=kind==='fish'?state.inventory.fish:state.inventory.items;
  return (group[id]||0)>0 || uniqueBagStacks()<state.inventory.capacity;
}
function addFish(id,qty=1){
  if(!bagHasSpaceFor('fish',id))return false;
  state.inventory.fish[id]=(state.inventory.fish[id]||0)+qty;return true;
}
function removeFish(id,qty=1){
  if(fishCount(id)<qty)return false;state.inventory.fish[id]-=qty;if(state.inventory.fish[id]<=0)delete state.inventory.fish[id];return true;
}
function addItem(id,qty=1){
  if(!bagHasSpaceFor('item',id))return false;
  state.inventory.items[id]=clamp((state.inventory.items[id]||0)+qty,0,ITEMS[id]?.stack||999);return true;
}
function removeItem(id,qty=1){if(itemCount(id)<qty)return false;state.inventory.items[id]-=qty;return true;}
function recordCatch(id,size){
  const s=SPECIES[id];if(!s)return false;
  const rec=state.codex[id]||{count:0,minSize:null,maxSize:null,firstLocation:'연못 마을'};
  const newRecord=rec.maxSize==null||size>rec.maxSize;
  rec.count++;rec.minSize=rec.minSize==null?size:Math.min(rec.minSize,size);rec.maxSize=rec.maxSize==null?size:Math.max(rec.maxSize,size);
  state.codex[id]=rec;state.stats.caught++;
  return newRecord;
}
function randomFishSize(id){const [a,b]=SPECIES[id].size;const r=(Math.random()+Math.random()+Math.random())/3;return Math.round((a+(b-a)*r)*10)/10;}
function rarityColor(r){return r==='고급'?'#4f82a9':'#725a36';}

function importLegacyIfNeeded(){
  try{
    const legacyCollection=JSON.parse(localStorage.getItem(CONFIG.legacyCollectionKey)||'null');
    const legacyEconomy=JSON.parse(localStorage.getItem(CONFIG.legacyEconomyKey)||'null');
    const legacyAquarium=JSON.parse(localStorage.getItem(CONFIG.legacyAquariumKey)||'null');
    if(legacyEconomy){
      state.money=Number(legacyEconomy.money)||0;
      state.inventory.items.iceBomb=Number(legacyEconomy.iceBombs)||0;
      state.inventory.items.wideBait=Number(legacyEconomy.baits?.wideBait)||0;
      state.inventory.items.curiosityBait=Number(legacyEconomy.baits?.curiosityBait)||0;
      state.equipment.ownedRods.basic=Math.max(1,Number(legacyEconomy.rods?.basic)||1);
      state.equipment.ownedRods.wide=Number(legacyEconomy.rods?.wide)||0;
      state.equipment.rod=legacyEconomy.equippedRod==='wide'&&state.equipment.ownedRods.wide?'wide':'basic';
      state.equipment.bait=legacyEconomy.equippedBait&&state.inventory.items[legacyEconomy.equippedBait]>0?legacyEconomy.equippedBait:null;
    }
    // Legacy fish names are imported only when they exist in the new pond roster.
    const nameToId=Object.fromEntries(Object.values(SPECIES).map(s=>[s.name,s.id]));
    if(legacyCollection&&typeof legacyCollection==='object'){
      for(const [name,val] of Object.entries(legacyCollection)){
        const id=nameToId[name];if(!id)continue;
        const qty=Number(val?.count??val??0)||0;if(qty>0)state.inventory.fish[id]=qty;
        const rec={count:qty,minSize:null,maxSize:null,firstLocation:'이전 프로토타입'};if(qty>0)state.codex[id]=rec;
      }
    }
    if(legacyAquarium?.displayed){
      for(const [name,qty] of Object.entries(legacyAquarium.displayed)){
        const id=nameToId[name];if(id&&qty>0)state.aquarium.displayed[id]=Number(qty)||0;
      }
      state.aquarium.ticketPrice=clamp(Number(legacyAquarium.ticketPrice)||5,0,50);
      state.aquarium.totalVisitors=Number(legacyAquarium.admissions)||0;
      state.aquarium.turnedAway=Number(legacyAquarium.turnedAway)||0;
      if(Object.values(state.aquarium.displayed).some(v=>v>0)){state.aquarium.isOpen=true;state.story.localReopening=true;state.story.firstTankRepaired=true;state.story.stage=3;}
    }
  }catch(err){console.warn('Legacy migration skipped',err);}
}
function loadGame(){
  try{
    const raw=localStorage.getItem(CONFIG.saveKey);
    if(raw){const parsed=JSON.parse(raw);state={...defaultState(),...parsed,player:{...defaultState().player,...parsed.player},inventory:{...defaultState().inventory,...parsed.inventory,fish:{...(parsed.inventory?.fish||{})},items:{...defaultState().inventory.items,...(parsed.inventory?.items||{})}},equipment:{...defaultState().equipment,...parsed.equipment,ownedRods:{...defaultState().equipment.ownedRods,...(parsed.equipment?.ownedRods||{})}},aquarium:{...defaultState().aquarium,...parsed.aquarium,displayed:{...(parsed.aquarium?.displayed||{})}},story:{...defaultState().story,...parsed.story},stats:{...defaultState().stats,...parsed.stats}};}
    else {state=defaultState();importLegacyIfNeeded();}
  }catch(err){console.warn('Save load failed',err);state=defaultState();}
  // Never spawn inside new geometry after schema changes.
  if(isSolidAt(state.player.x,state.player.y,10)){state.player.x=7.5*32;state.player.y=7.5*32;state.scene='village';}
}
function saveGame(){try{state.version=CONFIG.saveVersion;localStorage.setItem(CONFIG.saveKey,JSON.stringify(state));}catch(err){console.warn('Save failed',err);}}

// ============================================================
// Time, weather, settlement and visitor economy.
// ============================================================
function chooseWeather(){return weightedChoice(Object.values(WEATHER).map(w=>({weight:w.weight,value:w.id})))||'sunny';}
function aquariumDisplayTotal(){return Object.values(state.aquarium.displayed).reduce((a,b)=>a+b,0);}
function aquariumReputation(){
  let rep=0;for(const [id,q] of Object.entries(state.aquarium.displayed)){const s=SPECIES[id];if(s)rep+=q*(s.rarity==='고급'?2:1);}return rep;
}
function recommendedTicketPrice(){return clamp(3+Math.floor(aquariumReputation()/3),3,25);}
function visitorAcceptance(){
  const rec=recommendedTicketPrice(),p=0.92-(Math.max(0,state.aquarium.ticketPrice-rec)*0.09);return clamp(p,.12,.96);
}
function runSettlement(){
  const revenue=state.aquarium.todayTicketRevenue;
  const visitors=state.aquarium.todayVisitors;
  state.money+=revenue;state.pendingRevenue=Math.max(0,state.pendingRevenue-revenue);
  state.lastSettlement={day:Math.max(1,state.day-1),visitors,ticketPrice:state.aquarium.ticketPrice,revenue,expenses:0,net:revenue};
  state.aquarium.todayVisitors=0;state.aquarium.todayTicketRevenue=0;
  if(revenue||visitors)openSettlementModal(state.lastSettlement);
}
function crossTimeEvent(prev,newM,prevDay,newDay){
  // midnight date progression is tracked by caller; 04:00 is operational day boundary.
  const crossed4=(prevDay===newDay&&prev<240&&newM>=240)||(newDay>prevDay&&newM>=240);
  if(crossed4){runSettlement();state.weather=chooseWeather();state.lastWeatherDay=state.day;showToast(`새로운 아침 · ${currentWeather().icon} ${currentWeather().name}`);}
}
function advanceTime(realSeconds){
  const prev=state.gameMinute,prevDay=state.day;
  let total=state.gameMinute+realSeconds*CONFIG.gameMinutesPerRealSecond;
  while(total>=1440){total-=1440;state.day++;}
  state.gameMinute=total;
  crossTimeEvent(prev,state.gameMinute,prevDay,state.day);
}
function skipToHour(targetHour){
  const target=targetHour*60;let minutes=target-state.gameMinute;if(minutes<=0)minutes+=1440;
  // Advance in chunks so midnight/04:00 events cannot be skipped.
  let remain=minutes;
  while(remain>0){const step=Math.min(remain,30);advanceTime(step);remain-=step;}
  saveGame();
}
let visitorTimer=2;
const visualVisitors=[];
function updateVisitors(dt){
  if(!state.aquarium.isOpen||aquariumDisplayTotal()<=0)return;
  const openHours=state.gameMinute>=7*60&&state.gameMinute<19*60;if(!openHours)return;
  visitorTimer-=dt;if(visitorTimer<=0){
    visitorTimer=clamp(8-aquariumReputation()*.12,2.5,8)+Math.random()*3;
    const accept=Math.random()<visitorAcceptance();
    if(accept){
      state.aquarium.totalVisitors++;state.aquarium.todayVisitors++;state.aquarium.todayTicketRevenue+=state.aquarium.ticketPrice;state.pendingRevenue+=state.aquarium.ticketPrice;
      if(state.scene==='aquarium')visualVisitors.push({x:4*32,y:14*32,tx:rand(9*32,22*32),ty:12*32,t:rand(5,11),shirt:['#d58e70','#6e9dbc','#8e78a4','#77a27d'][Math.floor(Math.random()*4)]});
    }else state.aquarium.turnedAway++;
  }
  for(let i=visualVisitors.length-1;i>=0;i--){const v=visualVisitors[i];v.t-=dt;const d=Math.hypot(v.tx-v.x,v.ty-v.y);if(d>3){v.x+=(v.tx-v.x)/d*36*dt;v.y+=(v.ty-v.y)/d*36*dt;}if(v.t<=0)visualVisitors.splice(i,1);}
}

// ============================================================
// Casting, spawn filters and 360 fishing.
// ============================================================
function canStartCast(){
  if(state.scene!=='village'||ui.modal||fishing)return false;
  const f=getFacingVector();
  // The first water point must be found reasonably close in front of the player.
  for(let d=24;d<=88;d+=8){if(isWater(state.player.x+f.x*d,state.player.y+f.y*d))return true;}
  return false;
}
function startCastCharge(){
  if(!canStartCast())return false;
  cast.mode='charging';cast.value=0;cast.dir=1;cast.landing=null;dom.castGaugeWrap.classList.remove('hidden');return true;
}
function updateCastCharge(dt){
  if(cast.mode!=='charging')return;
  cast.value+=cast.dir*92*dt;
  if(cast.value>=100){cast.value=100;cast.dir=-1;}else if(cast.value<=0){cast.value=0;cast.dir=1;}
  const f=getFacingVector(),distance=lerp(CONFIG.castMinDistance,CONFIG.castMaxDistance,cast.value/100);
  cast.landing={x:state.player.x+f.x*distance,y:state.player.y+f.y*distance};
  dom.castGaugeFill.style.width=`${cast.value}%`;dom.castGaugeMarker.style.left=`calc(${cast.value}% - 2px)`;
  const d=getWaterDepth(cast.landing.x,cast.landing.y);dom.castHint.textContent=d?`${DEPTH[d].label} · ${DEPTH[d].name}에 착수 예정`:'현재 거리에는 물이 없습니다';
}
function releaseCast(){
  if(cast.mode!=='charging')return;
  dom.castGaugeWrap.classList.add('hidden');
  const landing=cast.landing,depth=landing&&getWaterDepth(landing.x,landing.y);
  if(!landing||!depth){cast.mode='idle';showToast('찌가 물에 닿지 않았어요. 수심을 보며 다시 던져보세요.');return;}
  cast.mode='waiting';cast.depth=depth;cast.landing={...landing};cast.biteTimer=rand(CONFIG.biteMin,CONFIG.biteMax);cast.bobberPulse=0;
  if(state.equipment.bait&&itemCount(state.equipment.bait)>0){removeItem(state.equipment.bait,1);if(itemCount(state.equipment.bait)<=0)state.equipment.bait=null;}
  showToast(`${DEPTH[depth].label}에 찌가 떨어졌습니다.`);
  saveGame();
}
function speciesEligible(s,depth){
  let depthOk=s.depths.includes(depth);
  if(s.id==='loach'&&depth==='far')depthOk=state.weather==='rain';
  if(!depthOk)return false;
  if(!s.weather.includes(state.weather))return false;
  if(s.time==='night'&&!isNight())return false;
  return true;
}
function chooseBite(depth){
  const entries=[];
  for(const s of Object.values(SPECIES)){
    if(!speciesEligible(s,depth))continue;
    let w=s.weight;
    if(state.equipment.bait==='curiosityBait'&&s.rarity==='고급')w*=1.65;
    entries.push({weight:w,value:s});
  }
  return weightedChoice(entries);
}
function updateBobber(dt){
  if(cast.mode!=='waiting')return;
  cast.bobberPulse+=dt*4;cast.biteTimer-=dt;
  if(cast.biteTimer<=0){
    const species=chooseBite(cast.depth);
    if(!species){showToast('지금 이 수심에는 입질이 거의 없네요.');cast.mode='idle';return;}
    cast.mode='bite';startFishing(species);
  }
}
function fishPatternParams(s){
  const base={speed:.60+s.difficulty*.10,turn:1.2+s.difficulty*.2,burst:0,rest:0};
  switch(s.pattern){
    case 'minnow':return {...base,speed:.72,turn:2.2};
    case 'crucian':return {...base,speed:.58,turn:.85};
    case 'loach':return {...base,speed:.60,turn:1.2,burst:.4,rest:1.0};
    case 'snail':return {...base,speed:.16,turn:.28};
    case 'waterBug':return {...base,speed:.54,turn:1.3,burst:.55};
    case 'frog':return {...base,speed:.46,turn:.75,burst:1.2,rest:.9};
    case 'carp':return {...base,speed:.62,turn:.75,burst:.75};
    case 'shrimp':return {...base,speed:.55,turn:1.15,burst:1.15};
    case 'beetle':return {...base,speed:.72,turn:1.35,rest:.45};
    case 'goldfish':return {...base,speed:.66,turn:1.75};
    case 'salamander':return {...base,speed:.58,turn:1.0,burst:1.1};
    case 'softshell':return {...base,speed:.38,turn:.55,burst:.75};
    case 'snakehead':return {...base,speed:.52,turn:.7,burst:1.55};
    case 'bullhead':return {...base,speed:.48,turn:.8,burst:1.45};
    default:return base;
  }
}
function startFishing(species){
  const baitMult=state.equipment.bait==='wideBait'?1.2:1;
  const rodMult=RODS[state.equipment.rod]?.barMult||1;
  fishing={species,barAngle:0,barSpeed:-BAR_ACCEL.releaseStartSpeed,fishAngle:Math.random()*Math.PI*2,fishVel:(Math.random()<.5?-1:1)*fishPatternParams(species).speed,fishTarget:0,gauge:50,zone:clamp(.42*rodMult*baitMult,.30,1.05),patternTimer:rand(.5,1.5),iceTimer:0,result:null,resultTimer:0};
  dom.fishingSpecies.textContent=species.name;dom.fishingDifficulty.textContent=`난이도 ${species.difficulty}`;dom.iceBombCount.textContent=`×${itemCount('iceBomb')}`;
  dom.worldLayer.classList.add('blurred');dom.fishingOverlay.classList.remove('hidden');
}
function useIceBomb(){if(!fishing||fishing.iceTimer>0||itemCount('iceBomb')<=0)return;removeItem('iceBomb',1);fishing.iceTimer=3;dom.iceBombCount.textContent=`×${itemCount('iceBomb')}`;saveGame();}
function updateFishing(dt){
  if(!fishing)return;
  if(fishing.result){fishing.resultTimer-=dt;if(fishing.resultTimer<=0)finishFishingOverlay();return;}
  const hold=input.pointerDown;
  const targetSign=hold?1:-1;
  if(targetSign>0){
    if(fishing.barSpeed<0)fishing.barSpeed=Math.min(0,fishing.barSpeed+BAR_ACCEL.pressTurnAccel*dt);
    else fishing.barSpeed=Math.min(BAR_ACCEL.maxSpeed,Math.max(BAR_ACCEL.pressStartSpeed,fishing.barSpeed)+BAR_ACCEL.pressHoldAccel*dt);
  }else{
    if(fishing.barSpeed>0)fishing.barSpeed=Math.max(0,fishing.barSpeed-BAR_ACCEL.releaseTurnAccel*dt);
    else fishing.barSpeed=Math.max(-BAR_ACCEL.maxSpeed,Math.min(-BAR_ACCEL.releaseStartSpeed,fishing.barSpeed)-BAR_ACCEL.releaseHoldAccel*dt);
  }
  fishing.barAngle=normalizeAngle(fishing.barAngle+fishing.barSpeed*dt);
  const p=fishPatternParams(fishing.species);fishing.patternTimer-=dt;
  if(fishing.patternTimer<=0){
    fishing.patternTimer=rand(.45,1.55)/(1+p.turn*.16);
    let sign=Math.random()<.5?-1:1;let speed=p.speed*rand(.72,1.22);
    if(p.rest&&Math.random()<.24)speed*=.12;
    if(p.burst&&Math.random()<.32)speed+=p.burst;
    fishing.fishTarget=sign*speed;
  }
  const response=clamp(3.0+fishing.species.difficulty*.4,2.5,4.5);
  fishing.fishVel=lerp(fishing.fishVel,fishing.fishTarget,1-Math.exp(-response*dt));
  const slow=fishing.iceTimer>0?.32:1;if(fishing.iceTimer>0)fishing.iceTimer-=dt;
  fishing.fishAngle=normalizeAngle(fishing.fishAngle+fishing.fishVel*slow*dt);
  const inside=angleDifference(fishing.fishAngle,fishing.barAngle)<=fishing.zone/2;
  fishing.gauge+= (inside?28:-19)*dt;fishing.gauge=clamp(fishing.gauge,0,100);
  if(fishing.gauge>=100)resolveFishing(true);else if(fishing.gauge<=0)resolveFishing(false);
  dom.catchGaugeFill.style.width=`${fishing.gauge}%`;
}
function resolveFishing(success){
  if(!fishing||fishing.result)return;const s=fishing.species;
  if(success){
    const size=randomFishSize(s.id);
    if(addFish(s.id,1)){
      const record=recordCatch(s.id,size);fishing.result={success:true,size,record};showToast(record?`신기록! ${s.name} ${size.toFixed(1)}cm`:`잡았다! ${s.name} ${size.toFixed(1)}cm`);
    }else {fishing.result={success:false,bagFull:true};showToast('가방이 가득 차서 생물을 가져오지 못했어요.');}
  }else {fishing.result={success:false};showToast('놓쳤다!');}
  fishing.resultTimer=1.0;saveGame();refreshHud();
}
function finishFishingOverlay(){dom.worldLayer.classList.remove('blurred');dom.fishingOverlay.classList.add('hidden');fishing=null;cast.mode='idle';cast.landing=null;}

// ============================================================
// Player input and interactions.
// ============================================================
function updatePlayer(dt){
  if(ui.modal||fishing||cast.mode==='charging'||cast.mode==='waiting')return;
  let dx=0,dy=0;if(input.keys.has('KeyW'))dy--;if(input.keys.has('KeyS'))dy++;if(input.keys.has('KeyA'))dx--;if(input.keys.has('KeyD'))dx++;
  if(!dx&&!dy)return;const len=Math.hypot(dx,dy);dx/=len;dy/=len;
  if(Math.abs(dx)>Math.abs(dy))state.player.dir=dx<0?'left':'right';else state.player.dir=dy<0?'up':'down';
  const speed=CONFIG.playerSpeed*dt,nx=state.player.x+dx*speed,ny=state.player.y+dy*speed;
  if(!isSolidAt(nx,state.player.y,10))state.player.x=nx;if(!isSolidAt(state.player.x,ny,10))state.player.y=ny;
}
function pointerToWorld(e){
  const rect=canvas.getBoundingClientRect();const sx=CONFIG.canvasW/rect.width,sy=CONFIG.canvasH/rect.height;
  input.pointerX=(e.clientX-rect.left)*sx;input.pointerY=(e.clientY-rect.top)*sy;input.pointerWorldX=input.pointerX+camera.x;input.pointerWorldY=input.pointerY+camera.y;
}
function nearestNpc(x,y,max=CONFIG.interactDistance){if(state.scene!=='village')return null;let best=null,bd=max;for(const n of npcs){const d=dist(state.player.x,state.player.y,n.x,n.y);if(d<bd&&dist(x,y,n.x,n.y)<100){best=n;bd=d;}}return best;}
function nearbyObjectAt(x,y){
  for(const o of currentSceneObjects()){
    const r=tileRect(o);if(rectContains(r,x,y,10)&&dist(state.player.x,state.player.y,clamp(state.player.x,r.x,r.x+r.w),clamp(state.player.y,r.y,r.y+r.h))<CONFIG.interactDistance)return o;
  }
  return null;
}
function handleWorldClick(){
  const x=input.pointerWorldX,y=input.pointerWorldY;
  const npc=nearestNpc(x,y);if(npc){interactNpc(npc);return;}
  const o=nearbyObjectAt(x,y);if(o){interactObject(o);return;}
  showToast('조금 더 가까이 가서 좌클릭해보세요.');
}
function interactNpc(n){
  if(n.id==='marco'){openShop();return;}
  if(n.id==='bruno'){
    if(!state.story.firstTankRepaired){state.story.firstTankRepaired=true;state.story.stage=Math.max(state.story.stage,1);showDialogue('브루노','낡긴 했지만, 메인 수조 하나는 다시 살릴 수 있겠어. 여과장치는 손봐뒀다. 이제 안을 채워봐.');saveGame();}
    else showDialogue('브루노','수조는 내가 살려놨다. 안에 뭘 넣을지는 네 몫이야.');return;
  }
  if(n.id==='rohan'){showDialogue('로한','연못은 겉보기보다 깊이가 달라. 물색을 봐. 밝은 곳은 얕고, 짙은 곳은 깊다. 어느 수심에 찌를 넣느냐에 따라 사는 녀석도 달라.');return;}
  if(n.id==='yotri'){showDialogue('요트리',isNight()?'밤의 연못은 낮하고 완전히 달라 보여. 조용히 보면 움직이는 게 보여.':'난 밤에 연못 보는 걸 좋아해. 낮에는 안 보이던 애들이 나오거든.');return;}
  if(n.id==='luka'){showDialogue('루카','저 버스, 오늘도 그냥 지나가네. 언젠가는 여기에도 다시 멈추겠지?');return;}
  showDialogue('마을 주민','아쿠아리움 다시 연다며? 마을이 조금 활기차지겠네.');
}
function interactObject(o){
  if(state.scene==='village'){
    if(o.id==='aquarium'){enterAquarium();return;}if(o.id==='shop'){openShop();return;}if(o.id==='workshop'){interactNpc(npcs.find(n=>n.id==='bruno'));return;}
  }else{
    if(o.id==='exitAquarium'){exitAquarium();return;}if(o.id==='tank'){openTankPanel();return;}if(o.id==='desk'){openManager();return;}
  }
}
function enterAquarium(){state.scene='aquarium';state.player.x=4.5*32;state.player.y=13.5*32;camera.x=0;camera.y=0;showToast('낡은 아쿠아리움');saveGame();}
function exitAquarium(){state.scene='village';state.player.x=13.5*32;state.player.y=11.2*32;showToast('연못 마을');saveGame();}

// ============================================================
// Modal UI.
// ============================================================
function openModal(kind,html){ui.modal=kind;dom.modalContent.innerHTML=html;dom.modalLayer.classList.remove('hidden');dom.worldLayer.classList.add('blurred');bindModalActions();}
function closeModal(){ui.modal=null;dom.modalLayer.classList.add('hidden');dom.worldLayer.classList.remove('blurred');dom.modalContent.innerHTML='';saveGame();refreshHud();}
function showDialogue(name,text){openModal('dialogue',`<h2 class="panelTitle">${name}</h2><div class="panelCard" style="font-size:12px;min-height:110px">${text}</div>`);}
function openInventory(){
  const slots=[];for(const [id,q] of Object.entries(state.inventory.fish)){if(q>0){const s=SPECIES[id];slots.push({icon:s.icon,name:s.name,qty:q,meta:`${s.rarity} · ${s.price}G`});}}
  for(const [id,q] of Object.entries(state.inventory.items)){if(q>0){const it=ITEMS[id];slots.push({icon:it.icon,name:it.name,qty:q,meta:it.description});}}
  while(slots.length<state.inventory.capacity)slots.push(null);
  openModal('inventory',`<h2 class="panelTitle">🎒 가방 · ${uniqueBagStacks()}/${state.inventory.capacity}칸</h2><div class="panelSub">생물은 한 마리씩 따로 차지하지 않고 <b>같은 종끼리 한 슬롯에 스택</b>됩니다. 크기는 도감 기록으로만 남습니다.</div><div class="inventoryGrid">${slots.slice(0,state.inventory.capacity).map((s,i)=>s?`<div class="inventorySlot"><span class="slotNo">${i+1}</span><span class="bigIcon">${s.icon}</span><b>${s.name}</b><div class="quantity">×${s.qty}</div><small>${s.meta}</small></div>`:`<div class="inventorySlot"><span class="slotNo">${i+1}</span><span class="bigIcon" style="opacity:.18">·</span><small>빈 칸</small></div>`).join('')}</div>`);
}
function openCodex(){
  const cards=Object.values(SPECIES).map(s=>{const r=state.codex[s.id];return `<div class="panelCard" style="border-color:${r?rarityColor(s.rarity):'#b7a98e'};opacity:${r?1:.6}"><b>${r?s.icon:'?'} ${r?s.name:'???'}</b>${r?`잡은 횟수 ${r.count}<br>최대 ${r.maxSize==null?'—':r.maxSize.toFixed(1)+'cm'}<br>최소 ${r.minSize==null?'—':r.minSize.toFixed(1)+'cm'}<br>수심 ${s.id==='loach'?'근 · 비 오는 날 원':s.depths.map(d=>DEPTH[d].name.replace('거리','')).join('/')}<br>시간 ${s.time==='night'?'밤 20:00–04:00':'종일'}<br>날씨 ${s.weather.map(w=>WEATHER[w].name).join('/')}`:'아직 발견하지 못했습니다.'}</div>`}).join('');
  openModal('codex',`<h2 class="panelTitle">📖 연못 생물 도감 · ${Object.keys(state.codex).length}/14</h2><div class="panelSub">개체별 크기는 가방에 저장하지 않고 도감의 최대/최소 기록만 갱신합니다.</div><div class="panelGrid">${cards}</div>`);
}
function openEquipment(){
  openModal('equipment',`<h2 class="panelTitle">🎣 낚시 장비</h2><div class="equipmentSlots"><div class="equipSlot"><strong>낚싯대</strong>${RODS[state.equipment.rod].name}<br><small>${RODS[state.equipment.rod].description}</small>${state.equipment.ownedRods.wide?`<button data-action="equipRod" data-id="${state.equipment.rod==='wide'?'basic':'wide'}">${state.equipment.rod==='wide'?'기본':'와이드'}로 교체</button>`:''}</div><div class="equipSlot"><strong>찌</strong>${BOBBERS[state.equipment.bobber].name}<br><small>${BOBBERS[state.equipment.bobber].description}</small></div><div class="equipSlot"><strong>미끼</strong>${state.equipment.bait?ITEMS[state.equipment.bait].name:'장착 안 함'}<br><small>와이드 ${itemCount('wideBait')} · 호기심 ${itemCount('curiosityBait')}</small><button data-action="cycleBait">미끼 변경</button></div><div class="equipSlot"><strong>액티브</strong>얼음 폭탄<br><small>보유 ${itemCount('iceBomb')}개</small></div></div>`);
}
function openAquariumStatus(){
  openModal('aquariumStatus',`<h2 class="panelTitle">🐠 아쿠아리움 상태</h2><div class="panelGrid"><div class="panelCard"><b>운영</b>${state.aquarium.isOpen?'마을 주민 대상 재개장':'아직 폐업 상태'}<br>전시 ${aquariumDisplayTotal()}/${state.aquarium.tankCapacity}<br>평판 ${aquariumReputation()}</div><div class="panelCard"><b>오늘</b>방문 ${state.aquarium.todayVisitors}명<br>정산 대기 ${state.aquarium.todayTicketRevenue}G<br>현재 입장료 ${state.aquarium.ticketPrice}G</div><div class="panelCard"><b>누적</b>입장 ${state.aquarium.totalVisitors}명<br>입장 포기 ${state.aquarium.turnedAway}명<br>추천 입장료 ${recommendedTicketPrice()}G</div></div><div class="panelSub" style="margin-top:10px">입장료 변경과 잠자기는 아쿠아리움 안 <b>관리자실 장부</b>에서만 할 수 있습니다.</div>`);
}
function openManager(){
  openModal('manager',`<h2 class="panelTitle">📒 관리자실 장부</h2><div class="panelSub">현재 관리자실 배경을 유지한 채 관리 기능만 오버레이로 엽니다.</div><div class="panelCard"><b>입장료 관리</b><div class="managerRow"><button class="panelAction alt" data-action="ticketMinus">−</button><div class="managerPrice">${state.aquarium.ticketPrice}G</div><button class="panelAction" data-action="ticketPlus">＋</button></div>추천 ${recommendedTicketPrice()}G · 예상 입장 확률 ${Math.round(visitorAcceptance()*100)}%</div><div class="panelCard" style="margin-top:8px"><b>시간 넘기기</b>강제 수면은 없습니다. 밤낚시를 계속하거나 원하는 경우에만 시간을 넘깁니다.<div class="managerRow"><button class="panelAction gold" data-action="sleep6">다음 06:00까지 쉬기</button><button class="panelAction" data-action="skipNoon">다음 12:00까지 쉬기</button></div></div>`);
}
function openTankPanel(){
  const displayed=Object.entries(state.aquarium.displayed).filter(([,q])=>q>0).map(([id,q])=>`<div class="panelCard"><b>${SPECIES[id].icon} ${SPECIES[id].name} ×${q}</b><button data-action="removeTank" data-id="${id}">1마리 꺼내기</button></div>`).join('');
  const available=Object.entries(state.inventory.fish).filter(([,q])=>q>0).map(([id,q])=>`<div class="panelCard"><b>${SPECIES[id].icon} ${SPECIES[id].name} ×${q}</b><button data-action="addTank" data-id="${id}" ${aquariumDisplayTotal()>=state.aquarium.tankCapacity?'disabled':''}>1마리 전시</button></div>`).join('');
  openModal('tank',`<h2 class="panelTitle">🐠 메인 수조 · ${aquariumDisplayTotal()}/${state.aquarium.tankCapacity}</h2><div class="panelSub">전시는 가방의 종별 수량에서 한 마리씩 차감됩니다.</div><h3>전시 중</h3><div class="panelGrid">${displayed||'<div class="panelCard">아직 비어 있습니다.</div>'}</div><h3>가방에서 넣기</h3><div class="panelGrid">${available||'<div class="panelCard">전시할 생물이 없습니다.</div>'}</div>`);
}
function openShop(){ui.shopTab='buy';renderShopModal();}
function renderShopModal(){
  const buyCards=[{kind:'rod',id:'wide',name:RODS.wide.name,price:RODS.wide.buy,desc:RODS.wide.description,owned:state.equipment.ownedRods.wide},{kind:'item',id:'wideBait',...ITEMS.wideBait},{kind:'item',id:'curiosityBait',...ITEMS.curiosityBait},{kind:'item',id:'iceBomb',...ITEMS.iceBomb}].map(it=>`<div class="panelCard"><b>${it.name}</b>${it.desc||it.description||''}<br><strong>${it.price}G</strong><button data-action="buy" data-kind="${it.kind}" data-id="${it.id}" ${it.kind==='rod'&&it.owned?'disabled':''}>${it.kind==='rod'&&it.owned?'보유 중':'구매'}</button></div>`).join('');
  const sellCards=Object.entries(state.inventory.fish).filter(([,q])=>q>0).map(([id,q])=>{const s=SPECIES[id];return `<div class="panelCard"><b>${s.icon} ${s.name} ×${q}</b>1마리 ${s.price}G<button data-action="sellFish" data-id="${id}">1마리 판매</button></div>`}).join('');
  openModal('shop',`<h2 class="panelTitle">🏪 마르코의 연못 상점 · 보유 ${state.money}G</h2><div class="panelSub">“어서 와. 연못에서 쓸 만한 것들만 골라놨어.”</div><div class="shopTabs"><button data-action="shopTab" data-id="buy" class="${ui.shopTab==='buy'?'active':''}">물품 구매</button><button data-action="shopTab" data-id="sell" class="${ui.shopTab==='sell'?'active':''}">생물 판매</button></div><div class="panelGrid">${ui.shopTab==='buy'?buyCards:(sellCards||'<div class="panelCard">판매할 생물이 없습니다.</div>')}</div>`);
}
function openSettlementModal(s){
  openModal('settlement',`<h2 class="panelTitle">🌅 ${s.day}일 영업 정산</h2><div class="settlement">방문객 ${s.visitors}명<br>입장료 ${s.ticketPrice}G<br>입장료 수익 ${s.revenue}G<br>기타 수익 0G<br>비용 ${s.expenses}G<hr><b>순수익 ${s.net}G</b></div>`);
}
function bindModalActions(){
  dom.modalContent.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleModalAction(btn.dataset.action,btn.dataset.id,btn.dataset.kind)));
}
function handleModalAction(action,id,kind){
  if(action==='equipRod'){state.equipment.rod=id;openEquipment();return;}
  if(action==='cycleBait'){
    const options=[null,'wideBait','curiosityBait'].filter(x=>!x||itemCount(x)>0);let i=options.indexOf(state.equipment.bait);state.equipment.bait=options[(i+1)%options.length];openEquipment();return;
  }
  if(action==='ticketMinus'){state.aquarium.ticketPrice=clamp(state.aquarium.ticketPrice-1,0,50);openManager();return;}
  if(action==='ticketPlus'){state.aquarium.ticketPrice=clamp(state.aquarium.ticketPrice+1,0,50);openManager();return;}
  if(action==='sleep6'){closeModal();skipToHour(6);return;}if(action==='skipNoon'){closeModal();skipToHour(12);return;}
  if(action==='addTank'){
    if(aquariumDisplayTotal()<state.aquarium.tankCapacity&&removeFish(id,1)){state.aquarium.displayed[id]=(state.aquarium.displayed[id]||0)+1;if(state.story.firstTankRepaired&&!state.aquarium.isOpen){state.aquarium.isOpen=true;state.story.localReopening=true;state.story.stage=Math.max(state.story.stage,3);showToast('작은 재개장! 이제 마을 주민들이 아쿠아리움을 찾아옵니다.');}openTankPanel();}return;
  }
  if(action==='removeTank'){
    if((state.aquarium.displayed[id]||0)>0&&bagHasSpaceFor('fish',id)){state.aquarium.displayed[id]--;addFish(id,1);openTankPanel();}else showToast('가방에 빈 슬롯이 필요합니다.');return;
  }
  if(action==='buy'){
    if(kind==='rod'){const r=RODS[id];if(state.money>=r.buy&&!state.equipment.ownedRods[id]){state.money-=r.buy;state.equipment.ownedRods[id]=1;state.equipment.rod=id;showToast(`${r.name} 장착!`);}}
    else {const it=ITEMS[id];if(state.money>=it.price&&bagHasSpaceFor('item',id)){state.money-=it.price;addItem(id,1);showToast(`${it.name} 구매`);}else if(!bagHasSpaceFor('item',id))showToast('가방 슬롯이 부족합니다.');}
    renderShopModal();return;
  }
  if(action==='sellFish'){const s=SPECIES[id];if(removeFish(id,1)){state.money+=s.price;showToast(`${s.name} 판매 +${s.price}G`);}renderShopModal();return;}
  if(action==='shopTab'){ui.shopTab=id;renderShopModal();return;}
}

function showToast(text,duration=2.2){dom.toast.textContent=text;dom.toast.classList.remove('hidden');ui.toastTimer=duration;}
function updateToast(dt){if(ui.toastTimer>0){ui.toastTimer-=dt;if(ui.toastTimer<=0)dom.toast.classList.add('hidden');}}

// ============================================================
// Rendering helpers.
// ============================================================
function colorMix(a,b,t){
  const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const ar=pa>>16,ag=pa>>8&255,ab=pa&255,br=pb>>16,bg=pb>>8&255,bb=pb&255;
  return `rgb(${Math.round(lerp(ar,br,t))},${Math.round(lerp(ag,bg,t))},${Math.round(lerp(ab,bb,t))})`;
}
function dayLighting(){
  const h=state.gameMinute/60;
  if(h>=7&&h<16)return {dark:0,tint:null,shadow:8};
  if(h>=16&&h<20){const t=(h-16)/4;return {dark:.05+t*.22,tint:`rgba(218,118,62,${.05+t*.12})`,shadow:8+18*t};}
  if(h>=4&&h<7){const t=(h-4)/3;return {dark:.32*(1-t),tint:`rgba(98,113,154,${.12*(1-t)})`,shadow:24-16*t};}
  return {dark:.48,tint:'rgba(35,55,104,.22)',shadow:5};
}
function shadowAlpha(){const base=state.weather==='sunny'?.24:state.weather==='cloudy'?.11:.07;return base*(1-dayLighting().dark*.8);}
function drawPixelText(text,x,y,size=12,color='#fff',align='left'){ctx.save();ctx.fillStyle='#0008';ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.fillText(text,x+1,y+1);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();}
function worldToScreen(x,y){return {x:x-camera.x,y:y-camera.y};}
function onScreenRect(r,pad=80){return r.x+r.w>=camera.x-pad&&r.x<=camera.x+CONFIG.canvasW+pad&&r.y+r.h>=camera.y-pad&&r.y<=camera.y+CONFIG.canvasH+pad;}

function drawGroundVillage(){
  ctx.fillStyle='#8dbd7b';ctx.fillRect(0,0,CONFIG.canvasW,CONFIG.canvasH);
  // Background low mountains.
  for(let i=-1;i<9;i++){const wx=i*290-camera.x*.18,wy=20-camera.y*.05;ctx.fillStyle=i%2?'#6f9b70':'#648b68';ctx.beginPath();ctx.moveTo(wx,wy+170);ctx.lineTo(wx+145,wy+20+(i%3)*15);ctx.lineTo(wx+310,wy+170);ctx.fill();}
  // Dirt village paths.
  ctx.save();ctx.translate(-camera.x,-camera.y);ctx.strokeStyle='#c6aa72';ctx.lineWidth=74;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(7*32,8*32);ctx.lineTo(16*32,13*32);ctx.lineTo(31*32,13*32);ctx.lineTo(42*32,15*32);ctx.lineTo(48*32,19*32);ctx.stroke();ctx.beginPath();ctx.moveTo(30*32,13*32);ctx.lineTo(31*32,20*32);ctx.lineTo(31*32,24*32);ctx.stroke();ctx.restore();
  drawPond();
}
function drawPond(){
  const p=worldToScreen(pond.cx,pond.cy);ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,pond.ry/pond.rx);
  const r=pond.rx;
  // Draw many rings to create a persistent natural shallow→mid→deep gradient.
  for(let i=0;i<28;i++){
    const t=i/27,rr=r*(1-t*.51);let col;
    if(t<.43)col=colorMix('#89d0c2','#5fa8b7',t/.43);else col=colorMix('#5fa8b7','#376f91',(t-.43)/.57);
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  // Subtle water streaks.
  ctx.save();ctx.globalAlpha=.17;ctx.strokeStyle='#e2f6e9';ctx.lineWidth=2;
  for(let i=0;i<34;i++){const a=i*.83+state.gameMinute*.001;const rr=rand(.16,.95);const x=p.x+Math.cos(a)*pond.rx*rr,y=p.y+Math.sin(a)*pond.ry*rr;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.stroke();}
  ctx.restore();
  // Bridge on top of water.
  const b=worldToScreen(bridge.x,bridge.y);ctx.fillStyle='#5a3c27';ctx.fillRect(b.x,b.y,bridge.w,bridge.h);for(let x=0;x<bridge.w;x+=18){ctx.fillStyle=x%36?'#a77542':'#bb8750';ctx.fillRect(b.x+x,b.y+4,14,bridge.h-8);}ctx.strokeStyle='#4a3022';ctx.lineWidth=5;ctx.strokeRect(b.x,b.y,bridge.w,bridge.h);
}
function drawBuilding(o){
  const r=tileRect(o);if(!onScreenRect(r))return;const s=worldToScreen(r.x,r.y);const light=dayLighting();
  // Directional shadow.
  ctx.fillStyle=`rgba(42,43,31,${shadowAlpha()})`;ctx.fillRect(s.x+light.shadow,s.y+light.shadow*.55,r.w,r.h*.86);
  // Walls and timber framing.
  ctx.fillStyle=o.wall;ctx.fillRect(s.x,s.y+38,r.w,r.h-38);ctx.fillStyle='#6f4d31';ctx.fillRect(s.x,s.y+38,8,r.h-38);ctx.fillRect(s.x+r.w-8,s.y+38,8,r.h-38);for(let x=42;x<r.w;x+=64)ctx.fillRect(s.x+x,s.y+40,6,r.h-42);
  // Sloped roof.
  ctx.fillStyle=o.roof;ctx.beginPath();ctx.moveTo(s.x-13,s.y+46);ctx.lineTo(s.x+r.w*.5,s.y-8);ctx.lineTo(s.x+r.w+13,s.y+46);ctx.closePath();ctx.fill();ctx.fillStyle='#4b382d';ctx.fillRect(s.x-8,s.y+42,r.w+16,8);
  // Windows + flower pots.
  ctx.fillStyle='#bfe4dc';for(let x=42;x<r.w-36;x+=84){ctx.fillRect(s.x+x,s.y+68,28,25);ctx.strokeStyle='#6b4a30';ctx.lineWidth=4;ctx.strokeRect(s.x+x,s.y+68,28,25);ctx.fillStyle='#9d5b4c';ctx.fillRect(s.x+x+3,s.y+95,22,7);ctx.fillStyle='#bfe4dc';}
  // Door.
  const doorX=s.x+r.w*.5-15;ctx.fillStyle='#69462d';ctx.fillRect(doorX,s.y+r.h-51,30,51);ctx.fillStyle='#e8c66c';ctx.fillRect(doorX+21,s.y+r.h-27,4,4);
  // Purpose props/signs.
  const label=o.id==='shop'?'낚시 상점':o.id==='workshop'?'수리 작업장':o.id==='aquarium'?'AQUARIUM':o.label;
  ctx.fillStyle='#5b4630';ctx.fillRect(s.x+r.w*.5-54,s.y+48,108,22);drawPixelText(label,s.x+r.w*.5,s.y+63,10,'#ffe9ac','center');
  if(o.id==='workshop'){ctx.fillStyle='#6a4c33';ctx.fillRect(s.x+r.w-46,s.y+r.h-35,36,25);ctx.fillStyle='#98a3a0';ctx.fillRect(s.x+r.w-36,s.y+r.h-48,6,25);}
  if(o.id==='shop'){ctx.fillStyle='#7a4e32';ctx.fillRect(s.x+15,s.y+r.h-26,42,22);ctx.fillStyle='#dfc16b';ctx.fillRect(s.x+18,s.y+r.h-23,9,9);ctx.fillRect(s.x+31,s.y+r.h-23,9,9);}
  if(o.id==='aquarium'){ctx.fillStyle='#6e7d75';ctx.fillRect(s.x+14,s.y+r.h-31,20,31);ctx.fillStyle='#8f806b';ctx.fillRect(s.x+r.w-31,s.y+r.h-40,18,40);}
}
function drawTree(wx,wy,blossom=false,scale=1){
  const s=worldToScreen(wx,wy);if(s.x<-80||s.y<-100||s.x>CONFIG.canvasW+80||s.y>CONFIG.canvasH+80)return;const sh=dayLighting().shadow;
  ctx.fillStyle=`rgba(40,48,33,${shadowAlpha()})`;ctx.beginPath();ctx.ellipse(s.x+sh,s.y+22,s.width||28*scale,10*scale,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6e4a2f';ctx.fillRect(s.x-5*scale,s.y,10*scale,34*scale);
  const c=blossom?'#dca6ba':'#4f865d',c2=blossom?'#efc1ca':'#659d66';for(const [dx,dy,rr] of [[-14,-9,17],[10,-15,20],[0,-30,19],[20,-1,14],[-23,-25,14]]){ctx.fillStyle=(dx+dy)%2?c:c2;ctx.beginPath();ctx.arc(s.x+dx*scale,s.y+dy*scale,rr*scale,0,Math.PI*2);ctx.fill();}
}
function drawVillageDecor(){
  const trees=[[5,14,1],[8,16,0],[19,5,1],[21,11,0],[31,4,1],[43,4,1],[59,13,0],[55,18,1],[13,20,1],[17,25,0],[53,31,1],[22,35,0],[9,31,1],[45,35,0]];for(const [x,y,b] of trees)drawTree(x*32,y*32,!!b,.9);
  // Bus stop.
  const bx=worldToScreen(3*32,5*32);ctx.fillStyle='#6d5038';ctx.fillRect(bx.x,bx.y+32,128,10);ctx.fillRect(bx.x+8,bx.y+40,7,57);ctx.fillRect(bx.x+110,bx.y+40,7,57);ctx.fillStyle='#d9c88d';ctx.fillRect(bx.x+26,bx.y+65,68,9);ctx.fillStyle='#38546a';ctx.fillRect(bx.x+121,bx.y+8,7,90);ctx.fillStyle='#f0e2ae';ctx.fillRect(bx.x+108,bx.y+8,34,27);drawPixelText('BUS',bx.x+125,bx.y+26,9,'#30475a','center');
}
function drawPixelPerson(x,y,palette,dir='down',walking=false,name=null){
  const s=worldToScreen(x,y);const bob=walking?Math.sin(performance.now()/110)*1.5:0;const [hair,body,skin]=palette;ctx.save();ctx.translate(Math.round(s.x),Math.round(s.y+bob));
  ctx.fillStyle=`rgba(30,35,28,${shadowAlpha()+.12})`;ctx.beginPath();ctx.ellipse(0,12,11,5,0,0,Math.PI*2);ctx.fill();
  // backpack/side silhouette based on direction.
  if(dir==='left'||dir==='right'){ctx.fillStyle='#694b35';ctx.fillRect(dir==='left'?5:-11,-4,7,13);}
  if(dir==='up'){ctx.fillStyle='#694b35';ctx.fillRect(-8,-5,16,14);}
  ctx.fillStyle=body;ctx.fillRect(-8,-4,16,16);ctx.fillStyle='#ede2c6';ctx.fillRect(-6,-3,12,5);ctx.fillStyle=skin;ctx.fillRect(-7,-17,14,13);ctx.fillStyle=hair;ctx.fillRect(-8,-19,16,7);ctx.fillRect(-8,-14,3,8);ctx.fillRect(5,-14,3,8);
  if(dir!=='up'){ctx.fillStyle='#372a25';const eyeShift=dir==='left'?-2:dir==='right'?2:0;ctx.fillRect(-4+eyeShift,-11,2,2);ctx.fillRect(3+eyeShift,-11,2,2);}
  const leg=Math.sin(performance.now()/95)>0?2:-2;ctx.fillStyle='#4d3b30';ctx.fillRect(-6,-0+16,5,8+(walking?leg:0));ctx.fillRect(1,-0+16,5,8-(walking?leg:0));ctx.restore();if(name)drawPixelText(name,s.x,s.y-27,9,'#fff4c9','center');
}
function npcWalking(n){return !!n.path[n.pathIndex];}
function drawNpcs(){if(state.scene!=='village')return;for(const n of npcs)drawPixelPerson(n.x,n.y,n.palette,'down',npcWalking(n),n.id.startsWith('resident')?null:n.name);}
function drawPlayer(){const moving=input.keys.has('KeyW')||input.keys.has('KeyA')||input.keys.has('KeyS')||input.keys.has('KeyD');drawPixelPerson(state.player.x,state.player.y,['#49352f','#416a91','#efc3a0'],state.player.dir,moving,null);}
function drawBobber(){if(!cast.landing||!['waiting','bite'].includes(cast.mode))return;const s=worldToScreen(cast.landing.x,cast.landing.y);ctx.save();ctx.translate(s.x,s.y+Math.sin(cast.bobberPulse)*2);ctx.fillStyle='#f4eee2';ctx.fillRect(-3,-8,6,8);ctx.fillStyle='#d95b4e';ctx.fillRect(-3,-11,6,4);ctx.fillStyle='#283d47';ctx.fillRect(-1,-16,2,5);ctx.restore();}
function drawCastPreview(){if(cast.mode!=='charging'||!cast.landing)return;const a=worldToScreen(state.player.x,state.player.y),b=worldToScreen(cast.landing.x,cast.landing.y);ctx.save();ctx.setLineDash([6,6]);ctx.strokeStyle='#fff2b3cc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y-8);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);const depth=getWaterDepth(cast.landing.x,cast.landing.y);ctx.fillStyle=depth?DEPTH[depth].color:'#c96b61';ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff4cf';ctx.stroke();ctx.restore();}
function drawAquariumInterior(){
  ctx.fillStyle='#b48f60';ctx.fillRect(0,0,CONFIG.canvasW,CONFIG.canvasH);ctx.save();ctx.translate(-camera.x,-camera.y);ctx.fillStyle='#d5bd8d';ctx.fillRect(2*32,2*32,28*32,14*32);for(let x=2*32;x<30*32;x+=32){ctx.strokeStyle='#c4a875';ctx.beginPath();ctx.moveTo(x,2*32);ctx.lineTo(x,16*32);ctx.stroke();}ctx.restore();
  // Tank.
  const t=worldToScreen(10*32,4*32);ctx.fillStyle=`rgba(34,95,112,.78)`;ctx.fillRect(t.x,t.y,12*32,5*32);ctx.strokeStyle='#49392d';ctx.lineWidth=10;ctx.strokeRect(t.x,t.y,12*32,5*32);for(let i=0;i<aquariumDisplayTotal();i++){const entries=Object.entries(state.aquarium.displayed).filter(([,q])=>q>0);if(!entries.length)break;let k=i;let pick=entries[0][0];for(const [id,q] of entries){if(k<q){pick=id;break;}k-=q;}const px=t.x+40+(i*61%(12*32-80)),py=t.y+35+((i*37)%(5*32-65));drawTinyFish(px,py,SPECIES[pick],i%2?1:-1);}
  // Manager room.
  const r=worldToScreen(23*32,3*32);ctx.fillStyle='#7b573b';ctx.fillRect(r.x,r.y,6*32,7*32);ctx.fillStyle='#d5bd8d';ctx.fillRect(r.x+10,r.y+10,6*32-20,7*32-20);ctx.strokeStyle='#4b3427';ctx.lineWidth=7;ctx.strokeRect(r.x,r.y,6*32,7*32);drawPixelText('관리자 외 출입금지',r.x+3*32,r.y+25,10,'#5b3928','center');const d=worldToScreen(25*32,5*32);ctx.fillStyle='#6e4c31';ctx.fillRect(d.x,d.y,64,52);ctx.fillStyle='#f0dfa7';ctx.fillRect(d.x+10,d.y+6,30,20);
  // Exit.
  const ex=worldToScreen(3*32,13*32);ctx.fillStyle='#5d4534';ctx.fillRect(ex.x,ex.y,64,64);drawPixelText('마을',ex.x+32,ex.y+36,11,'#ffe8ad','center');
  for(const v of visualVisitors)drawPixelPerson(v.x,v.y,['#534039',v.shirt,'#dfad82'],'up',true,null);
}
function drawTinyFish(x,y,s,dir){ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.fillStyle=s.rarity==='고급'?'#6eb4c6':'#e3b867';ctx.fillRect(-8,-4,15,8);ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-14,-7);ctx.lineTo(-14,7);ctx.closePath();ctx.fill();ctx.fillStyle='#1d3034';ctx.fillRect(3,-2,2,2);ctx.restore();}
function drawWeatherAndLighting(){
  if(state.weather==='rain'){
    ctx.save();ctx.strokeStyle='#c9e5e6aa';ctx.lineWidth=1;for(const r of rainDrops){ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x-4,r.y+r.len);ctx.stroke();}ctx.restore();
  }
  const l=dayLighting();if(l.tint){ctx.fillStyle=l.tint;ctx.fillRect(0,0,CONFIG.canvasW,CONFIG.canvasH);}if(l.dark>0){ctx.fillStyle=`rgba(8,19,38,${l.dark})`;ctx.fillRect(0,0,CONFIG.canvasW,CONFIG.canvasH);}
  if(state.scene==='village'&&!isNight()&&state.weather==='sunny'&&state.gameMinute>6*60&&state.gameMinute<18*60){ctx.fillStyle='rgba(255,244,181,.035)';ctx.fillRect(0,0,CONFIG.canvasW,CONFIG.canvasH);}
}
function drawLocationLabels(){
  if(state.scene!=='village')return;
  const spots=[['버스정류장',5*32,4*32],['낡은 아쿠아리움',13.5*32,3.5*32],['중앙 연못',37*32,13.7*32]];for(const [txt,x,y] of spots){const s=worldToScreen(x,y);if(s.x>0&&s.x<CONFIG.canvasW&&s.y>0&&s.y<CONFIG.canvasH)drawPixelText(txt,s.x,s.y,10,'#fff0b9','center');}
}
function renderWorld(){
  ctx.clearRect(0,0,CONFIG.canvasW,CONFIG.canvasH);
  if(state.scene==='village'){drawGroundVillage();for(const o of villageObjects)drawBuilding(o);drawVillageDecor();drawLocationLabels();drawNpcs();drawBobber();drawCastPreview();drawPlayer();}
  else {drawAquariumInterior();drawPlayer();}
  drawWeatherAndLighting();
}
function drawFishingOverlay(){
  if(!fishing)return;const W=fishingCanvas.width,H=fishingCanvas.height,cx=W/2,cy=H/2,R=168;fctx.clearRect(0,0,W,H);
  fctx.fillStyle='#10292fe8';fctx.beginPath();fctx.arc(cx,cy,R+58,0,Math.PI*2);fctx.fill();fctx.strokeStyle='#d8bd79';fctx.lineWidth=5;fctx.stroke();
  fctx.strokeStyle='#365b60';fctx.lineWidth=26;fctx.beginPath();fctx.arc(cx,cy,R,0,Math.PI*2);fctx.stroke();
  fctx.strokeStyle='#f0ce70';fctx.lineWidth=30;fctx.lineCap='round';fctx.beginPath();fctx.arc(cx,cy,R,fishing.barAngle-fishing.zone/2,fishing.barAngle+fishing.zone/2);fctx.stroke();
  const fx=cx+Math.cos(fishing.fishAngle)*R,fy=cy+Math.sin(fishing.fishAngle)*R;fctx.save();fctx.translate(fx,fy);fctx.rotate(fishing.fishAngle+Math.PI/2);fctx.fillStyle=fishing.species.rarity==='고급'?'#74c9d6':'#e2b55d';fctx.fillRect(-12,-7,24,14);fctx.beginPath();fctx.moveTo(-12,0);fctx.lineTo(-21,-10);fctx.lineTo(-21,10);fctx.closePath();fctx.fill();fctx.fillStyle='#10292f';fctx.fillRect(6,-3,3,3);fctx.restore();
  fctx.fillStyle='#f7ecc8';fctx.font='bold 18px monospace';fctx.textAlign='center';fctx.fillText(fishing.result?(fishing.result.success?'CATCH!':'MISS!'):'360° CATCH',cx,cy+6);
  fctx.font='12px monospace';fctx.fillStyle='#bddbd4';fctx.fillText(`${DEPTH[cast.depth]?.label||''} · ${currentWeather().name} · ${isNight()?'밤':'낮'}`,cx,cy+29);
  if(fishing.iceTimer>0){fctx.strokeStyle='#9be6ff';fctx.lineWidth=4;fctx.beginPath();fctx.arc(cx,cy,R+40,0,Math.PI*2);fctx.stroke();}
}

function updateCamera(dt){
  const b=sceneBounds();const targetX=state.player.x-CONFIG.canvasW/2,targetY=state.player.y-CONFIG.canvasH/2;const maxX=Math.max(0,b.w-CONFIG.canvasW),maxY=Math.max(0,b.h-CONFIG.canvasH);const tx=clamp(targetX,0,maxX),ty=clamp(targetY,0,maxY);const t=1-Math.exp(-7*dt);camera.x=lerp(camera.x,tx,t);camera.y=lerp(camera.y,ty,t);
}
function updateRain(dt){if(state.weather!=='rain')return;for(const r of rainDrops){r.y+=r.speed*dt;r.x-=r.speed*.25*dt;if(r.y>CONFIG.canvasH+20||r.x<-20){r.y=-20;r.x=Math.random()*CONFIG.canvasW+40;}}}
function locationName(){
  if(state.scene==='aquarium')return '연못 마을 · 아쿠아리움';const p=state.player;if(p.x<10*32&&p.y<13*32)return '연못 마을 · 버스정류장';if(pondNorm(p.x,p.y)<1.35)return '연못 마을 · 중앙 연못';if(p.x<19*32&&p.y<13*32)return '연못 마을 · 아쿠아리움 앞';if(p.x<32*32&&p.y<13*32)return '연못 마을 · 상점길';return '연못 마을';
}
function refreshHud(){
  dom.locationText.textContent=locationName();dom.clockText.textContent=`${state.day}일 · ${formatTime(state.gameMinute)}`;dom.weatherText.textContent=`${currentWeather().icon} ${currentWeather().name}`;dom.moneyText.textContent=`${state.money}G`;dom.pendingRevenueText.textContent=`정산 대기 ${state.pendingRevenue}G`;
  const stacks=[];for(const [id,q] of Object.entries(state.inventory.fish))if(q>0)stacks.push({name:SPECIES[id].name,icon:SPECIES[id].icon,qty:q});for(const [id,q] of Object.entries(state.inventory.items))if(q>0)stacks.push({name:ITEMS[id].name,icon:ITEMS[id].icon,qty:q});
  dom.bagUsage.textContent=`${stacks.length}/${state.inventory.capacity}`;dom.bagMiniGrid.innerHTML=Array.from({length:state.inventory.capacity},(_,i)=>{const s=stacks[i];return s?`<div class="bagSlot" title="${s.name}"><span class="icon">${s.icon}</span><span>${s.name}</span><span class="qty">×${s.qty}</span></div>`:`<div class="bagSlot empty"></div>`}).join('');dom.iceBombCount.textContent=`×${itemCount('iceBomb')}`;
}

function fixedUpdate(dt){
  if(!fishing&&!ui.modal){advanceTime(dt);updatePlayer(dt);updateNpcs(dt);updateVisitors(dt);updateBobber(dt);updateCastCharge(dt);}
  updateFishing(dt);updateCamera(dt);updateToast(dt);updateRain(dt);saveTimer+=dt;if(saveTimer>10){saveTimer=0;saveGame();}refreshHud();
}
function render(){renderWorld();drawFishingOverlay();}

// ============================================================
// Events.
// ============================================================
window.addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code)){input.keys.add(e.code);e.preventDefault();}
  if(e.code==='Escape'){if(ui.modal)closeModal();else if(cast.mode==='charging'){cast.mode='idle';dom.castGaugeWrap.classList.add('hidden');}e.preventDefault();}
});
window.addEventListener('keyup',e=>{input.keys.delete(e.code);});
canvas.addEventListener('pointermove',pointerToWorld);
function pointerTargetsInteraction(){
  const x=input.pointerWorldX,y=input.pointerWorldY;
  return !!nearestNpc(x,y)||!!nearbyObjectAt(x,y);
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;pointerToWorld(e);input.pointerDown=true;canvas.setPointerCapture?.(e.pointerId);
  if(fishing)return;if(ui.modal)return;
  // World interactions win over casting when the click actually targets a nearby NPC/object.
  if(pointerTargetsInteraction())return;
  if(cast.mode==='idle'&&startCastCharge()){e.preventDefault();return;}
});
canvas.addEventListener('pointerup',e=>{
  if(e.button!==0)return;pointerToWorld(e);input.pointerDown=false;
  if(fishing)return;if(cast.mode==='charging'){releaseCast();return;}if(cast.mode==='waiting')return;handleWorldClick();
});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
dom.fishingOverlay.addEventListener('pointerdown',e=>{if(e.button===0)input.pointerDown=true;});
dom.fishingOverlay.addEventListener('pointerup',e=>{if(e.button===0)input.pointerDown=false;});
dom.iceBombButton.addEventListener('pointerdown',e=>{e.stopPropagation();input.pointerDown=false;useIceBomb();});
dom.modalClose.addEventListener('click',closeModal);
dom.modalLayer.addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});
document.querySelectorAll('[data-panel]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.panel;if(id==='inventoryPanel')openInventory();if(id==='codexPanel')openCodex();if(id==='equipmentPanel')openEquipment();if(id==='aquariumStatusPanel')openAquariumStatus();
}));
dom.resetButton.addEventListener('click',()=>{
  if(!confirm('낚시 아쿠아리움의 저장 데이터를 초기화할까요?'))return;localStorage.removeItem(CONFIG.saveKey);state=defaultState();state.weather=chooseWeather();saveGame();showToast('저장 데이터를 초기화했습니다.');
});
window.addEventListener('beforeunload',saveGame);

// ============================================================
// Boot and fixed timestep loop.
// ============================================================
loadGame();state.weather=state.weather||chooseWeather();refreshHud();showToast('연못 마을 · WASD 이동 / 좌클릭 상호작용');
let last=performance.now(),acc=0;
function frame(now){
  const delta=Math.min(CONFIG.maxFrameDelta,Math.max(0,(now-last)/1000));last=now;acc+=delta;let steps=0;
  while(acc>=CONFIG.fixedStep&&steps<10){fixedUpdate(CONFIG.fixedStep);acc-=CONFIG.fixedStep;steps++;}
  if(steps>=10)acc=0;render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
