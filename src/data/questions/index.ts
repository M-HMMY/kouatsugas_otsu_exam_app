import type { Question } from '../../types';
import { lawWhat } from './law-what';
import { lawPermit } from './law-permit';
import { lawHandle } from './law-handle';
import { lawPeople } from './law-people';
import { lawVessel } from './law-vessel';

/**
 * 確認問題の全体。**まだ 1 問も書いていません。**
 *
 * **教本より先に書かないこと。**問題は教本の節にひも付けるものなので、
 * 節が無いと `sectionId` を付けられません。
 *
 * **この試験は択一式。**`choices` は 5 要素、`answer` は 0〜4 を想定しています。
 *
 * **設問の形は「組合せ選択」で確定しました**（令和 7 年度の公開問題で確認。
 * `docs/public-questions.md` §2）。**記述を本文に並べ、`choices` に組合せを書きます。**
 *
 * - **法令**：記述は**イ・ロ・ハ の 3 つ**。選択肢は単独・2 つ組・3 つ全部が混ざる
 * - **保安管理技術**：記述は**イ・ロ・ハ・ニ の 4 つ**。
 *   選択肢は**必ず「2 要素の組 3 つ ＋ 3 要素の組 2 つ」**（単独も 4 つ全部も出ない）
 * - **学識**：4 つが基本。計算問題は選択肢が数値 5 つ
 * - **記述の正誤を問うときは「正しいものはどれか」。「誤っているものはどれか」は作らない**
 *
 * 記述は `question` に `イ．…` の形で並べます（読点は全角の `．`）。
 * **`scripts/check.ts` がこの形を検査します。**
 *
 * **数は本番の 3 倍が目安**です（`docs/handover.md` §10）。
 * 1 区分 50 問なので 150 問、内訳は法令 60 / 保安管理技術 45 / 学識 45。
 * **保安管理技術と学識は、化学と機械で別に持ちます。**
 * **入門編（intro）には問題を付けない。**試験範囲外だからです。
 */
export const QUESTIONS: Question[] = [...lawWhat, ...lawPermit, ...lawHandle, ...lawPeople, ...lawVessel];

export const questionById = (id: string): Question | undefined => QUESTIONS.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): Question[] =>
  QUESTIONS.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): Question[] =>
  QUESTIONS.filter((q) => q.sectionId === sectionId);
