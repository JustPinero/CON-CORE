import type { ButtonHTMLAttributes } from 'react'

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger'
  active?: boolean
}

export default function RetroButton({
  variant = 'default',
  active = false,
  className = '',
  ...props
}: RetroButtonProps) {
  const classes = [
    'retro-button',
    variant === 'danger' ? 'retro-button--danger' : '',
    active ? 'active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...props} />
}
