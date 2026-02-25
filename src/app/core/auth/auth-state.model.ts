export interface AuthState {
  userId?: number;
  email?: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  roles?: string[] | null;
}
