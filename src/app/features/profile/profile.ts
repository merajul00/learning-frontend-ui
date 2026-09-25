import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Profile } from '../../core/models/user-progress.model';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { getInitials } from '../../shared/utils/initials';
import {
  COUNTRY_DIAL_CODES,
  CountryDialCode,
  findCountryByIso2,
  findCountryByName,
  flagUrl,
  parseStoredPhone,
} from '../../shared/data/country-codes';

/** Supabase errors (Postgrest/Storage) are plain objects, not `Error` instances,
 * so `error instanceof Error` always misses them and hides the real message. */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return fallback;
}

@Component({
  imports: [FormsModule],
  selector: 'app-profile',
  styleUrl: './profile.scss',
  templateUrl: './profile.html',
})
export class ProfilePage implements OnInit {
  loading = signal(true);
  loadError = signal<string | null>(null);

  showEditModal = signal(false);
  savingDetails = signal(false);
  detailsError = signal<string | null>(null);
  private formSnapshot = signal('');
  private avatarUrlAtOpen = signal<string | null>(null);

  firstName = signal('');
  lastName = signal('');
  phoneCountry = signal<CountryDialCode>(findCountryByIso2('BD'));
  phoneNumber = signal('');
  phoneNumberError = signal<string | null>(null);
  showPhoneCountryDropdown = signal(false);
  phoneCountryFilter = signal('');
  address = signal('');
  countrySelection = signal<CountryDialCode | null>(null);
  showCountryFieldDropdown = signal(false);
  countryFieldFilter = signal('');
  stateRegion = signal('');
  city = signal('');
  zipCode = signal('');
  bio = signal('');

  newPassword = signal('');
  savingPassword = signal(false);
  passwordSaved = signal(false);
  passwordError = signal<string | null>(null);

  uploadingAvatar = signal(false);
  avatarError = signal<string | null>(null);

  readonly profile;
  readonly flagUrl = flagUrl;

  get initials(): string {
    return getInitials(this.profile()?.displayName || this.authService.user()?.email || '');
  }

  get email(): string {
    return this.authService.user()?.email ?? '';
  }

