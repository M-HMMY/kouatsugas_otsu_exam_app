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
 * ただし**区分で分かれるのは学識だけ**である
 * （令和 7 年度の公開問題で確認。`docs/public-questions.md` §1）。
 *
 * | 分野 | 受験する区分 | 問題数 | 区分による違い |
 * | --- | --- | --- | --- |
 * | `law` | **両方** | 20 | **完全に同一**（問題文・選択肢・正解番号がすべて一致） |
 * | `hoan` | **両方** | 15 | **15 問中 14 問が同一**（違うのは本番の問 7 だけ） |
 * | `gaku-kagaku` | 乙種化学 | 15 | **完全に別** |
 * | `gaku-kikai` | 乙種機械 | 15 | **完全に別** |
 *
 * **★ 以前は保安管理技術も `hoan-kagaku` / `hoan-kikai` に割っていた。**
 * 実際には 15 問中 14 問が同じ問題だったので、**同じ本文を 2 回書くことになる。**
 * `Category.field` は 1 つしか持てず章を共有できないため、**1 つにまとめた**
 * （`docs/section-plan.md` §1。戻し方もそこにある）。
 *
 * **保安管理技術と学識をまとめて 30 問にしてはいけない。**`scripts/check.ts` は
 * 「章の `questions` の合計が科目の公表値と一致するか」を見ていて、
 * 15 問の科目が 30 問になると検査が落ちる。
 * それ以前に、**受験者はどちらか一方の学識しか受けない**ので、
 * 模試の構成比が本番と違うものになる。
 *
 * **★ 章（`CATEGORIES`）と `questions` の配分は、令和 7 年度の公開問題 1 年分から起こした。**
 * 対応表は `docs/section-plan.md` §4 にある。**「R7 ではこうだった」以上のことは言っていない。**
 * 令和 6 年度以前が手に入ったら割り直すこと。
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
    note: '高圧ガス保安法と関係政省令。乙種化学と乙種機械で完全に共通の科目で、20 問 60 分。高圧ガスの定義、製造・貯蔵・販売・移動・消費の規制、保安体制、容器、そして技術上の基準',
    questions: 20,
  },
  {
    id: 'hoan',
    name: '保安管理技術',
    note: '「高圧ガスの製造に必要な通常の保安管理の技術」。15 問 90 分。受験案内書の文言は区分で分かれているが、令和 7 年度の問題は 15 問中 14 問が両区分で同じだった',
    questions: 15,
  },
  {
    id: 'gaku-kagaku',
    name: '学識（化学）',
    note: '乙種化学の科目。「高圧ガスの製造に必要な通常の応用化学」。15 問 120 分。令和 7 年度は燃焼・爆発が 6 問、計算が 4 問',
    questions: 15,
  },
  {
    id: 'gaku-kikai',
    name: '学識（機械）',
    note: '乙種機械の科目。「高圧ガスの製造に必要な通常の機械工学」。15 問 120 分。令和 7 年度は熱力学が 4 問。計算は 1 問だけで、あとは現象と用語の正誤判断',
    questions: 15,
  },
];

const TODO = '**この章はまだ書かれていません。**節割りと数値の台帳ができ次第、書きます（`docs/section-plan.md`）。';

