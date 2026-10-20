/* 還原 App 自己的 confetti；canvas-confetti 改叫 window.__lvCC */
(function(){ var cc = window.confetti; if (typeof cc === 'function' && cc.create){ window.__lvCC = cc; if (typeof window.__lvAppConfetti === 'function') window.confetti = window.__lvAppConfetti; } })();

/* 活潑層 engine：cap（905 國中會考複習）——由 sync_lively.py 串接在 lively.js 前面
   - 練習引擎 practice.js 包在 IIFE 裡（pick／finish 都不在 window），wrap 接不到 → 用 observe。
   - 單題作答（pick→lockUI、總複習 rvPick、錯題複習 rvWrongPick）都是在既有選項上 classList.add('ok'／'no')，
     MutationObserver 抓得到。答錯時正解也會被加上 .ok，所以「答對」要再看同一張題卡的回饋是 .fb.good
     （回饋框在同一段同步程式裡設定，觀察者回呼時已就位）。
   - 閱讀題組（pickG／revealG→renderGroup）每次整段 innerHTML 重畫，新選項一出生就帶 .ok／.no，
     核心的 attributes 監聽抓不到 → 改用 observe.added 接新出現的回饋框。
   - 作業簿版（2026-10-19）：練習畫面都是 innerHTML 整段重畫、函式又在 IIFE 裡 → 本檔自己用 MutationObserver
     看 #pr-cats／#pr-units／#pr-quiz／#pr-result，畫面換了就請核心重換圖示，結果頁出現時蓋紅筆圈章、≥80% 放大彩帶。
     不碰 index.html／practice.js。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.cap = {
  observe: { correct: ".qcard:has(.fb.good) .opt.ok", wrong: ".qcard .opt.no",
             /* 閱讀題組整段重畫：新出現的回饋框（核心 2026-10-03 起支援 added，只在剛點過畫面時算、同批合併成一次） */
             added: { correct: ".qcard .fb.show.good", wrong: ".qcard .fb.show.bad" } },
  installBar: "#installBar",  /* App 自己的安裝列有東西時，藏起家族浮動安裝鈕，避免兩顆安裝鈕 */
  /* 會按的東西一律線條圖示（分頁列、類型卡、練習類型、標題列返回／回首頁）；講義段落標題同一套 */
  lines: ".topbar .back, .cat-tile .ci, .pr-cta .pi, #pr-cats .prcat .pci, .sec-head .ic, .engwc-help",
  linesLead: ".tabbar button, .engwc-home, #v-practice > button, #eng80-prog .eng80-wrong, #pr-quiz .btnrow .btn, #pr-result h3, #pr-units .topbar h2",
  /* 四線格：單字講義裡「主角是一個字」的地方（字彙題目標字、難字卡）；練習的字彙題選項由下面的程式依題型加 */
  four: "#v-vocab .pcard.v .pterm > b, #v-vocab .wcard .w",
  lineIcons: {"abc":"<path d=\"M3 16v-6a2 2 0 1 1 4 0v6\"/><path d=\"M3 13h4\"/><path d=\"M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1\"/><path d=\"M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01\"/>",
    "puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>",
    "book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>",
    "circle-check":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 12l2 2l4 -4\"/>",
    "tool":"<path d=\"M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5\"/>",
    "link":"<path d=\"M9 15l6 -6\"/><path d=\"M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464\"/><path d=\"M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463\"/>",
    "mountain":"<path d=\"M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z\"/><path d=\"M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2\"/>",
    "notebook":"<path d=\"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18\"/><path d=\"M13 8l2 0\"/><path d=\"M13 12l2 0\"/>",
    "circle-x":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M10 10l4 4m0 -4l-4 4\"/>"},
  lineEmoji: { "🧩":["puzzle"], "🔧":["tool"], "🔗":["link"], "📖":["book"], "🔤":["abc"], "🔴":["mountain","coral"], "📒":["notebook","sun"],
               "❌":["circle-x","coral"], "✅":["circle-check"], "🤔":["help"], "🔥":["flame","sun"], "📚":["books"], "🔁":["repeat","coral"],
               "←":["arrow-left"] },
  celebrateFns: ["__lvCapCheer"]
};
(function(){
  "use strict";
  /* 所有 engines/*.js 都會串進每一支 App 的 lively.js → 只有 engine=cap 的 App 才接 */
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}
  if (ENG !== "cap") return;
  /* 核心用 celebrateFns 包這個空函式：呼叫它＝放大彩帶（簡潔／減少動態時核心自己會略過） */
  window.__lvCapCheer = function(){};

  /* 練習的字彙題：選項都是一個字（或 3 字內短語）才寫在四線格上；句子、閱讀、翻譯不加 */
  var WORDY = /^(字彙|語意|難字)$/, SHORT = /^[A-Za-z][A-Za-z'’\-]*( [A-Za-z][A-Za-z'’\-]*){0,2}$/;
  function fourOpts(){
    document.querySelectorAll("#pr-quiz .qcard").forEach(function(card){
      if (card.__lvFour) return; card.__lvFour = true;
      var tag = card.querySelector(".qtag"); if (!tag || !WORDY.test((tag.textContent || "").trim())) return;
      var spans = Array.prototype.map.call(card.querySelectorAll(".opts .opt"), function(o){ return o.querySelector("span:last-child"); });
      if (!spans.length || !spans.every(function(s){ var t = s && (s.textContent || "").trim(); return t && t.length <= 24 && SHORT.test(t); })) return;
      spans.forEach(function(s){ s.classList.add("lv-four", "lv-opt-word"); });
    });
  }

  /* 結果頁：Unit 總結（大字 c/n）、總複習診斷（小字 c/n 題）→ 依答對率蓋章；錯題本的「完整度」不是答對率，不蓋 */
  function resultPct(box){
    var big = ((box.querySelector(".big") || {}).textContent || "").trim();
    var sub = ((box.querySelector(".sub") || {}).textContent || "").trim();
    if (/完整度/.test(sub)) return -1;
    var m = big.match(/^(\d+)\s*\/\s*(\d+)$/) || sub.match(/^(\d+)\s*\/\s*(\d+)\s*題/);
    return (m && +m[2] > 0) ? (+m[1] / +m[2]) : -1;
  }
  function stampResult(){
    var box = document.querySelector("#pr-result > .scorebox");
    if (!box || box.__lvStamped) return;
    box.__lvStamped = true;
    var p = resultPct(box); if (p < 0) return;
    try{ window.__lvApi.stamp(box, p); }catch(e){}
    if (p >= .8) setTimeout(function(){ try{ window.__lvCapCheer(); }catch(e){} }, 250);
  }

  var queued = false;
  function later(){
    if (queued) return; queued = true;
    setTimeout(function(){
      queued = false;
      try{ fourOpts(); }catch(e){}
      try{ if (window.__lvApi) window.__lvApi.refresh(); }catch(e){}
      try{ stampResult(); }catch(e){}
    }, 0);
  }
  function start(){
    var mo = new MutationObserver(later);
    /* subtree：App 另外插進標題列的 🏠 回首頁鈕（H3HOME）也要換；核心換圖示只動已處理過的元素一次，不會無限迴圈 */
    ["pr-cats","pr-units","pr-quiz","pr-result","eng80-prog"].forEach(function(id){
      var el = document.getElementById(id); if (el) mo.observe(el, { childList:true, subtree:true });
    });
    later();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* 活潑層 engine 設定：conv（909 旅遊／910 家庭／911 校園／912 跑腿／913 社交 生活會話家族，909 母版換皮）
   來源：packages/lively/engines/conv.js（sync 時串接在 lively.js 前面；每支 App 都會載入本檔，
   所以本檔只登記設定，任何會動到頁面的程式都要先確認 --lv-engine＝conv 才執行）。
   答對／答錯用 observe（不碰 App 程式）：
     選擇題（聽力／中翻英／聽數字，pickOpt）：點對＝該選項加 .ok；點錯＝該選項加 .no，同時把正解也標 .ok
       → 答對選擇器排除「同組已有 .no」的情況，免得把「答錯後揭示正解」算成答對。
     拼句（sczCheck）：#sczT 加 .ok／.err。兒童圖卡遊戲（kidPick）：.kgopt 加 .kgok／.kgbad。
   level=low：彩帶只在完成時 → finishKidGame（貼紙到手）＋「一般練習 ≥70%」或「總複習過關（≥F_PASS）」。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  window.__LV_ENGINES.conv = {
    observe: {
      correct: "#opts:not(:has(.opt.no)) > .opt.ok, #sczT.ok, .kgopt.kgok",
      wrong: "#opts > .opt.no, #sczT.err, .kgopt.kgbad"
    },
    /* 圖示：底部選單／橫幅／模式格的 emoji 大多（🆘🔎👤✈️🛡️🎧🧩🎤…）不在 vendor/fluent-emoji 清單裡，
       只換一半會變成兩種畫風並排，所以先不換（icons 留空＝核心不動 emoji）。 */
    /* 作業簿版（2026-10-19）：彩色 Fluent 只當插圖（首頁橫幅大圖、頁首數據格）；會按的東西一律線條圖示（Tabler 3.19.0） */
    icons: ".banner .big",
    iconsLead: ".topbar .stats .chip",
    lines: ".nav button > .ni, .mode .mi, .mic, .rbtn, .fabsafe-bar .engwc-help, .cf-favcard > span[aria-hidden]",
    linesLead: ".fabsafe-bar .engwc-home, .primcta .primbtn, .ovfoot .pbtn, .flash > .speak, .bigshow > .speak, .patcard .speak, .ovhead .cnt, .back, #cfJump, .cf-actions .pbtn, #view-profile > .pbtn, #view-sos .cf-chip",
    /* 畫面一直整段重畫（每張卡都是 innerHTML）→ 有新節點就再換一次圖示（已換過的有記號，不會重複） */
    observeIcons: true,
    /* 四線格：只給「單字暖身」的單字和短句學習卡（≤22 字、純英文），由下方程式判斷後加 .lv-four；長句不畫 */
    afterRender: ["renderHome"],
    celebrateFns: ["finishKidGame", "__lvConvPassed"],
    lineEmoji: {
      /* 第二格＝模式格小方塊的底色（只在 .mode .mi 用；其他位置不上色） */
      "🆘":["sos"], "👤":["user"], "📇":["cards","sun"], "📖":["book"], "🎧":["headphones","green"], "🧩":["puzzle","coral"], "✍":["writing","sun"],
      "🎤":["microphone","green"], "🔢":["number-123","coral"], "🔑":["key","sun"], "🎭":["masks-theater","coral"], "💬":["message-circle","green"],
      "📚":["books"], "🏆":["trophy","sun"],"▶":["player-play"], "🪧":["device-mobile"], "🎮":["device-gamepad-2"], "🎉":["sticker"],
      "🎯":["target"], "🗑":["trash"], "✓":["check"], "🗣":["messages"], "📞":["phone"], "💵":["cash"]
    },
    lineIcons: {"phone":"<path d=\"M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2\"/>","cash":"<path d=\"M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z\"/><path d=\"M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2\"/>","messages":"<path d=\"M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10\"/><path d=\"M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","check":"<path d=\"M5 12l5 5l10 -10\"/>","device-gamepad-2":"<path d=\"M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4z\"/><path d=\"M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232\"/><path d=\"M8 9v2\"/><path d=\"M7 10h2\"/><path d=\"M14 10h2\"/>","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>","headphones":"<path d=\"M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\"/><path d=\"M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\"/><path d=\"M4 15v-3a8 8 0 0 1 16 0v3\"/>","key":"<path d=\"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z\"/><path d=\"M15 9h.01\"/>","masks-theater":"<path d=\"M13.192 9h6.616a2 2 0 0 1 1.992 2.183l-.567 6.182a4 4 0 0 1 -3.983 3.635h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183z\"/><path d=\"M15 13h.01\"/><path d=\"M18 13h.01\"/><path d=\"M15 16.5c1 .667 2 .667 3 0\"/><path d=\"M8.632 15.982a4.037 4.037 0 0 1 -.382 .018h-1.5a4 4 0 0 1 -3.983 -3.635l-.567 -6.182a2 2 0 0 1 1.992 -2.183h6.616a2 2 0 0 1 2 2\"/><path d=\"M6 8h.01\"/><path d=\"M9 8h.01\"/><path d=\"M6 12c.764 -.51 1.528 -.63 2.291 -.36\"/>","message-circle":"<path d=\"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1\"/>","microphone":"<path d=\"M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z\"/><path d=\"M5 10a7 7 0 0 0 14 0\"/><path d=\"M8 21l8 0\"/><path d=\"M12 17l0 4\"/>","number-123":"<path d=\"M3 10l2 -2v8\"/><path d=\"M9 8h3a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h3\"/><path d=\"M17 8h2.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1 -1.5 1.5h-2.5\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>","sos":"<path d=\"M7 8h-3a1 1 0 0 0 -1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-3\"/><path d=\"M10 8h4v8h-4z\"/><path d=\"M17 16h3a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h3\"/>","sticker":"<path d=\"M20 12l-2 .5a6 6 0 0 1 -6.5 -6.5l.5 -2l8 8\"/><path d=\"M20 12a8 8 0 1 1 -8 -8\"/>","target":"<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\"/><path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/>","trash":"<path d=\"M4 7l16 0\"/><path d=\"M10 11l0 6\"/><path d=\"M14 11l0 6\"/><path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\"/><path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\"/>","trophy":"<path d=\"M8 21l8 0\"/><path d=\"M12 17l0 4\"/><path d=\"M7 4l10 0\"/><path d=\"M17 4v8a5 5 0 0 1 -10 0v-8\"/><path d=\"M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/>","user":"<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\"/><path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\"/>","writing":"<path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z\"/><path d=\"M16 7h4\"/><path d=\"M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3\"/>"}
  };

  var isConv = false;
  try{ isConv = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim() === "conv"; }catch(e){}
  if (!isConv) return;

  /* 1.（已移到核心）App 自己的全域 confetti()（emoji 飄落）由 sync 注入的兩行保存／還原，canvas-confetti 改叫 window.__lvCC。 */

  /* 2. 過關才放彩帶：核心會把 window.__lvConvPassed 包成「呼叫就大彩帶」。 */
  window.__lvConvPassed = window.__lvConvPassed || function(){};
  try{
    var fs = window.finishSession;
    if (typeof fs === "function" && !fs.__lvConv){
      var w = function(){
        var pass = false, ratio = -1;
        try{
          var t = Q.items.length, pct = t ? Math.round(Q.correct / t * 100) : 0;
          pass = Q.final ? pct >= F_PASS : pct >= 70;
          if (t) ratio = Q.correct / t;
        }catch(e){}
        var r = fs.apply(this, arguments);
        if (pass){ try{ window.__lvConvPassed(); }catch(e){} }
        /* 紅筆圈章：蓋在結果卡（答對幾題那張）右上角外緣，不壓到數字；一般練習與總複習結算都是同一個畫面結構 */
        if (ratio >= 0){
          try{
            var host = document.querySelector("#overlayMount .flash > .card3d");
            if (host && window.__lvApi){ host.classList.add("lv-conv-res"); window.__lvApi.stamp(host, ratio); }
          }catch(e){}
        }
        return r;
      };
      w.__lvConv = true; window.finishSession = w;
    }
  }catch(e){}

  /* 2a. 兒童圖卡遊戲結算（貼紙到手）也蓋章：每回合都要點到對的才會前進，所以完成＝全對 */
  try{
    var fk = window.finishKidGame;
    if (typeof fk === "function" && !fk.__lvConv){
      var wk = function(){
        var ratio = -1;
        try{ if (KG && KG.rounds) ratio = Math.min(1, KG.correct / KG.rounds); }catch(e){}
        var r = fk.apply(this, arguments);
        if (ratio >= 0){
          try{
            var host = document.querySelector("#overlayMount .flash > .card3d");
            if (host && window.__lvApi){ host.classList.add("lv-conv-res"); window.__lvApi.stamp(host, ratio); }
          }catch(e){}
        }
        return r;
      };
      wk.__lvConv = true; window.finishKidGame = wk;
    }
  }catch(e){}

  /* 2b. 四線格：會話群的主角多半是整句，只有「短的英文」才畫四線格。
         單字暖身（.flash 有 .wico）、學習卡／跟讀的英文若 ≤22 字且是純英文 → 加 .lv-four；長句維持原樣。 */
  function markFour(){
    try{
      document.querySelectorAll("#overlayMount .flash .card3d .big-en, #overlayMount .mic-wrap > .big-en").forEach(function(el){
        if (el.__lvFourChk === el.textContent) return;
        el.__lvFourChk = el.textContent;
        var s = (el.textContent || "").trim();
        el.classList.toggle("lv-four", s.length > 0 && s.length <= 22 && /^[\x20-\x7E’‘]+$/.test(s));
      });
    }catch(e){}
  }
  function startFour(){
    var mount = document.getElementById("overlayMount"); if (!mount) return;
    markFour(); new MutationObserver(markFour).observe(mount, { childList:true, subtree:true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startFour); else startFour();

  /* 3. 手機狀態列顏色跟著頁首淡主色（App 的 applyDark 寫死草綠 #E9F3E0／深藍） */
  function syncThemeColor(){
    try{
      var m = document.querySelector('meta[name="theme-color"]');
      var v = getComputedStyle(document.documentElement).getPropertyValue("--lv-soft").trim();
      if (m && v) m.content = v;
    }catch(e){}
  }
  try{
    var ad = window.applyDark;
    if (typeof ad === "function" && !ad.__lvConv){
      var wd = function(){ var r = ad.apply(this, arguments); syncThemeColor(); return r; };
      wd.__lvConv = true; window.applyDark = wd;
    }
  }catch(e){}
  syncThemeColor();
})();

/* 活潑層 engine 設定：game（927 英語之塔、928 文法勇者：遊戲外框套法）
   來源：packages/lively/engines/game.js（sync 時串接在每一支的 lively.js 前面；這裡只放設定物件，不執行任何會動到頁面的程式）
   原則：遊戲畫面（地圖、戰鬥、怪物像素圖、戰鬥指令、獎勵訊息）完全不動；作業簿版只套「外框」——
     · 頁首頁籤、首頁選單、城鎮選單、⬅ 入口／撤退／❓ 怎麼玩／音樂開關：emoji 換線條圖示（同一排全部換，不混用）
     · 家族按鈕（LINE／回報）同一種外觀，但跟著遊戲的深色面板（game.css）
   不接 observe／wrap：答對答錯遊戲自己有閃光、傷害數字、音效，不再加彩帶；也不包任何遊戲函式。
   不蓋章：兩支的結算畫面都沒有「答對率」（927 討伐成功＝寶箱獎勵、928 勝利＝經驗與金幣），硬算要動遊戲邏輯。
   不用四線格：英文主角字都在戰鬥畫面裡。
   圖示：Tabler Icons 3.19.0 outline（MIT），授權全文 vendor/tabler-icons/LICENSE.txt。
   兩支都是整段 innerHTML 重畫（927 render()、928 renderHud／enterTown／showClassSelect 的 draw…），用 observeIcons 統一補換。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.game = {
  /* 整個元素就是一個 emoji */
  lines: "#app .navBtn > .navIcon, #app button[title='開關背景音樂']",
  /* emoji 寫在文字裡（只換對照表有的） */
  linesLead: "#towerNav .towerTab, #retreatBtn, #hud .hubbtn, #b-hub, #wnav button, #b-how, #v-town button.townbtn > span:first-child",
  lineIcons: {
    "map": "<path d=\"M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13\"/><path d=\"M9 4v13\"/><path d=\"M15 7v13\"/>",
    "trophy": "<path d=\"M8 21l8 0\"/><path d=\"M12 17l0 4\"/><path d=\"M7 4l10 0\"/><path d=\"M17 4v8a5 5 0 0 1 -10 0v-8\"/><path d=\"M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/>",
    "device-floppy": "<path d=\"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2\"/><path d=\"M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M14 4l0 4l-6 0l0 -4\"/>",
    "sword": "<path d=\"M20 4v5l-9 7l-4 4l-3 -3l4 -4l7 -9z\"/><path d=\"M6.5 11.5l6 6\"/>",
    "shirt": "<path d=\"M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0\"/>",
    "paw": "<path d=\"M14.7 13.5c-1.1 -2 -1.441 -2.5 -2.7 -2.5c-1.259 0 -1.736 .755 -2.836 2.747c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c1.013 0 1.8 -.823 1.8 -2c0 -.285 -.049 -.697 -.146 -.962c-.475 -1.451 -2.512 -1.835 -3.454 -3.538z\"/><path d=\"M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052z\"/><path d=\"M9.474 9c.055 0 .109 0 .163 -.011c.944 -.128 1.533 -1.346 1.32 -2.722c-.203 -1.297 -1.047 -2.267 -1.932 -2.267c-.055 0 -.109 0 -.163 .011c-.944 .128 -1.533 1.346 -1.32 2.722c.204 1.293 1.048 2.267 1.933 2.267z\"/><path d=\"M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267z\"/><path d=\"M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082z\"/>",
    "book": "<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>",
    "script": "<path d=\"M17 20h-11a3 3 0 0 1 0 -6h11a3 3 0 0 0 0 6h1a3 3 0 0 0 3 -3v-11a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8\"/>",
    "tree": "<path d=\"M12 13l-2 -2\"/><path d=\"M12 12l2 -2\"/><path d=\"M12 21v-13\"/><path d=\"M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z\"/>",
    "calendar": "<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\"/><path d=\"M16 3v4\"/><path d=\"M8 3v4\"/><path d=\"M4 11h16\"/><path d=\"M11 15h1\"/><path d=\"M12 15v3\"/>",
    "tornado": "<path d=\"M21 4l-18 0\"/><path d=\"M13 16l-6 0\"/><path d=\"M11 20l4 0\"/><path d=\"M6 8l14 0\"/><path d=\"M4 12l12 0\"/>",
    "building-castle": "<path d=\"M15 19v-2a3 3 0 0 0 -6 0v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-14h4v3h3v-3h4v3h3v-3h4v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/><path d=\"M3 11l18 0\"/>",
    "user": "<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\"/><path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\"/>",
    "volume-off": "<path d=\"M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464\"/><path d=\"M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615\"/><path d=\"M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664\"/><path d=\"M3 3l18 18\"/>",
    "bed": "<path d=\"M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M22 17v-3h-20\"/><path d=\"M2 8v9\"/><path d=\"M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z\"/>",
    "building-store": "<path d=\"M3 21l18 0\"/><path d=\"M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4\"/><path d=\"M5 21l0 -10.15\"/><path d=\"M19 21l0 -10.15\"/><path d=\"M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4\"/>",
    "building-church": "<path d=\"M3 21l18 0\"/><path d=\"M10 21v-4a2 2 0 0 1 4 0v4\"/><path d=\"M10 5l4 0\"/><path d=\"M12 3l0 5\"/><path d=\"M6 21v-7m-2 2l8 -8l8 8m-2 -2v7\"/>",
    "walk": "<path d=\"M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M7 21l3 -4\"/><path d=\"M16 21l-2 -4l-3 -3l1 -6\"/><path d=\"M6 12l2 -3l4 -1l3 3l3 1\"/>",
    "leaf": "<path d=\"M5 21c.5 -4.5 2.5 -8 7 -10\"/><path d=\"M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z\"/>",
    "droplet": "<path d=\"M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546z\"/>"
  },
  lineEmoji: {
    "🗺":["map"], "🏆":["trophy"], "💾":["device-floppy"], "🗡":["sword"], "🎽":["shirt"], "🐾":["paw"], "📖":["book"],
    "📜":["script"], "🌳":["tree"], "📅":["calendar"], "🌀":["tornado"], "🏯":["building-castle"], "🏰":["building-castle"],
    "👤":["user"], "🔇":["volume-off"], "🛏":["bed"], "🏪":["building-store"], "⛪":["building-church"], "🚶":["walk"],
    "🌿":["leaf"], "💧":["droplet"]
  },
  observeIcons: true
};

