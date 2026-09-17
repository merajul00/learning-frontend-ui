import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: '**', component: NotFound, title: 'Page Not Found' },
];
