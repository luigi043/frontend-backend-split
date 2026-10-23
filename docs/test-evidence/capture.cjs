const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/cluiz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page = await browser.newPage({viewport:{width:1350,height:900},deviceScaleFactor:1});
 for (const [file,title,command] of [
 ['test-run','Automated API and frontend tests','node --test --test-reporter=spec backend/api.test.cjs backend/frontend.test.cjs'],
 ['syntax-check','Syntax and whitespace checks','node --check frontend/script.js; node --check backend/routes/items.js; git diff --check']
 ]) {
  const raw=fs.readFileSync(path.join(__dirname,file+'.txt'),'utf8');
  const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const html=`<!doctype html><meta charset="utf-8"><style>body{margin:36px;background:#fff;color:#172033;font:20px Arial}h1{font-size:28px}p{color:#475569;font-size:17px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:24px;font:18px/1.65 Consolas,monospace;border:1px solid #cbd5e1}</style><h1>${title}</h1><p>Demo 2 DataBridge | 23 October 2026 | Screenshot of saved test transcript</p><p>Command: ${escape(command)}</p><pre>${escape(raw)}</pre>`;
  fs.writeFileSync(path.join(__dirname,file+'.html'),html);
  await page.goto('file:///'+path.join(__dirname,file+'.html').replace(/\\/g,'/'));
  await page.locator('body').screenshot({path:path.join(__dirname,file+'.png')});
 }
 await browser.close();
})();


