export interface CountryDialCode {
  name: string;
  iso2: string;
  dialCode: string;
  /** Max digits in the national number, excluding the dial code. */
  maxLength: number;
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { name: 'Bangladesh', iso2: 'BD', dialCode: '+880', maxLength: 10 },
  { name: 'India', iso2: 'IN', dialCode: '+91', maxLength: 10 },
  { name: 'Pakistan', iso2: 'PK', dialCode: '+92', maxLength: 10 },
  { name: 'Sri Lanka', iso2: 'LK', dialCode: '+94', maxLength: 9 },
  { name: 'Nepal', iso2: 'NP', dialCode: '+977', maxLength: 10 },
  { name: 'Bhutan', iso2: 'BT', dialCode: '+975', maxLength: 8 },
  { name: 'Maldives', iso2: 'MV', dialCode: '+960', maxLength: 7 },
  { name: 'Afghanistan', iso2: 'AF', dialCode: '+93', maxLength: 9 },
  { name: 'United States', iso2: 'US', dialCode: '+1', maxLength: 10 },
  { name: 'Canada', iso2: 'CA', dialCode: '+1', maxLength: 10 },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '+44', maxLength: 10 },
  { name: 'Ireland', iso2: 'IE', dialCode: '+353', maxLength: 9 },
  { name: 'Germany', iso2: 'DE', dialCode: '+49', maxLength: 11 },
  { name: 'France', iso2: 'FR', dialCode: '+33', maxLength: 9 },
  { name: 'Italy', iso2: 'IT', dialCode: '+39', maxLength: 10 },
  { name: 'Spain', iso2: 'ES', dialCode: '+34', maxLength: 9 },
  { name: 'Portugal', iso2: 'PT', dialCode: '+351', maxLength: 9 },
  { name: 'Netherlands', iso2: 'NL', dialCode: '+31', maxLength: 9 },
  { name: 'Belgium', iso2: 'BE', dialCode: '+32', maxLength: 9 },
  { name: 'Switzerland', iso2: 'CH', dialCode: '+41', maxLength: 9 },
  { name: 'Austria', iso2: 'AT', dialCode: '+43', maxLength: 11 },
  { name: 'Sweden', iso2: 'SE', dialCode: '+46', maxLength: 9 },
  { name: 'Norway', iso2: 'NO', dialCode: '+47', maxLength: 8 },
  { name: 'Denmark', iso2: 'DK', dialCode: '+45', maxLength: 8 },
  { name: 'Finland', iso2: 'FI', dialCode: '+358', maxLength: 10 },
  { name: 'Poland', iso2: 'PL', dialCode: '+48', maxLength: 9 },
  { name: 'Russia', iso2: 'RU', dialCode: '+7', maxLength: 10 },
  { name: 'Ukraine', iso2: 'UA', dialCode: '+380', maxLength: 9 },
  { name: 'Turkey', iso2: 'TR', dialCode: '+90', maxLength: 10 },
  { name: 'Greece', iso2: 'GR', dialCode: '+30', maxLength: 10 },
  { name: 'Romania', iso2: 'RO', dialCode: '+40', maxLength: 9 },
  { name: 'Czech Republic', iso2: 'CZ', dialCode: '+420', maxLength: 9 },
  { name: 'Hungary', iso2: 'HU', dialCode: '+36', maxLength: 9 },
  { name: 'China', iso2: 'CN', dialCode: '+86', maxLength: 11 },
  { name: 'Japan', iso2: 'JP', dialCode: '+81', maxLength: 10 },
  { name: 'South Korea', iso2: 'KR', dialCode: '+82', maxLength: 10 },
  { name: 'Taiwan', iso2: 'TW', dialCode: '+886', maxLength: 9 },
  { name: 'Hong Kong', iso2: 'HK', dialCode: '+852', maxLength: 8 },
  { name: 'Singapore', iso2: 'SG', dialCode: '+65', maxLength: 8 },
  { name: 'Malaysia', iso2: 'MY', dialCode: '+60', maxLength: 10 },
  { name: 'Indonesia', iso2: 'ID', dialCode: '+62', maxLength: 12 },
  { name: 'Thailand', iso2: 'TH', dialCode: '+66', maxLength: 9 },
  { name: 'Vietnam', iso2: 'VN', dialCode: '+84', maxLength: 10 },
  { name: 'Philippines', iso2: 'PH', dialCode: '+63', maxLength: 10 },
  { name: 'Myanmar', iso2: 'MM', dialCode: '+95', maxLength: 10 },
  { name: 'Cambodia', iso2: 'KH', dialCode: '+855', maxLength: 9 },
  { name: 'Australia', iso2: 'AU', dialCode: '+61', maxLength: 9 },
  { name: 'New Zealand', iso2: 'NZ', dialCode: '+64', maxLength: 9 },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '+971', maxLength: 9 },
  { name: 'Saudi Arabia', iso2: 'SA', dialCode: '+966', maxLength: 9 },
  { name: 'Qatar', iso2: 'QA', dialCode: '+974', maxLength: 8 },
  { name: 'Kuwait', iso2: 'KW', dialCode: '+965', maxLength: 8 },
  { name: 'Bahrain', iso2: 'BH', dialCode: '+973', maxLength: 8 },
  { name: 'Oman', iso2: 'OM', dialCode: '+968', maxLength: 8 },
  { name: 'Israel', iso2: 'IL', dialCode: '+972', maxLength: 9 },
  { name: 'Iran', iso2: 'IR', dialCode: '+98', maxLength: 10 },
  { name: 'Iraq', iso2: 'IQ', dialCode: '+964', maxLength: 10 },
  { name: 'Egypt', iso2: 'EG', dialCode: '+20', maxLength: 10 },
  { name: 'South Africa', iso2: 'ZA', dialCode: '+27', maxLength: 9 },
  { name: 'Nigeria', iso2: 'NG', dialCode: '+234', maxLength: 10 },
  { name: 'Kenya', iso2: 'KE', dialCode: '+254', maxLength: 9 },
  { name: 'Ghana', iso2: 'GH', dialCode: '+233', maxLength: 9 },
  { name: 'Brazil', iso2: 'BR', dialCode: '+55', maxLength: 11 },
  { name: 'Mexico', iso2: 'MX', dialCode: '+52', maxLength: 10 },
  { name: 'Argentina', iso2: 'AR', dialCode: '+54', maxLength: 10 },
  { name: 'Colombia', iso2: 'CO', dialCode: '+57', maxLength: 10 },
  { name: 'Chile', iso2: 'CL', dialCode: '+56', maxLength: 9 },
  { name: 'Peru', iso2: 'PE', dialCode: '+51', maxLength: 9 },
];

