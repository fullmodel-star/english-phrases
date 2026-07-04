# -*- coding: utf-8 -*-
"""把 master.json 注入 app/app.template.html → app/index.html（可發佈單檔 PWA）。
並產出 manifest.json / sw.js / icon.svg。"""
import json, os, sys, hashlib
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, 'app')
master = json.load(open(os.path.join(ROOT, 'data', 'master.json'), encoding='utf-8'))
tpl = open(os.path.join(APP, 'app.template.html'), encoding='utf-8').read()

# 發布前移除出版社 source 等不必App顯示的標籤(降低版權自證/瘦身)
for q in master.get('questions', []):
    for k in ('source', 'topicKey', 'badReason', 'aiSuggest'):
        q.pop(k, None)
for p in master.get('passages', []):
    p.pop('source', None)
data_js = 'const DATA = ' + json.dumps(master, ensure_ascii=False, separators=(',', ':')) + ';'
html = tpl.replace('/*__DATA__*/', data_js, 1)
open(os.path.join(APP, 'index.html'), 'w', encoding='utf-8').write(html)

# manifest
manifest = {
    "name": "英語片語", "short_name": "英語片語", "start_url": "index.html",
    "scope": ".", "display": "standalone",
    "background_color": "#e7f7f4", "theme_color": "#0d9488", "lang": "zh-Hant",
    "orientation": "any",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}
open(os.path.join(APP, 'manifest.json'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=1))

# service worker（離線快取）— 快取名用內容雜湊,重建後自動更新
cache_ver = hashlib.md5(html.encode('utf-8')).hexdigest()[:8]
sw = """const C='eng-%s';const A=['index.html','manifest.json','icon-192.png','icon-512.png','icon-180.png','icon-maskable.png'];""" % cache_ver + """
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
"""
open(os.path.join(APP, 'sw.js'), 'w', encoding='utf-8').write(sw)

# icon（統一識別系統：靛藍底 ABC + 藥丸「高中文法」，與國中紫色區隔）
icon = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d9488"/><stop offset="1" stop-color="#2dd4bf"/></linearGradient></defs>
<rect width="192" height="192" rx="42" fill="url(#g)"/>
<text x="96" y="86" font-size="56" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">ABC</text>
<rect x="30" y="116" width="132" height="40" rx="20" fill="#fff"/>
<text x="96" y="144" font-size="27" font-family="Microsoft JhengHei,PingFang TC,sans-serif" font-weight="bold" fill="#0d9488" text-anchor="middle">片語</text>
</svg>"""
open(os.path.join(APP, 'icon.svg'), 'w', encoding='utf-8').write(icon)

sz = os.path.getsize(os.path.join(APP, 'index.html')) / 1024
print('✓ 產出 app/index.html', f'{sz:.0f} KB')
print('  + manifest.json / sw.js / icon.svg')
print('  題庫:', master['counts'])
