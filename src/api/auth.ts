import api from './axios'
import type { AuthResponse, UserResponse } from '../types'

export const register = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { email, password })

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const getMe = () => api.get<UserResponse>('/auth/me')
