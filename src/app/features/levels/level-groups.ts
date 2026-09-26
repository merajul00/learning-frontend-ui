import { LevelState } from '../../core/models/level.model';

/**
 * The four cards on the Levels page "New" tab (Figma 293:4531).
 *
 * Status, progress and ticks are fixed to what Figma shows, for every learner
 * (not their real progress). `levelSlugs` are the database levels behind each
 * topic; the card's title, Practice and Exam open the first of them.
 */
export interface LevelGroupTopic {
  label: string;
  levelSlugs: string[];
  completed: boolean;
}

export interface LevelGroup {
  number: number;
  title: string;
  state: LevelState;
  /** 0-100 */
  progress: number;
  topics: LevelGroupTopic[];
}

export const LEVEL_GROUPS: LevelGroup[] = [
  {
    number: 1,
    title: 'Hiragana Foundations',
    state: 'completed',
    progress: 100,
    topics: [
      { label: 'ভূমিকা', levelSlugs: [], completed: true },
      { label: 'হিরাগানা', levelSlugs: ['hiragana'], completed: true },
      { label: 'তেন তেন, মারু', levelSlugs: ['dakuten-handakuten'], completed: true },
      { label: 'মিশ্র বর্ণ: ইয়া, ইউ, ইয়ো', levelSlugs: ['mixed-combination'], completed: true },
      { label: 'দীপ্ত বর্ণ', levelSlugs: ['double-consonants'], completed: true },
    ],
  },
  {
    number: 2,
    title: 'Numbers & Counting',
    state: 'in_progress',
    progress: 50,
    topics: [
      { label: 'সংখ্যার গণনা ১-১০k', levelSlugs: ['numbers'], completed: true },
      { label: 'ভগ্নাংশ গণনা', levelSlugs: ['fractions-decimals'], completed: true },
      { label: 'দশমিক গণনা', levelSlugs: ['fractions-decimals'], completed: false },
    ],
  },
  {
    number: 3,
    title: 'Dates & Calendar',
    state: 'locked',
    progress: 0,
    topics: [
      { label: 'দিন তারিখ গণনা', levelSlugs: ['dates'], completed: false },
      { label: 'সাপ্তাহিক বার গণনা', levelSlugs: ['days-of-week'], completed: false },
      { label: 'বয়স গণনা', levelSlugs: ['age-counting-1', 'age-counting-2'], completed: false },
      { label: 'মাসের নাম গণনা', levelSlugs: ['months'], completed: false },
      { label: 'সপ্তাহ গণনা', levelSlugs: ['week-year-counting'], completed: false },
      { label: 'বছর গণনা', levelSlugs: ['week-year-counting'], completed: false },
    ],
  },
  {
    number: 4,
    title: 'Time & Seasons',
    state: 'locked',
    progress: 0,
    topics: [
      { label: 'ঋতু গণনা', levelSlugs: [], completed: false },
      { label: 'ঘড়ির সময় গণনা', levelSlugs: ['time'], completed: false },
      { label: 'একক গণনা', levelSlugs: ['units'], completed: false },
    ],
  },
];
