export interface User {
  id: number
  email: string
  isSuperAdmin?: boolean
  _count?: { tasks: number }
}

export interface Task {
  id: number
  title: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
}

export interface UserResponse {
  user: User
}