/**
 * 章の一覧。**`questions` は令和 7 年度の公開問題を 1 問ずつ章へ割り当てて数えたもの。**
 * どの問がどの章かは `docs/section-plan.md` §4 に書いてある。
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
      '**この章は試験範囲ではありません。**読み始める前に、試験の形と、この教本の歩き方をそろえるための章です。\n\nいちばん先に知っておいてほしいのは、**3 科目それぞれで 6 割程度を取らないと合格にならない**ことです。合計点ではありません。\n\nもう 1 つ、**乙種化学と乙種機械は、受けるならどちらか一方**です。ただし**違うのは学識だけ**だと思ってください。法令 20 問は両区分で同じ問題が出ますし、保安管理技術も、令和 7 年度は 15 問中 14 問が同じ問題でした。**区分選びで悩む必要は、思っているより小さい**ということです。',
  },

  // ---- 法令（本番 20 問。乙種化学・乙種機械で完全に共通）----
  //
  // **章の切り方は令和 7 年度の公開問題から起こした。**
  // R7 は単問 7 問＋「例による事業所」2 例（コンビナート地域内 5 問／地域外 8 問）で、
  // **技術上の基準だけで 9 問（20 問の 45 %）**あった。だから law-tech と law-ope を立ててある。
  // 詳しくは docs/section-plan.md §4。
  {
    id: 'law-what',
    field: 'law',
    name: '高圧ガスとは何か',
    summary: '法の目的、高圧ガスの定義、適用除外',
    syllabus: '法令（法 1〜3／令 1〜2／一般則 2）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'law-permit',
    field: 'law',
    name: '製造の許可・変更・完成検査',
    summary: '第一種製造者と第二種製造者、変更の許可、完成検査、承継と廃止',
    syllabus: '法令（法 5〜14・20・21／一般則 3〜17・31〜36）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'law-handle',
    field: 'law',
    name: '貯蔵・販売・移動・消費・廃棄・輸入',
    summary: '貯蔵所、販売の届出、移動の基準、特定高圧ガスの消費、廃棄、輸入検査、帳簿',
    syllabus: '法令（法 15〜25／一般則 18〜30・45〜62／液石則）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'law-people',
    field: 'law',
    name: '保安体制・危害予防規程・検査',
    summary: '保安統括者から保安係員まで、危害予防規程、保安教育計画、保安検査と定期自主検査',
    syllabus: '法令（法 26〜39／一般則 63〜83 の 2）',
    questions: 3,
    intro: TODO,
  },
  {
    id: 'law-vessel',
    field: 'law',
    name: '容器と附属品',
    summary: '容器検査、刻印と表示、充塡、容器再検査、附属品検査',
    syllabus: '法令（法 40〜49／容器則）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'law-tech',
    field: 'law',
    name: '製造施設の技術上の基準',
    summary: '保安距離、貯槽、配管と導管、安全装置、耐震、ガスの種類で変わる規制',
    syllabus: '法令（一般則 6 ほか／コンビ則）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'law-ope',
    field: 'law',
    name: '製造の方法の技術上の基準',
    summary: '充塡のしかた、修理と作業計画、容器置場、除害と防爆',
    syllabus: '法令（一般則 6 第 2 項ほか）',
    questions: 4,
    intro: TODO,
  },

  // ---- 保安管理技術（本番 15 問。**両区分で共通**）----
  //
  // 令和 7 年度は 15 問が 15 テーマに 1 問ずつ対応していて、問の順番がテーマの順番だった。
  // そのテーマを 7 章にまとめてある（docs/section-plan.md §4）。
  {
    id: 'ho-burn',
    field: 'hoan',
    name: '燃焼・爆発とガスの性質',
    summary: '爆発限界と消炎距離、可燃性・毒性・支燃性・不活性の別、ガスごとの扱い',
    syllabus: '保安管理技術（R7 問 1・2）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'ho-material',
    field: 'hoan',
    name: '材料の劣化と設備の検査・診断',
    summary: '腐食と粒界腐食、エロージョン、非破壊検査（超音波・浸透・渦電流）、気密試験',
    syllabus: '保安管理技術（R7 問 3・15）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'ho-inst',
    field: 'hoan',
    name: '計装・計測機器と電気設備',
    summary: 'フィードバック制御とフール・プルーフ、流量計、防爆構造、ボンディングと非常用電源',
    syllabus: '保安管理技術（R7 問 4・10）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'ho-device',
    field: 'hoan',
    name: '高圧装置・圧縮機と流体機械',
    summary: '反応器・貯槽・吸収塔、圧縮機のサージングと容量調整、ポンプと流動・伝熱・分離',
    syllabus: '保安管理技術（R7 問 5・6・7）',
    questions: 3,
    intro: TODO,
  },
  {
    id: 'ho-seal',
    field: 'hoan',
    name: '流体の漏えい防止',
    summary: 'ガスケットとパッキン、フランジの締付け、各種シールの使い分け',
    syllabus: '保安管理技術（R7 問 8）',
    questions: 1,
    intro: TODO,
  },
  {
    id: 'ho-safety',
    field: 'hoan',
    name: '保安装置と防災設備',
    summary: '安全弁と破裂板、緊急遮断装置、ガス漏えい検知警報設備、フレアースタック、除害',
    syllabus: '保安管理技術（R7 問 11・12）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'ho-manage',
    field: 'hoan',
    name: 'リスクマネジメントと運転・設備・工事の管理',
    summary: 'ハザードの特定と HAZOP・ETA、運転操作、置換と火気工事、保全計画',
    syllabus: '保安管理技術（R7 問 9・13・14）',
    questions: 3,
    intro: TODO,
  },

  // ---- 学識（化学）（本番 15 問。乙種化学だけ）----
  //
  // **令和 7 年度は燃焼・爆発が 6 問（4 割）。**仮置きしていた「ガスの製造プロセス」は 0 問だった。
  {
    id: 'gk-state',
    field: 'gaku-kagaku',
    name: '単位・気体の状態・熱力学',
    summary: 'SI 単位、状態方程式と密度、圧縮係数、断熱変化とジュール-トムソン効果',
    syllabus: '学識（化学）（R7 問 1〜4）',
    questions: 4,
    intro: TODO,
  },
  {
    id: 'gk-react',
    field: 'gaku-kagaku',
    name: '反応速度・化学反応式・化学平衡',
    summary: '活性化エネルギーとアレニウスの式、反応式の係数、平衡定数とルシャトリエ',
    syllabus: '学識（化学）（R7 問 5〜7）',
    questions: 3,
    intro: TODO,
  },
  {
    id: 'gk-burn',
    field: 'gaku-kagaku',
    name: '燃焼・爆発',
    summary: '理論空気量、消炎距離、爆発限界と爆発範囲、分解爆発、爆燃と爆ごう',
    syllabus: '学識（化学）（R7 問 8〜13）',
    questions: 6,
    intro: TODO,
  },
  {
    id: 'gk-gas',
    field: 'gaku-kagaku',
    name: '個別のガスの性質',
    summary: '酸素、水素、アセチレン、アンモニア、シランなどを 1 つずつ',
    syllabus: '学識（化学）（R7 問 14・15）',
    questions: 2,
    intro: TODO,
  },

  // ---- 学識（機械）（本番 15 問。乙種機械だけ）----
  //
  // **令和 7 年度の計算問題は 1 問だけ。**残りは現象と用語の正誤判断だった。
  {
    id: 'gm-thermo',
    field: 'gaku-kikai',
    name: '単位・熱力学・燃焼',
    summary: 'SI 単位、理想気体の状態変化、熱と仕事、熱力学第二法則、化学量論組成',
    syllabus: '学識（機械）（R7 問 1〜5）',
    questions: 5,
    intro: TODO,
  },
  {
    id: 'gm-flow',
    field: 'gaku-kikai',
    name: '流体の流れと伝熱・分離',
    summary: 'レイノルズ数、圧力損失とファニングの式、放射伝熱と総括伝熱係数、吸収と蒸留',
    syllabus: '学識（機械）（R7 問 6・7）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'gm-strength',
    field: 'gaku-kikai',
    name: '材料力学と圧力容器の強度',
    summary: '応力とひずみ、熱応力、S-N 曲線、薄肉円筒胴と薄肉球形胴に働く応力',
    syllabus: '学識（機械）（R7 問 8・9）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'gm-material',
    field: 'gaku-kikai',
    name: '材料の腐食・劣化と溶接',
    summary: '応力腐食割れ、水素侵食、粒界腐食、高温割れと低温割れ、溶接法',
    syllabus: '学識（機械）（R7 問 10・11）',
    questions: 2,
    intro: TODO,
  },
  {
    id: 'gm-device',
    field: 'gaku-kikai',
    name: '高圧装置・計測機器・ポンプ・シール',
    summary: '熱交換器と弁、液面計と流量計と温度計、NPSH と水撃作用、メカニカルシール',
    syllabus: '学識（機械）（R7 問 12〜15）',
    questions: 4,
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
 * **分野の `questions` の合計（65 問）ではない。**学識は化学と機械の両方を収録していて、
 * **受験者はどちらか一方しか受けない**ので、実際に解くのは 50 問である。
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
 * **学識は 15 問に 120 分＝1 問 8 分。**ただし**計算科目という意味ではない**
 * （令和 7 年度の計算問題は化学 4 問／機械 1 問だけ。`docs/public-questions.md` §3）。
 * 記述を 4 つ読んで正誤を判断させるので、**読む時間がかかる**という作りである。
 */
export const EXAM_MINUTES = 270;

/**
 * 合格基準。
 *
 * > **７．合格基準：各科目とも満点の６０パーセント程度です。**
 * > （令和 8 年度 受験案内書 Ⅰ-7）
 *
 * **★「程度」と書いてあることを落とさないこと。**危険物取扱者試験は
 * 「それぞれ 60 % 以上」と言い切っているが、**受験案内書は言い切っていない。**
 * 年度や科目によって、60 % ちょうどが基準にならないことがありうる。
 *
 * **★ ただし、同じ協会の資料どうしで書き方が食い違っている。**
 * 令和 7 年度の正解番号の PDF には「①合格基準点は、各科目とも満点の**６０％です。**」と、
 * 「程度」なしで書かれている（`docs/public-questions.md` §5）。
 * **方針は変えない**（慎重な側に寄せたまま）が、
 * **「程度」だけを根拠に説明文を書くと、その PDF と矛盾する。**
 *
 * だからこのアプリが出せるのは「**この模試の結果が 6 割に届いたか**」までで、
 * **合否の判定ではない。**画面の文言も「基準を満たすか」ではなく
 * 「6 割程度という目安に届いたか」に寄せること。
 */
export const PASS_RATIO = 0.6;
