const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../devmondiale-card-touch.js'), 'utf8');
function setup({touch = true, reduced = false} = {}) {
  const listeners = new Map();
  const timers = new Map();
  const options = [];
  const listen = (type, callback, settings) => {
    listeners.set(type, callback);
    options.push({type, settings});
  };
  const cards = ['service', 'secondary', 'contact'].map(kind => {
    const classes = new Set();
    const properties = new Map();
    return {
      kind, classes, properties,
      classList: {add: name => classes.add(name), remove: name => classes.delete(name)},
      style: {setProperty: (name, value) => properties.set(name, value)},
      getBoundingClientRect: () => ({left:0, top:0, width:300, height:240}),
      closest: selector => selector === '.dm-touch-card' ? cards.find(card => card.kind === kind) : null,
    };
  });
  const media = matches => ({matches, addEventListener() {}});
  const document = {
    querySelectorAll: () => cards,
    createElement: () => ({}),
    head: {appendChild() {}},
    addEventListener: listen,
  };
  let timerId = 0;
  const window = {
    matchMedia: query => media(query.includes('reduced-motion') ? reduced : touch),
    addEventListener: listen,
    setTimeout: callback => {timers.set(++timerId, callback); return timerId;},
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(source, {document, window});
  const dispatch = (type, overrides = {}) => listeners.get(type)?.({
    target:cards[0], pointerType:'touch', pointerId:1, isPrimary:true,
    clientX:80, clientY:100, ...overrides,
  });
  const flush = () => {for (const callback of [...timers.values()]) callback();};
  const active = card => card.classes.has('dm-touch-active');
  return {cards, dispatch, flush, active, options};
}

test('service, secondary and contact cards respond to touch and reset after release', () => {
  const env = setup();
  for (const card of env.cards) {
    env.dispatch('pointerdown', {target:card});
    assert.ok(env.active(card), card.kind);
    assert.ok(card.properties.has('--touch-x'));
    env.dispatch('pointerup');
    env.flush();
    assert.equal(env.active(card), false, card.kind);
  }
});

test('small finger movement updates feedback, scrolling gestures cancel it', () => {
  const env = setup();
  env.dispatch('pointerdown');
  const initial = env.cards[0].properties.get('--touch-x');
  env.dispatch('pointermove', {clientX:84});
  assert.notEqual(env.cards[0].properties.get('--touch-x'), initial);
  env.dispatch('pointermove', {clientY:130});
  assert.equal(env.active(env.cards[0]), false);
  env.dispatch('pointermove');
  assert.equal(env.active(env.cards[0]), false);
});

test('cancellation, scroll, loss of focus and hidden page clear touch state', () => {
  for (const event of ['pointercancel', 'scroll', 'blur', 'visibilitychange']) {
    const env = setup();
    env.dispatch('pointerdown');
    env.dispatch(event);
    assert.equal(env.active(env.cards[0]), false, event);
  }
});

test('a new touch replaces the old card and cancels its pending release', () => {
  const env = setup();
  env.dispatch('pointerdown');
  env.dispatch('pointerup');
  env.dispatch('pointerdown', {target:env.cards[2], pointerId:2});
  env.flush();
  assert.equal(env.active(env.cards[0]), false);
  assert.ok(env.active(env.cards[2]));
  env.dispatch('pointerup', {pointerId:1});
  env.flush();
  assert.ok(env.active(env.cards[2]));
});

test('desktop mouse and nonprimary touches do not activate mobile feedback', () => {
  for (const overrides of [{pointerType:'mouse'}, {isPrimary:false}]) {
    const env = setup();
    env.dispatch('pointerdown', overrides);
    assert.equal(env.active(env.cards[0]), false);
  }
  const desktop = setup({touch:false});
  desktop.dispatch('pointerdown');
  assert.equal(desktop.active(desktop.cards[0]), false);
});

test('reduced motion disables tilt; passive handlers leave links and scrolling native', () => {
  const env = setup({reduced:true});
  env.dispatch('pointerdown');
  assert.equal(env.cards[0].properties.get('--touch-rx'), '0deg');
  assert.equal(env.cards[0].properties.get('--touch-ry'), '0deg');
  for (const {type, settings} of env.options.filter(({type}) => type.startsWith('pointer') || type === 'scroll')) {
    assert.equal(settings.passive, true, type);
  }
  assert.ok(!env.options.some(({type}) => type === 'click'));
});
