import type { Question } from '../../types';

/**
 * 確認問題の全体。**まだ 1 問も書いていません。**
 *
 * **教本より先に書かないこと。**問題は教本の節にひも付けるものなので、
 * 節が無いと `sectionId` を付けられません。
 *
 * **この試験は択一式。**`choices` は 5 要素、`answer` は 0〜4 を想定しています。
 * ただし KHK の問題は「イ・ロ・ハの記述のうち正しいものの組合せはどれか」という
 * **組合せを選ばせる形**が多いので、**公開問題を分析して形を確かめてから**書くこと
 * （`docs/public-questions.md`）。
 *
 * **数は本番の 3 倍が目安**です（`docs/handover.md` §10）。
 * 1 区分 50 問なので 150 問、内訳は法令 60 / 保安管理技術 45 / 学識 45。
 * **保安管理技術と学識は、化学と機械で別に持ちます。**
 * **入門編（intro）には問題を付けない。**試験範囲外だからです。
 */
export const QUESTIONS: Question[] = [];

export const questionById = (id: string): Question | undefined => QUESTIONS.find((q) => q.id === id);

export const questionsOfCategory = (categoryId: string): Question[] =>
  QUESTIONS.filter((q) => q.categoryId === categoryId);

export const questionsOfSection = (sectionId: string): Question[] =>
  QUESTIONS.filter((q) => q.sectionId === sectionId);
