/* Browser port of Cydney Monroe's completed GAME140 project. */
const ITEM_NAMES=['torch','sword','berries','shield','potion','key','pickaxe'];
const ITEM_ICONS=['t','s','b','S','p','k','V'];
class DungeonGame {
 constructor(){this.rooms=JSON.parse(JSON.stringify(DUNGEON_ROOMS));this.room=0;this.x=38;this.y=13;this.health=20;this.inventory=[];this.cleared=false;this.unlocked=false;this.ended=false;this.won=false;this.message='Find a way out of the cave.';this.view='look';}
 get current(){return this.rooms[this.room];}
 near(x,y){return Math.abs(x-this.x)+Math.abs(y-this.y)<=1;}
 opening(x,y){return this.room===0&&y===18&&x>=36&&x<=39;}
 has(i){return this.inventory.includes(i);}
 move(dx,dy){if(this.ended)return;this.message='';this.view='look';const r=this.current,x=this.x+dx,y=this.y+dy;if(x<0||x>=r.width||y<0||y>=r.map.length/r.width||r.map[y*r.width+x]!==' ')return;
 if(this.opening(x,y)&&!this.cleared){this.message='Large rocks block this way.';return;}
 if(r.skeletons.some(s=>s[2]&&s[0]===x&&s[1]===y)){this.message='A skeleton blocks the way.';return;}
 const px=this.x,py=this.y;this.x=x;this.y=y;
 if(this.opening(x,y)&&this.cleared){this.won=true;this.ended=true;this.message='YOU ESCAPED! Fresh air at last. You made it out!';return;}
 const e=r.exits.find(e=>e[0]===x&&e[1]===y);
 if(e){if((this.room===3&&e[2]===5||this.room===5&&e[2]===3)&&!this.unlocked){if(!this.has(5)){this.x=px;this.y=py;this.message='The door is locked.';return;}this.unlocked=true;this.message='You unlock the door with the key.';}this.room=e[2];this.x=e[3];this.y=e[4];return;}
 this.combat(false);
 }
 canSkeletonStep(x,y){const r=this.current;return x>=0&&x<r.width&&y>=0&&y<r.map.length/r.width&&r.map[y*r.width+x]===' '&&!(x===this.x&&y===this.y)&&!r.skeletons.some(s=>s[0]===x&&s[1]===y)&&!r.items.some(i=>i[1]===x&&i[2]===y)&&!r.chests.some(c=>c[0]===x&&c[1]===y)&&!r.exits.some(e=>e[0]===x&&e[1]===y)&&!this.rooms.some(r=>r.exits.some(e=>e[2]===this.room&&e[3]===x&&e[4]===y))&&!this.opening(x,y);}
 combat(attack){if(this.ended)return;const r=this.current;if(attack){this.message='No skeleton within reach.';const s=r.skeletons.find(s=>s[2]&&s[3]>0&&Math.abs(s[0]-this.x)+Math.abs(s[1]-this.y)===1);if(s){const damage=this.has(1)?10:5;s[3]=Math.max(0,s[3]-damage);if(!s[3])s[2]=false;this.message=s[3]?`Hit skeleton for ${damage}. Skeleton health: ${s[3]}.`:'Skeleton defeated.';}}
 for(const s of r.skeletons){if(!s[2])continue;const dx=this.x-s[0],dy=this.y-s[1];if(Math.abs(dx)+Math.abs(dy)<=1)continue;const horizontal=Math.abs(dx)>=Math.abs(dy);for(const h of [horizontal,!horizontal]){if(h&&!dx||!h&&!dy)continue;const x=s[0]+(h?Math.sign(dx):0),y=s[1]+(h?0:Math.sign(dy));if(this.canSkeletonStep(x,y)){s[0]=x;s[1]=y;break;}}}
 const attackers=r.skeletons.filter(s=>s[2]&&s[3]>0&&Math.abs(s[0]-this.x)+Math.abs(s[1]-this.y)===1).length;if(attackers){const damage=attackers*(this.has(3)?3:5);this.health=Math.max(0,this.health-damage);this.message+=(this.message?' ':'')+`Skeleton damage: ${damage}.`;}
 if(!this.health){this.ended=true;this.message='GAME OVER! The skeletons overwhelm you. Your journey ends here.';}
 }
 command(text){if(this.ended)return;const [v='',...rest]=text.trim().toLowerCase().split(/\s+/),p=rest.join(' '),r=this.current;this.message='';
 if(v==='look'){this.view='look';return;}if(v==='inventory'){this.view='inventory';return;}
 if(v==='help'){this.message='look · inventory · get ITEM · use ITEM · open chest · quit';return;}
 if(v==='quit'){this.ended=true;this.message='Game ended. Restart to play again.';return;}
 if(v==='get'){const i=r.items.findIndex(i=>ITEM_NAMES[i[0]]===p&&this.near(i[1],i[2]));if(i<0){this.message='No matching item within reach.';return;}if(r.items[i][0]===2){this.message="You can't pick up a bush. Try use berries.";return;}this.inventory.push(r.items[i][0]);r.items.splice(i,1);this.message=`Picked up ${p}.`;return;}
 if(v==='open'&&p==='chest'){const c=r.chests.find(c=>this.near(c[0],c[1]));if(!c){this.message='No chest within reach.';return;}if(c[3]){this.message='This chest is already open.';return;}c[3]=true;r.items.push([c[2],c[0],c[1]]);this.message=`Chest opened. Contents: ${ITEM_NAMES[c[2]]}. Collect with get ${ITEM_NAMES[c[2]]}.`;return;}
 if(v==='use'){
 if(p==='pickaxe'){this.message=!this.has(6)?'You do not have a pickaxe.':![36,37,38,39].some(x=>this.opening(x,18)&&this.near(x,18))?'Use the pickaxe beside the blocked cave opening.':this.cleared?'The opening is already clear. Walk through to escape.':'You clear the rocks. Walk through the opening to escape.';if(this.has(6)&&[36,37,38,39].some(x=>this.opening(x,18)&&this.near(x,18)))this.cleared=true;return;}
 if(p==='potion'){if(!this.has(4))this.message='You do not have a potion.';else if(this.health===20)this.message='Health is full. Potion saved.';else{this.inventory.splice(this.inventory.indexOf(4),1);this.health=20;this.message='Potion used. Health fully restored.';}return;}
 if(p==='berries'){if(!r.items.some(i=>i[0]===2&&this.near(i[1],i[2])))this.message='No berry bush within reach.';else{const n=Math.min(3,20-this.health);this.health+=n;this.message=n?`Ate berries. Restored ${n} health.`:'Health is already full.';}return;}
 this.message='Try use potion, use berries, or use pickaxe.';return;}
 this.message='Invalid command. Try help.';
 }
 feedback(){return this.message || (this.room===0 && this.x===77 && (this.y===9||this.y===10) ? 'There is a deep, dark hole with no end in sight. You should find another way.' : '');}
 nearby(){const r=this.current;const a=r.items.filter(i=>this.near(i[1],i[2])).map(i=>ITEM_NAMES[i[0]]);a.push(...r.chests.filter(c=>this.near(c[0],c[1])).map(c=>c[3]?'open chest':'closed chest'));return a.length?'You see: '+a.join(', '):'No items or chests within reach.';}
 tiles(){const r=this.current,a=[...r.map];const put=(x,y,c)=>a[y*r.width+x]=c;for(let y=0;y<r.map.length/r.width;y++)for(let x=0;x<r.width;x++){if(a[y*r.width+x]!==' ')continue;if(this.has(0)&&x===this.x-1&&y===this.y)put(x,y,'t');if(this.has(1)&&x===this.x+1&&y===this.y)put(x,y,'s');if(this.has(3)&&x===this.x&&y===this.y-1)put(x,y,'S');}for(const c of r.chests)put(c[0],c[1],c[3]?'c':'C');for(const i of r.items)put(i[1],i[2],ITEM_ICONS[i[0]]);if(this.room===0&&!this.cleared)for(let x=36;x<=39;x++)put(x,18,'O');for(const s of r.skeletons)put(s[0],s[1],s[2]?'K':'x');put(this.x,this.y,'@');return a;}
}
if(typeof module!=='undefined')module.exports={DungeonGame,ITEM_NAMES};
