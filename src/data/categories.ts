import type { Category, FieldId } from '../types';

/**
 * 分野と章の定義。
 *
 * **分野（`FIELDS`）は公式の試験科目そのもの。**高圧ガス製造保安責任者試験の
 * 乙種化学・乙種機械は「法令」「保安管理技術」「学識」の 3 科目で、
 * **法令 20 問 / 保安管理技術 15 問 / 学識 15 問の合計 50 問。**
 * すべて択一式である（令和 8 年度受験案内書 Ⅰ-5「試験内容・試験形式」）。
 *
 * **★ このアプリは乙種化学と乙種機械の両方を 1 つに入れている。**
 * 法令 20 問は**両区分で共通**（受験案内書の表でも、乙種機械の法令の欄が
 * 乙種化学と同じものを指す「〃」になっている）。違うのは保安管理技術と学識で、
 * それぞれに**化学版と機械版**がある。
 *
 * だから分野を 6 つに割ってある。
 *
 * | 分野 | 受験する区分 | 問題数 |
 * | --- | --- | --- |
 * | `law` | **両方** | 20 |
 * | `hoan-kagaku` / `gaku-kagaku` | 乙種化学 | 15 / 15 |
 * | `hoan-kikai` / `gaku-kikai` | 乙種機械 | 15 / 15 |
 *
 * **1 つの分野にまとめて 30 問にしてはいけない。**`scripts/check.ts` は
 * 「章の `questions` の合計が科目の公表値と一致するか」を見ていて、
 * 化学と機械を混ぜると 15 問の科目が 30 問になって検査が落ちる。
 * それ以前に、**受験者はどちらか一方しか受けない**ので、
 * 模試の構成比が本番と違うものになる。
 *
 * **★ 章（`CATEGORIES`）は仮置き。**出題範囲の洗い出し（`docs/syllabus.md`）が
 * まだなので、KHK の受験案内書に載っている試験内容の記述と、
 * 高圧ガス保安法の条文の構造から当てただけの分け方である。
 * **章を確定させるまで、教本を書き始めないこと。**
 * 順番は `docs/handover.md` の §2 にある。
 */
export const FIELDS: { id: FieldId; name: string; note: string; questions: number }[] = [
  {
    id: 'intro',
    name: '入門編',
    note: '試験の形、2 つの区分の違い、3 科目それぞれで 6 割程度を取る必要があること、科目免除のしくみをここでそろえる',
    questions: 0,
  },
  {
    id: 'law',
    name: '法令',
    note: '高圧ガス保安法と関係政省令。乙種化学と乙種機械で共通の科目で、20 問 60 分。高圧ガスの定義、製造・貯蔵・販売・移動・消費の規制、保安体制、容器、検査',
    questions: 20,
  },
  {
    id: 'hoan-kagaku',
    name: '保安管理技術（化学）',
    note: '乙種化学の科目。「高圧ガスの製造に必要な化学に関する通常の保安管理の技術」。15 問 90 分',
    questions: 15,
  },
  {
    id: 'gaku-kagaku',
    name: '学識（化学）',
    note: '乙種化学の科目。「高圧ガスの製造に必要な通常の応用化学」。15 問 120 分。計算問題が出る',
    questions: 15,
  },
  {
    id: 'hoan-kikai',
    name: '保安管理技術（機械）',
    note: '乙種機械の科目。「高圧ガスの製造に必要な機械に関する通常の保安管理の技術」。15 問 90 分',
    questions: 15,
  },
  {
    id: 'gaku-kikai',
    name: '学識（機械）',
    note: '乙種機械の科目。「高圧ガスの製造に必要な通常の機械工学」。15 問 120 分。計算問題が出る',
    questions: 15,
  },
];

const TODO = '**この章はまだ書かれていません。**出題範囲の洗い出しが済んでから書きます。';

/**
 * 章の一覧。**すべて仮置き**（上の注記を読むこと）。
 *
 * `questions` は分野ごとに合計が公表値と合うように置いてあるが、
 * **章ごとの配分には根拠がない。**公開問題を分析してから割り直すこと。
 */