/* 活潑層 engine：grammar（文法／題庫類：917、923、924、925、926）
   ⚠ 本檔會串進「每一支」App 的公開 lively.js：註解不要寫對內 App 的書名／出版社（上鎖 App 的 TELLS 驗收）
   來源：packages/lively/engines/grammar.js（sync_lively.py 串接在 lively.js 前面）
   2026-10-19 作業簿版加入。這幾支都是上鎖 App：活潑層裝在 _source/index.plain.html（明文，gitignore），重鎖後才會生效。

   兩種畫面結構（同一個 engine，載入時自己判斷，寫在 html[data-lv-gram]）：
   - jr＝923～926（#v-home／#v-run／#v-result／底部 #nav，跟 915/916 題庫同一套程式）
   - hs＝917（.tabbar 分頁、#practiceBody 練習、RV2 總複習／嚴格錯題本）
   為什麼不直接 observe「.opt.correct／.opt.ok」：
   - jr 作答後 drawRun 用 innerHTML 整頁重畫，新選項一出生就帶 class；
   - hs 的總複習／錯題本答錯時也把「正解」標 .ok → 答錯會被當成答對。
   所以包住 App 的作答函式，只在「這一次作答」的那個選項加 lv-ans-ok／lv-ans-no，核心的 observe 只看這兩個記號。
   包裝自己出錯一律吞掉，App 原本的判分、SRS、錯題本流程完全不動。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}
  var D = document, root = D.documentElement;
  var V = D.getElementById("v-run") ? "jr" : (D.getElementById("practiceBody") ? "hs" : "");
  /* Tabler Icons 3.19.0 outline（MIT），核心沒有的才補 */
  var ICONS = {"arrow-right":"<path d=\"M5 12l14 0\"/><path d=\"M13 18l6 -6\"/><path d=\"M13 6l6 6\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","book-2":"<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\"/><path d=\"M19 16h-12a2 2 0 0 0 -2 2\"/><path d=\"M9 8h6\"/>","check":"<path d=\"M5 12l5 5l10 -10\"/>","dice-5":"<path d=\"M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\"/><circle cx=\"8.5\" cy=\"8.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"15.5\" cy=\"8.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"15.5\" cy=\"15.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"15.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"12\" r=\".5\" fill=\"currentColor\"/>","letter-case":"<path d=\"M17.5 15.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0\"/><path d=\"M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5\"/><path d=\"M3 13h7\"/><path d=\"M21 12v7\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","printer":"<path d=\"M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2\"/><path d=\"M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4\"/><path d=\"M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z\"/>","puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>","trash":"<path d=\"M4 7l16 0\"/><path d=\"M10 11l0 6\"/><path d=\"M14 11l0 6\"/><path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\"/><path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\"/>","x":"<path d=\"M18 6l-12 12\"/><path d=\"M6 6l12 12\"/>"};
  var EMO = {
    "🎲":["dice-5","sun"], "→":["arrow-right"], "←":["arrow-left"], "▶":["player-play"], "🧩":["puzzle"], "📖":["book"],
    "🔤":["letter-case"], "❌":["x","coral"], "✕":["x"], "🔥":["flame","coral"], "🖨":["printer"], "🗑":["trash"], "✅":["check"],
    "🤔":["help"], "📘":["book-2"], "📚":["books","green"], "🔁":["repeat","coral"]
  };
  var common = {
    observe: { correct: ".lv-ans-ok", wrong: ".lv-ans-no" },
    lineIcons: ICONS, lineEmoji: EMO,
    celebrateFns: ["__lvGramCheer"]
  };
  function ext(a, b){ var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  window.__LV_ENGINES.grammar = V === "hs" ? ext(common, {
    icons: ".sec-head .ic, .wc-step .wc-i",
    lines: ".tabbar .gx-ti, .prcat .pci, .cat-tile .ci, .fabsafe-bar .engwc-help",
    linesLead: "#practiceBody .btn, #practiceBody .back, .pr-cta .go, .pr-note button, #gxGo, #gxRead, .printbtn, .fabsafe-bar .engwc-home, .backtop",
    afterRender: ["practiceHome", "renderQ", "renderScore", "rvRenderQ", "rvFinish", "rvWrongRender", "rvWrongDone", "show"]
  }) : ext(common, {
    lines: ".rl-appbar .iconbtn, #nav button > .ni, #v-home .mode .mi, #v-diagnose .mode .mi, #v-wrong .mode .mi",
    linesLead: ".back, #v-run .foot .btn, .gx-welcome .gx-ok, .uf-next",
    afterRender: ["renderHome", "renderDiagnose", "renderWrong", "renderSettings", "drawRun", "drawResult", "renderVocab"]
  });
  if (ENG !== "grammar" || !V) return;
  root.setAttribute("data-lv-gram", V);
  /* 917 原本沒有深色模式（App 的顏色全寫死淺色）：活潑層也固定淺色，不在系統深色時把一半畫面變暗 */
  if (V === "hs" && !root.hasAttribute("data-theme")) root.setAttribute("data-theme", "light");

  window.__lvGramCheer = function(){};   // 核心用 celebrateFns 包這個空函式：呼叫它＝放大彩帶
  function cheer(){ try{ window.__lvGramCheer(); }catch(e){} }
  function stamp(host, pct){ try{ if (host && window.__lvApi) window.__lvApi.stamp(host, pct); }catch(e){} }
  function mark(el, ok){ if (el && el.classList) el.classList.add(ok ? "lv-ans-ok" : "lv-ans-no"); }
  function wrap(name, before, after){
    var o = window[name];
    if (typeof o !== "function" || o.__lvg) return;
    var w = function(){
      var pre = null;
      try{ pre = before ? before.apply(this, arguments) : null; }catch(e){}
      var r = o.apply(this, arguments);
      try{ after.call(this, arguments, pre); }catch(e){}
      return r;
    };
    w.__lvg = true; window[name] = w;
  }
  function fluent(name, cls){
    var i = D.createElement("img"); i.src = "vendor/fluent-emoji/" + name + "_flat.svg"; i.alt = ""; i.className = cls;
    i.setAttribute("aria-hidden", "true"); i.decoding = "async"; return i;
  }
  /* 四線格：選項是「一個字或短語」時才用（整句改寫題、長句不用） */
  var SHORT = /^[A-Za-z][A-Za-z '’\-\/.,!?()]{0,26}$/;
  function fourShort(sel){
    D.querySelectorAll(sel).forEach(function(el){
      if (el.__lvf) return; el.__lvf = 1;
      var t = (el.textContent || "").trim();
      if (SHORT.test(t)) el.classList.add("lv-four");
    });
  }
  function resultArt(host, pct){
    if (!host || host.querySelector(".lv-res-art")) return;
    var n = pct >= .8 ? "trophy" : pct >= .6 ? "glowing_star" : "seedling";
    var a = fluent(n, "lv-res-art"); host.insertBefore(a, host.firstChild);
  }

  if (V === "jr"){
    /* 底部導覽：10-13 的 UIUX 修正已換成手寫線條 → 換回 emoji 讓核心換成同一套 Tabler 線條 */
    var NAVE = { home:"🏠", diagnose:"📊", wrong:"🔁", settings:"⚙", vocab:"🔤" };
    D.querySelectorAll("#nav button[data-v] .ni").forEach(function(ni){
      var e = NAVE[ni.parentNode.getAttribute("data-v")]; if (e && ni.querySelector("svg") && !ni.querySelector(".lv-line")) ni.textContent = e;
    });
    /* 單題作答（隨機／單元／總複習／錯題）：這一次作答的選項打記號 */
    wrap("pick", function(){
      var q = sess.list[sess.i];
      return { fresh: sess.picks[q.id] == null };
    }, function(a, pre){
      if (!pre || !pre.fresh) return;
      var k = a[0], hit = null;
      D.querySelectorAll("#v-run .opts .opt").forEach(function(b){
        var kk = b.querySelector(".k"); if (kk && kk.textContent === k) hit = b;
      });
      if (hit) mark(hit, hit.classList.contains("correct"));
    });
    wrap("drawRun", null, function(){ fourShort("#v-run .opt .v"); });
    /* 結果頁：插圖＋紅筆圈章；答對率 ≥ 80% 放大彩帶 */
    wrap("drawResult", null, function(){
      var n = sess.list.length, p = n ? sess.correct / n : 0;
      var host = D.querySelector("#v-result .result");
      resultArt(host && host.querySelector(".big"), p);
      stamp(host, p);
      if (p >= .8) setTimeout(cheer, 250);
    });
    /* 首頁三格統計：彩色插圖（不可按，只是看） */
    var STAT_ART = ["books", "memo", "bullseye"];
    var statArt = function(){
      D.querySelectorAll("#v-home .stats .stat").forEach(function(s, i){
        if (s.querySelector(".lv-stat-art") || !STAT_ART[i]) return;
        s.insertBefore(fluent(STAT_ART[i], "lv-stat-art"), s.firstChild);
      });
    };
    wrap("renderHome", null, statArt);
    statArt();   // 首頁在活潑層載入前已經畫好一次
  } else {
    wrap("pick", function(){ return { fresh: !D.querySelector("#opts .opt.dis") }; }, function(a, pre){
      if (!pre || !pre.fresh) return;
      var hit = D.querySelector('#opts .opt[data-i="' + a[0] + '"]');
      if (hit) mark(hit, hit.classList.contains("ok"));
    });
    /* 總複習／嚴格錯題本：rvLockG 會把正解標 .ok、選錯標 .no */
    function rvAfter(box){
      return function(a, pre){
        if (!pre || !pre.fresh) return;
        var no = D.querySelector(box + " .opt.no");
        if (no) mark(no, false); else mark(D.querySelector(box + " .opt.ok"), true);
      };
    }
    wrap("rvPick", function(){ return { fresh: window.rvPk == null }; }, rvAfter("#rvopts"));
    wrap("rvWrongPick", function(){ return { fresh: window.rwPk == null }; }, rvAfter("#rwopts"));
    var OPTS = "#opts .opt > span:last-child, #rvopts .opt > span:last-child, #rwopts .opt > span:last-child";
    wrap("renderQ", null, function(){ fourShort(OPTS); });
    wrap("rvRenderQ", null, function(){ fourShort(OPTS); });
    wrap("rvWrongRender", null, function(){ fourShort(OPTS); });
    /* 結果頁（綜合／主題測驗、總複習）：插圖＋紅筆圈章 */
    wrap("renderScore", null, function(){
      var p = pool.length ? score / pool.length : 0, host = D.querySelector("#practiceBody .scorebox");
      resultArt(host, p); stamp(host, p);
      if (p >= .8) setTimeout(cheer, 250);
    });
    wrap("rvFinish", null, function(){
      var c = rvRes.filter(function(x){ return x.ok; }).length, p = rvRes.length ? c / rvRes.length : 0;
      var host = D.querySelector("#practiceBody .scorebox");
      resultArt(host, p); stamp(host, p);
      if (p >= .8) setTimeout(cheer, 250);
    });
    /* 單字頁：每個難字站在四線格上 */
    var fv = function(){ fourShort("#vocabBody .wcard .w"); };
    wrap("renderVocab", null, fv); setTimeout(fv, 0);
  }

  /* 家族「📝 我的複習」重考錯題（REVIEWUI 面板）：點完選項後才有 .ok／.no */
  D.addEventListener("click", function(e){
    try{
      var el = e.target && e.target.closest && e.target.closest(".rvc-opt"); if (!el) return;
      var item = el.closest(".rvc-item"); if (!item || item.__lvg) return;
      if (!el.classList.contains("ok") && !el.classList.contains("no")) return;
      item.__lvg = true; mark(el, el.classList.contains("ok"));
    }catch(err){}
  });
})();

