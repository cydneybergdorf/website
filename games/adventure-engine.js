class AdventureGame{
 constructor(){this.rooms=JSON.parse(JSON.stringify(ADVENTURE_ROOMS));this.room=0;this.inventory=[];this.ended=false;this.won=false;}
 look(){const r=this.rooms[this.room];return r.name+'\n\n'+r.description+(r.items.length?'\n\n'+r.items.map(i=>'You also see a '+i.name+'!').join('\n'):'');}
 command(text){if(this.ended)return 'Game ended. Restart to play again.';const [v='',p='']=text.trim().toLowerCase().split(/\s+/),r=this.rooms[this.room];if(!v)return 'Enter a command. Try help.';
 if(v==='look')return this.look();if(v==='help')return 'look · go north/south/east/west · get ITEM · inspect ITEM · check inventory · fix ship · quit';
 if(v==='inventory'||v==='check'&&p==='inventory')return 'INVENTORY:\n'+(this.inventory.map(i=>i.name).join('\n')||'Your inventory is empty.');
 if(v==='go'){if(!(p in r.exits))return "You can't go that way.";this.room=r.exits[p];return 'You have arrived at: '+this.rooms[this.room].name+'\n\n'+this.look();}
 if(v==='get'){const i=r.items.findIndex(i=>i.name===p);if(i<0)return "You don't see that item here.";this.inventory.push(r.items.splice(i,1)[0]);return 'You picked up the '+p+'.';}
 if(v==='inspect'){const item=[...r.items,...this.inventory].find(i=>i.name===p);return item?item.description:"You don't see that item here, and you aren't carrying it. Maybe it's somewhere else...";}
 if(v==='fix'&&p==='ship'){if(this.room!==0)return "Your ship isn't here... You should find it first.";if(this.inventory.length<5)return 'You are still missing ship parts. You need 5 parts total to fix the ship.';this.ended=true;this.won=true;return 'You install the recovered parts and repair the ship.\nThe engines roar to life, and you escape planet Veor.\n\nYOU WIN!';}
 if(v==='quit'){this.ended=true;return 'Quitting... Restart to play again.';}return 'You tried your best, but failed miserably. Enter "help" for a list of things that might work.';
 }
}
if(typeof module!=='undefined')module.exports={AdventureGame};
