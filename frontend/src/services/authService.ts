import apiClient, { getErrorMessage } from './apiClient';

// Types for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ARTISAN' | 'DESIGNER';
  phone_number: string;
  profile_image: string;
  is_verified: boolean;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'ARTISAN' | 'DESIGNER';
  phone_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
  message: string;
}

// Auth Service
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register/', data);
      
      if (response.data.success && response.data.data) {
        // Store tokens and user data
        this.setAuthData(response.data.data.tokens, response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Registration error:', error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', data);
      
      if (response.data.success && response.data.data) {
        // Store tokens and user data
        this.setAuthData(response.data.data.tokens, response.data.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Login error:', error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      return null;
    }
    
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('[Auth Service] Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get current user from API
   */
  async fetchCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me/');
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error('Failed to fetch user data');
    } catch (error) {
      console.error('[Auth Service] Fetch user error:', error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: User; message: string }>(
        '/auth/me/',
        data
      );
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('[Auth Service] Update profile error:', error);
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Check if user is an artisan
   */
  isArtisan(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ARTISAN';
  }

  /**
   * Check if user is a designer
   */
  isDesigner(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'DESIGNER';
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Store authentication data
   */
  private setAuthData(tokens: AuthTokens, user: User): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;

// Made with Bob