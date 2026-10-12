'use client';

export interface OwnerSession {
  isAuthenticated: boolean;
  ownerName: string;
  email: string;
  role: 'owner';
  lastLogin: string;
}

const AUTH_KEY = 'studyos_owner_session';
const PIN_KEY = 'studyos_owner_pin';

export const OWNER_DEFAULTS = {
  name: 'Harshal',
  email: 'harshal@cdac.in',
  defaultPin: '77965',
  defaultPassword: 'studyos2026',
};

export const AuthManager = {
  getSession(): OwnerSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      // Cookie fallback recovery if localStorage was cleared
      if (typeof document !== 'undefined' && document.cookie && document.cookie.includes('studyos_owner=true')) {
        const session: OwnerSession = {
          isAuthenticated: true,
          ownerName: OWNER_DEFAULTS.name,
          email: OWNER_DEFAULTS.email,
          role: 'owner',
          lastLogin: new Date().toISOString(),
        };
        try {
          localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        } catch {}
        return session;
      }
      return null;
    } catch {
      return null;
    }
  },

  getOwnerPin(): string {
    if (typeof window === 'undefined') return OWNER_DEFAULTS.defaultPin;
    return localStorage.getItem(PIN_KEY) || OWNER_DEFAULTS.defaultPin;
  },

  setOwnerPin(newPin: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PIN_KEY, newPin);
  },

  login(identifier: string, secret: string): boolean {
    if (typeof window === 'undefined') return false;

    const currentPin = this.getOwnerPin();
    const cleanSecret = secret.trim();
    const cleanId = identifier.trim().toLowerCase();

    // Verification: Match current PIN, default PIN (77965), legacy PIN 1234, password, or owner username
    const isPinMatch =
      cleanSecret === currentPin ||
      cleanSecret === OWNER_DEFAULTS.defaultPin ||
      cleanSecret === '77965' ||
      cleanSecret === '1234';

    const isPasswordMatch =
      cleanSecret === OWNER_DEFAULTS.defaultPassword &&
      (cleanId === OWNER_DEFAULTS.email.toLowerCase() ||
        cleanId === 'harshal' ||
        cleanId.includes('harshal'));

    const isOwnerBypass =
      cleanSecret.toLowerCase() === 'harshal' ||
      cleanSecret === '77965' ||
      cleanSecret === '1234';

    if (isPinMatch || isPasswordMatch || isOwnerBypass) {
      // Ensure current stored PIN is 77965
      try {
        localStorage.setItem(PIN_KEY, OWNER_DEFAULTS.defaultPin);
      } catch {}

      const session: OwnerSession = {
        isAuthenticated: true,
        ownerName: OWNER_DEFAULTS.name,
        email: OWNER_DEFAULTS.email,
        role: 'owner',
        lastLogin: new Date().toISOString(),
      };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        document.cookie = `studyos_owner=true; path=/; max-age=2592000; SameSite=Lax`;
      } catch {}
      return true;
    }

    return false;
  },

  quickUnlock(): OwnerSession {
    const session: OwnerSession = {
      isAuthenticated: true,
      ownerName: OWNER_DEFAULTS.name,
      email: OWNER_DEFAULTS.email,
      role: 'owner',
      lastLogin: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        localStorage.setItem(PIN_KEY, OWNER_DEFAULTS.defaultPin);
        document.cookie = `studyos_owner=true; path=/; max-age=2592000; SameSite=Lax`;
      } catch {}
    }
    return session;
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(AUTH_KEY);
      document.cookie = `studyos_owner=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    } catch {}
  },
};
