/* Browser translation of Cydney Monroe's completed SDL Intro project. */
class SDLIntroGame {
  constructor(random=Math.random) { this.random=random; this.ship={x:40,y:50,w:171,h:153};this.movingRight=true;this.spinning=false;this.pendingSpins=0;this.angle=0;
    this.stars=Array.from({length:500},()=>({x:random()*1280,y:random()*720,speed:30+random()*30}));
    this.asteroids=Array.from({length:9},(_,i)=>({x:1300+i*300,y:random()*550,w:180,h:172,speed:80+random()*270,texture:Math.floor(random()*4),touching:false}));
  }
  update(dt,keys={}) { const r=this.random,s=this.ship;
    for(const star of this.stars){star.x+=star.speed*dt;star.y+=star.speed*dt;if(star.x>=1280||star.y>=720){if(r()<.5){star.x=0;star.y=r()*720;}else{star.y=0;star.x=r()*1280;}}}
    for(const a of this.asteroids){a.x-=a.speed*dt;if(a.x+a.w<=0){a.x=1280+r()*200;a.y=r()*550;a.speed=80+r()*270;}}
    if(keys.w)s.y-=180*dt;if(keys.s)s.y+=180*dt;
    // Original: 1 pixel/rendered frame. Normalize to 60 pixels/second.
    s.x+=(this.movingRight?60:-60)*dt;
    if(s.x+s.w>=1280){s.x=1280-s.w;this.movingRight=false;}if(s.x<=0){s.x=0;this.movingRight=true;}
    s.y=Math.max(0,Math.min(720-s.h,s.y));
    for(const a of this.asteroids){const touching=s.x<a.x+a.w&&s.x+s.w>a.x&&s.y<a.y+a.h&&s.y+s.h>a.y;if(touching&&!a.touching)this.pendingSpins++;a.touching=touching;}
    if(!this.spinning&&this.pendingSpins>0){this.spinning=true;this.pendingSpins--;this.angle=0;}
    if(this.spinning){this.angle+=720*dt;if(this.angle>=720-1e-8){this.angle=0;this.spinning=false;}}
  }
}
// Fixed simulation step decouples collision/update timing from display refresh rate.
class SDLIntroClock {
 constructor(){this.accumulator=0;this.step=1/120;}
 reset(){this.accumulator=0;}
 advance(seconds,update){this.accumulator+=Math.max(0,Math.min(seconds,.1));while(this.accumulator+1e-10>=this.step){update(this.step);this.accumulator-=this.step;}}
}
if(typeof module!=='undefined')module.exports={SDLIntroGame,SDLIntroClock};
