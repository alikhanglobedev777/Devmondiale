/* Touch feedback for service and contact cards. Desktop hover stays in the page CSS. */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.service-card, .secondary-card, #contact .dm-contact-card')];
  const touchUI = window.matchMedia('(hover: none), (pointer: coarse)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.id = 'devmondiale-card-touch';
  style.textContent = `
@media (hover:none), (pointer:coarse) {
  /* Replace sticky browser hover and continuous card sway with a short touch response. */
  .dm-touch-card.fx-tilt,
  #contact .dm-contact-card.reveal.visible {
    transform:none!important;animation:none!important;will-change:auto;
    box-shadow:0 12px 30px rgba(0,54,64,.10);
    border-color:rgba(0,139,155,.24);
  }
  .dm-touch-card .service-icon {animation:none!important}
  .dm-touch-card.service-card::after,
  #contact .dm-touch-card::after {display:none}
  .dm-touch-card.secondary-card:not(:nth-child(2)):hover {background:#FFFFFF;color:#050708}
  .dm-touch-card.secondary-card:not(:nth-child(2)):hover h3,
  .dm-touch-card.secondary-card:not(:nth-child(2)):hover p {color:#050708}
  .dm-touch-card.secondary-card:not(:nth-child(2)):hover>span {color:#008B9B}
  #contact .dm-touch-card:is(:hover,:focus-visible) .dm-contact-icon,
  #contact .dm-touch-card:is(:hover,:focus-visible) .dm-contact-sub span {transform:none}
  .dm-touch-card {position:relative;isolation:isolate}
  .dm-touch-card::before,
  #contact .dm-touch-card::before {
    content:"";position:absolute;inset:0;z-index:0;border-radius:inherit;
    pointer-events:none;background:radial-gradient(circle at var(--touch-x,50%) var(--touch-y,50%),rgba(0,139,155,.13),transparent 65%);
    opacity:0;transition:opacity .22s ease;
  }
  .dm-touch-card.service-card:first-child::before,
  .dm-touch-card.secondary-card:nth-child(2)::before {
    background:radial-gradient(circle at var(--touch-x,50%) var(--touch-y,50%),rgba(255,255,255,.16),transparent 65%);
  }
  #contact .dm-touch-card>* {position:relative;z-index:1}
  .dm-touch-card:not(.dm-touch-active)::before,
  #contact .dm-touch-card:not(.dm-touch-active)::before {opacity:0}
  .dm-touch-card.dm-touch-active::before,
  #contact .dm-touch-card.dm-touch-active::before {opacity:1}
  .dm-touch-card.fx-tilt.dm-touch-active,
  #contact .dm-contact-card.reveal.visible.dm-touch-active {
    transform:perspective(1000px) rotateX(var(--touch-rx,0deg)) rotateY(var(--touch-ry,0deg)) translateY(-3px)!important;
    box-shadow:0 16px 35px rgba(0,54,64,.16);
  }
}
@media (prefers-reduced-motion:reduce) {
  .dm-touch-card.fx-tilt.dm-touch-active,
  #contact .dm-contact-card.reveal.visible.dm-touch-active {transform:none!important}
  .dm-touch-card::before,#contact .dm-touch-card::before {transition:none!important}
}
`;
  document.head.appendChild(style);
  cards.forEach(card => card.classList.add('dm-touch-card'));

  let active = null;
  let releaseTimer = 0;
  const clear = () => {
    window.clearTimeout(releaseTimer);
    releaseTimer = 0;
    if (active) active.card.classList.remove('dm-touch-active');
    active = null;
  };
  const position = event => {
    if (!active) return;
    const {card, box} = active;
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    card.style.setProperty('--touch-x', `${x * 100}%`);
    card.style.setProperty('--touch-y', `${y * 100}%`);
    card.style.setProperty('--touch-rx', `${reduced.matches ? 0 : (0.5 - y) * 5}deg`);
    card.style.setProperty('--touch-ry', `${reduced.matches ? 0 : (x - 0.5) * 6}deg`);
  };
  document.addEventListener('pointerdown', event => {
    clear();
    if (!touchUI.matches || event.pointerType === 'mouse' || !event.isPrimary) return;
    const card = event.target.closest('.dm-touch-card');
    if (!card) return;
    const box = card.getBoundingClientRect();
    if (!box.width || !box.height) return;
    active = {card, box, id:event.pointerId, x:event.clientX, y:event.clientY};
    position(event);
    card.classList.add('dm-touch-active');
  }, {passive:true});
  document.addEventListener('pointermove', event => {
    if (!active || event.pointerId !== active.id) return;
    // Let vertical/horizontal gestures scroll normally instead of keeping a card pressed.
    if (Math.hypot(event.clientX - active.x, event.clientY - active.y) > 10) {
      clear();
      return;
    }
    position(event);
  }, {passive:true});
  document.addEventListener('pointerup', event => {
    if (active && event.pointerId === active.id) releaseTimer = window.setTimeout(clear, 160);
  }, {passive:true});
  document.addEventListener('pointercancel', clear, {passive:true});
  window.addEventListener('scroll', clear, {passive:true, capture:true});
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);
  touchUI.addEventListener('change', clear);
  reduced.addEventListener('change', clear);
})();
