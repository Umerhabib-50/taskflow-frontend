import api from './axios'
import type { User, Task } from '../types'

export const getUsers = (page = 1, limit = 20) =>
  api.get<{ users: User[]; totalPages: number }>(`/admin/users?page=${page}&limit=${limit}`)

export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`)

export const getUserTasks = (userId: number) =>
  api.get<{ tasks: Task[] }>(`/admin/users/${userId}/tasks`)
