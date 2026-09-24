import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { levelAccessGuard } from './core/guards/level-access.guard';
import { AuthShell } from './layout/auth-shell/auth-shell';
import { PublicShell } from './layout/public-shell/public-shell';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';
import { ComingSoon } from './features/coming-soon/coming-soon';

export const routes: Routes = [
  {
    path: '',
    component: PublicShell,
    children: [
      { path: '', component: Home, title: 'Home' },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
        title: 'Log In',
      },
    ],
  },
  {
    path: '',
    component: AuthShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard',
      },
      {
        path: 'levels',
        loadComponent: () => import('./features/levels/levels').then((m) => m.Levels),
        title: 'Levels',
      },
      {
        path: 'levels/n4',
        component: ComingSoon,
        data: { title: 'N4 Levels', description: 'N4 level content is coming soon.' },
        title: 'N4 Levels',
      },
      {
        path: 'levels/n3',
        component: ComingSoon,
        data: { title: 'N3 Levels', description: 'N3 level content is coming soon.' },
        title: 'N3 Levels',
      },
      {
        path: 'levels/n2',
        component: ComingSoon,
        data: { title: 'N2 Levels', description: 'N2 level content is coming soon.' },
        title: 'N2 Levels',
      },
      {
        path: 'levels/n1',
        component: ComingSoon,
        data: { title: 'N1 Levels', description: 'N1 level content is coming soon.' },
        title: 'N1 Levels',
      },
      {
        path: 'levels/:id',
        canActivate: [levelAccessGuard],
        loadComponent: () => import('./features/lesson/lesson').then((m) => m.Lesson),
        title: 'Lesson',
      },
      {
        path: 'levels/:id/practice',
        canActivate: [levelAccessGuard],
        loadComponent: () => import('./features/practice/practice').then((m) => m.Practice),
        title: 'Practice',
      },
      {
        path: 'levels/:id/quiz',
        canActivate: [levelAccessGuard],
        loadComponent: () => import('./features/quiz/quiz').then((m) => m.Quiz),
        title: 'Short Quiz',
      },
      {
        path: 'levels/:id/exam',
        canActivate: [levelAccessGuard],
        loadComponent: () => import('./features/exam/exam').then((m) => m.Exam),
        title: 'Final Exam',
      },
      {
        path: 'levels/:id/exam/result/:attemptId',
        canActivate: [levelAccessGuard],
        loadComponent: () =>
          import('./features/exam-result/exam-result').then((m) => m.ExamResult),
        title: 'Exam Result',
      },
      {
        path: 'practice',
        loadComponent: () =>
          import('./features/current-level-redirect/current-level-redirect').then(
            (m) => m.CurrentLevelRedirect,
          ),
        data: { target: 'practice' },
        title: 'Practice',
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./features/current-level-redirect/current-level-redirect').then(
            (m) => m.CurrentLevelRedirect,
          ),
        data: { target: 'quiz' },
        title: 'Quiz',
      },
      {
        path: 'progress',
        loadComponent: () => import('./features/progress/progress').then((m) => m.ProgressPage),
        title: 'Progress',
      },
      {
        path: 'mistakes',
        loadComponent: () => import('./features/mistakes/mistakes').then((m) => m.Mistakes),
        title: 'Mistakes',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.ProfilePage),
        title: 'Profile',
      },
      {
        path: 'homework-verify',
        component: ComingSoon,
        data: {
          title: 'Homework Verify',
          description: 'Homework verification is coming soon.',
        },
        title: 'Homework Verify',
      },
      {
        path: 'help-support',
        component: ComingSoon,
        data: { title: 'Help & Supports', description: 'Help & support is coming soon.' },
        title: 'Help & Supports',
      },
      {
        path: 'settings',
        component: ComingSoon,
        data: { title: 'Setting', description: 'Settings are coming soon.' },
        title: 'Setting',
      },
      {
        path: 'admin/countdown',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin-countdown/admin-countdown').then((m) => m.AdminCountdown),
        title: 'Countdown Settings',
      },
    ],
  },
  { path: '**', component: NotFound, title: 'Page Not Found' },
];
