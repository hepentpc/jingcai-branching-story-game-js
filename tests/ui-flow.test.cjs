"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const load=(name)=>fs.readFileSync(path.resolve(__dirname,"..",name),"utf8");
const context={window:{}};
vm.runInNewContext(load("data/story.js"),context);
vm.runInNewContext(load("data/outcomes.js"),context);
const story=context.window.STORY_DATA;
function element(){
 const names=new Set();
 return {
  hidden:false,disabled:false,style:{},dataset:{},textContent:"",innerHTML:"",handlers:{},attrs:{},
  classList:{toggle(key,on){if(on)names.add(key);else names.delete(key)},contains(key){return names.has(key)}},
  addEventListener(key,fn){this.handlers[key]=fn},setAttribute(k,v){this.attrs[k]=v},
  closest(){return this.card},focus(){},scrollIntoView(){},querySelector(){return null},contains(){return true}
 };
}
function setup(){
 const names="intro game ending header-reset start-btn back-btn again-btn rethink-btn confirm-btn scene-title scene-narrative scene-chip scene-number scene-image choices step-fraction progress-fill route-trail ending-title ending-intro ending-code journey-steps confirm-actions feedback-section feedback-heading positive-text improve-text status-text status-icon brand-link".split(" ");
 const el=Object.fromEntries(names.map(id=>[id,element()]));
 el["status-text"].card=element();
 const slides=[element(),element(),element()];
 const buttons=[element(),element(),element()];
 buttons.forEach((b,i)=>b.dataset.guide=String(i));
 const document={
  handlers:{},getElementById(id){assert.ok(el[id],"Missing node "+id);return el[id]},
  querySelectorAll(query){return query==="[data-guide-slide]"?slides:query==="[data-guide]"?buttons:[]},
  addEventListener(key,fn){this.handlers[key]=fn}
 };
 const window={STORY_DATA:story,scrollTo(){},setInterval(){},matchMedia(){return {matches:true}}};
 vm.runInNewContext(load("assets/app.js"),{window,document},{filename:"assets/app.js"});
 return {
  el,buttons,slides,
  click(id){el[id].handlers.click()},
  choose(key){document.handlers.keydown({key,target:{tagName:"BODY",isContentEditable:false},
   altKey:false,ctrlKey:false,metaKey:false,repeat:false,preventDefault(){}})}
 };
}
test("首頁動畫教學、開始旅程、ABC 選項及圖片佔位",()=>{
 const g=setup(),e=g.el;
 assert.equal(e.intro.hidden,false);
 g.buttons[2].handlers.click();
 assert.equal(g.slides[2].attrs["aria-hidden"],"false");
 g.click("start-btn");
 assert.equal(e.game.hidden,false);
 assert.equal(e["scene-title"].textContent,"她怎麼還能自在運動？");
 assert.ok(e["choices"].innerHTML.includes('data-choice="A"'));
 assert.ok(e["choices"].innerHTML.includes('data-choice="B"'));
 assert.ok(e["choices"].innerHTML.includes('data-choice="C"'));
 assert.ok(e["scene-image"].attrs["aria-label"].includes("預留區"));
 g.choose("A");
 assert.equal(e["scene-title"].textContent,story.nodes.A1.title);
 g.click("back-btn");
 assert.equal(e["scene-title"].textContent,story.nodes.S0.title);
});
test("全部 27 條路徑：先確認再回饋，只有 ACA、BAA、CAC 暫定過關",()=>{
 for(const a of "ABC")for(const b of "ABC")for(const c of "ABC"){
  const id=a+b+c,g=setup(),e=g.el;
  g.click("start-btn");
  [a,b,c].forEach(key=>g.choose(key));
  assert.equal(e.ending.hidden,false,id);
  assert.equal(e["confirm-actions"].hidden,false,id);
  assert.equal(e["feedback-section"].hidden,true,id);
  assert.equal(e["ending-code"].textContent,"路徑 "+id,id);
  assert.ok(e["journey-steps"].innerHTML.includes("<li>"),id);
  g.click("confirm-btn");
  assert.equal(e["confirm-actions"].hidden,true,id);
  assert.equal(e["feedback-section"].hidden,false,id);
  assert.equal(e["positive-text"].textContent,story.endings[id].positive,id);
  assert.equal(e["improve-text"].textContent,story.endings[id].improve,id);
  const passing=story.passRoutes.includes(id);
  assert.equal(e["status-text"].textContent.includes("恭喜過關"),passing,id);
  g.click("again-btn");
  assert.equal(e.intro.hidden,false,id);
  assert.equal(e.game.hidden,true,id);
 }
});
test("返回修改第三個選擇，或重新開始回首頁並清空選擇",()=>{
 const g=setup(),e=g.el;
 g.click("start-btn");["A","C","A"].forEach(x=>g.choose(x));
 assert.equal(e["ending-code"].dataset.route,"ACA");
 g.click("rethink-btn");
 assert.equal(e.game.hidden,false);
 assert.equal(e["scene-title"].textContent,story.nodes.AC2.title);
 g.choose("B");
 assert.equal(e["ending-code"].dataset.route,"ACB");
 g.click("header-reset");
 assert.equal(e.intro.hidden,false);
 g.click("start-btn");
 assert.equal(e["scene-title"].textContent,story.nodes.S0.title);
 assert.equal(e["route-trail"].textContent,"從這裡開始");
});
