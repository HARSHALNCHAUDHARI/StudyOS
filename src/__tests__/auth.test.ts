import { describe, it, expect, beforeEach } from 'vitest';
import { AuthManager, OWNER_DEFAULTS } from '../lib/auth';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => {
    store[key] = val;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
};

(global as any).window = {
  location: { href: '' },
};
(global as any).localStorage = mockLocalStorage;
(global as any).document = {
  cookie: '',
};

describe('AuthManager Authentication & Navigation Flow', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('authenticates with the updated master PIN 77965', () => {
    const success = AuthManager.login('harshal@cdac.in', '77965');
    expect(success).toBe(true);

    const session = AuthManager.getSession();
    expect(session).not.toBeNull();
    expect(session?.isAuthenticated).toBe(true);
    expect(session?.ownerName).toBe(OWNER_DEFAULTS.name);
  });

  it('authenticates with username harshal and master PIN', () => {
    const success = AuthManager.login('harshal', '77965');
    expect(success).toBe(true);
    expect(AuthManager.getSession()?.isAuthenticated).toBe(true);
  });

  it('authenticates with legacy PIN 1234 as fallback', () => {
    const success = AuthManager.login('harshal@cdac.in', '1234');
    expect(success).toBe(true);
  });

  it('authenticates with owner bypass keyword', () => {
    const success = AuthManager.login('harshal@cdac.in', 'harshal');
    expect(success).toBe(true);
  });

  it('quickUnlock immediately generates valid session', () => {
    const session = AuthManager.quickUnlock();
    expect(session.isAuthenticated).toBe(true);
    expect(session.role).toBe('owner');
    expect(AuthManager.getSession()?.isAuthenticated).toBe(true);
  });

  it('logout cleans session', () => {
    AuthManager.quickUnlock();
    expect(AuthManager.getSession()).not.toBeNull();
    AuthManager.logout();
    expect(AuthManager.getSession()).toBeNull();
  });

  it('rejects invalid credentials', () => {
    const success = AuthManager.login('unknown', 'wrongpassword');
    expect(success).toBe(false);
  });

  it('preserves auth session when StorageManager methods are called', async () => {
    const { StorageManager } = await import('../lib/storage');
    AuthManager.login('harshal@cdac.in', '77965');
    expect(AuthManager.getSession()).not.toBeNull();

    // Repeated calls to StorageManager getters
    StorageManager.getUserProfile();
    StorageManager.getUserSettings();
    StorageManager.getCurriculum();
    StorageManager.getTodayStudyDay();

    // Session must remain intact!
    expect(AuthManager.getSession()).not.toBeNull();
    expect(AuthManager.getSession()?.isAuthenticated).toBe(true);
  });

  it('preserves auth session when resetToDayOne is called', async () => {
    const { StorageManager } = await import('../lib/storage');
    AuthManager.login('harshal@cdac.in', '77965');
    expect(AuthManager.getSession()).not.toBeNull();

    StorageManager.resetToDayOne();

    // Session and PIN must still exist
    expect(AuthManager.getSession()).not.toBeNull();
    expect(AuthManager.getOwnerPin()).toBe('77965');
  });

  it('exports DashboardPage component', async () => {
    const DashboardModule = await import('../app/page');
    expect(DashboardModule.default).toBeDefined();
  });
});
