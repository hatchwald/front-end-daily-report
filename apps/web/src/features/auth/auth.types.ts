export interface User {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
}

export interface AuthResponse {
  success: boolean;
  data: { user: User };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name?: string;
  timezone: string;
}
