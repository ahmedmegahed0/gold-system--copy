export interface LoginDto {
  email: string;
  password?: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  role: 'OWNER' | 'EMPLOYEE';
  accessToken: string;
}
