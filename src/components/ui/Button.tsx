import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'danger' | 'ghost' | 'inline-edit' | 'inline-save' | 'inline-delete'
type Size = 'sm' | 'md' | 'lg' | 'full'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
  className?: string
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
  ghost: 'border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50',
  'inline-edit':
    'text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50',
  'inline-save':
    'text-xs px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50',
  'inline-delete':
    'text-xs px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-50 disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
  full: 'w-full py-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isInline = variant.startsWith('inline-')

  return (
    <button
      disabled={loading || disabled}
      className={`
        font-medium rounded-lg transition
        ${isInline ? variants[variant] : `${variants[variant]} ${sizes[size]}`}
        ${className}
      `.trim()}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
