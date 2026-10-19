/* HelioHR's three chapters use the same presentation classes as CargoPro,
   with separate selectors so CargoPro's controls remain independent. */
(()=>{
  'use strict';
  const root=document.querySelector('[data-helio-showcase]');
  if(!root)return;
  const pages=[...root.querySelectorAll('[data-helio-page]')];
  const screens=[...root.querySelectorAll('[data-helio-screen]')];
  const tabs=[...root.querySelectorAll('[data-helio-tab]')];
  const prev=root.querySelector('[data-helio-prev]');
  const next=root.querySelector('[data-helio-next]');
  const number=root.querySelector('[data-helio-number]');
  const label=root.querySelector('[data-helio-label]');
  const labels=['01 — Overview','02 — Employees','03 — Payroll'];
  if(pages.length!==3||screens.length!==3||tabs.length!==3||!prev||!next||!number||!label)return;
  let current=0;
  function select(index,focus=false){
    current=(index+tabs.length)%tabs.length;
    pages.forEach((page,i)=>{const active=i===current;page.hidden=!active;page.classList.toggle('is-active',active)});
    screens.forEach((screen,i)=>{const active=i===current;screen.hidden=!active;screen.classList.toggle('is-active',active)});
    tabs.forEach((tab,i)=>{
      const active=i===current;
      tab.classList.toggle('is-active',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
    });
    number.textContent=String(current+1).padStart(2,'0');
    label.textContent=labels[current];
    if(focus)tabs[current].focus();
  }
  prev.addEventListener('click',()=>select(current-1));
  next.addEventListener('click',()=>select(current+1));
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(i));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const dest=event.key==='Home'?0:event.key==='End'?tabs.length-1:i+(event.key==='ArrowRight'?1:-1);
      select(dest,true);
    });
  });
})();
