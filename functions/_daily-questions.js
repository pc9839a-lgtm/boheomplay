import { dailyQuestions20260713 } from './_qa-2026-07-13.js';
import { dailyQuestions20260714 } from './_qa-2026-07-14.js';
import { dailyQuestions20260715 } from './_qa-2026-07-15.js';

const withDate = (items, updatedAt) => items.map((item) => ({ ...item, updatedAt }));

export const dailyQuestions = [
  ...withDate(dailyQuestions20260715, '2026-07-15'),
  ...withDate(dailyQuestions20260714, '2026-07-14'),
  ...withDate(dailyQuestions20260713, '2026-07-13')
];
