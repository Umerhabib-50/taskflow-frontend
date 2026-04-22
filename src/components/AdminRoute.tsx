import { Navigate } from 'react-router-dom'

function decodeToken(token: string): { isSuperAdmin?: boolean } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  const payload = decodeToken(token)
  if (!payload?.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
