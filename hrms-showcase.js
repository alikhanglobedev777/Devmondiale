/* HelioHR gallery: small, accessible, and separate from the CargoPro slider. */
(()=>{
  'use strict';
  const root=document.querySelector('[data-hrms-gallery]');
  if(!root)return;
  const tabs=[...root.querySelectorAll('[role="tab"]')];
  const panels=tabs.map(tab=>document.getElementById(tab.getAttribute('aria-controls')));
  if(!tabs.length||panels.some(panel=>!panel))return;
  function select(index,focus){
    tabs.forEach((tab,i)=>{
      const selected=i===index;
      tab.classList.toggle('is-active',selected);
      tab.setAttribute('aria-selected',String(selected));
      tab.tabIndex=selected?0:-1;
      panels[i].hidden=!selected;
    });
    const viewport=panels[index].querySelector('.hrms-image-window');
    if(viewport)viewport.scrollTop=0;
    if(focus)tabs[index].focus({preventScroll:true});
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i,false));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();
      select(next,true);
    });
  });
})();
