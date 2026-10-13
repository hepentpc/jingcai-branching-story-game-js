"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=(name)=>fs.readFileSync(path.resolve(__dirname,"..",name),"utf8");
const scope={window:{}};
vm.runInNewContext(read("data/story.js"),scope);
vm.runInNewContext(read("data/outcomes.js"),scope);
const story=scope.window.STORY_DATA;
const choices=["A","B","C"];

test("內容來自國中版 V2，13 個情境、39 個選項與 27 條結局",()=>{
 assert.equal(story.edition,"國中版");
 assert.equal(story.sourceVersion,"網格修正版 V2");
 assert.equal(Object.keys(story.nodes).length,13);
 assert.equal(Object.keys(story.endings).length,27);
 assert.equal(Object.keys(story.nodes).reduce((n,k)=>n+Object.keys(story.nodes[k].choices).length,0),39);
 assert.deepEqual(Array.from(story.passRoutes),["ACA","BAA","CAC"]);
});

test("選項標籤恰為四字、原始對話保留、跳轉節點存在",()=>{
 for(const [id,node] of Object.entries(story.nodes)){
  assert.ok(node.title&&node.scene);
  for(const key of choices){
   const opt=node.choices[key];
   assert.match(opt.label,/^[\u3400-\u9fff]{4}$/u,id+key);
   assert.ok(opt.text.startsWith("「")&&opt.text.endsWith("」"),id+key);
   assert.ok(story.nodes[opt.next]||story.endings[opt.next],id+key+"->"+opt.next);
  }
 }
});

test("完整 27 條路徑均三次選擇到達唯一相符結局",()=>{
 const all=new Set();
 for(const a of choices)for(const b of choices)for(const c of choices){
  let id=story.start;
  for(const [i,letter] of [a,b,c].entries()){
   assert.ok(story.nodes[id],"premature conclusion: "+id+" at "+i);
   id=story.nodes[id].choices[letter].next;
  }
  assert.equal(id,a+b+c);
  all.add(id);
 }
 assert.equal(all.size,27);
});

test("27 種結局均保留各三句七字摘要及兩項獨立回饋",()=>{
 for(const [id,o] of Object.entries(story.endings)){
  assert.equal(o.steps.length,3,id);
  for(const s of o.steps)assert.equal([...s].length,7,id+": "+s);
  assert.ok(o.positive.length>20,id+" positive");
  assert.ok(o.improve.length>20,id+" improve");
 }
});

test("原版的三個代表學習路徑作為暫定通關",()=>{
 for(const route of ["ACA","BAA","CAC"]){
  assert.ok(story.corePaths[route]&&story.endings[route]);
 }
 assert.equal(story.endings.ACA.steps[2],"全都學會才自在");
 assert.equal(story.endings.BAA.steps[2],"請假分工再協調");
 assert.equal(story.endings.CAC.steps[2],"量與感受調強度");
});

test("沒有實際插圖時維持所有情境共用的『劇情圖片』佔位框",()=>{
 const html=read("index.html");
 assert.ok(html.includes('id="scene-image"'));
 assert.ok(html.includes(">劇情圖片</span>"));
 assert.ok(!html.includes("scene-video"));
 assert.ok(!html.includes("<img "));
 assert.ok(html.indexOf('data/story.js')<html.indexOf('data/outcomes.js'));
 assert.ok(html.indexOf('data/outcomes.js')<html.indexOf('assets/app.js'));
});
