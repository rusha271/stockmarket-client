export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}


export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isEmailVerified?: boolean;
  role?: 'admin' | 'client' | 'temporary';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface EmailService {
  sendTemporaryCredentials: (email: string) => Promise<{ success: boolean; message: string }>;
  sendVerificationEmail: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
} 