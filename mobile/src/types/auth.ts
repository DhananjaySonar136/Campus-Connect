export type User = {
  id: string;
  name: string;
  email: string;
  university: string;
  role: string;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  university: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  success: true;
  message: string;
  token: string;
  user: User;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  token: string | null;
  user: User | null;
};
