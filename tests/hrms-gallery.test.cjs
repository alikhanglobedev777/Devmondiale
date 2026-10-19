const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','hrms-showcase.js'),'utf8');
function fakePage(count=3){
  function element(){
    const events={};const classes=new Set();const attrs={};
    return {events,attrs,hidden:false,tabIndex:-1,textContent:'',
      classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name)},contains(name){return classes.has(name)}},
      setAttribute(k,v){attrs[k]=v},addEventListener(k,fn){events[k]=fn},focus(){this.focused=true}};
  }
  const pages=Array.from({length:count},element),screens=Array.from({length:count},element),tabs=Array.from({length:count},element);
  const prev=element(),next=element(),number=element(),label=element();
  const elements={'[data-helio-prev]':prev,'[data-helio-next]':next,'[data-helio-number]':number,'[data-helio-label]':label};
  const lists={'[data-helio-page]':pages,'[data-helio-screen]':screens,'[data-helio-tab]':tabs};
  const root={querySelectorAll(selector){return lists[selector]||[]},querySelector(selector){return elements[selector]||null}};
  const document={querySelector(selector){return selector==='[data-helio-showcase]'?root:null}};
  vm.runInNewContext(source,{document});
  return {pages,screens,tabs,prev,next,number,label};
}
test('switching chapters updates text, screen, tab aria and counter',()=>{
  const p=fakePage();p.tabs[1].events.click();
  assert.deepEqual(p.pages.map(e=>e.hidden),[true,false,true]);
  assert.deepEqual(p.screens.map(e=>e.hidden),[true,false,true]);
  assert.equal(p.tabs[1].attrs['aria-selected'],'true');
  assert.equal(p.tabs[0].attrs['aria-selected'],'false');
  assert.equal(p.number.textContent,'02');
  assert.equal(p.label.textContent,'02 — Employees');
});
test('prev and next wrap through three chapters',()=>{
  const p=fakePage();p.prev.events.click();assert.equal(p.number.textContent,'03');
  p.next.events.click();assert.equal(p.number.textContent,'01');
});
test('keyboard tabs navigate and restore focused tab',()=>{
  const p=fakePage();let prevents=0;
  p.tabs[0].events.keydown({key:'ArrowRight',preventDefault(){prevents++}});
  assert.equal(p.tabs[1].focused,true);assert.equal(p.tabs[1].tabIndex,0);
  p.tabs[1].events.keydown({key:'End',preventDefault(){prevents++}});
  assert.equal(p.tabs[2].focused,true);
  p.tabs[2].events.keydown({key:'Home',preventDefault(){prevents++}});
  assert.equal(p.tabs[0].focused,true);assert.equal(prevents,3);
});
test('script does nothing if root is absent',()=>{
  assert.doesNotThrow(()=>vm.runInNewContext(source,{document:{querySelector(){return null}}}));
});
test('script does nothing if three matching chapters are not present',()=>{
  const p=fakePage(2);assert.equal(p.next.events.click,undefined);
});
