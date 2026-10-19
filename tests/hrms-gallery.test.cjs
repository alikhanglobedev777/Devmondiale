const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','hrms-showcase.js'),'utf8');

function fakePage(count=3){
  const tabs=[],panels=[];
  for(let i=0;i<count;i++){
    const listeners={};
    const attrs={'aria-controls':`p-${i}`,'aria-selected':String(i===0)};
    const classes=new Set(i===0?['is-active']:[]);
    const tab={tabIndex:i===0?0:-1,attrs,listeners,
      classList:{toggle(c,on){if(on)classes.add(c);else classes.delete(c)},contains(c){return classes.has(c)}},
      getAttribute(k){return attrs[k]},setAttribute(k,v){attrs[k]=v},
      addEventListener(k,fn){listeners[k]=fn},focus(){tab.focused=true}
    };
    const viewport={scrollTop:100};
    const panel={hidden:i!==0,querySelector(sel){return sel==='.hrms-image-window'?viewport:null},viewport};
    tabs.push(tab);panels.push(panel);
  }
  const root={querySelectorAll(sel){if(sel==='[role="tab"]')return tabs;throw Error('unrecognized '+sel)}};
  const document={querySelector(sel){return sel==='[data-hrms-gallery]'?root:null},getElementById(id){return panels[Number(id.split('-')[1])]}};
  vm.runInNewContext(source,{document});
  return {tabs,panels};
}

test('click selects exactly one HRMS panel and updates ARIA state',()=>{
  const {tabs,panels}=fakePage();
  tabs[1].listeners.click();
  assert.equal(tabs.filter(t=>t.attrs['aria-selected']==='true').length,1);
  assert.equal(tabs[1].attrs['aria-selected'],'true');
  assert.deepEqual(panels.map(p=>p.hidden),[true,false,true]);
  assert.equal(panels[1].viewport.scrollTop,0);
  assert.equal(tabs[1].tabIndex,0);
});

test('ArrowRight and Home keyboard navigation move and restore focus',()=>{
  const {tabs,panels}=fakePage();
  let prevented=0;
  tabs[0].listeners.keydown({key:'ArrowRight',preventDefault(){prevented++}});
  assert.equal(tabs[1].focused,true);
  assert.equal(panels[1].hidden,false);
  tabs[1].listeners.keydown({key:'End',preventDefault(){prevented++}});
  assert.equal(panels[2].hidden,false);
  tabs[2].listeners.keydown({key:'Home',preventDefault(){prevented++}});
  assert.equal(panels[0].hidden,false);
  assert.equal(prevented,3);
});

test('script handles a missing gallery gracefully',()=>{
  assert.doesNotThrow(()=>vm.runInNewContext(source,{document:{querySelector(){return null}}}));
});
