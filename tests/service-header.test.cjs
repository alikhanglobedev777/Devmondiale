const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const servicePages = [
  'services/index.html',
  'services/ai-automation/index.html',
  'services/erp-development/index.html',
  'services/web-development/index.html',
  'services/mobile-app-development/index.html',
  'services/ui-ux-design/index.html',
];
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const mainNav = homepage.match(/<nav\s+aria-label="Main navigation"\s+class="nav-links"[^>]*>([\s\S]*?)<\/nav>/);
assert.ok(mainNav, 'homepage navigation must exist');
const textOfLinks = content => [...content.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
  .map(match => match[1].replace(/<[^>]*>/g, '').trim());
const expectedLabels = textOfLinks(mainNav[1]);

test('all service pages use the homepage navigation labels and order', () => {
  for (const name of servicePages) {
    const source = fs.readFileSync(path.join(root, name), 'utf8');
    const nav = source.match(/<nav\s+class="header-nav"\s+aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${name} missing desktop navigation`);
    assert.deepEqual(textOfLinks(nav[1]), expectedLabels, `${name} has different links`);
    assert.match(source, /class="header-actions"/, `${name} missing separate action area`);
    assert.match(source, /id="menuToggle"/, `${name} missing mobile menu toggle`);
    assert.match(source, /id="mobileNav"[^>]*hidden/, `${name} mobile menu initially open`);
  }
});

test('header links and shared mobile scripts resolve on every service page', () => {
  for (const name of servicePages) {
    const absolute = path.join(root, name);
    const source = fs.readFileSync(absolute, 'utf8');
    const header = source.match(/<header class="site-header">([\s\S]*?)<\/header>/);
    assert.ok(header, `${name} missing header`);
    const hrefs = [...header[1].matchAll(/href="([^"]+)"/g)].map(x => x[1]);
    for (const href of hrefs) {
      const target = path.resolve(path.dirname(absolute), href.split('#')[0] || 'index.html');
      assert.ok(fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html'))), `${name}: unresolved ${href}`);
    }
    const script = source.match(/<script defer src="([^"]*header\.js)"><\/script>/);
    assert.ok(script, `${name} missing header script`);
    assert.ok(fs.existsSync(path.resolve(path.dirname(absolute), script[1])), `${name}: script does not resolve`);
  }
});
