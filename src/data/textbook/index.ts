import type { TextbookSection } from '../../types';
import { intro } from './intro';
import { lawWhat } from './law-what';
import { lawPermit } from './law-permit';
import { lawHandle } from './law-handle';
import { lawPeople } from './law-people';
import { lawVessel } from './law-vessel';
import { lawTech } from './law-tech';

/**
 * 教本の全セクション。**入門編 4 節だけ書いてあります**（2026 年 9 月 15 日）。
 *
 * 書く順番は `docs/handover.md` の §2 にあります。
 * **出題範囲の洗い出し → 公開問題の分析 → 読者を決める → 章立ての確定 →
 * 数値の一次資料台帳 → 入門編を手で書く**、の順でないと手戻りします。
 *
 * 節を書き始めるときは、**1 章 1 ファイル**（`src/data/textbook/<章 ID>.ts`）にして、
 * ここで束ねてください。複数のエージェントを並行で走らせても衝突しません。
 * **並びは `CATEGORIES` と同じ順にすること。**目次の表示順がここで決まります。
 */
export const SECTIONS: TextbookSection[] = [...intro, ...lawWhat, ...lawPermit, ...lawHandle, ...lawPeople, ...lawVessel, ...lawTech];

export const sectionById = (id: string): TextbookSection | undefined => SECTIONS.find((s) => s.id === id);

export const sectionsOfCategory = (categoryId: string): TextbookSection[] =>
  SECTIONS.filter((s) => s.categoryId === categoryId);

/** 教本全体の目安学習時間（分）。ホームと目次に出す */
export const totalMinutes = SECTIONS.reduce((sum, s) => sum + s.minutes, 0);
