/**
 * 計算ドリル：出題のたびに数値が変わる自動生成問題。
 *
 * 計算問題は同じ問題文を暗記してしまうと本番で崩れるため、
 * 値を振り直して「手順」だけが身に付くようにしている。
 * 生成した問題は復習カード（SRS）には登録しない（同じ問題が二度と現れないため）。
 *
 * **この試験には計算問題が出る。**とくに**学識は 15 問に 120 分**（1 問 8 分）で、
 * **時間をかけて計算させる作り**になっている。化学なら状態方程式・物質収支・反応熱、
 * 機械なら円筒の応力・圧力損失・熱の移動あたりが計算になる。
 * **どの単元に何問出るかは、公開問題を分析してから決めること**（`docs/public-questions.md`）。
 *
 * **物性値をこちらで決め打ちしない。**問題文の中で与えること。
 * 実在の物質の値を書くと `docs/primary-numbers.md` の裏づけが要るうえ、
 * 出典によって値が違う。**ドリルは手順の練習なので、値は与えてよい。**
 * **ただし法令の値（容器の内容積の区分など）だけは台帳から取ること。**
 *
 * 手順で必ず解けるものに絞ること。有効数字や単位の扱いで割れる問題は、
 * 自動生成すると答えが一意にならない。
 *
 * **★ まだ 1 つも作っていない。**骨組み（`pick` / `fx` / `buildNumeric` / `build`）は
 * 姉妹アプリからそのまま持ってきてあるので、章が決まったら中身を足すこと。
 */

export interface DrillItem {
  question: string;
  choices: string[];
  answer: number;
  /** 計算手順の解説 */
  explanation: string;
}

export interface Drill {
  id: string;
  name: string;
  categoryId: string;
  sectionId: string;
  summary: string;
  generate: () => DrillItem;
}

// ---------------------------------------------------------------- 補助関数

const rnd = (min: number, max: number): number => min + Math.floor(Math.random() * (max - min + 1));

/** 選択肢や条件をランダムに 1 つ選ぶ。新しいドリルを書くときに使う */
export function pick<T>(items: readonly T[]): T {
  return items[rnd(0, items.length - 1)];
}

/** 小数を読みやすく整える（末尾の 0 を落とす）。新しいドリルを書くときに使う */
export function fx(n: number, digits = 2): string {
  return Number(n.toFixed(digits)).toString();
}

/**
 * 正解と誤答候補から 5 択を作る。重複は除き、足りなければ補充関数で埋める。
 *
 * **5 択なのは、この試験が五肢択一式だから。**姉妹アプリは四肢択一で 4 択だった。
 * 本番と選択肢の数が違うと、消去法の手応えが変わってしまう。
 */
function build(
  correct: string,
  wrongs: string[],
  fallback?: (i: number) => string,
): { choices: string[]; answer: number } {
  const pool: string[] = [];
  for (const w of wrongs) {
    if (w !== correct && !pool.includes(w)) pool.push(w);
    if (pool.length === 4) break;
  }
  for (let i = 1; pool.length < 4 && i < 80; i++) {
    const extra = fallback ? fallback(i) : String(i);
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const all = [correct, ...pool];
  for (let j = all.length - 1; j > 0; j--) {
    const k = rnd(0, j);
    [all[j], all[k]] = [all[k], all[j]];
  }
  return { choices: all, answer: all.indexOf(correct) };
}

/**
 * 数値の 5 択。ありがちな誤答を先に使い、足りない分は倍率でずらして作る。
 * 正解が 0 や負になりうる問題では倍率では埋まらないので、build に自前の
 * 補充関数を渡すこと（npm run check が「選択肢が 2 個になる」で捕まえる）。
 */
export function buildNumeric(
  correct: number,
  fmt: (n: number) => string,
  mistakes: number[],
): { choices: string[]; answer: number } {
  const wrongs = mistakes.filter((n) => Number.isFinite(n) && n >= 0).map(fmt);
  const factors = [2, 0.5, 1.5, 0.8, 1.25, 3, 0.25, 1.1, 0.9, 1.4, 0.6];
  let fi = 0;
  return build(fmt(correct), wrongs, () => fmt(correct * factors[fi++ % factors.length]));
}

/**
 * 計算ドリル。**まだ 0 種類**（2026 年 9 月 15 日）。骨組みだけ残してある。
 *
 * **★ 区分で力の入れどころが違う**（`docs/public-questions.md` §3）。
 * 令和 7 年度の計算問題は**学識（化学）が 4 問、学識（機械）は 1 問だけ**だった。
 *
 * - **化学**：厚くする。R7 の 4 問はどれも典型的な型
 *   （状態方程式と密度・圧縮係数・理論空気量・バージェス-ホイーラーの法則）で、繰り返しが効く
 * - **機械**：**計算ドリルより「式の意味を問う一問一答」を厚くする。**
 *   「何に比例するか」「各項が何か」を問う形が、本番の記述の形に近い
 *
 * **法令にも計算はある**（容器の充塡量、貯蔵能力、保安距離）。`docs/primary-numbers.md` を作ってから。
 */
export const DRILLS: Drill[] = [];