/* 活潑層 engine：gsat（906 學測複習）——由 sync_lively.py 串接在 lively.js 前面
   - 單題作答（pick→lockUI、總複習 rvPick、錯題複習 rvWrongPick）都是在既有選項上 classList.add('ok'／'no') → observe。
     答錯時正解也會被加上 .ok，所以「答對」要再看同一張題卡的回饋是 .fb.good。
   - pick(k) 的參數是選項字母（永遠為真），不能用核心的 wrap.juice（它把第一個參數當對錯）。
   - 單元總結 finish() 是全域函式 → wrap.result＋resultPct：答對 ≥80% 才放過關彩帶。
   - 閱讀題組（pickG／revealG→renderGroup）每次整段重畫，attributes 監聽抓不到 → 改用 observe.added。

   作業簿版（2026-10-19）：
   - 會按的東西一律線條圖示：題型卡、頂部導覽、← 返回／🏠、⬅ 入口／❓、「✅ 對答案」「下一題 →」、講義的題型摺疊列。
     題目回饋框裡的 ✅／❌、提示列的 🎯👇💡 是內容，不換。
   - 四線格：「我的生字」與講義「高頻難字」的單字（一個字＝主角）。題幹、文章、片語都是長句，不用。
   - 紅筆圈章：Unit 總結、總複習診斷（都在 #s-result .scorebox），依畫面上的百分比蓋章。 */
(function(){
  var GS_ICONS = {"book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","abc":"<path d=\"M3 16v-6a2 2 0 1 1 4 0v6\"/><path d=\"M3 13h4\"/><path d=\"M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1\"/><path d=\"M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01\"/>","puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>","wall":"<path d=\"M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\"/><path d=\"M4 8h16\"/><path d=\"M20 12h-16\"/><path d=\"M4 16h16\"/><path d=\"M9 4v4\"/><path d=\"M14 8v4\"/><path d=\"M8 12v4\"/><path d=\"M16 12v4\"/><path d=\"M11 16v4\"/>","arrow-right":"<path d=\"M5 12l14 0\"/><path d=\"M13 18l6 -6\"/><path d=\"M13 6l6 6\"/>","check":"<path d=\"M5 12l5 5l10 -10\"/>","circle-x":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M10 10l4 4m0 -4l-4 4\"/>","trash":"<path d=\"M4 7l16 0\"/><path d=\"M10 11l0 6\"/><path d=\"M14 11l0 6\"/><path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\"/><path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\"/>","link":"<path d=\"M9 15l6 -6\"/><path d=\"M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464\"/><path d=\"M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463\"/>","target":"<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\"/><path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/>","file-text":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\"/><path d=\"M9 9l1 0\"/><path d=\"M9 13l6 0\"/><path d=\"M9 17l6 0\"/>","home":"<path d=\"M5 12l-2 0l9 -9l9 9l-2 0\"/><path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\"/><path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\"/>","star":"<path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z\"/>","chevron-right":"<path d=\"M9 6l6 6l-6 6\"/>","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>","plus":"<path d=\"M12 5l0 14\"/><path d=\"M5 12l14 0\"/>"};
  var NAV_ICON = ["home", "book", "circle-x", "star"];   // 頂部導覽：首頁／學測重點／錯題複習／我的生字
  var SVGNS = "http://www.w3.org/2000/svg";
  function eng(){ try{ return getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){ return ""; } }
  function svg(name, cls){
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "lv-line " + (cls||"")); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    s.innerHTML = GS_ICONS[name] || ""; return s;
  }
  /* ENG81 頂部導覽四顆鈕：純文字 → 前面加線條圖示 */
  function navIcons(){
    var bs = document.querySelectorAll("#eng81-nav button");
    for (var i = 0; i < bs.length && i < NAV_ICON.length; i++){
      if (!bs[i].querySelector("svg")) bs[i].insertBefore(svg(NAV_ICON[i], "lv-gs-nav"), bs[i].firstChild);
    }
  }
  /* 四線格：生字清單、講義難字 */
  function four(){
    document.querySelectorAll("#wordList .rev .rh > b, #lecBody .lword > b").forEach(function(b){
      if (b.__gsFour) return; b.__gsFour = true;
      var t = (b.textContent||"").trim();
      if (t && t.length <= 18 && /^[A-Za-z][A-Za-z' -]*$/.test(t)) b.classList.add("lv-four", "lv-gs-four");
    });
  }
  /* 結果頁蓋章：#s-result 每次整段重畫；Unit 總結由核心 wrap.result 蓋，其他（總複習診斷）在這裡補 */
  function stamp(){
    var box = document.querySelector("#s-result.on .scorebox, #s-result .scorebox");
    if (!box || box.querySelector(":scope > .lv-stamp") || !window.__lvApi) return;
    var m = (box.textContent||"").match(/(\d+)\s*%/); if (!m) return;
    window.__lvApi.stamp(box, Math.min(1, +m[1] / 100));
  }
  var RELIVE = ".topbar .back, .fabsafe-bar .engwc-help, .fabsafe-bar .engwc-home, .prcat .pci, .qbtn, .btn.primary, .lc .goq, .lc .lci, .topbar h2, #s-result h3, .lsec, .lc summary .arw, #installBar .ib";
  function relive(){
    document.querySelectorAll(RELIVE).forEach(function(el){ if (!el.querySelector("svg.lv-line")){ el.__lvLine = false; el.__lvLineLead = false; } });
  }
  function watch(){
    if (eng() !== "gsat") return;
    var t = 0;
    var run = function(){ t = 0; try{ relive(); navIcons(); four(); stamp(); if (window.__lvApi) window.__lvApi.refresh(); }catch(e){} };
    new MutationObserver(function(){ if (!t) t = setTimeout(run, 60); }).observe(document.body, { childList:true, subtree:true });
    run(); setTimeout(run, 700); setTimeout(run, 1700);   // ENG81 會在 0.5／1.5 秒把「⬅ 入口」「❓」改寫成「← 入口」「?」
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(watch, 0); });
  else setTimeout(watch, 0);
  window.__LV_GS_ICONS = GS_ICONS;
})();

window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.gsat = {
  observe: { correct: ".qcard:has(.fb.good) .opt.ok", wrong: ".qcard .opt.no",
             /* 閱讀題組整段重畫：新出現的回饋框（核心 2026-10-03 起支援 added，只在剛點過畫面時算、同批合併成一次） */
             added: { correct: ".qcard .fb.show.good", wrong: ".qcard .fb.show.bad" } },
  installBar: "#installBar",
  wrap: { result: "finish" },
  resultHost: "#s-result .scorebox",
  resultPct: function(){
    try{
      /* Q／answers 是 906 主程式的頂層 let，跨 script 可直接取用 */
      var n = 0; Q.forEach(function(q, i){ if (answers[i] === q.answer) n++; });
      return Q.length ? n / Q.length : 0;
    }catch(e){ return 0; }
  },
  /* 作業簿版：線條圖示 */
  lines: ".topbar .back, .fabsafe-bar .engwc-help, .prcat .pci, .lc .lci, .lc summary .arw",
  linesLead: ".topbar .back, .fabsafe-bar .engwc-home, .qbtn, .btn.primary, .lc .goq, .topbar h2, #s-result h3, .lsec, #installBar .ib",
  lineIcons: window.__LV_GS_ICONS || {},
  lineEmoji: { "📖":["book"], "📘":["book"], "🔤":["abc"], "🧩":["puzzle"], "🧱":["wall"], "🔥":["flame"], "→":["arrow-right"], "←":["arrow-left"],
               "✅":["check"], "❌":["circle-x"], "🗑":["trash"], "🔗":["link"], "🎯":["target"], "📄":["file-text"], "?":["help"], "▶":["chevron-right"], "📲":["device-mobile"], "➕":["plus"] }
};

/* 活潑層 engine 設定：hub（922 對外作品集入口：入口卡片、儀表板、備份還原、搜尋；沒有作答）
   來源：packages/lively/engines/hub.js（sync 時串接在 lively.js 前面）
   App 卡片的 .ic 圖示磚（字卡式「英文 2000」）是品牌層，不動。
   afterRender 接上 render／renderDash。

   作業簿版（2026-10-19）：入口頁沒有練習和結果，重點在卡片列表。
   - 會按的東西一律線條圖示：頁首 ❓、▶ 開始學習、🔍 搜尋、📊 我的進度、📲 加到桌面、儀表板摺疊列、⬇⬆ 備份還原、開啟 ▶。
   - 不是按鈕的 🆓📴📲 標籤也換線條，跟上面同一套（同一排不混用）；👋 第一次來、🎉 這類句中 emoji 是插圖，不換。
   - App 卡片 .ic 不換、不重新上色。 */
(function(){
  var HUB_ICONS = {"player-play":"<path d=\"M7 4v16l13 -8z\"/>","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>","plus":"<path d=\"M12 5l0 14\"/><path d=\"M5 12l14 0\"/>","download":"<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\"/><path d=\"M7 11l5 5l5 -5\"/><path d=\"M12 4l0 12\"/>","upload":"<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\"/><path d=\"M7 9l5 -5l5 5\"/><path d=\"M12 4l0 12\"/>","gift":"<path d=\"M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z\"/><path d=\"M12 8l0 13\"/><path d=\"M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5\"/>","wifi-off":"<path d=\"M12 18l.01 0\"/><path d=\"M9.172 15.172a4 4 0 0 1 5.656 0\"/><path d=\"M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2\"/><path d=\"M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374\"/><path d=\"M3 3l18 18\"/>","device-floppy":"<path d=\"M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2\"/><path d=\"M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M14 4l0 4l-6 0l0 -4\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>"};
  function eng(){ try{ return getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){ return ""; } }
  var RELIVE = ".rl-appbar .engwc-help, .fabsafe-bar .engwc-help, .fabsafe-bar .engwc-home, #eng81-cta > span, .search, #eng80-chips a, #installBar .ib, details.hubmore > summary, .bk button, .bk h3, .dash h3, .tags span, .dapp .dgo, .card .go, .rvc-card h3, #eng81-prog";
  function relive(){
    document.querySelectorAll(RELIVE).forEach(function(el){ if (!el.querySelector("svg.lv-line")){ el.__lvLine = false; el.__lvLineLead = false; } });
  }
  function watch(){
    if (eng() !== "hub") return;
    var t = 0;
    var run = function(){ t = 0; try{ relive(); if (window.__lvApi) window.__lvApi.refresh(); }catch(e){} };
    new MutationObserver(function(){ if (!t) t = setTimeout(run, 60); }).observe(document.body, { childList:true, subtree:true });
    run(); setTimeout(run, 700); setTimeout(run, 1700);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(watch, 0); });
  else setTimeout(watch, 0);
  window.__LV_HUB_ICONS = HUB_ICONS;
})();

