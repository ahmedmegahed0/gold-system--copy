import apiClient from '../core/apiClient';
import type { 
  LoginDto, 
  VerifyOtpDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  UserSession 
} from '../common/types/auth.types';

export const AuthService = {
  login: async (data: LoginDto): Promise<UserSession> => {
    const response = await apiClient.post<any>('/auth/login', data);
    console.log('Login API Response:', response.data);
    
    const raw = response.data;
    
    // Normalize response format from backend (handle nested data/user objects)
    const sessionData = raw?.data?.user || raw?.data || raw?.user || raw;
    
    const findToken = (obj: any): string | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      return obj.accessToken || obj.access_token || obj.token 
        || obj.data?.accessToken || obj.data?.access_token || obj.data?.token;
    };
    
    const token = findToken(raw) || findToken(raw?.data) || findToken(sessionData);
    
    if (token) {
       sessionData.accessToken = token;
    }
    
    return sessionData;
  },
  
  verifyOtp: async (data: VerifyOtpDto): Promise<UserSession> => {
    const response = await apiClient.post<any>('/auth/verify-otp', data);
    const raw = response.data;
    console.log('OTP Verification FULL Response:', JSON.stringify(raw, null, 2));
    
    // Deep extract: find user data and token from any response shape
    const findToken = (obj: any): string | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      return obj.accessToken || obj.access_token || obj.token 
        || obj.data?.accessToken || obj.data?.access_token || obj.data?.token;
    };
    
    const userData = raw?.data?.user || raw?.data || raw?.user || raw;
    const token = findToken(raw) || findToken(raw?.data) || findToken(userData);
    
    const session: UserSession = {
      id: userData?.id || userData?._id || '',
      fullName: userData?.fullName || userData?.full_name || '',
      email: userData?.email || data.email,
      role: userData?.role || 'OWNER',
      accessToken: token || '',
    };
    
    console.log('Extracted session:', session);
    return session;
  },
  
  forgotPassword: async (data: ForgotPasswordDto): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },
  
  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },
};
