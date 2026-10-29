export type UserRole = "admin" | "facturation" | "picker" | "delivery";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  rol: UserRole;
  nombre?: string;
  apellido?: string;
  createdAt?: string;
}

export interface AuthResult {
  profile: UserProfile;
}

export interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
}

export interface UpdateUserData {
  nombre: string;
  apellido: string;
  rol: UserRole;
}

export interface LoginFormProps {
  allowedRoles?: UserRole[];
  roleRedirects?: Partial<Record<UserRole, string>>;
  defaultRedirect?: string;
  onSuccess?: (profile: UserProfile) => void;
  unauthorizedMessage?: string;
}
