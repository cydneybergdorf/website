'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),statusLine=document.getElementById('status');
const embedded=new URLSearchParams(location.search).has('embed');if(embedded)document.body.classList.add('embedded');
let game=new SDLIntroGame(),clock=new SDLIntroClock(),keys={},state='loading',last=null,assets={},parentVisible=true;
function overlay(text){ctx.fillStyle='rgba(8,13,24,.72)';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#eef0fa';ctx.textAlign='center';ctx.font='24px monospace';ctx.fillText(text,640,360);}
function draw(){ctx.fillStyle='rgb(25,35,70)';ctx.fillRect(0,0,1280,720);if(!assets.background){overlay(state==='error'?'Artwork could not be loaded.':'Loading…');return;}
 ctx.drawImage(assets.background,0,0,1280,720);ctx.fillStyle='white';for(const s of game.stars)ctx.fillRect(s.x,s.y,1,1);
 for(const a of game.asteroids)ctx.drawImage(assets['rock'+(a.texture+1)],a.x,a.y,a.w,a.h);
 const s=game.ship;ctx.save();ctx.translate(s.x+s.w/2,s.y+s.h/2);if(game.spinning)ctx.rotate(game.angle*Math.PI/180);ctx.drawImage(assets.ship,-s.w/2,-s.h/2,s.w,s.h);ctx.restore();
 if(state==='ready')overlay('Click here or press Enter to play');if(state==='paused')overlay('Paused — click here or press Enter');if(state==='ended')overlay('Game ended — press Enter to restart');
}
function pause(){keys={};last=null;clock.reset();if(state==='running'){state='paused';statusLine.textContent='Paused. Click the game or press Enter to continue.';}draw();}
function start(){if(state==='loading'||state==='error'||!parentVisible||document.hidden)return;if(state==='ended')game=new SDLIntroGame();state='running';keys={};last=null;clock.reset();statusLine.textContent='W: up · S: down · Esc: end';canvas.focus({preventScroll:true});draw();}
canvas.addEventListener('pointerdown',()=>{canvas.focus({preventScroll:true});if(state==='ready'||state==='paused')start();});
canvas.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();if(state==='running'||state==='paused'){state='ended';keys={};last=null;statusLine.textContent='Game ended. Press Enter to restart.';draw();}return;}if(k==='enter'){e.preventDefault();if(state!=='running')start();return;}if(k==='w'||k==='s'){e.preventDefault();if(state==='running')keys[k]=true;}});
window.addEventListener('keyup',e=>{delete keys[e.key.toLowerCase()];});window.addEventListener('blur',pause);canvas.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='sdl-intro-visibility')return;parentVisible=!!e.data.visible;if(!parentVisible)pause();});
function frame(timestamp){if(state==='running'){if(last!==null)clock.advance((timestamp-last)/1000,dt=>game.update(dt,keys));last=timestamp;draw();}else last=null;requestAnimationFrame(frame);}
function reportHeight(){if(embedded)parent.postMessage({type:'school-game-height',height:Math.ceil(document.querySelector('main').getBoundingClientRect().height)+2},'*');}
new ResizeObserver(reportHeight).observe(document.querySelector('main'));
Promise.all(['background','ship','rock1','rock2','rock3','rock4'].map(name=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve([name,image]);image.onerror=()=>reject(new Error(name));image.src='sdl-intro-assets/'+name+'.png';}))).then(images=>{assets=Object.fromEntries(images);state='ready';statusLine.textContent='Click the game to play · W: up · S: down · Esc: end';draw();reportHeight();}).catch(()=>{state='error';statusLine.textContent='Artwork could not be loaded. Reload to try again.';draw();});
draw();requestAnimationFrame(frame);
