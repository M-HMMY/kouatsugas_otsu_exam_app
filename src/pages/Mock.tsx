import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import type { MockResult, Question } from '../types';
import { QUESTIONS } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';
import {
  CATEGORIES,
  categoryName,
  EXAM_MINUTES,
  EXAM_QUESTIONS,
  FIELDS,
  fieldName,
  fieldOfCategory,
  PASS_RATIO,
} from '../data/categories';
import type { FieldId } from '../types';
import { actions } from '../store';
import { navigate } from '../lib/router';
import { choiceIndexOf, useKeys } from '../lib/useKeys';
import { isCorrectAnswer, toggleChoice } from '../lib/answer';

interface Item {
  qid: string;
  categoryId: string;
  q: Question;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const toItem = (q: Question): Item => ({ qid: q.id, categoryId: q.categoryId, q });

/**
 * 模試の問題を作る。
 *
 * **科目ごとの問題数は公表されている**（法令 15 / 物化 10 / 性消 10）ので、科目の比率は本番どおりに作れる。
 * ただし**科目の中でどの章から何問出るかは公表されていない。**
 * 科目ごとの問題数は公表値（法令 15 / 物化 10 / 性消 10）なので、**科目の比率は本番どおり**にできる。
 * 科目の中でどの章から何問出るかは公表されていないので、そこは `categories.ts` の
 * `questions`（こちらの見立て）を重みにして抽選する。
 * 収録が足りない章があれば、その不足分は他章から補って総数だけは合わせる。
 *
 * `fields` を渡すと、その科目だけから作る（**科目免除の形式**で使う）。
 * このとき、不足分を他章から補うのも**同じ科目の中に限る。**
 * 免除された科目の問題が混ざったら、免除の形式にならない。
 */
function build(count: number, fields?: FieldId[]): Item[] {
  const inScope = (categoryId: string): boolean => {
    if (fields === undefined) return true;
    const f = fieldOfCategory(categoryId);
    return f !== undefined && fields.includes(f);
  };
  const weighted = CATEGORIES.filter((c) => c.questions > 0 && inScope(c.id));
  const totalWeight = weighted.reduce((n, c) => n + c.questions, 0);
  const picked: Item[] = [];
  const used = new Set<string>();

  for (const c of weighted) {
    const want = Math.round((count * c.questions) / totalWeight);
    const pool = shuffle(QUESTIONS.filter((q) => q.categoryId === c.id));
    for (const q of pool.slice(0, want)) {
      picked.push(toItem(q));
      used.add(q.id);
    }
  }

  // 端数と、収録が足りない章の不足分を補う。**絞った科目の外からは取らない。**
  if (picked.length < count) {
    const rest = shuffle(QUESTIONS.filter((q) => !used.has(q.id) && inScope(q.categoryId)));
    for (const q of rest.slice(0, count - picked.length)) picked.push(toItem(q));
  }
  return shuffle(picked).slice(0, count);
}

/**
 * 分野ごとの正解数。
 *
 * **この試験は合格基準が公表されている**ので、科目ごとに満たしたかどうかを出してよい。
 * 「各科目とも満点の 60 パーセント程度」（高圧ガス保安協会）。**「程度」を落とさないこと。**
 * 姉妹アプリは合格基準が非公表だったので合否を出さない方針だったが、この試験は違う。
 *
 * **ただし出してよいのは「この模試の結果が基準を満たすか」まで。**
 * 収録した問題は本番ではないので、本番の合否を予想するものではない。
 */
function fieldScores(items: Item[], answers: number[][]): { id: FieldId; total: number; correct: number }[] {
  return FIELDS.filter((f) => f.questions > 0).map((f) => {
    let total = 0;
    let correct = 0;
    items.forEach((item, i) => {
      if (fieldOfCategory(item.categoryId) !== f.id) return;
      total += 1;
      if (isCorrectAnswer(item.q.answer, answers[i])) correct += 1;
    });
    return { id: f.id, total, correct };
  });
}

interface Config {
  count: number;
  minutes: number;
  /** 出題する科目。未指定なら全科目（本番形式） */
  fields?: FieldId[];
  /** 学習記録に残す形式名 */
  label: string;
}

/**
 * 出題セット。**本番は 1 区分 50 問を 270 分**（法令 60 / 保安管理技術 90 / 学識 120）。
 *
 * **★ この試験は、区分を選ばないと模試が作れない。**乙種化学と乙種機械は
 * 法令 20 問が共通で、保安管理技術と学識だけが違う。**受験者はどちらか一方しか受けない**ので、
 * 6 分野を全部混ぜた模試は本番と別物になる。だから本番形式を区分ごとに 2 つ置いている。
 *
 * **本番形式では、科目の比率を本番どおりにすること**（法令 20 / 保安管理技術 15 / 学識 15）。
 * 科目ごとに 6 割程度という基準がある以上、比率が違うと判定の意味がなくなる。
 *
 * **★ この試験には科目免除がある**（受験案内書 Ⅰ-10 と別紙）。危険物甲種には無かったので、
 * そちらから形式を写すと足りない。実際に多いのは次の 2 つ。
 *
 * - **乙種化学（機械）講習の検定に合格している** → 保安管理技術と学識が免除。**受験は法令だけ**
 * - **もう一方の区分の免状をすでに持っている** → 法令が免除。**受験は保安管理技術と学識だけ**
 *
 * この 2 つをそのまま形式にしてある。**「免除」という名前で出してよい。**
 * （危険物甲種版では、制度が無いのに名前だけ残っていないか確かめる必要があった）
 */
const PRESETS: (Config & { note: string })[] = [
  {
    label: '本番形式（乙種化学）',
    count: EXAM_QUESTIONS,
    minutes: EXAM_MINUTES,
    fields: ['law', 'hoan-kagaku', 'gaku-kagaku'],
    note: EXAM_QUESTIONS + ' 問 / ' + EXAM_MINUTES + ' 分。法令 20 / 保安管理技術 15 / 学識 15',
  },
  {
    label: '本番形式（乙種機械）',
    count: EXAM_QUESTIONS,
    minutes: EXAM_MINUTES,
    fields: ['law', 'hoan-kikai', 'gaku-kikai'],
    note: EXAM_QUESTIONS + ' 問 / ' + EXAM_MINUTES + ' 分。法令 20 / 保安管理技術 15 / 学識 15',
  },
  {
    label: '法令だけ（保安管理技術・学識が免除の人）',
    count: 20,
    minutes: 60,
    fields: ['law'],
    note: '20 問 / 60 分。講習の検定に合格していると、受験するのはこの科目だけになります',
  },
  {
    label: '保安管理技術＋学識（化学／法令が免除の人）',
    count: 30,
    minutes: 210,
    fields: ['hoan-kagaku', 'gaku-kagaku'],
    note: '30 問 / 210 分。もう一方の区分の免状を持っていると、法令が免除されます',
  },
  {
    label: '保安管理技術＋学識（機械／法令が免除の人）',
    count: 30,
    minutes: 210,
    fields: ['hoan-kikai', 'gaku-kikai'],
    note: '30 問 / 210 分。もう一方の区分の免状を持っていると、法令が免除されます',
  },
  { label: '短縮（化学）', count: 10, minutes: 54, fields: ['law', 'hoan-kagaku', 'gaku-kagaku'], note: '10 問 / 54 分。すきま時間に' },
  { label: '短縮（機械）', count: 10, minutes: 54, fields: ['law', 'hoan-kikai', 'gaku-kikai'], note: '10 問 / 54 分。すきま時間に' },
];

interface Session {
  config: Config;
  items: Item[];
  /** 各問の選択。未解答は空配列（複数選択があるので配列で持つ） */
  answers: number[][];
  idx: number;
  startedAt: number;
  /** 採点済みなら経過秒数を保持 */
  finishedAt: number | null;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function Mock(): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());
  const [reviewing, setReviewing] = useState(false);

