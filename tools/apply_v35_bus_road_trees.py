from pathlib import Path

p = Path('prototype/v3/game-v31-source.js')
s = p.read_text(encoding='utf-8')

old_upper = "const UPPER_LAND=[[2,7],[8,5],[18,5],[24,4],[35,6],[40,10],[40,18],[36,22],[33,22],[33,26],[29,26],[29,23],[22,23],[16,25],[8,23],[3,19]];"
new_upper = "const UPPER_LAND=[[0,9],[2,5],[8,3],[17,3],[24,2],[34,4],[40,7],[42,11],[41,18],[36,22],[33,22],[33,26],[29,26],[29,23],[22,23],[16,25],[8,23],[3,19]];"
if old_upper in s:
    s = s.replace(old_upper, new_upper, 1)

old_world = '''const busShelter=rect(4*TILE,11*TILE,5*TILE,2.4*TILE);
const rocks=[rect(20*TILE,55*TILE,1.5*TILE,1.3*TILE),rect(96*TILE,60*TILE,1.7*TILE,1.5*TILE),rect(42*TILE,66*TILE,1.3*TILE,1.2*TILE),rect(89*TILE,67*TILE,1.5*TILE,1.2*TILE),rect(103*TILE,39*TILE,1.5*TILE,1.4*TILE)];
const pathTiles=new Set();
const addPathTile=(x,y)=>pathTiles.add(`${x},${y}`);
function addH(x1,x2,y,w=3){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let o=-Math.floor(w/2);o<=Math.floor(w/2);o++)addPathTile(x,y+o)}
function addV(y1,y2,x,w=3){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let o=-Math.floor(w/2);o<=Math.floor(w/2);o++)addPathTile(x+o,y)}
addH(7,27,15,3);addV(15,21,27,3);addH(27,31,21,3);addV(21,36,31,2);
addV(35,40,31,3);addH(18,101,40,3);addV(40,54,30,3);addH(18,45,54,3);addV(54,64,30,3);addH(30,45,64,3);addV(40,58,99,3);addH(92,101,58,3);'''
new_world = '''const busShelter=rect(4*TILE,11*TILE,5*TILE,2.4*TILE);
const rocks=[rect(20*TILE,55*TILE,1.5*TILE,1.3*TILE),rect(96*TILE,60*TILE,1.7*TILE,1.5*TILE),rect(42*TILE,66*TILE,1.3*TILE,1.2*TILE),rect(89*TILE,67*TILE,1.5*TILE,1.2*TILE),rect(103*TILE,39*TILE,1.5*TILE,1.4*TILE)];
const roadTiles=new Set(),pathTiles=new Set();
const addRoadTile=(x,y)=>roadTiles.add(`${x},${y}`),addPathTile=(x,y)=>pathTiles.add(`${x},${y}`);
function addRoadH(x1,x2,y,w=2){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let o=0;o<w;o++)addRoadTile(x,y+o)}
function addH(x1,x2,y,w=3){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let o=-Math.floor(w/2);o<=Math.floor(w/2);o++)addPathTile(x,y+o)}
function addV(y1,y2,x,w=3){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let o=-Math.floor(w/2);o<=Math.floor(w/2);o++)addPathTile(x+o,y)}
// Rural road above the bus stop. It bends by grid cells so it still belongs to the tile map.
addRoadH(0,12,8,2);addRoadH(12,16,7,2);addRoadH(16,22,6,2);addRoadH(22,34,5,2);addRoadH(34,40,6,2);addRoadH(4,10,10,1);
// Upper walking route: bus stop -> aquarium entrance -> narrow stair descent.
addV(14,18,7,3);addH(7,23,18,3);addV(16,18,23,3);addH(23,31,20,3);addV(20,36,31,2);
// Lower village routes, all aligned to tile coordinates.
addV(35,40,31,3);addH(18,101,40,3);addV(40,54,30,3);addH(18,45,54,3);addV(54,64,30,3);addH(30,45,64,3);addV(40,58,99,3);addH(92,101,58,3);
const conifers=[
 {tx:26.0,ty:23.7,s:1.04},{tx:26.2,ty:25.6,s:.92},{tx:26.0,ty:27.7,s:1.12},{tx:26.2,ty:29.8,s:.96},{tx:26.1,ty:31.8,s:1.08},{tx:26.4,ty:33.6,s:.92},
 {tx:35.8,ty:23.8,s:1.08},{tx:35.6,ty:25.8,s:.94},{tx:35.8,ty:27.8,s:1.12},{tx:35.5,ty:29.9,s:.9},{tx:35.8,ty:31.9,s:1.05},{tx:35.4,ty:33.7,s:.94},
 {tx:24.7,ty:26.8,s:.84},{tx:37.0,ty:26.9,s:.86},{tx:24.9,ty:30.9,s:.88},{tx:36.9,ty:31.0,s:.88}
];
function nearConifer(x,y,r=10){return conifers.some(t=>dist(x,y,t.tx*TILE,t.ty*TILE)<r+14*t.s)}'''
if old_world not in s:
    raise SystemExit('world/path block not found')
s = s.replace(old_world, new_world, 1)

