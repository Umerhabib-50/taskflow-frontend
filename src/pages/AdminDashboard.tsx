import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, deleteUser, getUserTasks } from '../api/admin'
import Button from '../components/ui/Button'
import type { User, Task } from '../types'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userTasks, setUserTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getUsers(page)
        setUsers(res.data.users)
        setTotalPages(res.data.totalPages)
      } catch (e: unknown) {
        if ((e as { response?: { status?: number } })?.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
        } else {
          setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load users')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, navigate])

  async function handleSelectUser(user: User) {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
      setUserTasks([])
      return
    }
    setSelectedUser(user)
    setTasksLoading(true)
    try {
      const res = await getUserTasks(user.id)
      setUserTasks(res.data.tasks)
    } catch {
      setUserTasks([])
    } finally {
      setTasksLoading(false)
    }
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`Delete user "${user.email}"? This will delete all their tasks.`)) return
    setDeletingId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      if (selectedUser?.id === user.id) {
        setSelectedUser(null)
        setUserTasks([])
      }
    } catch (e: unknown) {
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete user')
    } finally {
      setDeletingId(null)
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">TaskFlow Admin</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* User list */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Users</h2>
              </div>

              {users.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No users found.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer ${
                        selectedUser?.id === user.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div
                        className="flex-1"
                        onClick={() => handleSelectUser(user)}
                      >
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          {user._count?.tasks ?? 0} tasks · ID {user.id}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === user.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(user)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* User tasks panel */}
          {selectedUser && (
            <div className="w-80">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-800">
                    Tasks — {selectedUser.email}
                  </h2>
                </div>

                {tasksLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    Loading tasks…
                  </div>
                ) : userTasks.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No tasks
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {userTasks.map((task) => (
                      <div key={task.id} className="px-4 py-2">
                        <p className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
