export interface Profile {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  currentLevelId: string | null;
  currentLessonId: string | null;
  currentItemIndex: number;
  totalXp: number;
  streakCount: number;
  lastActivityDate: string | null;
  role: 'user' | 'admin';
}

export interface UserProgress {
  userId: string;
  levelId: string;
  lessonId: string | null;
  currentItemIndex: number;
  itemsCompleted: number;
  lessonCompleted: boolean;
  levelCompleted: boolean;
  lastActivity: string;
}
