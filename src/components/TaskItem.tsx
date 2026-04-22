import { useState } from 'react'
import { updateTask, deleteTask } from '../api/tasks'
import ConfirmDialog from './ConfirmDialog'
import Button from './ui/Button'
import Input from './ui/Input'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onUpdated: (task: Task) => void
  onDeleted: (id: number) => void
}

export default function TaskItem({ task, onUpdated, onDeleted }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle() {
    try {
      const res = await updateTask(task.id, { done: !task.done })
      onUpdated(res.data.task)
    } catch {
      // silently fail on toggle
    }
  }

  async function handleSaveTitle() {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await updateTask(task.id, { title: title.trim() })
      onUpdated(res.data.task)
      setEditing(false)
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task.id)
      onDeleted(task.id)
    } catch {
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
        <input
          type="checkbox"
          checked={task.done}
          onChange={handleToggle}
          className="w-4 h-4 accent-indigo-500 cursor-pointer flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') { setTitle(task.title); setEditing(false) }
              }}
              error={error}
              className="border-b border-indigo-400 rounded-none p-0 px-0"
            />
          ) : (
            <span
              className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
            >
              {task.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          {editing ? (
            <>
              <Button
                onClick={handleSaveTitle}
                disabled={saving}
                variant="inline-save"
                loading={saving}
                loadingText="Saving…"
              >
                Save
              </Button>
              <Button
                onClick={() => { setTitle(task.title); setEditing(false) }}
                variant="ghost"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setEditing(true)}
                variant="inline-edit"
              >
                Edit
              </Button>
              <Button
                onClick={() => setConfirmDelete(true)}
                variant="inline-delete"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${task.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
