import api from './axios'
import type { Task } from '../types'

export const getTasks = () => api.get<{ tasks: Task[] }>('/tasks')

export const createTask = (title: string) =>
  api.post<{ task: Task }>('/tasks', { title })

export const updateTask = (id: number, data: { title?: string; done?: boolean }) =>
  api.put<{ task: Task }>(`/tasks/${id}`, data)

export const deleteTask = (id: number) => api.delete(`/tasks/${id}`)
