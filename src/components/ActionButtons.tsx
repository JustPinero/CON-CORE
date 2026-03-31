import RetroButton from './RetroButton'

export interface ActionButton {
  key: string
  label: string
  variant?: 'default' | 'danger'
  onClick: () => void
  disabled?: boolean
}

interface ActionButtonsProps {
  buttons: ActionButton[]
}

export default function ActionButtons({ buttons }: ActionButtonsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 'var(--space-1)',
      }}
    >
      {buttons.map((btn) => (
        <RetroButton
          key={btn.key}
          variant={btn.variant}
          onClick={btn.onClick}
          disabled={btn.disabled}
          style={{ minHeight: '64px', fontSize: '13px' }}
        >
          {btn.label}
        </RetroButton>
      ))}
    </div>
  )
}
