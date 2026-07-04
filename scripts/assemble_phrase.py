# -*- coding: utf-8 -*-
"""組裝英語片語 master.json。
輸入: data/wf_output.json (工作流: categories[])
輸出: data/master.json
- grammar 技能 = 片語測驗(克漏字 MCQ)，依片語分類為主題
- vocab 技能 = 片語卡(片語+中文+例句)
- 無 reading"""
import json, os, sys, re
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception: pass
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'data')
wf = json.load(open(os.path.join(D, 'wf_output.json'), encoding='utf-8'))

# 分類 → (顯示標籤, 群組, 難度)
META = {
    'pv_basic':   ('常用動詞片語', '動詞片語', 1),
    'pv_adv':     ('進階動詞片語', '動詞片語', 3),
    'be_adj_prep':('形容詞+介系詞', '固定搭配', 1),
    'prep_phrase':('介系詞與名詞片語', '固定搭配', 2),
    'connector':  ('連接與轉折片語', '文章片語', 2),
    'time_freq':  ('時間頻率與程度片語', '文章片語', 2),
    'idiom':      ('慣用語與諺語', '慣用與生活', 3),
    'daily':      ('生活情境常用片語', '慣用與生活', 1),
}
CAT_ORDER = ['pv_basic', 'pv_adv', 'be_adj_prep', 'prep_phrase', 'connector', 'time_freq', 'idiom', 'daily']
GROUP_ORDER = ['動詞片語', '固定搭配', '文章片語', '慣用與生活']

cats = {c['cat']['key']: c for c in wf['categories']}

notes = {}
taxonomy_topics = []
questions = []
vocab = []
seen_phrase = set()
gid = 0
vid = 0

for key in CAT_ORDER:
    if key not in cats:
        continue
    c = cats[key]
    label, group, diff = META[key]
    taxonomy_topics.append({'key': key, 'label': label, 'group': group})
    intro = c.get('intro', '')
    phrases = []
    for ph in c.get('phrases', []):
        p = (ph.get('phrase') or '').strip()
        if not p:
            continue
        k = p.lower()
        if k in seen_phrase:
            continue
        seen_phrase.add(k)
        phrases.append(ph)

    # note: 速記表(前 ~18 個片語)
    ref = [f"{ph['phrase']} — {ph.get('zh','')}" for ph in phrases[:18]]
    notes[key] = {
        'topicKey': key, 'title': label,
        'summary': intro or f'{label}：先用片語卡認識，再用克漏字測驗驗收。',
        'sections': [{'h': '常用片語速記', 'body': f'本單元收錄 {len(phrases)} 個{label}。下面列出部分，完整清單請到「片語卡」翻閱。', 'examples': ref}],
        'mistakes': [], 'tip': '片語重在整組記憶與語感，多看例句、在克漏字中練習填空最有效。',
    }

    for ph in phrases:
        p = ph['phrase'].strip()
        zh = ph.get('zh', '')
        cloze = (ph.get('cloze') or '').strip()
        dis = [d for d in (ph.get('distractors') or []) if d and d.strip().lower() != p.lower()][:3]
        # vocab 卡
        vid += 1
        vocab.append({
            'id': f'V-{vid:04d}', 'type': 'vocab', 'unitGroup': '片語',
            'unit': label, 'level': diff, 'difficulty': min(diff, 3),
            'word': p, 'pos': ph.get('pos', '片語'), 'zh': zh,
            'example': ph.get('example', ''), 'exampleZh': ph.get('exampleZh', ''),
        })
        # 克漏字 MCQ（需要 cloze + 3 誘答）
        if not cloze or '___' not in cloze or len(dis) < 3:
            continue
        # 形容詞+介系詞類：片語為「be + adj + prep」，但克漏字空格前已有 is/are/feel 等系動詞，
        # 故選項去掉開頭 be，讓「is ___」語境文法正確(片語卡與解析仍保留原形)。
        def opt_form(x):
            return re.sub(r'^be\s+', '', x, flags=re.I) if key == 'be_adj_prep' else x
        ans_opt = opt_form(p)
        dis_opt = [opt_form(x) for x in dis[:3]]
        opts4 = [ans_opt] + dis_opt
        pos = (len(p) + len(cloze)) % 4  # 決定正解位置(去隨機)
        options = [None] * 4
        options[pos] = ans_opt
        di = 0
        for i in range(4):
            if options[i] is None:
                options[i] = dis_opt[di]; di += 1
        gid += 1
        ex = ph.get('example', '')
        questions.append({
            'id': f'GP{gid:04d}', 'type': 'grammar',
            'unitGroup': group, 'unit': label, 'topicKey': key,
            'level': diff, 'difficulty': diff, 'difficultyScore': 0.2 + 0.3 * (diff - 1),
            'stem': cloze, 'options': options, 'answer': pos,
            'explanation': f'{p}：{zh}。' + (f'例：{ex}' if ex else ''),
            'explSource': 'ai', 'source': '原創',
            'flags': {'ocr': False, 'answerCheck': 'ok'},
        })

master = {
    'version': 'phrase-1.0',
    'notes': notes,
    'taxonomy': {'grammarTopics': taxonomy_topics, 'readingGenres': []},
    'counts': {
        'grammar': sum(1 for q in questions if q['type'] == 'grammar'),
        'reading': 0, 'passages': 0, 'vocab': len(vocab),
    },
    'questions': questions, 'passages': [], 'vocab': vocab,
}
json.dump(master, open(os.path.join(D, 'master.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('✓ 片語 master.json 完成')
print('  分類:', len(taxonomy_topics), '| 片語卡:', len(vocab), '| 克漏字測驗題:', master['counts']['grammar'])
from collections import Counter
c = Counter(q['unit'] for q in questions)
for t in taxonomy_topics:
    vv = sum(1 for v in vocab if v['unit'] == t['label'])
    print(f"   {t['label']}: 片語 {vv} · 測驗 {c.get(t['label'],0)} 題 (難度{META[t['key']][2]})")