window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.hub = {
  icons: ".dash .lv-hub-ico",
  installBar: "#installBar",
  afterRender: ["render", "renderDash"],
  lines: ".rl-appbar .engwc-help, .fabsafe-bar .engwc-help",
  linesLead: ".fabsafe-bar .engwc-home, #eng81-cta > span, .search, #eng80-chips a, #installBar .ib, details.hubmore > summary, .bk button, .bk h3, .dash h3, .tags span, .dapp .dgo, .card .go, .rvc-card h3, #eng81-prog",
  lineIcons: window.__LV_HUB_ICONS || {},
  lineEmoji: { "▶":["player-play"], "📲":["device-mobile"], "➕":["plus"], "⬇":["download"], "⬆":["upload"], "🆓":["gift"], "📴":["wifi-off"],
               "💾":["device-floppy"], "📖":["book"], "?":["help"], "←":["arrow-left"] }
};

/* 活潑層 engine 設定：hubhome（900 家庭版上鎖入口：開始卡、進度卡、App 卡片、跨 App 儀表板、備份還原；沒有作答）
   來源：packages/lively/engines/hubhome.js（sync 時串接在每一支的 lively.js 前面；這裡只放設定物件，不執行任何會動到頁面的程式）
   ⚠️ 900 是上鎖 App：活潑層要裝在明文（_source/index.plain.html）裡再重鎖，密碼閘外殼不裝。
   作業簿版：會按的東西一律線條圖示（🔍 搜尋、🔒 說明、📊 儀表板收合鈕、▶ 開始／開啟、⬇⬆ 備份、📲 安裝、❓ 說明）；
            進度格（📖🔁✅）、儀表板與備份標題保留 Fluent 彩色插圖。沒有結果頁、沒有英文主角字 → 不蓋章、不用四線格。
   圖示：Tabler Icons 3.19.0 outline（MIT），授權全文 vendor/tabler-icons/LICENSE.txt。
   畫面多半是 innerHTML 整段重畫（render／renderDash／renderHero／備份區掛載／安裝列），用 observeIcons 統一補換。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.hubhome = {
  lines: ".rl-appbar .engwc-help, .fabsafe-bar .engwc-help",
  linesLead: ".search, .hubtip > summary, .hubmore > summary, .heroGo .hgt, .card .go, .dapp .dgo, #installBar .ib, .bk button",
  iconsLead: ".dstat span, .dash h3, .bk h3",
  lineIcons: {
    "lock": "<path d=\"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z\"/><path d=\"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0\"/><path d=\"M8 11v-4a4 4 0 1 1 8 0v4\"/>",
    "player-play": "<path d=\"M7 4v16l13 -8z\"/>",
    "download": "<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\"/><path d=\"M7 11l5 5l5 -5\"/><path d=\"M12 4l0 12\"/>",
    "upload": "<path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\"/><path d=\"M7 9l5 -5l5 5\"/><path d=\"M12 4l0 12\"/>",
    "device-mobile": "<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>",
    "plus": "<path d=\"M12 5l0 14\"/><path d=\"M5 12l14 0\"/>"
  },
  lineEmoji: { "🔒":["lock"], "▶":["player-play"], "⬇":["download"], "⬆":["upload"], "📲":["device-mobile"], "➕":["plus"] },
  installBar: null,
  observeIcons: true
};

/* 活潑層 engine：juniorq（914 國中英文題庫 內部版）
   來源：packages/lively/engines/juniorq.js（sync_lively.py 串接在 lively.js 前面）
   914 的結構跟 920／921（以課為單位）不同：書系→主題單元的四選一題庫、生字本、計時模擬測驗、總複習（RV2），所以另開一個 engine。

   上鎖 App（題庫 PBKDF2＋AES-256-GCM 加密內嵌），活潑層只碰「畫面」：
   - 不解密、不讀題庫內容；只看 App 畫完的 DOM 與 App 自己的進度變數（view／quiz／mock）。
   - 答案判定、錯題本、RV2 紀錄都不動。包住的函式一律「先跑原函式、自己出錯只吞掉」。

   為什麼不直接 observe「.opt.ok／.opt.bad」：
   - 答錯時 App 也會把「正解」標 .ok → 答錯會被當成答對；
   - 模擬測驗的 .ok 只是「我選了這個」（交卷前不揭曉），不是答對。
   所以這裡包住作答函式（answer／usageAns／rvPick；總複習填空走 rvRecord），
   只在「這一次作答」的那一個元素加 lv-ans-ok／lv-ans-no，核心的 observe 只看這兩個記號。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}

  /* Tabler Icons 3.19.0 outline（MIT），核心沒有的才補 */
  var LINES = {
    "book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>",
    "book-2":"<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\"/><path d=\"M19 16h-12a2 2 0 0 0 -2 2\"/><path d=\"M9 8h6\"/>",
    "file-text":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\"/><path d=\"M9 9l1 0\"/><path d=\"M9 13l6 0\"/><path d=\"M9 17l6 0\"/>",
    "circle-check":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 12l2 2l4 -4\"/>",
    "stopwatch":"<path d=\"M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0z\"/><path d=\"M14.5 10.5l-2.5 2.5\"/><path d=\"M17 8l1 -1\"/><path d=\"M14 3h-4\"/>",
    "notebook":"<path d=\"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18\"/><path d=\"M13 8l2 0\"/><path d=\"M13 12l2 0\"/>",
    "mood-confuzed":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 10l.01 0\"/><path d=\"M15 10l.01 0\"/><path d=\"M9.5 16a10 10 0 0 1 6 -1.5\"/>",
    "x":"<path d=\"M18 6l-12 12\"/><path d=\"M6 6l12 12\"/>"
  };

  window.__LV_ENGINES.juniorq = {
    observe: { correct: ".lv-ans-ok", wrong: ".lv-ans-no" },
    lineIcons: LINES,
    /* 📗文法 📘閱讀 📖講義 📄文本 ✏️單元 ✅完成 ⏱️模擬 ⏰到期 🤔用刪的 ✕刪除（其餘 📝⭐🔊📊📋 核心已有） */
    lineEmoji: { "📗":["book"], "📘":["book-2"], "📖":["notebook"], "📄":["file-text"], "✅":["circle-check"],
                 "⏱":["stopwatch"], "⏰":["alarm"], "🤔":["mood-confuzed"], "✕":["x"] },
    /* 會按的東西一律線條圖示 */
    lines: "#app .row > .ava, #app .iconbtn",
    linesLead: "#app .btn, #app .seg button, #fab, #sheetbox .btn",
    /* 彩色只當插圖：歡迎卡的連續天數火焰、結果頁的大彩球 */
    flame: "#app .hero .streak",
    icons: "#app .lv-jq-result > div:first-child",
    /* 四線格：生字翻卡、點字查詢的那個英文字 */
    four: "#app .flash .word, #sheetbox .w",
    /* 紅筆圈章：今日目標達成蓋在歡迎卡右上角 */
    goalDone: function(){ try{ return S.goal > 0 && (S.days[today()]||0) >= S.goal; }catch(e){ return false; } },
    goalHost: "#app .hero",
    afterRender: ["paint", "rvSeg", "openWord", "refreshFab"],
    celebrateFns: ["__lvJqCheer"]
  };
  if (ENG !== "juniorq") return;

  window.__lvJqCheer = function(){};
  function cheer(){ try{ window.__lvJqCheer(); }catch(e){} }
  function mark(el, ok){ if (el && el.classList) el.classList.add(ok ? "lv-ans-ok" : "lv-ans-no"); }
  function $(s){ return document.querySelector(s); }

  var depth = 0;
  function wrap(name, before, after){
    var o = window[name];
    if (typeof o !== "function" || o.__lvj) return;
    var w = function(){
      var pre = null;
      try{ pre = before ? before.apply(this, arguments) : null; }catch(e){}
      depth++;
      var r;
      try{ r = o.apply(this, arguments); } finally { depth--; }
      try{ if (after) after.call(this, arguments, pre); }catch(e){}
      return r;
    };
    w.__lvj = true; window[name] = w;
  }
  /* 揭曉後：有選錯的＝答錯（搖選錯的那個），否則＝答對（彈正解） */
  function reveal(box){
    var no = $(box + " .opt.bad");
    if (no) mark(no, false); else mark($(box + " .opt.ok"), true);
  }
  /* 單元練習／錯題本：answer(pick) 揭曉一次（App 揭曉後就拿掉 onclick） */
  wrap("answer", function(){ return { fresh: !$("#opts .opt.ok, #opts .opt.bad") }; },
       function(a, pre){ if (pre && pre.fresh) reveal("#opts"); });
  /* 生字造句 */
  wrap("usageAns", function(){ return { fresh: !$("#uopts .opt.ok, #uopts .opt.bad") }; },
       function(a, pre){ if (pre && pre.fresh) reveal("#uopts"); });
  /* 總複習選擇題：rvPk 非 null＝這題已經選過 */
  wrap("rvPick", function(){ return { fresh: window.rvPk == null }; },
       function(a, pre){ if (pre && pre.fresh) reveal("#rvopts"); });
  /* 自評「我確定／用刪的」只是記紀錄，不是另一次作答 */
  wrap("rvSelf", null, null);
  /* 總複習文法填空：只有 rvRecord(qid, ok, credited) 這個出口（rvPick／rvSelf 裡面呼叫的不算） */
  wrap("rvRecord", null, function(a){
    if (depth !== 0) return;
    var ok = !!a[1];
    setTimeout(function(){ try{ mark($("#rvfb .exp"), ok); }catch(e){} }, 0);
  });
  /* 生字浮動鈕：App 每次都用 textContent 重寫「⭐ 生字 N」→ 讓核心重新換成線條星星 */
  wrap("refreshFab", null, function(){ var f = document.getElementById("fab"); if (f) f.__lvLineLead = false; });

  /* 每次換畫面：結果頁蓋章（單元練習／模擬測驗／總複習診斷） */
  var cheered = null;
  function resultOf(){
    try{
      var v = view.cur; if (!v) return null;
      if (v.t === "quiz" && quiz && quiz.i >= quiz.ids.length) return { s: quiz, p: quiz.ids.length ? quiz.ok / quiz.ids.length : 0 };
      if (v.t === "mockresult" && mock && mock.ids.length) return { s: mock, p: mock.score / mock.ids.length };
      if (v.t === "rvdiag" && v.p != null) return { s: v, p: v.p / 100 };
    }catch(e){}
    return null;
  }
  wrap("paint", null, function(){
    var res = resultOf(); if (!res) return;
    var host = $("#app .card.center"); if (!host) return;
    host.classList.add("lv-jq-result");
    var p = Math.max(0, Math.min(1, res.p));
    try{ if (window.__lvApi) window.__lvApi.stamp(host, p); }catch(e){}
    if (p >= .8 && cheered !== res.s){ cheered = res.s; setTimeout(cheer, 250); }
  });
})();

