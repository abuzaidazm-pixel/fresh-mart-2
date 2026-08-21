/**
 * Password rules for FreshMart accounts.
 *
 * These are enforced in the browser for fast feedback. The browser is not a
 * security boundary — anyone can call the Supabase API directly — so the real
 * floor is set in the Supabase dashboard under
 * Authentication -> Providers -> Email -> Minimum password length, and
 * Authentication -> Attack Protection -> Leaked password protection.
 * Keep MIN_PASSWORD_LENGTH here in step with the dashboard setting.
 */

export const MIN_PASSWORD_LENGTH = 10;

/** Passwords that show up in every breach list. Refused outright. */
const BANNED = [
  'password',
  'passw0rd',
  'admin123',
  'admin1234',
  'freshmart',
  'freshmart2026',
  'qwerty',
  '12345678',
  '123456789',
  '1234567890',
  'letmein',
  'welcome',
  'iloveyou',
  'abc123',
];

export interface PasswordVerdict {
  /** Safe to submit */
  valid: boolean;
  /** 0-4, drives the strength meter */
  score: number;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  /** What still needs fixing, shown under the field */
  problems: string[];
}

export function checkPassword(password: string, email?: string): PasswordVerdict {
  const problems: string[] = [];

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (password.length < MIN_PASSWORD_LENGTH) {
    problems.push(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (classes < 3) {
    problems.push('Mix at least three of: lowercase, uppercase, numbers, symbols');
  }

  const lower = password.toLowerCase();
  if (BANNED.some(b => lower === b || lower.startsWith(b))) {
    problems.push('That is one of the most guessed passwords in the world');
  }

  // Anything built from the email local part is the first thing an attacker tries.
  const localPart = email?.split('@')[0]?.toLowerCase();
  if (localPart && localPart.length > 2 && lower.includes(localPart)) {
    problems.push('Do not build the password out of your email address');
  }

  if (/^(.)\1+$/.test(password)) {
    problems.push('Do not repeat a single character');
  }

  // Score is for the meter only; `valid` is what gates submission.
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 16) score++;
  if (classes >= 3) score++;
  if (classes === 4) score++;
  score = Math.min(4, score);
  if (problems.length > 0) score = Math.min(score, 1);

  const label: PasswordVerdict['label'] =
    password.length < MIN_PASSWORD_LENGTH
      ? 'Too short'
      : score <= 1
      ? 'Weak'
      : score === 2
      ? 'Fair'
      : score === 3
      ? 'Good'
      : 'Strong';

  return { valid: problems.length === 0, score, label, problems };
}

/**
 * Generates a passphrase-style suggestion. Uses crypto.getRandomValues rather
 * than Math.random, which is predictable and must never pick a password.
 */
export function suggestPassword(): string {
  const words = [
    'harvest', 'basil', 'orchard', 'saffron', 'lantern', 'copper', 'meadow',
    'walnut', 'ginger', 'cobalt', 'thistle', 'juniper', 'amber', 'pepper',
    'clover', 'cedar', 'mango', 'quartz', 'willow', 'indigo',
  ];
  const symbols = '!@#$%&*?';

  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);

  const pick = (i: number, list: string[] | string) =>
    typeof list === 'string'
      ? list[buf[i] % list.length]
      : list[buf[i] % list.length];

  const capitalise = (w: string) => w[0].toUpperCase() + w.slice(1);

  return [
    capitalise(pick(0, words) as string),
    pick(1, words) as string,
    (buf[2] % 90) + 10,
    pick(3, symbols),
    capitalise(pick(4, words) as string),
  ].join('');
}