export const CATEGORIES: Category[] = [
  {
    id: 'intro',
    field: 'intro',
    name: 'はじめに',
    summary: '試験の形と、この教本の使い方',
    syllabus: '範囲外',
    questions: 0,
    intro:
      '**この章は試験範囲ではありません。**読み始める前に、試験の形と、この教本の歩き方をそろえるための章です。\n\nいちばん先に知っておいてほしいのは、**3 科目それぞれで 6 割程度を取らないと合格にならない**ことです。合計点ではありません。\n\nもう 1 つ、**乙種化学と乙種機械は別の試験**です。法令 20 問は共通ですが、保安管理技術と学識は区分ごとに中身が違います。**自分が受ける区分を決めてから読み始めてください。**',
  },

  // ---- 法令（本番 20 問。乙種化学・乙種機械で共通）----
  // 高圧ガス保安法・同施行令・一般高圧ガス保安規則ほか。
  // **章の切り方も問題数の配分も仮置き。**公開問題を分析してから割り直すこと。
  {
    id: 'law-what',
    field: 'law',
    name: '高圧ガスとは何か',
    summary: '法の目的、高圧ガスの定義、適用除外',
    syllabus: '【仮】法令',
    questions: 4,
    intro: TODO,
  },
  {
    id: 'law-permit',
    field: 'law',
    name: '製造・貯蔵の許可と届出',
    summary: '製造の許可・届出、貯蔵所、完成検査',
    syllabus: '【仮】法令',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'law-handle',
    field: 'law',
    name: '販売・移動・消費・廃棄',
    summary: '販売の届出、移動の基準、消費と廃棄',
    syllabus: '【仮】法令',
    questions: 4,
    intro: TODO,
  },
  {
    id: 'law-people',
    field: 'law',
    name: '保安体制と危害予防規程',
    summary: '保安統括者・保安技術管理者・保安係員、保安教育、危害予防規程',
    syllabus: '【仮】法令',
    questions: 4,
    intro: TODO,
  },
  {
    id: 'law-vessel',
    field: 'law',
    name: '容器と検査',
    summary: '容器の刻印・表示・再検査、保安検査、定期自主検査、事故届',
    syllabus: '【仮】法令',
    questions: 3,
    intro: TODO,
  },

  // ---- 保安管理技術（化学）（本番 15 問）----
  {
    id: 'hk-gas',
    field: 'hoan-kagaku',
    name: 'ガスの性質と取扱い',
    summary: '可燃性・毒性・支燃性・不活性の別と、ガスごとの扱い',
    syllabus: '【仮】保安管理技術（化学）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'hk-plant',
    field: 'hoan-kagaku',
    name: '製造設備と運転',
    summary: '圧縮機・ポンプ・反応器・貯槽と、その運転管理',
    syllabus: '【仮】保安管理技術（化学）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'hk-safety',
    field: 'hoan-kagaku',
    name: '保安と防災',
    summary: '爆発・火災の防止、静電気、緊急措置、防消火設備',
    syllabus: '【仮】保安管理技術（化学）',
    questions: 5,
    intro: TODO,
  },

  // ---- 学識（化学）（本番 15 問）----
  {
    id: 'gk-state',
    field: 'gaku-kagaku',
    name: '気体の性質と状態変化',
    summary: '状態方程式、分圧、臨界と液化、蒸気圧',
    syllabus: '【仮】学識（化学）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'gk-react',
    field: 'gaku-kagaku',
    name: '化学反応と熱',
    summary: '反応式と物質収支、反応熱、平衡と反応速度',
    syllabus: '【仮】学識（化学）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'gk-process',
    field: 'gaku-kagaku',
    name: 'ガスの製造プロセス',
    summary: '水素・アンモニア・アセチレン・空気分離などの作り方',
    syllabus: '【仮】学識（化学）',
    questions: 5,
    intro: TODO,
  },

  // ---- 保安管理技術（機械）（本番 15 問）----
  {
    id: 'hm-machine',
    field: 'hoan-kikai',
    name: '高圧ガス設備の機器',
    summary: '圧縮機・ポンプ・熱交換器・塔槽類・配管と弁',
    syllabus: '【仮】保安管理技術（機械）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'hm-material',
    field: 'hoan-kikai',
    name: '材料・溶接・検査',
    summary: '金属材料の選び方、溶接、非破壊検査、腐食',
    syllabus: '【仮】保安管理技術（機械）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'hm-control',
    field: 'hoan-kikai',
    name: '計測制御と保安装置',
    summary: '温度・圧力・流量の計測、安全弁、緊急遮断、運転管理',
    syllabus: '【仮】保安管理技術（機械）',
    questions: 5,
    intro: TODO,
  },

  // ---- 学識（機械）（本番 15 問）----
  {
    id: 'gm-strength',
    field: 'gaku-kikai',
    name: '材料力学と圧力容器の強度',
    summary: '応力とひずみ、内圧を受ける円筒、許容応力と安全率',
    syllabus: '【仮】学識（機械）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'gm-flow',
    field: 'gaku-kikai',
    name: '流体と熱の工学',
    summary: '流れの基礎、圧力損失、熱の伝わり方、熱力学のサイクル',
    syllabus: '【仮】学識（機械）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'gm-element',
    field: 'gaku-kikai',
    name: '機械要素と材料',
    summary: 'ねじ・軸・軸受・歯車、金属材料の性質と試験',
    syllabus: '【仮】学識（機械）',
    questions: 5,
    intro: TODO,
  },
];

