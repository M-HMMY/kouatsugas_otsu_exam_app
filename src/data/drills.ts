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
 * 計算ドリル。**13 種類**（2026 年 9 月 18 日）。
 *
 * **★ 区分で力の入れどころが違う**（`docs/public-questions.md` §3）。
 * 令和 7 年度の計算問題は**学識（化学）が 4 問、学識（機械）は 1 問だけ**だった。
 * だから**化学を厚く（7 種類）、機械を薄く（4 種類）**してある。
 * 機械の「何に比例するか」は、ドリルより教本の一問一答で押さえる作り。
 *
 * **法令にも計算はある**ので 2 種類入れた（容器の充塡量、貯蔵所の要否）。
 * **法令の値だけは `docs/primary-numbers.md` §4・§9 から取っている。**
 * ほかの物性値は問題文の中で与えている（台帳に無いものを決め打ちしないため）。
 *
 * **★ 電卓の制約に合わせてある。**四則計算と開平計算だけで解けるものに限り、
 * 対数・指数を含む式（アレニウス、断熱変化、等温圧縮の仕事）はドリルにしていない。
 */
export const DRILLS: Drill[] = [
  // ------------------------------------------------------------ 法令
  {
    id: 'lw-fill-mass',
    name: '容器に充塡できる液化ガスの質量',
    categoryId: 'law-vessel',
    sectionId: 'lw-25',
    summary: 'G ＝ V ／ C。内容積と定数から、充塡できる質量を出す',
    generate: () => {
      // C の値は容器保安規則 22 条（基準日版）。docs/primary-numbers.md §9 から。
      const gas = pick([
        { name: '液化プロパン', c: 2.35 },
        { name: '液化アンモニア', c: 1.86 },
        { name: '液化塩素', c: 0.8 },
        { name: '液化炭酸ガス', c: 1.34 },
        { name: '液化ブタン', c: 2.05 },
      ]);
      const v = pick([20, 30, 40, 47, 50, 100, 120]);
      const g = v / gas.c;
      const fmt = (n: number): string => fx(n, 1) + ' kg';
      const { choices, answer } = buildNumeric(g, fmt, [v * gas.c, v, gas.c * 10]);
      return {
        question:
          '内容積 ' + v + ' L の容器に ' + gas.name + ' を充塡する。定数 C を ' + fx(gas.c, 2) +
          ' とするとき、充塡することができる最大の質量はおよそいくらか。',
        choices,
        answer,
        explanation:
          'G ＝ V ／ C なので、' + v + ' ÷ ' + fx(gas.c, 2) + ' ＝ ' + fx(g, 1) + ' kg。\n' +
          'C は分母にあるので、C が大きいガスほど充塡できる質量は小さくなる。' +
          'V × C と掛けてしまうと向きが逆になるので、割り算であることを確かめること。',
      };
    },
  },
  {
    id: 'lw-storage-volume',
    name: '貯蔵所が要るかどうか',
    categoryId: 'law-handle',
    sectionId: 'lw-10',
    summary: '液化ガス 10 kg を容積 1 m³ とみなして、300 m³ と比べる',
    generate: () => {
      const kg = pick([2000, 2500, 2800, 3000, 3200, 3500, 4000, 5000]);
      const v = kg / 10;
      const fmt = (n: number): string => fx(n, 0) + ' m³';
      const { choices, answer } = buildNumeric(v, fmt, [kg / 100, kg, kg / 1000]);
      return {
        question:
          '液化ガス ' + kg + ' kg を貯蔵する。高圧ガス保安法第 16 条第 3 項のみなし規定により、' +
          'この液化ガスは容積いくらとみなされるか。',
        choices,
        answer,
        explanation:
          '液化ガス 10 kg をもって容積 1 m³ とみなすので、' + kg + ' ÷ 10 ＝ ' + fx(v, 0) + ' m³。\n' +
          'この値が 300 m³ 以上であれば、貯蔵所において貯蔵しなければならない（' +
          (v >= 300 ? '今回は 300 m³ 以上なので貯蔵所が要る' : '今回は 300 m³ 未満なので貯蔵所は要らない') +
          '）。100 で割ると桁がひとつずれるので、10 で割ることを確かめること。',
      };
    },
  },

  // ------------------------------------------------------------ 学識（化学）
  {
    id: 'gk-boyle',
    name: '等温での圧力と体積',
    categoryId: 'gk-state',
    sectionId: 'gk-3',
    summary: '温度が一定なら PV が一定。移し替えたあとの圧力を出す',
    generate: () => {
      const p1 = pick([0.4, 0.5, 0.6, 0.8, 1.0, 1.2]);
      const v1 = pick([2.0, 2.5, 3.0, 4.0, 5.0]);
      const v2 = pick([0.25, 0.5, 1.0, 1.25]);
      const p2 = (p1 * v1) / v2;
      const fmt = (n: number): string => fx(n, 2) + ' MPa';
      const { choices, answer } = buildNumeric(p2, fmt, [(p1 * v2) / v1, p1 * v1 * v2, p1]);
      return {
        question:
          '温度を一定に保ったまま、絶対圧力 ' + fx(p1, 2) + ' MPa で内容積 ' + fx(v1, 1) +
          ' m³ の容器に入っている理想気体を、内容積 ' + fx(v2, 2) +
          ' m³ の容器へ移した。移したあとの絶対圧力はおよそいくらか。',
        choices,
        answer,
        explanation:
          '温度が一定なので PV が一定。P₂ ＝ P₁ × V₁ ／ V₂ ＝ ' + fx(p1, 2) + ' × ' + fx(v1, 1) +
          ' ÷ ' + fx(v2, 2) + ' ＝ ' + fx(p2, 2) + ' MPa。\n' +
          '狭い容器へ移せば圧力は上がる、という向きで検算できる。体積比を逆に掛けると下がってしまう。',
      };
    },
  },
  {
    id: 'gk-gaylussac',
    name: '定容での温度と圧力',
    categoryId: 'gk-state',
    sectionId: 'gk-3',
    summary: '体積が一定なら絶対圧力は絶対温度に比例する',
    generate: () => {
      const t1 = pick([17, 27, 37, 47]);
      const t2 = pick([127, 177, 227, 327]);
      const p1 = pick([0.3, 0.4, 0.5, 0.6, 0.8]);
      const p2 = (p1 * (t2 + 273)) / (t1 + 273);
      const fmt = (n: number): string => fx(n, 2) + ' MPa';
      const { choices, answer } = buildNumeric(p2, fmt, [(p1 * t2) / t1, (p1 * (t1 + 273)) / (t2 + 273), p1]);
      return {
        question:
          '内容積が一定の容器に入っている理想気体の絶対圧力が、温度 ' + t1 + ' ℃ のとき ' +
          fx(p1, 2) + ' MPa であった。温度を ' + t2 +
          ' ℃ にしたとき、絶対圧力はおよそいくらか。絶対温度は摂氏温度に 273 を加えて求めるものとする。',
        choices,
        answer,
        explanation:
          '体積が一定なので、絶対圧力は絶対温度に比例する。' + fx(p1, 2) + ' × ' + (t2 + 273) + ' ÷ ' +
          (t1 + 273) + ' ＝ ' + fx(p2, 2) + ' MPa。\n' +
          'セルシウス温度のまま比をとると大きく外れる。温度の比をとるときは必ず絶対温度に直すこと。',
      };
    },
  },
  {
    id: 'gk-density',
    name: '気体の密度',
    categoryId: 'gk-state',
    sectionId: 'gk-4',
    summary: '密度 ＝ 圧力 × モル質量 ÷（気体定数 × 絶対温度）',
    generate: () => {
      const m = pick([16, 28, 32, 44]); // g/mol
      const t = pick([27, 47, 77, 127]);
      const pk = pick([100, 200, 300, 500]); // kPa
      const r = 8.31;
      const rho = (pk * 1000 * (m / 1000)) / (r * (t + 273));
      const fmt = (n: number): string => fx(n, 2) + ' kg/m³';
      const { choices, answer } = buildNumeric(rho, fmt, [(pk * 1000 * (m / 1000)) / (r * t), rho * 10, rho / 10]);
      return {
        question:
          'モル質量 ' + m + ' g/mol の理想気体が、絶対圧力 ' + pk + ' kPa、温度 ' + t +
          ' ℃ の状態にある。この気体の密度はおよそいくらか。一般ガス定数を 8.31 J/(mol·K)、' +
          '絶対温度は摂氏温度に 273 を加えて求めるものとする。',
        choices,
        answer,
        explanation:
          '密度は ρ ＝ P M ／（R T）で求める。M は kg/mol に直して ' + fx(m / 1000, 3) + ' kg/mol、' +
          'P は Pa に直して ' + pk * 1000 + ' Pa、T は ' + (t + 273) + ' K。\n' +
          '計算すると ' + fx(rho, 2) + ' kg/m³ となる。モル質量を g/mol のまま入れると 1,000 倍ずれ、' +
          '温度をセルシウスのまま入れても外れる。',
      };
    },
  },
  {
    id: 'gk-compressibility',
    name: '圧縮係数',
    categoryId: 'gk-state',
    sectionId: 'gk-5',
    summary: '実在気体の体積が、理想気体の何倍になるかを出す',
    generate: () => {
      const z = pick([0.7, 0.8, 0.85, 0.9, 1.1, 1.2]);
      const videal = pick([10, 20, 25, 40, 50]);
      const vreal = videal * z;
      const fmt = (n: number): string => fx(n, 1) + ' m³';
      const { choices, answer } = buildNumeric(vreal, fmt, [videal / z, videal, videal + z]);
      return {
        question:
          'ある状態で、理想気体として計算した体積が ' + videal + ' m³ となった。' +
          'この状態における圧縮係数が ' + fx(z, 2) + ' であるとき、実在気体としての体積はおよそいくらか。',
        choices,
        answer,
        explanation:
          'PV ＝ Z m R T であるから、実在気体の体積は理想気体の体積に圧縮係数を掛けたものになる。' +
          videal + ' × ' + fx(z, 2) + ' ＝ ' + fx(vreal, 1) + ' m³。\n' +
          (z < 1
            ? '圧縮係数が 1 より小さいので、実在気体のほうが体積が小さくなる。分子間の引力が効いている領域である。'
            : '圧縮係数が 1 より大きいので、実在気体のほうが体積が大きくなる。分子自身の体積と反発が効いている領域である。'),
      };
    },
  },
  {
    id: 'gk-theoretical-air',
    name: '理論空気量',
    categoryId: 'gk-burn',
    sectionId: 'gk-16',
    summary: '反応式から理論酸素量を出し、0.21 で割る',
    generate: () => {
      const fuel = pick([
        { name: 'メタン CH₄', o2: 2 },
        { name: 'エタン C₂H₆', o2: 3.5 },
        { name: 'プロパン C₃H₈', o2: 5 },
        { name: 'ブタン C₄H₁₀', o2: 6.5 },
        { name: '水素 H₂', o2: 0.5 },
      ]);
      const air = fuel.o2 / 0.21;
      const fmt = (n: number): string => fx(n, 1) + ' 倍';
      const { choices, answer } = buildNumeric(air, fmt, [fuel.o2, fuel.o2 * 0.21, fuel.o2 / 0.79]);
      return {
        question:
          fuel.name + ' を完全燃焼させるのに必要な理論空気量は、この燃料の体積のおよそ何倍か。' +
          '空気中の酸素の体積割合を 21 パーセントとする。',
        choices,
        answer,
        explanation:
          '理論酸素量は燃料 1 に対して ' + fx(fuel.o2, 1) + ' である。理論空気量はこれを 0.21 で割るので、' +
          fx(fuel.o2, 1) + ' ÷ 0.21 ＝ ' + fx(air, 1) + ' 倍。\n' +
          '掛けてしまうと、必要な空気が酸素より少ないというあり得ない答えになる。' +
          '炭化水素 CxHy の理論酸素量が x ＋ y/4 であることを覚えておけば、反応式を書かずに出せる。',
      };
    },
  },
  {
    id: 'gk-burgess-wheeler',
    name: 'バージェス-ホイーラーの法則',
    categoryId: 'gk-burn',
    sectionId: 'gk-19',
    summary: '爆発下限界と燃焼熱の積が一定であることを使う',
    generate: () => {
      const q1 = pick([800, 900, 1000, 1200, 1500]);
      const l1 = pick([3.0, 4.0, 4.4, 5.0]);
      const k = q1 * l1;
      const q2 = pick([1600, 2000, 2400, 3000]);
      const l2 = k / q2;
      const fmt = (n: number): string => fx(n, 2) + ' 体積パーセント';
      const { choices, answer } = buildNumeric(l2, fmt, [(l1 * q2) / q1, l1, k / 1000]);
      return {
        question:
          '燃焼熱が ' + q1 + ' kJ/mol の可燃性ガスの爆発下限界が ' + fx(l1, 1) +
          ' 体積パーセントであった。バージェス-ホイーラーの法則が成り立つとして、燃焼熱が ' + q2 +
          ' kJ/mol の可燃性ガスの爆発下限界はおよそいくらか。',
        choices,
        answer,
        explanation:
          'この法則では、爆発下限界と燃焼熱の積がほぼ一定になる。積は ' + fx(k, 0) + ' なので、' +
          fx(k, 0) + ' ÷ ' + q2 + ' ＝ ' + fx(l2, 2) + ' 体積パーセント。\n' +
          '下限界は燃焼熱に反比例する。よく燃えるガスほど、少ない量で火炎が伝ぱするということである。' +
          '比例と見ると向きが逆になる。',
      };
    },
  },
  {
    id: 'gk-le-chatelier',
    name: 'ル・シャトリエの式',
    categoryId: 'gk-burn',
    sectionId: 'gk-19',
    summary: '混合ガスの爆発下限界を、逆数の和から出す',
    generate: () => {
      const a = pick([40, 50, 60, 70, 80]);
      const b = 100 - a;
      const la = pick([4.0, 5.0, 5.5]);
      const lb = pick([2.0, 2.5, 3.0]);
      const l = 100 / (a / la + b / lb);
      const fmt = (n: number): string => fx(n, 2) + ' 体積パーセント';
      const { choices, answer } = buildNumeric(l, fmt, [(a * la + b * lb) / 100, la, lb]);
      return {
        question:
          '可燃性成分が 2 種類からなる混合ガスがある。成分 A が ' + a + ' 体積パーセントで単独の爆発下限界が ' +
          fx(la, 1) + ' 体積パーセント、成分 B が ' + b + ' 体積パーセントで単独の爆発下限界が ' +
          fx(lb, 1) + ' 体積パーセントである。ル・シャトリエの式によるこの混合ガスの爆発下限界はおよそいくらか。',
        choices,
        answer,
        explanation:
          '100 を、各成分の体積百分率をその成分単独の下限界で割った値の和で除する。' +
          a + ' ÷ ' + fx(la, 1) + ' ＋ ' + b + ' ÷ ' + fx(lb, 1) + ' ＝ ' + fx(a / la + b / lb, 2) +
          ' であり、100 ÷ ' + fx(a / la + b / lb, 2) + ' ＝ ' + fx(l, 2) + ' 体積パーセント。\n' +
          '単純平均をとると ' + fx((a * la + b * lb) / 100, 2) +
          ' となるが、これは誤りである。逆数の平均になるので、単純平均より小さい側へ寄る。',
      };
    },
  },

  // ------------------------------------------------------------ 学識（機械）
  {
    id: 'gm-hoop-stress',
    name: '薄肉円筒胴の円周応力',
    categoryId: 'gm-strength',
    sectionId: 'gm-18',
    summary: '円周応力 ＝ 内圧 × 内径 ÷（2 × 板厚）',
    generate: () => {
      const p = pick([1.0, 1.5, 2.0, 2.5, 3.0]);
      const d = pick([600, 800, 1000, 1200, 1600]);
      const t = pick([8, 10, 12, 16, 20]);
      const s = (p * d) / (2 * t);
      const fmt = (n: number): string => fx(n, 1) + ' MPa';
      const { choices, answer } = buildNumeric(s, fmt, [(p * d) / (4 * t), (p * d) / t, (p * d) / (8 * t)]);
      return {
        question:
          '内径 ' + d + ' mm、板厚 ' + t + ' mm の薄肉円筒胴に、内外の圧力差 ' + fx(p, 1) +
          ' MPa が加わっている。この胴に生じる円周応力はおよそいくらか。',
        choices,
        answer,
        explanation:
          '円周応力は P D ／（2 t）で求める。' + fx(p, 1) + ' × ' + d + ' ÷（2 × ' + t + '）＝ ' +
          fx(s, 1) + ' MPa。\n' +
          '軸応力は P D ／（4 t）＝ ' + fx((p * d) / (4 * t), 1) +
          ' MPa であり、円周応力のちょうど半分になる。どちらを問われているかを読み分けること。' +
          '内径と板厚の単位がそろっていれば、内圧の単位がそのまま答えの単位になる。',
      };
    },
  },
  {
    id: 'gm-pump-power',
    name: 'ポンプの軸動力',
    categoryId: 'gm-device',
    sectionId: 'gm-30',
    summary: '軸動力 ＝ 密度 × 重力加速度 × 流量 × 全揚程 ÷ 効率',
    generate: () => {
      const rho = pick([800, 900, 1000, 1100]);
      const q = pick([0.01, 0.015, 0.02, 0.025, 0.03]);
      const h = pick([20, 25, 30, 40, 50]);
      const eta = pick([0.5, 0.6, 0.7, 0.75]);
      const p = (rho * 9.8 * q * h) / eta / 1000;
      const fmt = (n: number): string => fx(n, 2) + ' kW';
      const { choices, answer } = buildNumeric(p, fmt, [(rho * 9.8 * q * h * eta) / 1000, (rho * 9.8 * q * h) / 1000]);
      return {
        question:
          '密度 ' + rho + ' kg/m³ の液を、流量 ' + fx(q, 3) + ' m³/s、全揚程 ' + h +
          ' m で送る。ポンプ効率を ' + fx(eta, 2) + '、重力加速度を 9.8 m/s² とするとき、軸動力はおよそいくらか。',
        choices,
        answer,
        explanation:
          'ρ g Q H ＝ ' + rho + ' × 9.8 × ' + fx(q, 3) + ' × ' + h + ' ＝ ' + fx(rho * 9.8 * q * h, 0) +
          ' W。これを効率 ' + fx(eta, 2) + ' で割って ' + fx(p * 1000, 0) + ' W、すなわち ' +
          fx(p, 2) + ' kW。\n' +
          '効率は掛けるのではなく割る。効率が悪いほど必要な動力は大きくなる、という向きで検算できる。' +
          '流量を m³/h のまま入れると 3,600 倍ずれる。',
      };
    },
  },
  {
    id: 'gm-orifice-flow',
    name: '差圧式流量計',
    categoryId: 'gm-device',
    sectionId: 'gm-32',
    summary: '流量は差圧の平方根に比例する',
    generate: () => {
      const q1 = pick([50, 80, 100, 120, 200]);
      const dp1 = pick([16, 25, 36, 64, 100]);
      const ratio = pick([0.25, 4, 0.0625, 9]);
      const dp2 = dp1 * ratio;
      const q2 = q1 * Math.sqrt(ratio);
      const fmt = (n: number): string => fx(n, 1) + ' m³/h';
      const { choices, answer } = buildNumeric(q2, fmt, [q1 * ratio, q1 / ratio, q1]);
      return {
        question:
          'ある差圧式流量計で、流量が ' + q1 + ' m³/h のとき差圧が ' + fx(dp1, 0) +
          ' kPa であった。差圧が ' + fx(dp2, 2) + ' kPa になったとき、流量はおよそいくらか。',
        choices,
        answer,
        explanation:
          '差圧式流量計では、流量は差圧の平方根に比例する。差圧が ' + fx(ratio, 4) +
          ' 倍になったので、流量は その平方根の ' + fx(Math.sqrt(ratio), 2) + ' 倍となり、' +
          q1 + ' × ' + fx(Math.sqrt(ratio), 2) + ' ＝ ' + fx(q2, 1) + ' m³/h。\n' +
          '比例と見て ' + fx(q1 * ratio, 1) +
          ' m³/h とするのが、いちばんありがちな誤りである。開平計算はこの試験の電卓で使える。',
      };
    },
  },
  {
    id: 'gm-pressure-drop',
    name: '管内の圧力損失',
    categoryId: 'gm-flow',
    sectionId: 'gm-13',
    summary: '圧力損失は流速の 2 乗に比例する',
    generate: () => {
      const dp1 = pick([20, 30, 50, 80, 100]);
      const k = pick([1.2, 1.5, 2, 2.5, 3, 0.5]);
      const dp2 = dp1 * k * k;
      const fmt = (n: number): string => fx(n, 1) + ' kPa';
      const { choices, answer } = buildNumeric(dp2, fmt, [dp1 * k, dp1 / k, dp1]);
      return {
        question:
          'ある配管の圧力損失が ' + dp1 + ' kPa であった。管の条件と摩擦係数を変えずに流量を ' +
          fx(k, 2) + ' 倍にしたとき、圧力損失はおよそいくらになるか。',
        choices,
        answer,
        explanation:
          '同じ管なので流量が ' + fx(k, 2) + ' 倍なら流速も ' + fx(k, 2) +
          ' 倍になる。圧力損失は流速の 2 乗に比例するので、' + dp1 + ' × ' + fx(k, 2) + '² ＝ ' +
          dp1 + ' × ' + fx(k * k, 2) + ' ＝ ' + fx(dp2, 1) + ' kPa。\n' +
          '1 乗と見て ' + fx(dp1 * k, 1) +
          ' kPa とするのが、ありがちな誤りである。増えかたのほうが大きい、という感覚を持っておくこと。',
      };
    },
  },
];
