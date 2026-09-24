import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProgressService } from '../services/progress.service';

/**
 * Client-side check matching the RLS-backed reality: a level is only reachable
 * once the learner has a user_progress row for it (created on sign-up for
 * Level 01, and later by the exam RPC when a level is unlocked).
 */
export const levelAccessGuard: CanActivateFn = async (route) => {
  const progressService = inject(ProgressService);
  const router = inject(Router);

  const levelId = route.paramMap.get('id');
  if (!levelId) {
    return router.createUrlTree(['/levels']);
  }

  const hasAccess = await progressService.hasAccessToLevel(levelId);
  return hasAccess ? true : router.createUrlTree(['/levels']);
};