/* 活潑層 engine：lesson（920／921 以「課」為單位的複習程式（同一套））
   來源：packages/lively/engines/lesson.js（sync_lively.py 串接在 lively.js 前面）

   這兩支是上鎖 App（題庫 PBKDF2＋AES-256-GCM 加密內嵌），活潑層只碰「畫面」：
   - 不解密、不讀題庫內容；只看 App 畫完的 DOM 與 App 自己的進度變數（CUR／Q／GQ／T／F）。
   - 答案判定、SRS、錯題本、計分都不動。包住的函式一律「先跑原函式、自己出錯只吞掉」。

   為什麼不直接 observe「.opt.ok／.opt.bad」：
   - 選擇題答錯時 App 也會把「正解」標 .ok → 答錯會被當成答對；
   - 拼字／打字／拼句的回饋是整段 innerHTML 插入（新元素一出生就帶 class，沒有 class 變動）；
   - 921 閱讀測驗答完會整頁重畫。
   所以這裡包住 App 記錄對錯的收斂點（markResult／markGram；921 閱讀走 markCorrect／addWrong），
   只在「這一次作答」的那一個元素加 lv-ans-ok／lv-ans-no，核心的 observe 只看這兩個記號。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  /* 所有 engines/*.js 都會串進每一支 App 的 lively.js → 只有 engine=lesson 的 App 才包函式 */
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}

  /* Tabler Icons 3.19.0 outline（MIT），核心沒有的才補 */
  var LINES = {
    "abc":"<path d=\"M3 16v-6a2 2 0 1 1 4 0v6\"/><path d=\"M3 13h4\"/><path d=\"M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1\"/><path d=\"M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01\"/>",
    "puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>",
    "writing":"<path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z\"/><path d=\"M16 7h4\"/><path d=\"M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3\"/>",
    "book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>",
    "book-2":"<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\"/><path d=\"M19 16h-12a2 2 0 0 0 -2 2\"/><path d=\"M9 8h6\"/>",
    "file-text":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\"/><path d=\"M9 9l1 0\"/><path d=\"M9 13l6 0\"/><path d=\"M9 17l6 0\"/>",
    "mood-sad":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 10l.01 0\"/><path d=\"M15 10l.01 0\"/><path d=\"M9.5 15.25a3.5 3.5 0 0 1 5 0\"/>",
    "mood-smile":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 10l.01 0\"/><path d=\"M15 10l.01 0\"/><path d=\"M9.5 15a3.5 3.5 0 0 0 5 0\"/>",
    "mood-happy":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 9l.01 0\"/><path d=\"M15 9l.01 0\"/><path d=\"M8 13a4 4 0 1 0 8 0h-8\"/>",
    "confetti":"<path d=\"M4 5h2\"/><path d=\"M5 4v2\"/><path d=\"M11.5 4l-.5 2\"/><path d=\"M18 5h2\"/><path d=\"M19 4v2\"/><path d=\"M15 9l-1 1\"/><path d=\"M18 13l2 -.5\"/><path d=\"M18 19h2\"/><path d=\"M19 18v2\"/><path d=\"M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z\"/>"
  };

  window.__LV_ENGINES.lesson = {
    observe: { correct: ".lv-ans-ok", wrong: ".lv-ans-no" },
    lineIcons: LINES,
    /* 一課的入口：📘單字 🧩片語 ✍️句型 📗文法 📄閱讀 📖課文；字卡自評 😵🙂😎；「看結果 🎉」 */
    lineEmoji: { "📘":["abc"], "🧩":["puzzle"], "✍":["writing"], "📗":["book"], "📄":["file-text"], "📖":["book-2"],
                 "😵":["mood-sad"], "🙂":["mood-smile"], "😎":["mood-happy"], "🎉":["confetti"] },
    /* 會按的東西一律線條圖示 */
    lines: ".navtile > .ic, .txtentry > .ic, #app .spk",
    linesLead: "#app .btn, #app .card > h3, #app .spk.word, #app .rate button",
    /* 彩色只當插圖：結果頁的大獎盃／彩球 */
    icons: "#app .lv-kx-result > div:first-child",
    /* 四線格：字卡正面的英文、英→中測驗的題目字（由 engine 標 .lv-kx-word） */
    four: "#app .lv-kx-word",
    /* 紅筆圈章：今日目標達成蓋在目標列上 */
    goalDone: function(){ try{ return S.goal > 0 && (S.days[today()]||0) >= S.goal; }catch(e){ return false; } },
    goalHost: "#app .lv-kx-goal",
    afterRender: ["paint"],
    celebrateFns: ["__lvKxCheer"]
  };
  if (ENG !== "lesson") return;

  /* 核心用 celebrateFns 包這個空函式：呼叫它＝放大彩帶（簡潔／減少動態時核心自己會略過） */
  window.__lvKxCheer = function(){};
  function cheer(){ try{ window.__lvKxCheer(); }catch(e){} }
  function mark(el, ok){ if (el && el.classList) el.classList.add(ok ? "lv-ans-ok" : "lv-ans-no"); }
  function app(){ return document.getElementById("app"); }

  var depth = 0;   // >0＝正在 markResult／markGram 裡（裡面呼叫的 markCorrect／addWrong 不重複算）
  function wrapAfter(name, after){
    var o = window[name];
    if (typeof o !== "function" || o.__lvk) return;
    var w = function(){
      depth++;
      var r;
      try{ r = o.apply(this, arguments); } finally { depth--; }
      var a = arguments;
      try{ after.call(this, a); }catch(e){}
      return r;
    };
    w.__lvk = true; window[name] = w;
  }

  /* 這一次作答的回饋位置：App 畫完回饋之後（下一個 tick）才找 */
  function feedback(ok){
    setTimeout(function(){
      try{
        var root = app(); if (!root) return;
        var el = ok ? root.querySelector(".opt.ok:not(.lv-ans-ok), .slot.ok, .fb.ok")
                    : root.querySelector(".opt.bad:not(.lv-ans-no), .slot.bad, .fb.bad, .hintbox:not([style*='none'])");
        if (!el) el = root.querySelector("#fb .fb, #fb .hintbox");
        mark(el, ok);
      }catch(e){}
    }, 0);
  }
  /* 單字／片語測驗、中翻英、總複習都匯到 markResult(cat, id, ok, …)；文法選擇題是 markGram(it, ok) */
  wrapAfter("markResult", function(a){ if (depth === 0) feedback(!!a[2]); });
  wrapAfter("markGram", function(a){ if (depth === 0) feedback(!!a[1]); });

  /* 921 閱讀測驗：答一題就 markCorrect／addWrong 再整頁重畫 → 記住剛點的選項，重畫後在同一個選項上回饋 */
  var lastOpt = null;
  document.addEventListener("click", function(e){
    try{ var b = e.target && e.target.closest && e.target.closest("#app .opt[data-q][data-o]"); lastOpt = b ? { q:b.getAttribute("data-q"), o:b.getAttribute("data-o") } : lastOpt; }catch(err){}
  }, true);
  function readFeedback(ok){
    try{ if (depth !== 0 || CUR !== "read" || !lastOpt) return; }catch(e){ return; }
    var p = lastOpt; lastOpt = null;
    setTimeout(function(){
      try{ mark(app().querySelector('.opt[data-q="' + p.q + '"][data-o="' + p.o + '"]'), ok); }catch(e){}
    }, 0);
  }
  wrapAfter("markCorrect", function(){ readFeedback(true); });
  wrapAfter("addWrong", function(a){ if (!a[3]) readFeedback(false); });   // a[3]＝soft（字卡自評「不會」），不是作答

  /* 每次換畫面：標四線格、目標列、結果頁蓋章 */
  var cheered = null;
  function resultOf(){
    try{
      if (CUR === "quiz" && Q && Q.i >= Q.items.length) return { s: Q, r: Q.right, n: Q.items.length };
      if (CUR === "gquiz" && GQ && GQ.i >= GQ.items.length) return { s: GQ, r: GQ.right, n: GQ.items.length };
      if (CUR === "transRun" && T && T.i >= T.items.length) return { s: T, r: T.right, n: T.items.length };
      if (CUR === "finalRun" && F && F.i >= F.items.length){
        var base = F.review ? F.items.length : Math.max(1, F.items.length - (F.self || 0));   // 跟 App 結算同一個分母
        return { s: F, r: F.right, n: base };
      }
    }catch(e){}
    return null;
  }
  wrapAfter("paint", function(){
    var root = app(); if (!root) return;
    /* 字卡正面（還沒翻）＝英文主角 */
    try{
      if (CUR === "card" && CARD && !CARD.flipped){ var big = root.querySelector("#flip .big"); if (big) big.classList.add("lv-kx-word"); }
      /* 英→中測驗的題目字：只包住英文字本身，旁邊的發音鈕不進四線格 */
      if (CUR === "quiz" && Q && Q.i < Q.items.length && Q.dir === "en2zh"){
        var zh = root.querySelector(".card > .zh"), t = zh && zh.firstChild;
        if (t && t.nodeType === 3 && t.nodeValue.trim()){
          var sp = document.createElement("span"); sp.className = "lv-kx-word"; sp.textContent = t.nodeValue.trim();
          zh.replaceChild(sp, t); zh.insertBefore(document.createTextNode(" "), sp.nextSibling);
        }
      }
      /* 首頁「今日目標」那一列 */
      if (CUR === "home"){ var pg = root.querySelector(".card .prog"); if (pg && pg.parentNode) pg.parentNode.classList.add("lv-kx-goal"); }
    }catch(e){}
    /* 結果頁：依答對率蓋章，≥80% 放大彩帶（同一輪只放一次） */
    var res = resultOf();
    if (res && res.n > 0){
      var cards = root.querySelectorAll(".card.center"), host = cards[cards.length - 1];
      if (host){
        host.classList.add("lv-kx-result");
        var p = Math.max(0, Math.min(1, res.r / res.n));
        try{ if (window.__lvApi) window.__lvApi.stamp(host, p); }catch(e){}
        if (p >= .8 && cheered !== res.s){ cheered = res.s; setTimeout(cheer, 250); }
      }
    }
  });
})();

/* 活潑層 engine：phrases（918 英語片語：身分 → 首頁 → 片語卡翻卡／片語測驗／錯題本，跟文法題庫是不同的一套程式）
   來源：packages/lively/engines/phrases.js（sync_lively.py 串接在 lively.js 前面）
   2026-10-19 作業簿版加入。上鎖 App：活潑層裝在 _source/index.plain.html（明文，gitignore），重鎖後才會生效。

   答對／答錯：answer() 會把正解加 .ok、選錯的加 .bad（同一批變動）→ 核心 observe 直接看就對了
   （同一批有答錯就搖答錯的那個，否則彈答對的那個）。翻卡的「不會／會了」是自評，不算答題，不給回饋。
   兩個小遊戲（🏀 灌籃 PK、🔫 三角洲）是全螢幕深色畫面，活潑層不碰。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}
  var D = document, root = D.documentElement;
  var ICONS = {"arrow-right":"<path d=\"M5 12l14 0\"/><path d=\"M13 18l6 -6\"/><path d=\"M13 6l6 6\"/>","ball-basketball":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M5.65 5.65l12.7 12.7\"/><path d=\"M5.65 18.35l12.7 -12.7\"/><path d=\"M12 3a9 9 0 0 0 9 9\"/><path d=\"M3 12a9 9 0 0 1 9 9\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","book-2":"<path d=\"M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z\"/><path d=\"M19 16h-12a2 2 0 0 0 -2 2\"/><path d=\"M9 8h6\"/>","chalkboard":"<path d=\"M8 19h-3a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v11a1 1 0 0 1 -1 1\"/><path d=\"M11 16m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/>","circle-check":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 12l2 2l4 -4\"/>","file-text":"<path d=\"M14 3v4a1 1 0 0 0 1 1h4\"/><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\"/><path d=\"M9 9l1 0\"/><path d=\"M9 13l6 0\"/><path d=\"M9 17l6 0\"/>","mood-happy":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 9l.01 0\"/><path d=\"M15 9l.01 0\"/><path d=\"M8 13a4 4 0 1 0 8 0h-8\"/>","mood-sad":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 10l.01 0\"/><path d=\"M15 10l.01 0\"/><path d=\"M9.5 15.25a3.5 3.5 0 0 1 5 0\"/>","mood-smile":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 10l.01 0\"/><path d=\"M15 10l.01 0\"/><path d=\"M9.5 15a3.5 3.5 0 0 0 5 0\"/>","plant-2":"<path d=\"M2 9a10 10 0 1 0 20 0\"/><path d=\"M12 19a10 10 0 0 1 10 -10\"/><path d=\"M2 9a10 10 0 0 1 10 10\"/><path d=\"M12 4a9.7 9.7 0 0 1 2.99 7.5\"/><path d=\"M9.01 11.5a9.7 9.7 0 0 1 2.99 -7.5\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","plus":"<path d=\"M12 5l0 14\"/><path d=\"M5 12l14 0\"/>","search":"<path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/><path d=\"M21 21l-6 -6\"/>","target":"<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\"/><path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/>","user":"<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\"/><path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\"/>","x":"<path d=\"M18 6l-12 12\"/><path d=\"M6 6l12 12\"/>"};
  var EMO = {
    "→":["arrow-right"], "←":["arrow-left"], "▶":["player-play"], "❌":["x","coral"], "✕":["x"], "📘":["book-2"], "📝":["pencil"],
    "📖":["book"], "👤":["user"], "🔄":["repeat"], "🏀":["ball-basketball"], "🔫":["target"], "➕":["plus"], "👩‍🏫":["chalkboard"],
    "🌱":["plant-2","green"], "😵":["mood-sad"], "🙂":["mood-smile"], "😎":["mood-happy"], "✏":["pencil"], "📄":["file-text"],
    "🎉":["circle-check","green"], "🃏":["cards","sun"], "⭐":["star","sun"], "📊":["chart-bar"], "⚙":["settings"], "🔍":["search"]
  };
  window.__LV_ENGINES.phrases = {
    observe: { correct: "#view .opt.ok", wrong: "#view .opt.bad" },
    lineIcons: ICONS, lineEmoji: EMO,
    lines: "#botnav button > i, #backbtn, #view .mrow .mi, #view .unitcard .mi, #view .tile .ico, .fabsafe-bar .engwc-help",
    linesLead: "#view .btn, #view .skill .t, .uf-top button, #view .gradeRow button, .uf-res .acts button, .fabsafe-bar .engwc-home",
    icons: "#view > .center > div:first-child",
    afterRender: ["render", "next"],
    celebrateFns: ["__lvPhCheer"]
  };
  if (ENG !== "phrases") return;
  /* 918 原本沒有深色模式（顏色全寫死淺色）：活潑層也固定淺色 */
  if (!root.hasAttribute("data-theme")) root.setAttribute("data-theme", "light");

  window.__lvPhCheer = function(){};
  function cheer(){ try{ window.__lvPhCheer(); }catch(e){} }
  function wrap(name, after){
    var o = window[name];
    if (typeof o !== "function" || o.__lvp) return;
    var w = function(){ var r = o.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; };
    w.__lvp = true; window[name] = w;
  }
  /* 四線格：片語卡正面的片語；測驗選項是短片語時（選項文字包一層 span，按鈕本身與點擊不動） */
  var SHORT = /^[A-Za-z][A-Za-z '’\-\/.,!?()…]{0,30}$/;
  function decorateQuiz(){
    D.querySelectorAll("#view .flash .w").forEach(function(w){ w.classList.add("lv-four"); });
    D.querySelectorAll("#view .opt").forEach(function(b){
      if (b.__lvp) return; b.__lvp = 1;
      var lab = b.querySelector(".lab"), t = lab && lab.nextSibling;
      if (!t || t.nodeType !== 3) return;
      var s = D.createElement("span"); s.className = "lv-optx"; s.textContent = t.nodeValue;
      b.replaceChild(s, t);
      if (SHORT.test(s.textContent.trim())) s.classList.add("lv-four");
    });
  }
  wrap("scQuiz", decorateQuiz);
  /* renderFlash 翻面時是改 innerHTML（點擊事件裡），翻完再補一次四線格 */
  D.addEventListener("click", function(e){
    var f = e.target && e.target.closest && e.target.closest("#view .flash");
    if (f) setTimeout(function(){ decorateQuiz(); try{ window.__lvApi && window.__lvApi.refresh(); }catch(err){} }, 0);
  });
  /* 一輪做完：插圖換 Fluent（核心 icons）＋紅筆圈章；答對率 ≥ 80% 放大彩帶 */
  wrap("finish", function(){
    var c = D.querySelector("#view > .center"), sb = c && c.querySelector(".statbig");
    if (!sb) return;
    var m = sb.textContent.match(/(\d+)\s*\/\s*(\d+)/); if (!m || !+m[2]) return;
    var p = +m[1] / +m[2];
    if (window.__lvApi) window.__lvApi.stamp(c, p);
    if (p >= .8) setTimeout(cheer, 250);
  });
})();

/* 活潑層 engine 設定：pinju（903 英語拼句）
   來源：packages/lively/engines/pinju.js（sync 時串接在 lively.js 前面）

   903 的 check() 判完對錯只改「同一個」#sheet 的 class（sheet ok show／sheet no show），
   而核心 observe 用 WeakSet 記住觸發過的元素 → 只有第一題會觸發。
   在不改核心的前提下：包住 check()，每次作答把 #sheetHd 的內容包進一個「新的」標記 span，
   掛上 DOM 之後才加 lv-pj-ok／lv-pj-no → 核心 observe 每題都看得到（彈跳／搖晃也就落在面板標題上）。
   靠提示拼對的不算答對（App 自己也不計正確率），不觸發也不中斷連對。
   核心若之後支援「可重複觸發的 observe」或「wrap 一個沒有參數的判題函式＋讀結果」，這段可以拿掉。

   作業簿版（2026-10-19）：
   - 會按的東西一律線條圖示：底部選單、🔊 發音鈕、✕ 離開、💡 提示、👂 聽力、▶ 開始闖關、⬅ 入口／❓、上鎖關卡的 🔒。
     關卡／單元的主題 emoji（🧒🍎…）是內容插圖，不換；首頁統計 🔥⭐🏅 是插圖，不換。
   - 四線格：答完後面板裡「排好的英文句子」（#sheetSol b）。超過 30 個字元（約一行）就不用四線格。
   - 紅筆圈章：單元／複習完成頁，依畫面上的「正確率」蓋在獎盃旁。 */
