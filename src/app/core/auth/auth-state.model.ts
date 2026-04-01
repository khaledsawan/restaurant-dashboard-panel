export interface AuthState {
  userId?: number;
  email?: string | null;
  accessToken: string;
  expiresAt: string;
  roles?: string[] | null;
}
