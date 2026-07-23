import { dailyQuestions20260713 } from './_qa-2026-07-13.js';
import { dailyQuestions20260714 } from './_qa-2026-07-14.js';
import { dailyQuestions20260715 } from './_qa-2026-07-15.js';
import { dailyQuestions20260716 } from './_qa-2026-07-16.js';
import { dailyQuestions20260717 } from './_qa-2026-07-17.js';
import { dailyQuestions20260718 } from './_qa-2026-07-18.js';
import { dailyQuestions20260719 } from './_qa-2026-07-19.js';
import { dailyQuestions20260720 } from './_qa-2026-07-20.js';
import { dailyQuestions20260721 } from './_qa-2026-07-21.js';
import { dailyQuestions20260722 } from './_qa-2026-07-22.js';
import { dailyQuestions20260723 } from './_qa-2026-07-23.js';
import { dailyQuestions20260724 } from './_qa-2026-07-24.js';

const withDate = (items, updatedAt) => items.map((item) => ({ ...item, updatedAt }));

export const dailyQuestions = [
  ...withDate(dailyQuestions20260724, '2026-07-24'),
  ...withDate(dailyQuestions20260723, '2026-07-23'),
  ...withDate(dailyQuestions20260722, '2026-07-22'),
  ...withDate(dailyQuestions20260721, '2026-07-21'),
  ...withDate(dailyQuestions20260720, '2026-07-20'),
  ...withDate(dailyQuestions20260719, '2026-07-19'),
  ...withDate(dailyQuestions20260718, '2026-07-18'),
  ...withDate(dailyQuestions20260717, '2026-07-17'),
  ...withDate(dailyQuestions20260716, '2026-07-16'),
  ...withDate(dailyQuestions20260715, '2026-07-15'),
  ...withDate(dailyQuestions20260714, '2026-07-14'),
  ...withDate(dailyQuestions20260713, '2026-07-13')
];