(function(){
  var PJ_ICONS = {"puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","x":"<path d=\"M18 6l-12 12\"/><path d=\"M6 6l12 12\"/>","bulb":"<path d=\"M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7\"/><path d=\"M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3\"/><path d=\"M9.7 17l4.6 0\"/>","ear":"<path d=\"M6 10a7 7 0 1 1 13 3.6a10 10 0 0 1 -2 2a8 8 0 0 0 -2 3a4.5 4.5 0 0 1 -6.8 1.4\"/><path d=\"M10 10a3 3 0 1 1 5 2.2\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","lock":"<path d=\"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z\"/><path d=\"M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0\"/><path d=\"M8 11v-4a4 4 0 1 1 8 0v4\"/>","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>","plus":"<path d=\"M12 5l0 14\"/><path d=\"M5 12l14 0\"/>"};
  var FOUR_MAX = 30;   // 句子超過這個長度（含標點）就不畫四線格，免得折行
  function eng(){ try{ return getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){ return ""; } }
  function mark(ok){
    var hd = document.getElementById("sheetHd"); if (!hd) return;
    var s = document.createElement("span"); s.className = "lv-pj-mark";
    while (hd.firstChild) s.appendChild(hd.firstChild);
    hd.appendChild(s);
    s.className = "lv-pj-mark " + (ok ? "lv-pj-ok" : "lv-pj-no");   // 掛上去之後才改 class，observe 才收得到
  }
  function four(){
    var b = document.querySelector("#sheetSol > b"); if (!b || b.__pjFour) return;
    b.__pjFour = true;
    var t = (b.textContent || "").trim();
    if (t && t.length <= FOUR_MAX && /[A-Za-z]/.test(t)) b.classList.add("lv-four", "lv-pj-four");
  }
  /* 上鎖的 🔒：只有它換線條，主題 emoji 不換（同一個圓圈裡，選擇器分不出內容，所以先貼記號） */
  function tagLocks(){
    document.querySelectorAll(".card .ring > i, .unode .udot, .unode .st-lock").forEach(function(el){
      if (!el.querySelector("svg") && (el.textContent||"").trim() === "🔒") el.classList.add("lv-pj-lock");
    });
  }
  /* App 用 textContent／innerHTML 重設過的元素：清掉「已換過」記號，讓核心再換一次 */
  var RELIVE = "nav button > .ni, .spk-btn, #lesson .top .x, .engwc-help, .engwc-home, #hintBtn, #lchip, .eng80-go, #installBar .install-btn";
  function relive(){
    document.querySelectorAll(RELIVE).forEach(function(el){ if (!el.querySelector("svg.lv-line")){ el.__lvLine = false; el.__lvLineLead = false; } });
  }
  function hook(){
    // 這個檔會串進「每一支」App 的 lively.js：只在 engine＝pinju 且有拼句結果面板時才動手
    if (eng() !== "pinju" || !document.getElementById("sheetHd")) return;
    if (typeof window.check === "function" && !window.check.__lvpj){
      var orig = window.check;
      var w = function(){
        var r = orig.apply(this, arguments);
        try{
          var sh = document.getElementById("sheet");
          if (sh && sh.classList.contains("show")){
            var hinted = false; try{ hinted = !!qHinted; }catch(e){}
            if (sh.classList.contains("ok")){ if (!hinted) mark(true); }
            else if (sh.classList.contains("no")) mark(false);
          }
          four();
        }catch(e){}
        return r;
      };
      w.__lvpj = true; window.check = w;
    }
    /* 完成頁蓋章：讀畫面上的正確率（跟 App 顯示的數字一致，不另外算） */
    if (typeof window.finish === "function" && !window.finish.__lvpjDone){
      var of = window.finish;
      var f = function(){
        var r = of.apply(this, arguments);
        try{
          var m = ((document.getElementById("dAcc")||{}).textContent||"").match(/(\d+)/);
          if (m && window.__lvApi) window.__lvApi.stamp("#doneEmoji", Math.min(1, +m[1] / 100));
        }catch(e){}
        return r;
      };
      f.__lvpjDone = true; window.finish = f;
    }
  }
  function watch(){
    if (eng() !== "pinju") return;
    var t = 0;
    var run = function(){ t = 0; try{ relive(); tagLocks(); four(); if (window.__lvApi) window.__lvApi.refresh(); }catch(e){} };
    new MutationObserver(function(){ if (!t) t = setTimeout(run, 60); }).observe(document.body, { childList:true, subtree:true });
    run();
  }
  try{ hook(); }catch(e){}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ try{ hook(); }catch(e){} setTimeout(watch, 0); });
  else setTimeout(watch, 0);
  window.__LV_PJ_ICONS = PJ_ICONS;
})();

window.__LV_ENGINES = window.__LV_ENGINES || {};
window.__LV_ENGINES.pinju = {
  observe: { correct: "#sheetHd .lv-pj-ok", wrong: "#sheetHd .lv-pj-no" },
  /* 彩色 Fluent 只當插圖：首頁「🔥 連續天數」的火焰換成會晃的 Fluent 火焰。
     icons 仍要給一個值：核心 decorate() 在 icons 空的時候會連 flame 一起跳過。 */
  icons: "#learn .lv-pj-ico",
  flame: ".hero .stats .st b",
  /* 會按的東西：整顆就是一個符號的 → lines；符號寫在文字前後的 → linesLead */
  lines: "nav button > .ni, .spk-btn, #lesson .top .x, .engwc-help, .lv-pj-lock",
  linesLead: ".engwc-home, #hintBtn, #lchip, .eng80-go, #installBar .install-btn",
  lineIcons: window.__LV_PJ_ICONS || {},
  lineEmoji: { "🧩":["puzzle"], "📕":["book"], "✕":["x"], "💡":["bulb"], "👂":["ear"], "▶":["player-play"], "🔒":["lock"], "?":["help"], "←":["arrow-left"], "📲":["device-mobile"], "➕":["plus"] },
  installBar: "#installBar",
  afterRender: ["renderLearn"],
  celebrateFns: ["finish"]                 // 單元／複習完成 → 大彩帶（複習就該被獎勵）
};

/* 活潑層 engine：qbank（915 會考／916 學測 官方題庫引擎，同一套程式）
   來源：packages/lively/engines/qbank.js（sync_lively.py 串接在 lively.js 前面）

   為什麼不直接 observe「.opt.correct／.opt.wrong」：
   - 作答（pick）後 drawRun 用 innerHTML 整頁重畫，新選項一出生就帶 class → 不會有 class 變動事件；
   - 閱讀題組 revealGroup、整卷交卷會一次把好幾題標上對錯 → 一次撒好幾次彩帶；
   - 總複習／嚴格錯題本（rvLock）答錯時也會把「正解」標 .ok → 答錯會被當成答對。
   所以這裡包住 App 的作答函式，只在「這一次作答」的那一個選項加上 lv-ans-ok／lv-ans-no，
   核心的 observe 只看這兩個記號。包裝自己出錯一律吞掉，App 原本流程不受影響。 */
window.__LV_ENGINES = window.__LV_ENGINES || {};
(function(){
  "use strict";
  /* 所有 engines/*.js 都會串進每一支 App 的 lively.js → 只有 engine=qbank 的 App 才包函式 */
  var ENG = ""; try{ ENG = getComputedStyle(document.documentElement).getPropertyValue("--lv-engine").trim(); }catch(e){}
  window.__LV_ENGINES.qbank = {
    observe: { correct: ".lv-ans-ok", wrong: ".lv-ans-no" },
    /* 作業簿版（2026-10-19）：彩色 Fluent 只當插圖（考試倒數、每日一練大卡）；會按的東西一律線條圖示 */
    icons: ".cd .cdi, #v-home .mode.daily .mi",
    lines: ".nav button > .ni, .rl-appbar .iconbtn, #v-home .mode:not(.daily) .mi, #v-diagnose .mode .mi, .engwc-help, #v-run .audio > button, .rhead .iconbtn, #favBtn",
    linesLead: ".engwc-home, .wrap .sect, #v-run .tag, .rev-item .tag, .rhead > b, .bar .lb > span:first-child, #v-run .btn",
    lineIcons: {"abc":"<path d=\"M3 16v-6a2 2 0 1 1 4 0v6\"/><path d=\"M3 13h4\"/><path d=\"M10 8v6a2 2 0 1 0 4 0v-1a2 2 0 1 0 -4 0v1\"/><path d=\"M20.732 12a2 2 0 0 0 -3.732 1v1a2 2 0 0 0 3.726 1.01\"/>","puzzle":"<path d=\"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1\"/>","bulb":"<path d=\"M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7\"/><path d=\"M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3\"/><path d=\"M9.7 17l4.6 0\"/>","book":"<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>","headphones":"<path d=\"M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\"/><path d=\"M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z\"/><path d=\"M4 15v-3a8 8 0 0 1 16 0v3\"/>","wall":"<path d=\"M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\"/><path d=\"M4 8h16\"/><path d=\"M20 12h-16\"/><path d=\"M4 16h16\"/><path d=\"M9 4v4\"/><path d=\"M14 8v4\"/><path d=\"M8 12v4\"/><path d=\"M16 12v4\"/><path d=\"M11 16v4\"/>","writing":"<path d=\"M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z\"/><path d=\"M16 7h4\"/><path d=\"M18 19h-13a2 2 0 1 1 0 -4h4a2 2 0 1 0 0 -4h-3\"/>","barbell":"<path d=\"M2 12h1\"/><path d=\"M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2\"/><path d=\"M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z\"/><path d=\"M9 12h6\"/><path d=\"M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z\"/><path d=\"M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2\"/><path d=\"M22 12h-1\"/>","circle-check":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M9 12l2 2l4 -4\"/>","target":"<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\"/><path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/>","circle-x":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M10 10l4 4m0 -4l-4 4\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","trash":"<path d=\"M4 7l16 0\"/><path d=\"M10 11l0 6\"/><path d=\"M14 11l0 6\"/><path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\"/><path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\"/>"},
    lineEmoji: { "🔤":["abc"], "🧩":["puzzle"], "💡":["bulb","sun"], "📖":["book"], "🎧":["headphones","green"], "🧱":["wall"], "✍":["writing"],
                 "💪":["barbell","coral"], "🎯":["target"], "✅":["circle-check"], "▶":["player-play"], "🗑":["trash"], "←":["arrow-left"],
                 "🔥":["flame","sun"], "★":["star"], "⭐":["star","sun"], "🔁":["repeat","coral"], "📘":["book"], "🤔":["help"], "❌":["circle-x","coral"] },
    afterRender: ["renderHome", "renderDiagnose", "renderWrong", "renderFav", "renderSettings", "renderNonchoice",
                  "drawRun", "rvRenderQ", "rvWrongRender", "finish", "rvFinishReview", "rvWrongDone"],
    celebrateFns: ["__lvQbankCheer"]
  };
  if (ENG !== "qbank") return;

  function mark(el, ok){ if (el && el.classList) el.classList.add(ok ? "lv-ans-ok" : "lv-ans-no"); }
  function wrap(name, before, after){
    var o = window[name];
    if (typeof o !== "function" || o.__lvq) return;
    var w = function(){
      var pre = null;
      try{ pre = before ? before.apply(this, arguments) : null; }catch(e){}
      var r = o.apply(this, arguments);
      try{ after.call(this, arguments, pre); }catch(e){}
      return r;
    };
    w.__lvq = true; window[name] = w;
  }
  function cheer(){ try{ if (typeof window.__lvQbankCheer === "function") window.__lvQbankCheer(); }catch(e){} }
  /* 核心用 celebrateFns 包這個空函式：呼叫它＝放大彩帶（簡潔／減少動態時核心自己會略過） */
  window.__lvQbankCheer = function(){};

  /* 單題作答（題型專練／聽力／每日一練／錯題／收藏）；整卷模擬（exam）作答當下不揭曉，不觸發 */
  wrap("pick", function(){
    /* sess 是 App 的全域 let，跨 script 可直接讀 */
    var q = sess.list[sess.i];
    return { fresh: sess.mode !== "exam" && sess.picks[q.id] == null };
  }, function(a, pre){
    if (!pre || !pre.fresh) return;
    var k = a[0], hit = null;
    document.querySelectorAll("#v-run .opts .opt").forEach(function(b){
      var kk = b.querySelector(".k"); if (kk && kk.textContent === k) hit = b;
    });
    if (hit) mark(hit, hit.classList.contains("correct"));
  });

  /* 閱讀題組「對答案」：一次揭曉整篇 → 只回饋一次（有錯＝第一個選錯的搖一下；全對＝本篇結果彈跳） */
  wrap("revealGroup", function(){
    var g = groupRange(sess.i), pk = sess.list[g[0]].pkey;
    return { fresh: !(sess.revealed && sess.revealed.has(pk)) };
  }, function(a, pre){
    if (!pre || !pre.fresh) return;
    var no = document.querySelector("#v-run .opt.wrong");
    if (no) mark(no, false); else mark(document.querySelector("#v-run > .fb.ok"), true);
  });

  /* 總複習／嚴格錯題本：rvLock 會把正解標 .ok、選錯標 .no */
  function rvAfter(box){
    return function(a, pre){
      if (!pre || !pre.fresh) return;
      var no = document.querySelector(box + " .opt.no");
      if (no) mark(no, false); else mark(document.querySelector(box + " .opt.ok"), true);
    };
  }
  wrap("rvPick", function(){ return { fresh: window.rvPk == null }; }, rvAfter("#rvopts"));
  wrap("rvWrongPick", function(){ return { fresh: window.rwPk == null }; }, rvAfter("#rwopts"));

  /* 結果頁：答對率 ≥ 80% 才放大彩帶 */
  wrap("finish", null, function(){
    var s = document.querySelector("#v-result .result .score");
    var n = s ? parseFloat(s.textContent) : 0;
    if (n >= 80 && !document.querySelector("#v-result.hidden")) setTimeout(cheer, 250);
    /* 紅筆圈章：答對率＝答對／已作答（一題都沒答就不蓋） */
    var done = 0, corr = 0;
    sess.list.forEach(function(q){ var p = sess.picks[q.id]; if (p != null){ done++; if (p === q.answer) corr++; } });
    stamp("#v-result .result .big", done ? corr / done : -1);
  });
  wrap("rvFinishReview", null, function(){
    var s = document.querySelector("#v-result .scorebig");
    if (s && parseFloat(s.textContent) >= 80) setTimeout(cheer, 250);
    var n = (window.rvRes || []).length, c = (window.rvRes || []).filter(function(x){ return x.ok; }).length;
    stamp("#v-result .scorebig", n ? c / n : -1);
  });
  /* 嚴格錯題本結果是「完整度」不是答對率 → 不蓋章 */
  function stamp(sel, pct){
    if (pct < 0) return;
    try{ if (window.__lvApi && window.__lvApi.stamp) window.__lvApi.stamp(sel, pct); }catch(e){}
  }

  /* 四線格：只用在「字彙／詞彙」題的選項（每個選項都是一個單字或 3 字以內的短語才加；句子、閱讀不加） */
  var WORDY = /^(字彙|詞彙)$/, SHORT = /^[A-Za-z][A-Za-z'’\-]*( [A-Za-z][A-Za-z'’\-]*){0,2}$/;
  function four(box, type){
    if (!box || !WORDY.test(type || "")) return;
    var spans = Array.prototype.map.call(box.querySelectorAll(".opt"), function(o){ return o.querySelector(".v") || o.querySelector("span:last-child"); });
    if (!spans.length || !spans.every(function(s){ return s && SHORT.test((s.textContent || "").trim()) && s.textContent.trim().length <= 24; })) return;
    spans.forEach(function(s){ s.classList.add("lv-four", "lv-opt-word"); });
  }
  wrap("drawRun", null, function(){
    var q = sess.list[sess.i]; if (q && !(sess.grouped && q.pkey)) four(document.querySelector("#v-run .opts"), q.type);
  });
  wrap("rvRenderQ", null, function(){ var m = RVMAP[rvQ[rvI]]; four(document.getElementById("rvopts"), m && m.q && m.q.type); });
  wrap("rvWrongRender", null, function(){
    var it = rwS[rwI], q = it && ((RVMAP[it.id] && RVMAP[it.id].q) || byId[it.id]); four(document.getElementById("rwopts"), q && q.type);
  });

  /* 家族「📝 我的複習」重考錯題（REVIEWUI 面板）：點完選項後才有 .ok／.no */
  document.addEventListener("click", function(e){
    try{
      var el = e.target && e.target.closest && e.target.closest(".rvc-opt"); if (!el) return;
      var item = el.closest(".rvc-item"); if (!item || item.__lvq) return;
      if (!el.classList.contains("ok") && !el.classList.contains("no")) return;
      item.__lvq = true; mark(el, el.classList.contains("ok"));
    }catch(err){}
  });
})();

