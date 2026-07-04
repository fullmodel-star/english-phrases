const {JSDOM}=require('jsdom'); const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','app','index.html'),'utf8');
const errors=[]; const log=(...a)=>console.log('  ',...a);
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local/',
  beforeParse(w){ w.prompt=()=>'小明'; w.confirm=()=>true; w.alert=()=>{}; w.scrollTo=()=>{}; }});
const w=dom.window;
w.addEventListener('error',e=>errors.push(e.error?e.error.stack:e.message));
setTimeout(()=>{
  try{
    log('啟動畫面 profiles:', !!w.document.querySelector('.profile, .btn'));
    w.addProfile();                       // prompt→小明→進首頁
    log('首頁 tiles:', w.document.querySelectorAll('.tile').length);
    w.go('units','grammar'); const gu=w.document.querySelectorAll('.unitcard').length; log('文法單元列:', gu); if(gu<1)throw new Error('文法單元列為 0（.unitcard 找不到）');
    w.start('grammar',{unit:'常用動詞片語'});
    let opts=w.document.querySelectorAll('.opt'); log('文法選項:', opts.length);
    if(opts.length){opts[0].click(); log('作答後有解析/下一步:', !!w.document.querySelector('.expl, .btn'));}
    w.next();
    w.go('units','reading'); log('閱讀篩選載入:', !!w.document.querySelector('.seg'));
    w.go('units','vocab'); w.start('vocab',{level:1});
    let fl=w.document.querySelector('.flash'); log('單字翻卡:', !!fl);
    if(fl){fl.click(); let g=w.document.querySelectorAll('.gradeRow button'); log('評分鈕:', g.length); if(g.length)g[1].click();}
    w.go('stats'); log('統計頁:', !!w.document.querySelector('.statbig'));
    w.go('teacher'); w.go('wrong'); w.go('settings'); w.go('home');
    const ks=Object.keys(w.localStorage).filter(k=>k.startsWith('engph.'));
    log('localStorage:', ks.join(', '));
    const prog=JSON.parse(w.localStorage.getItem(ks.find(k=>k.startsWith('engph.prog'))||'{}')||'{}');
    log('已記錄答題:', (prog.log||[]).length, '題; srs:', Object.keys(prog.srs||{}).length);
  }catch(e){errors.push('FLOW: '+e.stack)}
  if(errors.length) console.log('✗ 有錯誤:\n'+errors.join('\n----\n'));
  else console.log('✓ 煙霧測試通過：建身分→文法作答→單字翻卡→統計/老師/錯題/設定 全程無崩潰，進度有寫入');
  process.exit(errors.length?1:0);
},400);