  const running = session !== null && session.finishedAt === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const remaining = session ? session.config.minutes * 60 - (now - session.startedAt) / 1000 : 0;

  const finish = (s: Session) => {
    const elapsed = Math.round((Date.now() - s.startedAt) / 1000);
    const byCategory: MockResult['byCategory'] = {};
    let correct = 0;
    s.items.forEach((item, i) => {
      const ok = isCorrectAnswer(item.q.answer, s.answers[i]);
      if (ok) correct += 1;
      const entry = byCategory[item.categoryId] ?? { total: 0, correct: 0 };
      entry.total += 1;
      if (ok) entry.correct += 1;
      byCategory[item.categoryId] = entry;
      // 未解答も含めて記録し、SRS へ反映する
      actions.answer({ qid: item.qid, categoryId: item.categoryId, correct: ok, mode: 'mock' });
    });
    actions.addMock({
      id: `mock-${Date.now()}`,
      at: Date.now(),
      preset: `${s.config.label}　${s.items.length} 問 / ${s.config.minutes} 分`,
      total: s.items.length,
      correct,
      elapsed,
      byCategory,
    });
    setSession({ ...s, finishedAt: Date.now() });
    setReviewing(false);
  };

  // 制限時間の到達で自動採点する
  useEffect(() => {
    if (session && session.finishedAt === null && remaining <= 0) finish(session);
    // finish は session を引数に取るため依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, session]);

  // 1〜5 で選択、← → で前後の問題へ
  useKeys(
    useCallback(
      (key: string) => {
        if (session === null || session.finishedAt !== null) return;
        const choice = choiceIndexOf(key);
        if (choice !== null) {
          setSession((s) => {
            if (s === null) return s;
            const answers = [...s.answers];
            answers[s.idx] = toggleChoice(s.items[s.idx].q.answer, answers[s.idx], choice);
            return { ...s, answers };
          });
          return;
        }
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
          setSession((s) => {
            if (s === null) return s;
            const delta = key === 'ArrowLeft' ? -1 : 1;
            return { ...s, idx: Math.min(s.items.length - 1, Math.max(0, s.idx + delta)) };
          });
        }
      },
      [session],
    ),
  );

  const unanswered = useMemo(
    () => (session ? session.answers.reduce<number[]>((acc, a, i) => (a.length === 0 ? [...acc, i] : acc), []) : []),
    [session],
  );

  // ---- 設定画面 ----
  if (!session) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>模試</h1>
          <p className="lead">
            時間制限つきで通しで解きます。途中で正誤は表示されません。時間配分の感覚をつかむことが目的です。
          </p>
        </header>
        <div className="preset-grid">
          {PRESETS.map((p) => {
            // 科目を絞る形式では、**その科目の収録数**で足りるかを見る。
            // 全体の問題数で判定すると、性消が 10 問未満でも押せてしまう。
            const pool =
              p.fields === undefined
                ? QUESTIONS.length
                : QUESTIONS.filter((q) => {
                    const f = fieldOfCategory(q.categoryId);
                    return f !== undefined && p.fields?.includes(f);
                  }).length;
            const enough = pool >= p.count;
            return (
              <button
                key={p.label}
                type="button"
                className="action"
                disabled={!enough}
                onClick={() =>
                  setSession({
                    config: { count: p.count, minutes: p.minutes, fields: p.fields, label: p.label },
                    items: build(p.count, p.fields),
                    answers: Array.from({ length: p.count }, () => [] as number[]),
                    idx: 0,
                    startedAt: Date.now(),
                    finishedAt: null,
                  })
                }
              >
                <span className="action-title">{p.label}</span>
                <span className="action-sub">
                  {enough ? p.note : `収録問題が不足しています（現在 ${pool} 問）`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="hint">
          本番は択一式が {EXAM_QUESTIONS} 問、合計 {EXAM_MINUTES} 分です（法令 20 問 60 分 / 保安管理技術 15 問 90 分 /
          学識 15 問 120 分）。<strong>科目の間に休憩があるので、通しで {EXAM_MINUTES} 分座るわけではありません。</strong>
        </p>
        <p className="hint">
          <strong>合格基準は「各科目とも満点の {Math.round(PASS_RATIO * 100)} パーセント程度」です。</strong>
          合計点ではありません。1 科目でも下回れば不合格になるので、この模試も科目ごとに出します。
        </p>
        <p className="hint">
          <strong>乙種化学と乙種機械は別の試験です。</strong>法令 20 問は共通ですが、
          保安管理技術と学識は区分ごとに中身が違います。<strong>受ける区分の形式を選んでください</strong>（→{' '}
          <button type="button" className="link-btn" onClick={() => navigate('textbook/i-1')}>
            この試験の形
          </button>
          ）。
        </p>
        <p className="hint">
          ※ 出すのは<strong>この模試の結果が 6 割に届いたか</strong>までです。
          <strong>合格基準は「6 割程度」であって「6 割以上」と言い切られていません。</strong>
          本番の合否を予想するものではありません。
          この記述は 2026 年 9 月 15 日時点のものです。最新の試験要項は高圧ガス保安協会の公式サイトで確認してください。
        </p>
      </div>
    );
  }

  // ---- 採点結果 ----
  if (session.finishedAt !== null) {
    const correct = session.items.filter((item, i) => isCorrectAnswer(item.q.answer, session.answers[i])).length;
    const rate = Math.round((correct / session.items.length) * 100);
    const elapsed = Math.round((session.finishedAt - session.startedAt) / 1000);
    const scores = fieldScores(session.items, session.answers);
    // 科目を絞った形式かどうか。絞った形式では、出していない科目の行の書き方を変える
    const narrowed = session.config.fields;
    const blank = session.answers.filter((a) => a.length === 0).length;
    // この試験で問われるのは速度でもある。持ち時間と実際のペースを比べる
    const perQuestion = elapsed / session.items.length;
    const budget = (session.config.minutes * 60) / session.items.length;
    const byCat = new Map<string, { total: number; correct: number }>();
    session.items.forEach((item, i) => {
      const e = byCat.get(item.categoryId) ?? { total: 0, correct: 0 };
      e.total += 1;
      if (isCorrectAnswer(item.q.answer, session.answers[i])) e.correct += 1;
      byCat.set(item.categoryId, e);
    });

    if (reviewing) {
      return (
        <div className="page">
          <header className="page-head">
            <h1>模試の見直し</h1>
            <p className="hint">誤答と未解答を中心に確認してください。</p>
          </header>
          {session.items.map((item, i) => (
            <QuestionCard
              key={item.qid}
              q={item.q}
              selected={session.answers[i]}
              revealed
              onSelect={() => undefined}
              counter={`${i + 1} / ${session.items.length}`}
            />
          ))}
          <div className="read-actions">
            <button type="button" className="btn" onClick={() => setReviewing(false)}>
              結果へ戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="page">
        <header className="page-head">
          <h1>模試の結果</h1>
        </header>
        <div className="cards">
          <div className="card stat">
            <span className="stat-label">得点</span>
            <span className="stat-value">
              {correct} / {session.items.length}
            </span>
            <span className="stat-sub">正答率 {rate}%</span>
          </div>
          <div className="card stat">
            <span className="stat-label">所要時間</span>
            <span className="stat-value">{formatTime(elapsed)}</span>
            <span className="stat-sub">制限 {session.config.minutes} 分</span>
          </div>
          <div className="card stat">
            <span className="stat-label">解答のペース</span>
            <span className="stat-value">{Math.round(perQuestion)} 秒 / 問</span>
            <span className="stat-sub">
              {blank > 0
                ? `未解答が ${blank} 問。持ち時間は 1 問 ${Math.round(budget)} 秒です`
                : `全問に解答。持ち時間 1 問 ${Math.round(budget)} 秒に対して${perQuestion <= budget ? '間に合っています' : '超えています'}`}
            </span>
          </div>
        </div>

        <section className="section">
          <h2>科目別の判定</h2>
          <p className="hint">
            <strong>合格基準は「試験科目ごとの成績が、それぞれ {Math.round(PASS_RATIO * 100)} % 以上」</strong>と公表されています。
            合計点ではないので、<strong>1 科目でも 6 割を切れば不合格</strong>です。下の表は科目ごとに基準を満たしたかを出しています。
            ただし、これは<strong>この模試の結果</strong>であって、本番の合否予想ではありません。
          </p>
          {narrowed !== undefined && (
            <p className="hint">
              これは<strong>科目を絞った形式</strong>です。判定は
              <strong>{narrowed.map(fieldName).join('・')}だけ</strong>で決まります。
              <strong>本番はこの科目の組合せではありません</strong>（科目免除を受けた場合の形式です）。
            </p>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>科目</th>
                  <th>正解 / 出題</th>
                  <th>正答率</th>
                  <th>基準 {Math.round(PASS_RATIO * 100)} %</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((f) => {
                  const met = f.total > 0 && f.correct / f.total >= PASS_RATIO;
                  // **出していない科目を「出題なし」と並べない。**
                  // 空欄に見えると、点が取れなかったのかと読める。
                  const excluded = narrowed !== undefined && !narrowed.includes(f.id);
                  return (
                    <tr key={f.id} className={f.total > 0 && !met ? 'low' : ''}>
                      <td>{fieldName(f.id)}</td>
                      <td>{excluded ? '対象外' : `${f.correct} / ${f.total}`}</td>
                      <td>
                        {excluded ? '—' : f.total === 0 ? '出題なし' : `${Math.round((f.correct / f.total) * 100)}%`}
                      </td>
                      <td>{excluded ? '対象外' : f.total === 0 ? '—' : met ? '満たす' : '満たさない'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>章別の結果</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>分野</th>
                  <th>正解 / 出題</th>
                  <th>正答率</th>
                </tr>
              </thead>
              <tbody>
                {[...byCat.entries()]
                  .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
                  .map(([cat, e]) => (
                    <tr key={cat} className={e.correct / e.total < 0.6 ? 'low' : ''}>
                      <td>{categoryName(cat)}</td>
                      <td>
                        {e.correct} / {e.total}
                      </td>
                      <td>{Math.round((e.correct / e.total) * 100)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="read-actions">
          <button type="button" className="btn primary" onClick={() => setReviewing(true)}>
            解説を見て復習する
          </button>
          <button type="button" className="btn" onClick={() => setSession(null)}>
            もう一度受ける
          </button>
          <button type="button" className="btn ghost" onClick={() => navigate('stats')}>
            成績分析へ
          </button>
        </div>
      </div>
    );
  }

  // ---- 受験中 ----
  const item = session.items[session.idx];
  const setAnswer = (choice: number) => {
    const answers = [...session.answers];
    answers[session.idx] = toggleChoice(item.q.answer, answers[session.idx], choice);
    setSession({ ...session, answers });
  };
  const move = (delta: number) => {
    const idx = Math.min(session.items.length - 1, Math.max(0, session.idx + delta));
    setSession({ ...session, idx });
  };

  return (
    <div className="page">
      <div className={`exam-bar ${remaining < 300 ? 'urgent' : ''}`}>
        <span className="exam-timer">残り {formatTime(remaining)}</span>
        <span className="exam-count">
          解答済み {session.answers.filter((a) => a.length > 0).length} / {session.items.length}
        </span>
        <button type="button" className="btn small" onClick={() => finish(session)}>
          採点する
        </button>
      </div>

      <QuestionCard
        q={item.q}
        selected={session.answers[session.idx]}
        revealed={false}
        onSelect={setAnswer}
        counter={`${session.idx + 1} / ${session.items.length}`}
        hideResult
      />

      <div className="exam-nav">
        <button type="button" className="btn" disabled={session.idx === 0} onClick={() => move(-1)}>
          ← 前の問題
        </button>
        <button
          type="button"
          className="btn"
          disabled={session.idx === session.items.length - 1}
          onClick={() => move(1)}
        >
          次の問題 →
        </button>
      </div>
      <p className="kbd-hint">
        <kbd>1</kbd>〜<kbd>5</kbd> で選択、<kbd>←</kbd> <kbd>→</kbd> で問題を移動できます
      </p>

      <section className="section">
        <h2>解答状況</h2>
        <div className="grid-nav">
          {session.items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`grid-cell ${session.answers[i].length > 0 ? 'filled' : ''} ${i === session.idx ? 'current' : ''}`}
              onClick={() => setSession({ ...session, idx: i })}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {unanswered.length > 0 && <p className="hint">未解答が {unanswered.length} 問あります。</p>}
      </section>
    </div>
  );
}
