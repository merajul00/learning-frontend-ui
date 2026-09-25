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
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  stateRegion: string | null;
  city: string | null;
  zipCode: string | null;
  bio: string | null;
  updatedAt: string;
}

export interface ProfileDetailsUpdate {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  stateRegion: string | null;
  city: string | null;
  zipCode: string | null;
  bio: string | null;
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