export const DEFAULT_COUNTRY_ISO2 = 'BD';

export function flagUrl(iso2: string): string {
  return `images/flags/${iso2.toLowerCase()}.svg`;
}

export function findCountryByIso2(iso2: string): CountryDialCode {
  return (
    COUNTRY_DIAL_CODES.find((c) => c.iso2 === iso2) ??
    COUNTRY_DIAL_CODES.find((c) => c.iso2 === DEFAULT_COUNTRY_ISO2)!
  );
}

export function findCountryByName(name: string | null | undefined): CountryDialCode | null {
  const trimmed = (name ?? '').trim().toLowerCase();
  if (!trimmed) return null;
  return COUNTRY_DIAL_CODES.find((c) => c.name.toLowerCase() === trimmed) ?? null;
}

/**
 * Splits a stored "+880 1712345678"-style phone string into its country and
 * national-number parts. Falls back to the default country when the stored
 * value has no recognizable dial code (e.g. it was never set).
 */
export function parseStoredPhone(raw: string | null | undefined): {
  country: CountryDialCode;
  nationalNumber: string;
} {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return { country: findCountryByIso2(DEFAULT_COUNTRY_ISO2), nationalNumber: '' };
  }

  const candidates = [...COUNTRY_DIAL_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of candidates) {
    if (trimmed.startsWith(country.dialCode)) {
      const rest = trimmed.slice(country.dialCode.length).replace(/\D/g, '');
      return { country, nationalNumber: rest.slice(0, country.maxLength) };
    }
  }

  return {
    country: findCountryByIso2(DEFAULT_COUNTRY_ISO2),
    nationalNumber: trimmed.replace(/\D/g, '').slice(0, findCountryByIso2(DEFAULT_COUNTRY_ISO2).maxLength),
  };
}
