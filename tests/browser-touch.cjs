const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const assert = require('node:assert/strict');
const os = require('node:os');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const root = path.resolve(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'devmondiale-touch-'));
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  fs.readFile(file, (err, data) => {
    if (err) {res.writeHead(404).end(); return;}
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html');
    res.end(data);
  });
});
let chrome, ws, send;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
  ], {windowsHide:true, stdio:['ignore', 'ignore', 'pipe']});
  let errors = '';
  chrome.stderr.on('data', data => {errors = (errors + data).slice(-3000);});
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i=0; i<100 && !fs.existsSync(portFile); i++) await wait(100);
  if (!fs.existsSync(portFile)) throw new Error('Chrome did not start: ' + errors);
  const debugPort = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const pages = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list', {signal:AbortSignal.timeout(10000)})).json();
  ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.id) {const item = pending.get(data.id); pending.delete(data.id); data.error ? item.reject(data.error) : item.resolve(data.result);}
  });
  send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve,reject}); ws.send(JSON.stringify({id,method,params}));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send('Emulation.setDeviceMetricsOverride', {width:390, height:844, deviceScaleFactor:1, mobile:true});
  await send('Emulation.setTouchEmulationEnabled', {enabled:true, maxTouchPoints:5});
  await send('Network.enable');
  await send('Network.setBlockedURLs', {urls:['https://*', 'http://fonts.*']});
  await send('Page.navigate', {url:'http://127.0.0.1:' + server.address().port});
  await wait(2500);
  assert.equal(await evaluate(`document.querySelectorAll('.dm-touch-card').length`), 11);
  for (const selector of ['.service-card:nth-child(1)', '.service-card:nth-child(2)', '.service-card:nth-child(3)', '.secondary-card:nth-child(3)', '#contact .dm-contact-card:nth-child(1)', '#contact .dm-contact-card:nth-child(2)', '#contact .dm-contact-card:nth-child(3)', '#contact .dm-contact-card:nth-child(4)']) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await wait(1500);
    // Fly-in transforms change the initial bounds; align again after the entrance settles.
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await wait(300);
    const point = await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width*.65,y:r.top+r.height*.6}})()`);
    const state = () => evaluate(`(()=>{const c=document.querySelector(${JSON.stringify(selector)}),s=getComputedStyle(c),p=getComputedStyle(c,'::before');return {active:c.classList.contains('dm-touch-active'),transform:s.transform,opacity:Number(p.opacity),x:c.style.getPropertyValue('--touch-x'),scrollY}})()`);
    const before = await state();
    await send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{...point,id:1}]});
    await wait(300);
    const held = await state();
    assert.ok(held.active && held.opacity > .9 && held.transform !== 'none', selector + ': held touch must be visible ' + JSON.stringify({held,point,hit:await evaluate(`document.elementFromPoint(${point.x},${point.y})?.outerHTML.slice(0,200)`)}));
    for (let step=1; step<=6; step++) {
      await send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:point.x+step*3,y:point.y-step*10,id:1}]});
      await wait(40);
    }
    await wait(100);
    const moved = await state();
    assert.ok(moved.active && moved.opacity > .9, selector + ': touch feedback must survive scrolling');
    assert.notEqual(moved.x, held.x, selector + ': highlight follows finger');
    assert.ok(moved.scrollY > before.scrollY, selector + ': native page scrolling must remain enabled');
    await send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await wait(1100);
    const released = await state();
    assert.ok(!released.active && released.opacity === 0, selector + ': release must clear feedback');
    console.log('PASS touch, drag, native scroll and release:', selector);
  }
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate(`document.querySelector('#contact .dm-contact-card').scrollIntoView({block:'center',behavior:'instant'})`);
  await wait(500);
  const point = await evaluate(`(()=>{const r=document.querySelector('#contact .dm-contact-card').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  await send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{...point,id:1}]});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#contact .dm-contact-card')).transform`), 'none');
  await send('Input.dispatchTouchEvent', {type:'touchCancel',touchPoints:[]});
  console.log('PASS reduced motion');
  await send('Emulation.setEmulatedMedia', {features:[]});
  await send('Emulation.setTouchEmulationEnabled', {enabled:false});
  await send('Emulation.setDeviceMetricsOverride', {width:1366,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.reload');
  await wait(1800);
  await evaluate(`document.querySelector('#contact .dm-contact-card').scrollIntoView({block:'center',behavior:'instant'})`);
  await wait(1000);
  const mousePoint = await evaluate(`(()=>{const r=document.querySelector('#contact .dm-contact-card').getBoundingClientRect();return {x:r.left+r.width*.65,y:r.top+r.height*.6}})()`);
  await send('Input.dispatchMouseEvent', {type:'mouseMoved',...mousePoint});
  await wait(650);
  assert.equal(await evaluate(`document.querySelectorAll('.dm-touch-active').length`), 0);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#contact .dm-contact-card')).transform`), 'none');
  console.log('PASS desktop hover unchanged');
})().catch(error => {console.error(error); process.exitCode=1;}).finally(async () => {
  if (send) await Promise.race([send('Browser.close').catch(() => {}),wait(1500)]);
  if (ws) ws.close();
  if (chrome) chrome.kill();
  server.close();
  // Only remove this run's generated browser profile under the operating system temp directory.
  if (path.resolve(profile).startsWith(path.resolve(os.tmpdir()) + path.sep + 'devmondiale-touch-')) {
    await wait(300);
    fs.rmSync(profile, {recursive:true,force:true,maxRetries:5,retryDelay:200});
  }
});
