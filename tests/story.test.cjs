"use strict";
// 經彩青春Do 國中版｜配合 2026-10-23 兩份 Word 修訂版之自動化測試
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = (name) => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8");
const scope = { window: {} };
vm.runInNewContext(read("data/story.js"), scope, { filename: "data/story.js" });
vm.runInNewContext(read("data/outcomes.js"), scope, { filename: "data/outcomes.js" });
const story = scope.window.STORY_DATA;
const letters = ["A", "B", "C"];

function follow(route) {
  let id = story.start;
  const labels = [];
  for (const [index, letter] of [...route].entries()) {
    const node = story.nodes[id];
    assert.ok(node, `${route} 第 ${index + 1} 步情境不存在：${id}`);
    const option = node.choices[letter];
    assert.ok(option, `${route} 第 ${index + 1} 步選項不存在`);
    labels.push(option.label);
    id = option.next;
  }
  return { id, labels };
}

test("國中版修訂：13 個情境、39 個 ABC 選項、27 條結局", () => {
  assert.equal(story.edition, "國中版");
  assert.equal(story.start, "S0");
  assert.equal(Object.keys(story.nodes).length, 13);
  assert.equal(Object.keys(story.endings).length, 27);
  assert.equal(Object.values(story.nodes).reduce((sum, node) => sum + Object.keys(node.choices).length, 0), 39);
  assert.deepEqual(Array.from(story.passRoutes), ["ACA", "BAA"]);
});

test("每個選項的標籤恰為四個中文字，情境文字與下一節點皆存在", () => {
  for (const [id, node] of Object.entries(story.nodes)) {
    assert.ok(node.title && node.scene, id);
    for (const letter of letters) {
      const choice = node.choices[letter];
      assert.match(choice.label, /^[\u3400-\u9FFF]{4}$/u, `${id}/${letter} 標籤`);
      assert.ok(choice.text && typeof choice.text === "string", `${id}/${letter} 選項內容`);
      assert.ok(story.nodes[choice.next] || story.endings[choice.next], `${id}/${letter} 下一節點 ${choice.next}`);
    }
  }
});

test("27 條路徑都在三次選擇後到達對應且唯一的結果", () => {
  const actual = new Set();
  for (const a of letters) for (const b of letters) for (const c of letters) {
    const route = a + b + c;
    const result = follow(route);
    assert.equal(result.id, route, `路徑 ${route} 的結局代碼應與選擇一致`);
    assert.deepEqual(Array.from(story.endings[route].steps), result.labels, `${route} 結局摘要應和學生選擇一致`);
    actual.add(result.id);
  }
  assert.equal(actual.size, 27);
});

test("所有 27 條路徑有完整、不同欄位的鼓勵性和建議性回饋", () => {
  for (const [route, result] of Object.entries(story.endings)) {
    assert.match(route, /^[ABC]{3}$/);
    assert.equal(result.steps.length, 3, route);
    result.steps.forEach(label => assert.equal([...label].length, 4, `${route}/${label}`));
    assert.ok(result.positive.length > 15, `${route} 鼓勵性回饋過短`);
    assert.ok(result.improve.length > 15, `${route} 建議性回饋過短`);
    assert.notEqual(result.positive, result.improve, route);
  }
});

test("修正來源表格不一致：BB2 與 BC2 仍依實際 A、B、C 的選擇產生結局", () => {
  assert.deepEqual(letters.map(x => story.nodes.BB2.choices[x].next), ["BBA", "BBB", "BBC"]);
  assert.deepEqual(letters.map(x => story.nodes.BC2.choices[x].next), ["BCA", "BCB", "BCC"]);
  assert.equal(story.endings.BBA.steps[2], "認命承受");
  assert.equal(story.endings.BBB.steps[2], "強效止痛");
  assert.equal(story.endings.BBC.steps[2], "健康舒緩");
  assert.equal(story.endings.BCA.steps[2], "女生專屬");
  assert.equal(story.endings.BCB.steps[2], "友善措施");
  assert.equal(story.endings.BCC.steps[2], "抗議不公");
});

test("網頁劇情插圖、腳本載入及操作元素仍保留", () => {
  // 可在原 Repository 執行本測試；只有 story/outcomes/tests 需要覆蓋，index 與 app 不需要改。
  const html = read("index.html");
  assert.ok(html.includes('id="scene-image"'));
  assert.ok(html.includes('id="image-placeholder"'));
  assert.ok(html.includes('id="start-btn"'));
  assert.ok(html.includes('id="confirm-btn"'));
  assert.ok(html.includes('id="positive-text"'));
  assert.ok(html.includes('id="improve-text"'));
  assert.ok(html.indexOf('data/story.js') < html.indexOf('data/outcomes.js'));
  assert.ok(html.indexOf('data/outcomes.js') < html.indexOf('assets/app.js'));
});