  readonly filteredPhoneCountries = computed(() => {
    const query = this.phoneCountryFilter().trim().toLowerCase();
    if (!query) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.dialCode.includes(query),
    );
  });

  readonly filteredCountryFieldOptions = computed(() => {
    const query = this.countryFieldFilter().trim().toLowerCase();
    if (!query) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter((c) => c.name.toLowerCase().includes(query));
  });

  private computeSnapshotKey(): string {
    return JSON.stringify({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      phoneIso2: this.phoneCountry().iso2,
      phoneNumber: this.phoneNumber().trim(),
      address: this.address().trim(),
      countryIso2: this.countrySelection()?.iso2 ?? '',
      stateRegion: this.stateRegion().trim(),
      city: this.city().trim(),
      zipCode: this.zipCode().trim(),
      bio: this.bio().trim(),
    });
  }

  readonly isDetailsDirty = computed(
    () =>
      this.computeSnapshotKey() !== this.formSnapshot() ||
      (this.profile()?.avatarUrl ?? null) !== this.avatarUrlAtOpen(),
  );

  get lastUpdatedLabel(): string {
    const updatedAt = this.profile()?.updatedAt;
    if (!updatedAt) return '—';
    return new Date(updatedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  constructor(
    readonly authService: AuthService,
    private readonly profileService: ProfileService,
  ) {
    this.profile = this.profileService.myProfile;
  }

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.profileService.getMyProfile();
      this.resetFormFromProfile(profile);
    } catch (error) {
      this.loadError.set(extractErrorMessage(error, 'Could not load your profile.'));
    } finally {
      this.loading.set(false);
    }
  }

  private resetFormFromProfile(profile: Profile | null): void {
    this.firstName.set(profile?.firstName ?? '');
    this.lastName.set(profile?.lastName ?? '');
    const { country, nationalNumber } = parseStoredPhone(profile?.phone);
    this.phoneCountry.set(country);
    this.phoneNumber.set(nationalNumber);
    this.phoneNumberError.set(null);
    this.showPhoneCountryDropdown.set(false);
    this.phoneCountryFilter.set('');
    this.address.set(profile?.address ?? '');
    this.countrySelection.set(findCountryByName(profile?.country));
    this.showCountryFieldDropdown.set(false);
    this.countryFieldFilter.set('');
    this.stateRegion.set(profile?.stateRegion ?? '');
    this.city.set(profile?.city ?? '');
    this.zipCode.set(profile?.zipCode ?? '');
    this.bio.set(profile?.bio ?? '');
    this.avatarUrlAtOpen.set(profile?.avatarUrl ?? null);
    this.formSnapshot.set(this.computeSnapshotKey());
  }

  openEditModal(): void {
    this.resetFormFromProfile(this.profile());
    this.detailsError.set(null);
    this.avatarError.set(null);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    if (this.savingDetails()) return;
    this.showEditModal.set(false);
    this.detailsError.set(null);
  }

  togglePhoneCountryDropdown(): void {
    this.showPhoneCountryDropdown.update((open) => !open);
    this.phoneCountryFilter.set('');
  }

  selectPhoneCountry(country: CountryDialCode): void {
    this.phoneCountry.set(country);
    this.showPhoneCountryDropdown.set(false);
    this.phoneCountryFilter.set('');

    const digits = this.phoneNumber();
    if (digits.length > country.maxLength) {
      this.phoneNumber.set(digits.slice(0, country.maxLength));
      this.phoneNumberError.set(
        `${country.name} phone numbers have at most ${country.maxLength} digits.`,
      );
    } else {
      this.phoneNumberError.set(null);
    }
  }

  toggleCountryFieldDropdown(): void {
    this.showCountryFieldDropdown.update((open) => !open);
    this.countryFieldFilter.set('');
  }

  selectCountryField(country: CountryDialCode): void {
    this.countrySelection.set(country);
    this.showCountryFieldDropdown.set(false);
    this.countryFieldFilter.set('');
  }

  onPhoneNumberKeydown(event: KeyboardEvent): void {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const maxLength = this.phoneCountry().maxLength;
    const input = event.target as HTMLInputElement;
    const selectionLength = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);
    const wouldExceed = this.phoneNumber().length - selectionLength >= maxLength;

    if (wouldExceed) {
      event.preventDefault();
      this.phoneNumberError.set(
        `${this.phoneCountry().name} numbers (${this.phoneCountry().dialCode}) take at most ${maxLength} digits — you've reached the limit.`,
      );
    }
  }

  onPhoneNumberChange(raw: string): void {
    const digits = raw.replace(/\D/g, '');
    const maxLength = this.phoneCountry().maxLength;
    if (digits.length > maxLength) {
      this.phoneNumber.set(digits.slice(0, maxLength));
      this.phoneNumberError.set(
        `${this.phoneCountry().name} numbers (${this.phoneCountry().dialCode}) take at most ${maxLength} digits — the extra digits were trimmed.`,
      );
    } else {
      this.phoneNumber.set(digits);
      this.phoneNumberError.set(null);
    }
  }

  onZipCodeKeydown(event: KeyboardEvent): void {
    if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onZipCodeChange(raw: string): void {
    this.zipCode.set(raw.replace(/\D/g, ''));
  }

  async saveDetails(): Promise<void> {
    this.savingDetails.set(true);
    this.detailsError.set(null);
    try {
      const nationalNumber = this.phoneNumber().trim();
      await this.profileService.updateProfileDetails({
        firstName: this.firstName().trim() || null,
        lastName: this.lastName().trim() || null,
        phone: nationalNumber ? `${this.phoneCountry().dialCode} ${nationalNumber}` : null,
        address: this.address().trim() || null,
        country: this.countrySelection()?.name ?? null,
        stateRegion: this.stateRegion().trim() || null,
        city: this.city().trim() || null,
        zipCode: this.zipCode().trim() || null,
        bio: this.bio().trim() || null,
      });
      this.formSnapshot.set(this.computeSnapshotKey());
      this.avatarUrlAtOpen.set(this.profile()?.avatarUrl ?? null);
      this.showEditModal.set(false);
    } catch (error) {
      this.detailsError.set(extractErrorMessage(error, 'Could not save your changes.'));
    } finally {
      this.savingDetails.set(false);
    }
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.avatarError.set(null);
    try {
      await this.profileService.uploadAvatar(file);
    } catch (error) {
      this.avatarError.set(extractErrorMessage(error, 'Could not upload photo.'));
    } finally {
      this.uploadingAvatar.set(false);
      input.value = '';
    }
  }

  async removeAvatar(): Promise<void> {
    this.uploadingAvatar.set(true);
    this.avatarError.set(null);
    try {
      await this.profileService.removeAvatar();
    } catch (error) {
      this.avatarError.set(extractErrorMessage(error, 'Could not remove photo.'));
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async savePassword(): Promise<void> {
    const password = this.newPassword();
    if (password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSaved.set(false);
    try {
      await this.authService.updatePassword(password);
      this.newPassword.set('');
      this.passwordSaved.set(true);
    } catch {
      this.passwordError.set('Could not update your password. Please try again.');
    } finally {
      this.savingPassword.set(false);
    }
  }
}
