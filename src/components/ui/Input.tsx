import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={label || error ? 'flex flex-col gap-1' : ''}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`
          w-full border rounded-lg px-3 py-2 text-sm outline-none transition
          focus:ring-2 focus:ring-indigo-400 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-200'}
          ${className}
        `.trim()}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