/**
 * 用語ミニ辞典の節 ID。教本の各節から「分からない語はここ」と案内するために使う。
 * 節の並びを変えるときはこの定数も一緒に直すこと（画面側は直接 id を持たない）。
 */
export const GLOSSARY_SECTION_ID = 'i-4';

/** 計算の解き方を説明する節の ID。解説から飛ばすのに使う */
export const MATH_SECTION_ID = 'i-3';

export const categoryById = (id: string): Category | undefined => CATEGORIES.find((c) => c.id === id);

export const categoryName = (id: string): string => categoryById(id)?.name ?? id;

export const categoriesOfField = (field: FieldId): Category[] => CATEGORIES.filter((c) => c.field === field);

/** 分野の表示名 */
export const fieldName = (id: FieldId): string => FIELDS.find((f) => f.id === id)?.name ?? id;

/** 章 ID から分野 ID を引く。模試の科目別集計に使う */
export function fieldOfCategory(categoryId: string): FieldId | undefined {
  return categoryById(categoryId)?.field;
}

/**
 * 1 区分あたりの本番の出題数（50 問）。法令 20 + 保安管理技術 15 + 学識 15。
 *
 * **6 つの分野の合計（80 問）ではない。**乙種化学と乙種機械のどちらか一方を受けるので、
 * 受験者が実際に解くのは 50 問である。
 */
export const EXAM_QUESTIONS = 50;

/**
 * 1 区分あたりの本番の試験時間（分）。**合計 4 時間 30 分。**
 *
 * | 科目 | 時刻 | 時間 |
 * | --- | --- | --- |
 * | 法令 | 9:30〜10:30 | 60 分 |
 * | 保安管理技術 | 11:10〜12:40 | 90 分 |
 * | 学識 | 13:30〜15:30 | 120 分 |
 *
 * **1 日がかりの試験で、科目の間に休憩がある。**通しで 270 分座るわけではない。
 * 模試を通しで解かせるときは、そのことを画面に書くこと。
 *
 * 1 問あたりにならすと **5 分 24 秒**で、危険物（甲種で 3 分 20 秒）よりかなり長い。
 * **学識は 15 問に 120 分＝1 問 8 分**で、計算に時間をかけさせる作りになっている。
 */
export const EXAM_MINUTES = 270;

/**
 * 合格基準。
 *
 * > **７．合格基準：各科目とも満点の６０パーセント程度です。**
 * > （令和 8 年度 受験案内書 Ⅰ-7）
 *
 * **★「程度」と書いてあることを落とさないこと。**危険物取扱者試験は
 * 「それぞれ 60 % 以上」と言い切っているが、**この試験は言い切っていない。**
 * 年度や科目によって、60 % ちょうどが基準にならないことがありうる。
 *
 * だからこのアプリが出せるのは「**この模試の結果が 6 割に届いたか**」までで、
 * **合否の判定ではない。**画面の文言も「基準を満たすか」ではなく
 * 「6 割程度という目安に届いたか」に寄せること。
 */
export const PASS_RATIO = 0.6;
