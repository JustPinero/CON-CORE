import { useState } from 'react'
import RetroButton from '../../components/RetroButton'
import type { ScheduleTemplate, TimeBlock } from '../../utils/types'

interface TemplateEditorProps {
  template?: ScheduleTemplate
  onSave: (data: Omit<ScheduleTemplate, 'id'>) => void
  onCancel: () => void
}

const EMPTY_BLOCK: TimeBlock = { startTime: '09:00', endTime: '10:00', label: '', calendarId: 'primary' }

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '')
  const [dayType, setDayType] = useState<'weekday' | 'weekend'>(template?.dayType || 'weekday')
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(template?.timeBlocks || [])

  function addBlock() {
    setTimeBlocks([...timeBlocks, { ...EMPTY_BLOCK }])
  }

  function removeBlock(index: number) {
    setTimeBlocks(timeBlocks.filter((_, i) => i !== index))
  }

  function updateBlock(index: number, field: keyof TimeBlock, value: string) {
    const updated = [...timeBlocks]
    updated[index] = { ...updated[index], [field]: value }
    setTimeBlocks(updated)
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), dayType, timeBlocks })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.05em' }}>
        {template ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <label style={{ textTransform: 'uppercase', fontSize: '12px', width: '80px' }}>NAME:</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="TEMPLATE NAME"
          aria-label="Template name"
          style={{ flex: 1 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <label style={{ textTransform: 'uppercase', fontSize: '12px', width: '80px' }}>TYPE:</label>
        <RetroButton
          active={dayType === 'weekday'}
          onClick={() => setDayType('weekday')}
          style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
        >
          WEEKDAY
        </RetroButton>
        <RetroButton
          active={dayType === 'weekend'}
          onClick={() => setDayType('weekend')}
          style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
        >
          WEEKEND
        </RetroButton>
      </div>

      <div style={{ borderTop: '1px solid var(--crt-primary)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '12px', marginBottom: 'var(--space-1)' }}>
          TIME BLOCKS ({timeBlocks.length})
        </div>

        {timeBlocks.map((block, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '8px',
              border: '1px solid var(--crt-primary)',
            }}
          >
            <input
              value={block.startTime}
              onChange={(e) => updateBlock(i, 'startTime', e.target.value)}
              style={{ width: '70px' }}
              aria-label={`Block ${i + 1} start time`}
            />
            <span style={{ color: 'var(--crt-tertiary)' }}>TO</span>
            <input
              value={block.endTime}
              onChange={(e) => updateBlock(i, 'endTime', e.target.value)}
              style={{ width: '70px' }}
              aria-label={`Block ${i + 1} end time`}
            />
            <input
              value={block.label}
              onChange={(e) => updateBlock(i, 'label', e.target.value)}
              placeholder="LABEL"
              style={{ flex: 1 }}
              aria-label={`Block ${i + 1} label`}
            />
            <RetroButton
              variant="danger"
              onClick={() => removeBlock(i)}
              style={{ minHeight: '32px', padding: '4px 8px', fontSize: '11px' }}
            >
              [X]
            </RetroButton>
          </div>
        ))}

        <RetroButton onClick={addBlock} style={{ width: '100%', minHeight: '32px', fontSize: '12px' }}>
          + ADD TIME BLOCK
        </RetroButton>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
        <RetroButton onClick={handleSave} style={{ flex: 1 }}>
          SAVE
        </RetroButton>
        <RetroButton onClick={onCancel} style={{ flex: 1 }}>
          CANCEL
        </RetroButton>
      </div>
    </div>
  )
}
