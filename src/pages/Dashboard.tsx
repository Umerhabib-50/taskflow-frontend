import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/auth'
import { getTasks, createTask } from '../api/tasks'
import TaskItem from '../components/TaskItem'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import type { User, Task } from '../types'

function decodeToken(token: string): { isSuperAdmin?: boolean } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [addError, setAddError] = useState('')

  const isSuperAdmin = (() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false
      const payload = decodeToken(token)
      return payload?.isSuperAdmin === true
    } catch {
      return false
    }
  })()

  useEffect(() => {
    async function load() {
      try {
        const [meRes, tasksRes] = await Promise.all([getMe(), getTasks()])
        setUser(meRes.data.user)
        setTasks(tasksRes.data.tasks)
      } catch (e: unknown) {
        if ((e as { response?: { status?: number } })?.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
        } else {
          setError('Failed to load data')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  async function handleAddTask(e: FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    setAddError('')
    try {
      const res = await createTask(newTitle.trim())
      setTasks((prev) => [res.data.task, ...prev])
      setNewTitle('')
    } catch (e: unknown) {
      setAddError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to add task')
    } finally {
      setAdding(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                Admin
              </button>
            )}
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Add task form */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task…"
            className="flex-1 rounded-xl"
          />
          <Button
            type="submit"
            disabled={adding || !newTitle.trim()}
            loading={adding}
            loadingText="Adding…"
            className="rounded-xl"
          >
            Add
          </Button>
        </form>
        {addError && (
          <p className="text-sm text-red-500 mb-4">{addError}</p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No tasks yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdated={(updated) =>
                  setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                }
                onDeleted={(id) =>
                  setTasks((prev) => prev.filter((t) => t.id !== id))
                }
              />
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <p className="text-xs text-gray-400 text-right mt-4">
            {tasks.filter((t) => t.done).length}/{tasks.length} completed
          </p>
        )}
      </main>
    </div>
  )
}
