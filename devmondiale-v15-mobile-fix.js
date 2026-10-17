/** Dev Mondiale V15: CargoPro badge + mobile/desktop orbit interaction.
 * Separate enhancement file to avoid brittle patches in the large index.html.
 * Keep this file next to index.html in your Git repository.
 */
(function(){
  'use strict';
  const style=document.createElement('style');
  style.id='devmondiale-v15-mobile-fix';
  style.textContent = String.raw`/* V14: readable CargoPro tile + consistent mobile/desktop globe magnet motion */
.float-ticket{
  background:#008B9B !important;
  color:#FFFFFF !important;
  border-color:rgba(255,255,255,.5);
  text-shadow:none;
}
.float-ticket span{
  color:#FFFFFF !important;
  background:transparent !important;
}
/* A finger or mouse steers the entire orbit via the existing 3D stage;
   rings keep their original independent rotations. */
.kinetic-scene.magnet-active .orbit-stage,
.kinetic-scene.magnet-active.is-hovering .orbit-stage{
  transform:perspective(1150px)
    translate3d(var(--dm-magnet-x,0px),var(--dm-magnet-y,0px),0px)
    rotateX(var(--dm-magnet-rx,0deg)) rotateY(var(--dm-magnet-ry,0deg))
    scale(1.04) !important;
  transition:transform 90ms linear;
  will-change:transform;
}
/* Satellite motion uses CSS translate separately so it does not interrupt
   any existing transform-based keyframes or 3D floating animation. */
.kinetic-scene .about-orbit-tag,
.kinetic-scene .art-floating,
.kinetic-scene .float-chip{
  translate:var(--dm-sat-x,0px) var(--dm-sat-y,0px);
  transition:translate 90ms linear;
}
.kinetic-scene.magnet-active .about-core,
.kinetic-scene.magnet-active .art-center{
  scale:1.035;
  transition:scale .35s cubic-bezier(.18,.76,.22,1);
}
/* On touchscreens the original V9 media query forced the globe's 3D
   transform off. Restore the same GPU-composited movement on mobile. */
@media(max-width:920px),(hover:none),(pointer:coarse){
  .kinetic-scene.is-awake.is-hovering .orbit,
  .kinetic-scene.is-awake.is-hovering .orbit.two,
  .kinetic-scene.is-awake.is-hovering .ring-outer,
  .kinetic-scene.is-awake.is-hovering .ring-inner,
  .kinetic-scene.is-awake.is-hovering .about-orbit-ring{
    animation-play-state:running;
  }
  .kinetic-scene.is-awake.is-hovering .art-center,
  .kinetic-scene.is-awake.is-hovering .about-core,
  .kinetic-scene.is-awake.is-hovering .art-floating,
  .kinetic-scene.is-awake.is-hovering .about-orbit-tag,
  .kinetic-scene.is-awake.is-hovering .float-chip{
    animation-play-state:running;
  }
  .kinetic-scene.is-awake:not(.magnet-active) .orbit-stage{
    transform:perspective(1150px) rotateX(-4deg) rotateY(5deg) scale(1.015) !important;
    rotate:0 1 0 -3deg;
    animation:dmMobileOrbitBreath 6.8s ease-in-out infinite alternate;
    transform-style:preserve-3d;
  }
  .kinetic-scene.is-awake.magnet-active .orbit-stage{
    rotate:0 1 0 0deg;
    animation:none;
  }
  .kinetic-scene.is-awake .workflow-window{animation:levitate 7s ease-in-out infinite}
  .kinetic-scene.is-awake .flow-step{animation-play-state:running}
  /* Keep central globe typography readable during stronger 3D orbit motion. */
  .kinetic-scene .about-core{animation:none!important;transform:none!important;transform-style:flat}
  .kinetic-scene .about-core span,.kinetic-scene .about-core strong{animation:none!important;transform:none!important;position:relative;z-index:3}
  .kinetic-scene .about-core small{color:#FFFFFF;position:relative;z-index:3}
  /* Faster GPU compositing and fewer expensive blurred layers on phones. */
  html.motion-ready .fly-card{filter:none!important}
  .kinetic-scene .orbit-stage,.kinetic-scene .about-core,.kinetic-scene .art-center{backface-visibility:visible}
  /* Keep animations readable: avoid excessive mobile bounce and blur. */
  .kinetic-scene .about-orbit-tag,.kinetic-scene .art-floating,.kinetic-scene .float-chip{
    backface-visibility:hidden;
  }
}
@keyframes dmMobileOrbitBreath{
  from{rotate:1 1 0 -5deg}
  to{rotate:1 1 0 6deg}
}
/* Put the badge outside the CargoPro screenshot, preventing image obstruction. */
@media(max-width:920px){
  .story-visual{
    display:flex;flex-direction:column;align-items:stretch;justify-content:center;
    gap:13px;min-height:0;overflow:visible;
  }
  .story-perspective{width:100%;max-width:100%;min-width:0}
  .screen-images{height:clamp(198px,64vw,370px)}
  .story-visual .float-ticket{
    position:relative;inset:auto;right:auto;bottom:auto;
    align-self:flex-end;width:max-content;max-width:100%;
    margin:0 1px 3px 0;padding:10px 13px;
    transform:none;border-radius:14px;
    animation:dmBadgeDrift 5.5s ease-in-out infinite;
    white-space:normal;overflow-wrap:break-word;
  }
  .story-visual .float-ticket span{font-size:16px}
}
@keyframes dmBadgeDrift{
  0%,100%{translate:0 0}
  50%{translate:0 -4px}
}
@media(max-width:360px){
 .story-visual .float-ticket{font-size:9px;padding:9px 10px;letter-spacing:.055em}
 .screen-images{height:clamp(180px,67vw,255px)}
}
/* No forced animation when the visitor requests reduced movement. */
@media(prefers-reduced-motion:reduce){
  .kinetic-scene.magnet-active .orbit-stage,
  .kinetic-scene.is-awake:not(.magnet-active) .orbit-stage{
    transform:none!important;rotate:none!important;animation:none!important;
    transition:none!important;will-change:auto;
  }
  .kinetic-scene .about-orbit-tag,
  .kinetic-scene .art-floating,.kinetic-scene .float-chip{
    translate:none!important;transition:none!important;
  }
  .story-visual .float-ticket{animation:none!important;translate:none!important}
/* White foreground on CargoPro teal badge, including nested labels */
.float-ticket,.float-ticket *, .story-visual .float-ticket, .story-visual .float-ticket * {
  color:#FFFFFF!important;
}
/* Do not shrink picture when badge is moved into the normal flow */
@media(max-width:920px){
  .story-visual>.float-ticket{flex:0 0 auto;max-width:100%;line-height:1.45}
  .story-visual>.story-perspective{flex:0 0 auto}
}
`;
  document.head.appendChild(style);
})();
/* V14: Globe follows the user's finger or cursor, without blocking scrolling. */
(()=>{
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;
  const touchUI=window.matchMedia('(hover:none), (pointer:coarse), (max-width:920px)');
  const scenes=[...document.querySelectorAll('.kinetic-scene')];
  if(!scenes.length)return;

  // Touch devices have no hover: activate the existing ring/satellite animations
  // while the illustration is visible, pausing them when it leaves the viewport.
  if(touchUI.matches){
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        for(const entry of entries){
          entry.target.classList.toggle('is-hovering',entry.isIntersecting);
          entry.target.classList.toggle('is-awake',entry.isIntersecting);
        }
      },{threshold:.08,rootMargin:'65px 0px 65px 0px'});
      scenes.forEach(scene=>observer.observe(scene));
    } else scenes.forEach(scene=>scene.classList.add('is-awake','is-hovering'));
  }

  scenes.forEach(scene=>{
    const stage=scene.querySelector('.orbit-stage');
    if(!stage)return;
    let frame=0, nextX=0, nextY=0, smoothX=0, smoothY=0, settling=0, interacting=false;
    const ease=touchUI.matches?0.22:0.30;
    const update=()=>{
      frame=0;
      smoothX += (nextX-smoothX)*ease;
      smoothY += (nextY-smoothY)*ease;
      stage.style.setProperty('--dm-magnet-x',(smoothX*12).toFixed(2)+'px');
      stage.style.setProperty('--dm-magnet-y',(smoothY*12).toFixed(2)+'px');
      stage.style.setProperty('--dm-magnet-rx',(-smoothY*14).toFixed(2)+'deg');
      stage.style.setProperty('--dm-magnet-ry',(smoothX*18).toFixed(2)+'deg');
      scene.style.setProperty('--dm-sat-x',(smoothX*14).toFixed(2)+'px');
      scene.style.setProperty('--dm-sat-y',(smoothY*14).toFixed(2)+'px');
      if(Math.abs(nextX-smoothX)>0.004 || Math.abs(nextY-smoothY)>0.004){
        frame=requestAnimationFrame(update);
      }
    };
    const move=(clientX,clientY)=>{
      const box=scene.getBoundingClientRect();
      if(!box.width||!box.height)return;
      // Clamp at the illustration edges so badges cannot fly outside the page.
      nextX=Math.max(-1,Math.min(1,(clientX-box.left-box.width/2)/(box.width/2)));
      nextY=Math.max(-1,Math.min(1,(clientY-box.top-box.height/2)/(box.height/2)));
      if(settling)clearTimeout(settling);
      scene.classList.add('magnet-active','is-hovering');
      interacting=true;
      if(!frame)frame=requestAnimationFrame(update);
    };
    const release=()=>{
      if(!interacting)return;
      interacting=false;nextX=nextY=0;
      if(!frame)frame=requestAnimationFrame(update);
      // Let the orb glide back rather than snapping when the finger lifts.
      settling=window.setTimeout(()=>scene.classList.remove('magnet-active'),640);
    };
    scene.addEventListener('pointermove',event=>{
      if(event.pointerType==='mouse'||event.pointerType==='pen')move(event.clientX,event.clientY);
    },{passive:true});
    scene.addEventListener('pointerleave',release,{passive:true});
    scene.addEventListener('touchstart',event=>{
      if(event.touches.length===1)move(event.touches[0].clientX,event.touches[0].clientY);
    },{passive:true});
    scene.addEventListener('touchmove',event=>{
      if(event.touches.length===1)move(event.touches[0].clientX,event.touches[0].clientY);
    },{passive:true});
    scene.addEventListener('touchend',release,{passive:true});
    scene.addEventListener('touchcancel',release,{passive:true});
    window.addEventListener('blur',release,{passive:true});
  });
})();
