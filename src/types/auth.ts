export interface UserAccount {
  username: string; // sanitized key
  displayName: string;
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
}

export interface UserSession {
  username: string;
  displayName: string;
}
