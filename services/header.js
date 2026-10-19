/* Lightweight responsive navigation shared by all service pages. */
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileNav');
  if (!header || !toggle || !menu) return;

  function setOpen(open) {
    menu.hidden = !open;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 920 && !menu.hidden) setOpen(false);
  });
})();
