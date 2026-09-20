// 確認問題に出てくるのに、教本のどこにも無い語を挙げる。
//
// **これは `npm run check` に入れていません。**誤検知が多すぎて、エラーにすると邪魔になります。
// **レビューのときに人が目で見るための道具**です。`node scripts/terms.mjs` で走ります。
//
// ★ なぜ要るか。**解説から教本へ戻る導線があるのに、その語が教本に無い**ことがあります。
// 2026 年 9 月 20 日の 2 巡目で、次の 6 件が出ました。
//
// | 語 | どうなっていたか |
// | --- | --- |
// | 酸素供給源 | 確認問題が使っているが、教本は「支燃物」としか書いていない |
// | 熱起電力・測温接点 | 熱電対の原理を問うているのに、教本にこの語が無い |
// | 理論火炎温度 | 教本は「断熱火炎温度」と呼んでいる。同じものの別名 |
// | 活量係数 | ラウールの法則のずれを問うているのに、教本は言葉でしか説明していない |
// | 平均垂直応力 | 教本は「応力」としか書いていない |
// | 認定指定設備 | 許可の処理能力から外れる設備を問うているのに、教本に無い |
//
// **出力の 8 割は誤検知です。**「超低温容器及」のように、助詞や列挙でつながった断片が拾われます。
// **ざっと眺めて、意味のある語だけ拾ってください。**それで十分に元が取れます。

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n');

const textbook = read('src/data/textbook');

/** 問題文を、ID ごとに取り出す。**ソースを素のテキストとして読む**（check-source.mjs と同じ作法）。 */
const questions = [];
for (const f of readdirSync('src/data/questions').filter((x) => x.endsWith('.ts'))) {
  const s = readFileSync(join('src/data/questions', f), 'utf8');
  const re = /id: '([a-z0-9-]+)',[\s\S]*?question:\s*\n?\s*'([\s\S]*?)',\n\s*choices/g;
  let m;
  while ((m = re.exec(s)) !== null) questions.push([m[1], m[2]]);
}

// 列挙や位置を表す漢字で切る。「超低温容器及」「第一種設備距離以上」のような断片を減らす。
const CUT = /[及又若並以当該其]/;
// 単位と日常語。技術用語ではないので外す。
const STOP = new Set([
  'ミリグラム', 'センチメートル', 'メートル', 'キログラム', 'パーセント',
  'リットル', 'パスカル', 'メガパスカル', 'キロパスカル', 'デシリットル',
  'コンクリート', 'トン',
]);

const found = new Map();
for (const [id, body] of questions) {
  const words = new Set();
  for (const w of body.match(/[ァ-ヴ]{4,}/g) ?? []) if (!STOP.has(w)) words.add(w);
  for (const run of body.match(/[一-鿿]{3,}/g) ?? []) {
    for (const part of run.split(CUT)) if (part.length >= 4) words.add(part);
  }
  for (const w of words) {
    if (textbook.includes(w)) continue;
    if (!found.has(w)) found.set(w, new Set());
    found.get(w).add(id);
  }
}

const rows = [...found.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja'));
for (const [w, ids] of rows) {
  console.log(`${w.padEnd(14, '　')} ${[...ids].sort().join('、')}`);
}
console.log(`\n${rows.length} 語（★ 多くは断片。意味のある語だけ拾うこと）`);