/* =====================================================================
   活潑層 lively.js v1.0（2026-10-03，英語對外家族共用）
   來源：packages/lively/lively.js（由 sync_lively.py 複製進各 App，請改來源再重跑）
   - 讀 lively-theme.css 的 --lv-engine／--lv-level 決定怎麼接、多熱鬧。
   - 接法兩種：
       wrap    包在 App 既有函式外面（先跑原函式，自己出錯只吞掉）
       observe 看畫面上的選項有沒有被標成答對／答錯（不碰 App 程式）
   - 強度：full＝每題答對小彩帶、連對 3/5/10…提示；mid＝答對只彈跳、連對 5/10 提示、10 連對與過關才彩帶；
           low＝答對只彈跳、連對 10 提示、過關才彩帶。
   - 「簡潔模式」或系統「減少動態效果」：不放彩帶、不跳字。
   ===================================================================== */
(function(){
  "use strict";
  var ICON_DIR = "vendor/fluent-emoji/";
  var reduceMQ = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  function cssVar(n){ try{ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }catch(e){ return ""; } }
  var ENGINE = "", LEVEL = "full";

  /* ---------- 各群設定 ---------- */
  var ENGINES = {
    /* 901／902／904／907／908／919：單字引擎（同一套程式） */
    vocab: {
      wrap: { juice: "quizJuice", celebrate: "celebrate", result: "renderQuizResult", home: "renderHome", go: "go" },
      correctEl: "#optList .opt.correct, #spellInput", wrongEl: "#optList .opt.wrong, #spellInput",
      /* 作業簿版（2026-10-19）：彩色 Fluent 只當插圖（首頁四格、新手卡、連續天數）；會按的東西一律線條圖示 */
      icons: ".tiles .tile .ico",
      lines: ".nav button > .ni, .quick-actions button > span, .rl-appbar .ab-set, .topbar .icon-btn, .face .speak, .engwc-help, .vn-search-entry .vn-mag",
      linesLead: ".engwc-home, #taskCard h3, #quizBody .result .btn, .exam-entry, #view-exam .exam-build, #examPlayBtn, #view-exam .exam-toggles label:has(#examReview), #eng80-how summary",
      /* 904／907／908／919 的考古頁：底部選單 🎯、說明 📖、聽讀中 ⏹（Tabler 3.19.0 outline） */
      lineIcons: { "target": "<path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/><path d=\"M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0\"/><path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/>",
                   "book": "<path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\"/><path d=\"M3 6l0 13\"/><path d=\"M12 6l0 13\"/><path d=\"M21 6l0 13\"/>",
                   "player-stop": "<path d=\"M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z\"/>" },
      lineEmoji: { "🎯":["target"], "📖":["book"], "⏹":["player-stop"] },
      /* 考古頁每次篩選／劃掉都整段重畫 → 畫完再換一次圖示；整級都劃掉時在級別標題蓋小章（只有 919 有級別標題） */
      afterRender: ["renderExamPanel"],
      onRefresh: (function(){ var seen = {}; return function(api){
        document.querySelectorAll("#examGrid .exgrp").forEach(function(h){
          if (h.querySelector(":scope > .lv-stamp")) return;
          var n = h.nextElementSibling, all = 0, kn = 0;
          while (n && !n.classList.contains("exgrp")){ if (n.classList.contains("exchip")){ all++; if (n.classList.contains("known")) kn++; } n = n.nextElementSibling; }
          if (!all || kn !== all) return;
          var key = (h.firstChild && h.firstChild.nodeValue) || ""; api.stamp(h, 1);
          var s = h.querySelector(":scope > .lv-stamp"); if (s && seen[key]) s.classList.add("lv-still"); seen[key] = 1;
        });
      }; })(),
      /* 紅筆圈章：今日目標達成蓋在圓環上；測驗結果依答對率蓋章 */
      goalDone: function(){ var m = ((document.getElementById("goalText")||{}).textContent||"").match(/(\d+)\s*\/\s*(\d+)/); return !!(m && +m[2] > 0 && +m[1] >= +m[2]); },
      goalHost: "#view-home .ring", resultHost: "#quizBody .result",
      four: ".face.front .word",
      flame: "#streakRow", hero: true, installBar: "#installBar",
      bump: ["pomoToday","masteredCount","dueCount","goalNum","streakHome"],
      minimal: function(){ try{ return !!(S.settings && S.settings.minimal); }catch(e){ return false; } },
      resultPct: function(){ try{ var t = quiz.kind==="reading" ? quiz.items.reduce(function(a,q){return a+q.questions.length;},0) : quiz.items.length; return t ? quiz.score/t : 0; }catch(e){ return 0; } },
      fresh: function(){ try{ return !S.srs || Object.keys(S.srs).length === 0; }catch(e){ return false; } },
      start: function(){ try{ startToday(); }catch(e){} },
      heroText: { h: "第一步：認識今天的新單字", p: "每天一點點，單字就會變成你的！", steps: ["① 看單字","② 翻卡片","③ 記住它"] }
    }
  };
  /* 其他群組的設定在 engines/<engine>.js（sync 時串接在本檔前面，掛在 window.__LV_ENGINES） */
  if (window.__LV_ENGINES) for (var k in window.__LV_ENGINES) ENGINES[k] = window.__LV_ENGINES[k];

  function E(){ return ENGINES[ENGINE] || {}; }
  function quiet(){
    if (reduceMQ && reduceMQ.matches) return true;
    try{ return !!(E().minimal && E().minimal()); }catch(e){ return false; }
  }
  function icon(name, cls){
    var img = document.createElement("img");
    img.src = ICON_DIR + name + "_flat.svg"; img.alt = ""; img.className = cls || "lv-ico";
    img.setAttribute("aria-hidden","true"); img.decoding = "async";
    return img;
  }

  /* ---------- 彩帶（沒載入就安靜略過） ---------- */
  var fire = null;
  function getFire(){
    if (fire) return fire;
    // canvas-confetti 載入後存成 __lvCC，window.confetti 還給 App 自己的同名函式（會話群有 emoji 飄落的 confetti()）
    var cc = window.__lvCC || window.confetti;
    if (typeof cc !== "function" || !cc.create) return null;
    var cv = document.createElement("canvas"); cv.id = "lvConfetti"; cv.setAttribute("aria-hidden","true");
    document.body.appendChild(cv);
    fire = cc.create(cv,{ resize:true, useWorker:false, disableForReducedMotion:true }); // CSP 沒開 blob worker
    return fire;
  }
  function colors(){ var c = cssVar("--lv-btn") || "#30C077"; return [c, "#ffc93c", "#ff8a65", "#7aa7ff", "#c58af9"]; }
  function burstAt(el, big){
    if (quiet()) return; var f = getFire(); if (!f) return;
    var x = .5, y = .55;
    if (el && el.getBoundingClientRect){ var r = el.getBoundingClientRect(); if (r.width){ x = (r.left + r.width/2) / innerWidth; y = (r.top + r.height/2) / innerHeight; } }
    f({ particleCount: big?70:22, spread: big?90:58, startVelocity: big?38:24, scalar: big?.95:.75, ticks: big?160:90, gravity:1.1, origin:{x:x,y:y}, colors: colors() });
  }
  function bigCelebrate(){
    if (quiet()) return; var f = getFire(); if (!f) return;
    f({ particleCount: 80, angle: 60, spread: 70, origin:{x:0,y:.75}, colors: colors() });
    f({ particleCount: 80, angle: 120, spread: 70, origin:{x:1,y:.75}, colors: colors() });
  }
  function replay(el, cls){
    if (!el || !el.classList) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function(){ el.classList.remove(cls); }, 700);
  }
  function comboChip(n){
    if (quiet()) return;
    var c = document.createElement("div"); c.className = "lv-combo"; c.setAttribute("role","status");
    c.textContent = "🔥 連對 " + n + " 題！"; document.body.appendChild(c); setTimeout(function(){ c.remove(); }, 1300);
  }

  /* ---------- 答對／答錯（依強度） ---------- */
  var combo = 0;
  function milestone(n){
    if (LEVEL === "full") return n===3 || n===5 || (n>=10 && n%5===0);
    if (LEVEL === "mid")  return n===5 || (n>=10 && n%10===0);
    return n>=10 && n%10===0;
  }
  function onCorrect(el, n){
    replay(el, "lv-pop");
    if (LEVEL === "full") burstAt(el, false);
    if (milestone(n)){
      comboChip(n);
      if ((LEVEL==="full" && n>=5) || (LEVEL!=="full" && n>=10)) burstAt(null, true);
    }
  }
  function onWrong(el){ replay(el, "lv-shake"); }

  /* 同一個函式可以掛多個 after（例如 celebrateFns 和 resultFns 同時指到 finish；A4 回報） */
  function wrapFn(name, after){
    if (!name || typeof window[name] !== "function") return;
    if (window[name].__lv){ if (window[name].__lvAfters.indexOf(after) < 0) window[name].__lvAfters.push(after); return; }
    var orig = window[name], afters = [after];
    var w = function(){ var r = orig.apply(this, arguments), a = arguments, self = this; afters.forEach(function(f){ try{ f.call(self, a, r); }catch(e){} }); return r; };
    w.__lv = true; w.__lvAfters = afters; window[name] = w;
  }

  /* observe 接法：
     - attributes：元素「從不符合變成符合」答對／答錯選擇器時觸發（同一個元素下一題再變也會觸發）。
     - added（選用）：整段重畫的畫面，新插入的元素一出生就帶答對／答錯 → 只在使用者剛點過畫面（1 秒內）才算，
       避免切回「已經對過答案」的頁面被當成又答一次。
     - 同一批變動合併成一次回饋：有答錯就搖第一個答錯的，否則彈第一個答對的（一次揭曉多題不會連撒彩帶）。 */
  var lastTap = 0;
  document.addEventListener("pointerdown", function(){ lastTap = Date.now(); }, true);
  document.addEventListener("click", function(){ lastTap = Date.now(); }, true);
  function observeAnswers(cfg){
    var o = cfg.observe, okSel = o.correct, noSel = o.wrong, add = o.added || null;
    var state = new WeakMap();
    var anySel = [okSel, noSel].filter(Boolean).join(",");
    function st(el){ try{ return (okSel && el.matches(okSel)) ? "ok" : (noSel && el.matches(noSel)) ? "no" : ""; }catch(e){ return ""; } }
    function matches(root, sel){
      if (!sel || !(root instanceof Element)) return [];
      var out = []; try{ if (root.matches(sel)) out.push(root); out = out.concat(Array.prototype.slice.call(root.querySelectorAll(sel))); }catch(e){}
      return out;
    }
    // 先記下目前已經是答對／答錯的元素：之後它們只是別的 class 變了，不會被當成「剛答對」
    matches(document.body, anySel).forEach(function(el){ state.set(el, st(el)); });
    new MutationObserver(function(muts){
      var oks = [], nos = [], fresh = add && Date.now() - lastTap < 1000;
      // 同一批裡「先插入、再加答對記號」的元素（例如整段重畫後立刻標記）要交給 class 變動判斷，插入時不先記狀態
      var touched = new Set();
      muts.forEach(function(m){ if (m.type === "attributes") touched.add(m.target); });
      muts.forEach(function(m){
        if (m.type !== "childList") return;
        m.addedNodes.forEach(function(n){
          matches(n, anySel).forEach(function(el){ if (!touched.has(el)) state.set(el, st(el)); });   // 新元素出生狀態先記錄
          if (fresh){ oks = oks.concat(matches(n, add.correct)); nos = nos.concat(matches(n, add.wrong)); }
        });
      });
      touched.forEach(function(el){
        if (!(el instanceof Element)) return;
        var now = st(el), was = state.get(el) || "";
        state.set(el, now);
        if (now && now !== was) (now === "ok" ? oks : nos).push(el);
      });
      if (nos.length){ combo = 0; onWrong(nos[0]); }
      else if (oks.length){ combo++; onCorrect(oks[0], combo); }
    }).observe(document.body, { subtree:true, attributes:true, attributeFilter:["class"], childList:true });
  }

  /* ---------- 圖示換 Fluent Emoji（依原 emoji 對照） ---------- */
  var EMOJI = {
    "🍅":["tomato","coral"], "🎯":["bullseye","green"], "📚":["books","teal"], "⭐":["glowing_star","sun"], "🌟":["glowing_star","sun"],
    "🔥":["fire","sun"], "✅":["check_mark_button","green"], "🃏":["card_index","teal"], "📝":["memo",""], "✏️":["memo",""],
    "⚡":["high_voltage",""], "🔁":["repeat_button",""], "🔄":["repeat_button",""], "🏠":["house",""], "📊":["bar_chart",""], "📈":["bar_chart",""],
    "📖":["open_book",""], "🏆":["trophy","sun"], "🚀":["rocket",""], "🎉":["party_popper",""], "✨":["sparkles",""], "🌱":["seedling",""],
    "📋":["clipboard",""], "🏀":["basketball",""],
    "🆘":["sos_button","coral"], "🔎":["magnifying_glass_tilted_right",""], "🔍":["magnifying_glass_tilted_left",""], "👤":["bust_in_silhouette",""],
    "✈️":["airplane",""], "✈":["airplane",""], "🛡️":["shield",""], "🛡":["shield",""], "🎧":["headphone",""], "🧩":["puzzle_piece",""],
    "🎤":["microphone",""], "📇":["card_index","teal"], "🔑":["key",""], "🎭":["performing_arts",""], "🔧":["wrench",""],
    "🔗":["link",""], "🔤":["input_latin_letters",""], "🧱":["brick",""], "📒":["ledger",""], "📕":["closed_book",""],
    "🧒":["child",""], "💬":["speech_balloon",""], "⚙️":["gear",""], "⚙":["gear",""], "💡":["light_bulb","sun"], "☀️":["sun","sun"], "☀":["sun","sun"],
    "✍️":["writing_hand",""], "✍":["writing_hand",""], "📒":["ledger",""], "🎮":["video_game",""], "❤️":["red_heart","coral"], "❤":["red_heart","coral"],
    "⭐️":["glowing_star","sun"], "📅":["calendar",""], "📆":["calendar",""], "🗓️":["calendar",""], "💾":["floppy_disk",""], "📤":["outbox_tray",""], "📥":["inbox_tray",""],
    "🎓":["graduation_cap",""], "📚️":["books","teal"], "🗂️":["card_index_dividers",""], "🗂":["card_index_dividers",""], "🔊":["speaker_high_volume",""], "📝️":["memo",""]
  };
  function swapEmoji(el){
    if (el.__lv) return;
    var key = (el.textContent||"").trim().replace(/️/g,"");
    var m = EMOJI[key] || EMOJI[key + "️"]; if (!m) return;
    el.__lv = true; el.textContent = ""; el.appendChild(icon(m[0], el.closest(".nav,.tabbar,nav") ? "lv-ico-sm" : "lv-ico"));
    if (m[1]) el.setAttribute("data-tint", m[1]);
  }
  /* 「📖 已學單字」這種 emoji 寫在文字開頭的元素：只換開頭那個 emoji，文字不動（對照表沒有的就整個不換） */
  function swapLead(el){
    if (el.__lvLead) return;
    var t = el.firstChild; if (!t || t.nodeType !== 3) return;
    var mm = t.nodeValue.match(/^\s*([\uD800-\uDBFF][\uDC00-\uDFFF]|[☀-➿⭐⭕])️?\s*/);
    if (!mm) return;
    var m = EMOJI[mm[1]]; if (!m) return;
    el.__lvLead = true;
    t.nodeValue = t.nodeValue.slice(mm[0].length);
    var img = icon(m[0], "lv-ico-inline"); img.style.marginRight = ".3em";
    el.insertBefore(img, t);
  }
  /* ---------- 線條圖示：Tabler Icons 3.19.0（MIT，© 2020-2024 Paweł Kuna；授權全文 vendor/tabler-icons/LICENSE.txt） ---------- */
  var LINE = {"adjustments-horizontal":"<path d=\"M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M4 6l8 0\"/><path d=\"M16 6l4 0\"/><path d=\"M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M4 12l2 0\"/><path d=\"M10 12l10 0\"/><path d=\"M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\"/><path d=\"M4 18l11 0\"/><path d=\"M19 18l1 0\"/>","alarm":"<path d=\"M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/><path d=\"M12 10l0 3l2 0\"/><path d=\"M7 4l-2.75 2\"/><path d=\"M17 4l2.75 2\"/>","arrow-left":"<path d=\"M5 12l14 0\"/><path d=\"M5 12l6 6\"/><path d=\"M5 12l6 -6\"/>","bolt":"<path d=\"M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11\"/>","books":"<path d=\"M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/><path d=\"M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/><path d=\"M5 8h4\"/><path d=\"M9 16h4\"/><path d=\"M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z\"/><path d=\"M14 9l4 -1\"/><path d=\"M16 16l3.923 -.98\"/>","cards":"<path d=\"M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304z\"/><path d=\"M15 4h1a1 1 0 0 1 1 1v3.5\"/><path d=\"M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374\"/>","chart-bar":"<path d=\"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/><path d=\"M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/><path d=\"M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/><path d=\"M4 20h14\"/>","clipboard-list":"<path d=\"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2\"/><path d=\"M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z\"/><path d=\"M9 12l.01 0\"/><path d=\"M13 12l2 0\"/><path d=\"M9 16l.01 0\"/><path d=\"M13 16l2 0\"/>","flame":"<path d=\"M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z\"/>","help":"<path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/><path d=\"M12 17l0 .01\"/><path d=\"M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4\"/>","home":"<path d=\"M5 12l-2 0l9 -9l9 9l-2 0\"/><path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\"/><path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\"/>","pencil":"<path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\"/><path d=\"M13.5 6.5l4 4\"/>","repeat":"<path d=\"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3\"/><path d=\"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3\"/>","search":"<path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/><path d=\"M21 21l-6 -6\"/>","settings":"<path d=\"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z\"/><path d=\"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\"/>","star":"<path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z\"/>","volume":"<path d=\"M15 8a5 5 0 0 1 0 8\"/><path d=\"M17.7 5a9 9 0 0 1 0 14\"/><path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\"/>","device-mobile":"<path d=\"M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z\"/><path d=\"M11 4h2\"/><path d=\"M12 17v.01\"/>"};
  /* emoji → [圖示名, 底色]（底色只用在快捷鈕這種「圖示放在色塊裡」的位置） */
  var LINE_EMOJI = {
    "🏠":["home"], "🃏":["cards"], "📚":["books"], "📝":["pencil","acc"], "✏":["pencil","acc"], "🔁":["repeat","coral"], "🔄":["repeat","coral"],
    "📊":["chart-bar"], "📈":["chart-bar"], "⚙":["settings"], "🔍":["search"], "🔎":["search"], "⚡":["bolt","sun"], "🍅":["alarm","green"],
    "🔊":["volume"], "🎚":["adjustments-horizontal"], "❓":["help"], "⬅":["arrow-left"], "📋":["clipboard-list"], "⭐":["star"],
    "📲":["device-mobile"], "📱":["device-mobile"]
  };
  var SVGNS = "http://www.w3.org/2000/svg";
  function lineSvg(name){
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox","0 0 24 24"); s.setAttribute("class","lv-line"); s.setAttribute("aria-hidden","true"); s.setAttribute("focusable","false");
    var extra = E().lineIcons || {};   // engines/*.js 可補自己的 Tabler 圖示：lineIcons:{名稱:"<path …/>"}
    s.innerHTML = extra[name] || LINE[name] || "";
    return s;
  }
  function lineMap(k){ var x = E().lineEmoji; return (x && x[k]) || LINE_EMOJI[k]; }   // engines/*.js 可補對照：lineEmoji:{"🎧":["headphones"]}
  function emojiKey(t){ return (t||"").trim().replace(/[️⃣]/g,""); }
  function swapLine(el){
    if (el.querySelector(":scope > svg.lv-line")) return;   // App 改寫文字後圖示會消失，就再換一次
    var m = lineMap(emojiKey(el.textContent)); if (!m) return;
    el.__lvLine = true; el.textContent = ""; el.appendChild(lineSvg(m[0]));
    if (m[1]) el.setAttribute("data-tint", m[1]);
    el.classList.add("lv-has-line");
  }
  /* 「⬅ 入口」「📋 今日任務」「再做一次 🔁」：只換文字裡的符號（對照表有的才換），文字不動 */
  var EMO_RE = /\s*([\uD800-\uDBFF][\uDC00-\uDFFF]|[←-⯿])[️]?\s*/g;
  function swapLineLead(el){
    // App 用 textContent 重寫後，換好的圖示會消失 → 以「裡面還有沒有 lv-line-inline」判斷，不用一次性旗標（A6 回報）
    if (el.querySelector(":scope > svg.lv-line-inline")) return;
    Array.prototype.slice.call(el.childNodes).forEach(function(t){
      if (t.nodeType !== 3) return;
      var s = t.nodeValue, last = 0, frag = null, mm;
      EMO_RE.lastIndex = 0;
      while ((mm = EMO_RE.exec(s))){
        var m = lineMap(mm[1]); if (!m) continue;
        frag = frag || document.createDocumentFragment();
        if (mm.index > last) frag.appendChild(document.createTextNode(s.slice(last, mm.index)));
        var svg = lineSvg(m[0]); svg.classList.add("lv-line-inline"); frag.appendChild(svg);   // 前後間距交給 CSS
        last = mm.index + mm[0].length;
      }
      if (!frag) return;
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      el.replaceChild(frag, t); el.classList.add("lv-has-line");
    });
  }

  /* ---------- 紅筆圈章 ---------- */
  function setStamp(host, html, cls){
    if (!host) return;
    var s = host.querySelector(":scope > .lv-stamp");
    if (!html){ if (s) s.remove(); return; }
    if (s && s.getAttribute("data-k") === html) return;
    if (s) s.remove();
    s = document.createElement("div"); s.className = "lv-stamp " + (cls||""); s.setAttribute("aria-hidden","true");
    s.setAttribute("data-k", html); s.innerHTML = html;
    host.appendChild(s);
  }
  function goalStamp(){
    var c = E(); if (!c.goalDone || !c.goalHost) return;
    setStamp(document.querySelector(c.goalHost), c.goalDone() ? "<span>今日</span><b>達成</b>" : "", "lv-stamp-goal");
  }
  function stampAt(host, pct){
    var t = pct >= .9 ? "Excellent!" : pct >= .8 ? "Great!" : pct >= .6 ? "Good" : "加油";
    setStamp(host, "<b>" + t + "</b><span>" + Math.round(pct*100) + "%</span>", "lv-stamp-result" + (pct < .6 ? " lv-stamp-soft" : ""));
  }
  function resultStamp(pct){
    var c = E(); if (!c.resultHost) return;
    stampAt(document.querySelector(c.resultHost), pct);
  }

  function decorate(){
    var c = E();
    if (c.icons) document.querySelectorAll(c.icons).forEach(swapEmoji);
    if (c.iconsLead) document.querySelectorAll(c.iconsLead).forEach(swapLead);
    if (c.lines) document.querySelectorAll(c.lines).forEach(swapLine);
    if (c.linesLead) document.querySelectorAll(c.linesLead).forEach(swapLineLead);
    if (c.lines || c.linesLead) document.querySelectorAll("#rdgInstallBtn").forEach(swapLineLead);   // 家族「📲 安裝到桌面」
    if (c.four) document.querySelectorAll(c.four).forEach(function(el){ el.classList.add("lv-four"); });
    if (c.flame){
      var sr = document.querySelector(c.flame);
      if (sr && !sr.__lv && sr.firstChild && sr.firstChild.nodeType===3 && sr.firstChild.nodeValue.indexOf("🔥")===0){
        sr.__lv = true; sr.firstChild.nodeValue = sr.firstChild.nodeValue.replace("🔥","");
        sr.insertBefore(icon("fire","lv-ico-inline lv-flame"), sr.firstChild);
      }
    }
  }

  /* ---------- 新手第一步卡 ---------- */
  function renderHero(){
    var c = E(); if (!c.hero || !c.fresh) return;
    var fresh = c.fresh();
    document.body.classList.toggle("lv-fresh", fresh);
    var hero = document.getElementById("lvHero");
    if (!fresh){ if (hero) hero.remove(); return; }
    if (hero) return;
    var anchor = document.querySelector("#view-home .tiles"); if (!anchor) return;
    var t = c.heroText;
    hero = document.createElement("div"); hero.id = "lvHero"; hero.className = "lv-hero";
    hero.appendChild(icon("seedling","lv-hero-ico"));
    var h = document.createElement("h3"); h.textContent = t.h; hero.appendChild(h);
    var p = document.createElement("p"); p.textContent = t.p; hero.appendChild(p);
    var st = document.createElement("div"); st.className = "lv-steps";
    t.steps.forEach(function(s){ var x = document.createElement("span"); x.textContent = s; st.appendChild(x); });
    hero.appendChild(st);
    var b = document.createElement("button"); b.className = "lv-go"; b.type = "button"; b.textContent = "出發！";
    b.appendChild(icon("rocket","lv-ico-inline"));
    b.addEventListener("click", c.start); hero.appendChild(b);
    anchor.parentNode.insertBefore(hero, anchor);
  }
  var lastVals = {};
  function bumpNums(){
    (E().bump||[]).forEach(function(id){
      var el = document.getElementById(id); if (!el) return; var v = el.textContent;
      if (lastVals[id]!==undefined && lastVals[id]!==v && parseFloat(v) > parseFloat(lastVals[id])) replay(el, "lv-bump");
      lastVals[id] = v;
    });
  }
  function refresh(){ try{ decorate(); renderHero(); bumpNums(); goalStamp(); if (E().onRefresh && window.__lvApi) E().onRefresh(window.__lvApi); }catch(e){} }

  function watchInstallBar(){
    var sel = E().installBar; var bar = sel && document.querySelector(sel); if (!bar) return;
    var sync = function(){ document.body.classList.toggle("lv-has-installbar", bar.children.length > 0); };
    sync(); new MutationObserver(sync).observe(bar, { childList:true });
  }

  function init(){
    ENGINE = cssVar("--lv-engine"); LEVEL = cssVar("--lv-level") || "full";
    var c = E(); if (!ENGINE || !ENGINES[ENGINE]) return;
    document.documentElement.setAttribute("data-lv-engine", ENGINE);
    try{
      if (c.wrap){
        var w = c.wrap;
        wrapFn(w.juice, function(a){
          var ok = a[0];
          if (ok){ var n = 0; try{ n = quiz.combo || 0; }catch(e){} onCorrect(document.querySelector(c.correctEl), n); }
          else onWrong(document.querySelector(c.wrongEl));
        });
        wrapFn(w.celebrate, function(){ bigCelebrate(); });
        wrapFn(w.result, function(){
          var p = c.resultPct ? c.resultPct() : 0;
          resultStamp(p); decorate();
          if (p >= .8) setTimeout(bigCelebrate, 250);
        });
        wrapFn(w.home, refresh);
        wrapFn(w.go, function(){ setTimeout(refresh, 0); });
      }
      if (c.observe) observeAnswers(c);
      if (c.afterRender) c.afterRender.forEach(function(n){ wrapFn(n, function(){ setTimeout(refresh, 0); }); });
      if (c.celebrateFns) c.celebrateFns.forEach(function(n){ wrapFn(n, function(){ bigCelebrate(); }); });
      /* 結果頁蓋章（沒有 wrap.result 的群用）：畫完結果的函式名 → 依 resultPct() 蓋章 */
      if (c.resultFns) c.resultFns.forEach(function(n){ wrapFn(n, function(){ setTimeout(function(){ try{ if (c.resultPct) resultStamp(c.resultPct()); decorate(); }catch(e){} }, 0); }); });
      refresh(); watchInstallBar();
      /* 家族注入的 ❓／⬅ 入口／🔍 是載入後才插進來的 → 載入完再補換一次圖示 */
      /* 給 engines/*.js 用的小工具（observe 型的群自己判斷時機再呼叫） */
      window.__lvApi = { refresh: refresh, goal: goalStamp, stamp: function(host, pct){ stampAt(typeof host === "string" ? document.querySelector(host) : host, pct); } };
      if (c.lines || c.four){ setTimeout(refresh, 600); window.addEventListener("load", function(){ setTimeout(refresh, 300); }); }
      if (c.observeIcons) new MutationObserver(function(){ decorate(); }).observe(document.body, { childList:true, subtree:true });
    }catch(e){}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
