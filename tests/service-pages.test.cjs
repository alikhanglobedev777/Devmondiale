const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const routes = [
  'services/',
  'services/ai-automation/',
  'services/erp-development/',
  'services/web-development/',
  'services/mobile-app-development/',
  'services/ui-ux-design/'
];
function page(route) { return fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'); }
function titleAndHeading(html) {
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta\b[^>]*\bname="description"[^>]*>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'one primary heading per page');
}
function hrefs(html) { return [...html.matchAll(/\bhref="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&')); }
function idSet(html) { return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])); }
test('homepage has navigation to the service hub and all four development pages', () => {
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  titleAndHeading(html);
  for (const route of routes) assert.ok(hrefs(html).includes('./' + route), `${route} linked from homepage`);
  assert.doesNotMatch(html, /digital growth|Brand & Digital Growth/i);
  assert.match(html, /HelioHR/);
  assert.match(html, /CargoPro/);
});
test('all six service routes have unique page titles, descriptions and H1s', () => {
  const titles = new Set();
  for (const route of routes) {
    const html = page(route);
    titleAndHeading(html);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title), `${route} has a unique title`);
    titles.add(title);
    assert.match(html, /<main id="main">/);
    assert.match(html, /aria-label="Breadcrumb"/);
  }
});
test('service pages include local stylesheet and navigable local links', () => {
  const files = ['index.html', ...routes.map(route => route+'index.html')];
  for (const file of files) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    for (const href of hrefs(html)) {
      if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(href)) continue;
      const [relative, frag] = href.split('#');
      let target = relative ? path.resolve(root, path.dirname(file), decodeURIComponent(relative)) : path.resolve(root,file);
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target,'index.html');
      assert.ok(fs.existsSync(target), `${file}: broken link ${href}`);
      if (frag) assert.ok(idSet(fs.readFileSync(target,'utf8')).has(decodeURIComponent(frag)), `${file}: missing anchor ${href}`);
    }
  }
});
test('service pages have practical deliverables, FAQs and related links', () => {
  for (const route of routes.slice(1)) {
    const html = page(route);
    assert.ok((html.match(/class="info-card"/g) || []).length>=6);
    assert.ok((html.match(/<details>/g) || []).length>=3);
    assert.ok((html.match(/class="service-link"/g) || []).length>=3);
    assert.match(html, /business@devmondiale.com/);
  }
});
