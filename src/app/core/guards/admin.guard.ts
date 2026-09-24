import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  await authService.ready;

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const profile = await profileService.getMyProfile();
  if (profile?.role === 'admin') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
