import { UserAccount, UserSession } from '../types/auth';

const USERS_REGISTRY_KEY = 'minimal_gym_users_db_v1';
const ACTIVE_SESSION_KEY = 'minimal_gym_active_session_v1';

// Simple fast string hashing for lightweight client-side credential verification
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

export function getAllUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAllUsers(users: Record<string, UserAccount>) {
  try {
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database', err);
  }
}

export function getActiveSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveSession(session: UserSession | null) {
  try {
    if (session) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to update active session', err);
  }
}

export function loginOrRegister(usernameInput: string, passwordInput: string): { success: boolean; user?: UserSession; message?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const rawPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, message: 'Digite seu usuário.' };
  }
  if (!rawPassword) {
    return { success: false, message: 'Digite sua senha.' };
  }
  if (cleanUsername.length < 2) {
    return { success: false, message: 'Usuário deve ter pelo menos 2 caracteres.' };
  }
  if (rawPassword.length < 3) {
    return { success: false, message: 'Senha deve ter pelo menos 3 caracteres.' };
  }

  const users = getAllUsers();
  const existing = users[cleanUsername];
  const hashed = simpleHash(rawPassword);

  if (existing) {
    // Attempt login
    if (existing.passwordHash === hashed) {
      existing.lastLogin = new Date().toISOString();
      saveAllUsers(users);

      const session: UserSession = {
        username: cleanUsername,
        displayName: existing.displayName || cleanUsername,
      };
      setActiveSession(session);
      return { success: true, user: session };
    } else {
      return { success: false, message: 'Senha incorreta para este usuário.' };
    }
  } else {
    // Auto-create new user account
    const newUser: UserAccount = {
      username: cleanUsername,
      displayName: usernameInput.trim(),
      passwordHash: hashed,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    users[cleanUsername] = newUser;
    saveAllUsers(users);

    const session: UserSession = {
      username: cleanUsername,
      displayName: newUser.displayName,
    };
    setActiveSession(session);

    // If there is legacy root data from v5, copy it over to the first user
    migrateLegacyData(cleanUsername);

    return { success: true, user: session };
  }
}

export function getUserStoragePrefix(username: string): string {
  return `minimal_gym_u_${username}_`;
}

function migrateLegacyData(username: string) {
  try {
    const userPrefix = getUserStoragePrefix(username);
    // Only migrate if user has no data yet
    const alreadyHasData = localStorage.getItem(`${userPrefix}migrated`);
    if (alreadyHasData) return;

    // Check legacy v5 keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('minimal_gym_v5_')) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          const subKey = key.replace('minimal_gym_v5_', '');
          localStorage.setItem(`${userPrefix}${subKey}`, value);
        }
      }
    }
    localStorage.setItem(`${userPrefix}migrated`, 'true');
  } catch {
    // ignore
  }
}