old_tree = "const trees=Array.from({length:62},(_,i)=>({x:(3+decoRand()*(CONFIG.villageCols-6))*TILE,y:(5+decoRand()*(CONFIG.villageRows-7))*TILE,blossom:i%3!==0,s:.85+(i%5)*.05})).filter(t=>pondNormRaw(t.x,t.y)>1.12&&!buildings.some(b=>rectContains(tileRect(b),t.x,t.y,50))&&!pathTiles.has(`${Math.floor(t.x/TILE)},${Math.floor(t.y/TILE)}`));"
new_tree = "const trees=Array.from({length:62},(_,i)=>({x:(3+decoRand()*(CONFIG.villageCols-6))*TILE,y:(5+decoRand()*(CONFIG.villageRows-7))*TILE,blossom:i%3!==0,s:.85+(i%5)*.05})).filter(t=>pondNormRaw(t.x,t.y)>1.12&&!buildings.some(b=>rectContains(tileRect(b),t.x,t.y,50))&&!pathTiles.has(`${Math.floor(t.x/TILE)},${Math.floor(t.y/TILE)}`)&&!roadTiles.has(`${Math.floor(t.x/TILE)},${Math.floor(t.y/TILE)}`));"
if old_tree in s:
    s = s.replace(old_tree, new_tree, 1)

old_solid = "if(buildings.some(b=>circleRectHit(x,y,r,tileRect(b))))return true;if(rocks.some(o=>circleRectHit(x,y,r,o)))return true;if(circleRectHit(x,y,r,busShelter))return true;return false}"
new_solid = "if(buildings.some(b=>circleRectHit(x,y,r,tileRect(b))))return true;if(rocks.some(o=>circleRectHit(x,y,r,o)))return true;if(nearConifer(x,y,r))return true;if(circleRectHit(x,y,r,busShelter))return true;return false}"
if old_solid not in s:
    raise SystemExit('solid block not found')
s = s.replace(old_solid, new_solid, 1)

old_npc = "if(buildings.some(b=>rectContains(tileRect(b),x,y)))return true;if(rocks.some(r=>rectContains(r,x,y)))return true;if(rectContains(busShelter,x,y))return true;return false}"
new_npc = "if(buildings.some(b=>rectContains(tileRect(b),x,y)))return true;if(rocks.some(r=>rectContains(r,x,y)))return true;if(nearConifer(x,y,6))return true;if(rectContains(busShelter,x,y))return true;return false}"
if old_npc not in s:
    raise SystemExit('npc blocked block not found')
s = s.replace(old_npc, new_npc, 1)

render_helpers = r'''function drawRoadTiles(){
  ctx.save();ctx.translate(-camera.x,-camera.y);
  for(const key of roadTiles){const[tx,ty]=key.split(',').map(Number),x=tx*TILE,y=ty*TILE;if(!visible(rect(x,y,TILE,TILE),40))continue;
    ctx.fillStyle='#9b8a70';ctx.fillRect(x-2,y-2,TILE+4,TILE+4);
    ctx.fillStyle=((tx+ty)%4===0)?'#555c5c':'#505758';ctx.fillRect(x,y,TILE,TILE);
    ctx.fillStyle='rgba(221,226,216,.10)';ctx.fillRect(x+3,y+3,TILE-6,2);
    if((ty===8&&tx%3===1)||(ty===7&&tx%3===0)||(ty===6&&tx%3===2)||(ty===5&&tx%3===1)){ctx.fillStyle='#d5c77f';ctx.fillRect(x+5,y+TILE/2-1,TILE-10,3)}
  }
  ctx.restore();
}
function drawConifer(t){
  const x=t.tx*TILE-camera.x,y=t.ty*TILE-camera.y,s=t.s||1;if(x<-90||x>VIEW.w+90||y<-130||y>VIEW.h+100)return;
  ctx.save();ctx.fillStyle='rgba(20,29,25,.30)';ctx.beginPath();ctx.ellipse(x+8*s,y+27*s,20*s,7*s,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5a3f2e';ctx.fillRect(x-3*s,y+2*s,6*s,30*s);
  for(const [dy,w,c] of [[-42,18,'#35684f'],[-29,24,'#2e5d47'],[-14,30,'#274f3c']]){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y+dy*s);ctx.lineTo(x-w*s,y+(dy+34)*s);ctx.lineTo(x+w*s,y+(dy+34)*s);ctx.closePath();ctx.fill()}
  ctx.fillStyle='rgba(136,166,132,.23)';ctx.fillRect(x-5*s,y-26*s,3*s,25*s);ctx.restore();
}
'''
if 'function drawRoadTiles()' not in s:
    anchor = 'function drawVillageGround(){'
    if anchor not in s:
        raise SystemExit('drawVillageGround anchor not found')
    s = s.replace(anchor, render_helpers + anchor, 1)

old_ground = "drawLandMass(UPPER_LAND,'#77a56b','#4c6548',26);\n  drawLandMass(LOWER_LAND,'#86b474','#577451',16);\n  drawNarrowStairs();"
new_ground = "drawLandMass(UPPER_LAND,'#77a56b','#4c6548',26);\n  drawLandMass(LOWER_LAND,'#86b474','#577451',16);\n  drawRoadTiles();\n  drawNarrowStairs();"
if old_ground not in s:
    raise SystemExit('ground draw block not found')
s = s.replace(old_ground, new_ground, 1)

old_entities = "for(const t of trees)list.push({y:t.y+40,fn:()=>drawTree(t)});\n  for(const n of npcs)"
new_entities = "for(const t of trees)list.push({y:t.y+40,fn:()=>drawTree(t)});\n  for(const t of conifers)list.push({y:t.ty*TILE+38*t.s,fn:()=>drawConifer(t)});\n  for(const n of npcs)"
if old_entities not in s:
    raise SystemExit('entity draw block not found')
s = s.replace(old_entities, new_entities, 1)

p.write_text(s, encoding='utf-8')
print('patched', p)
