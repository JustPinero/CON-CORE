import { useState } from 'react'
import RetroButton from '../../components/RetroButton'
import ActionButtons from '../../components/ActionButtons'
import { batchCreateEvents, checkConflicts, type Conflict } from '../../services/calendar'
import { getDatesInRange, filterDatesByDayType, formatDateISO } from '../../utils/date-range'
import type { ScheduleTemplate, TimeBlock } from '../../utils/types'

interface DeployScheduleProps {
  templates: ScheduleTemplate[]
  onStatusChange: (message: string) => void
  onBack: () => void
}

function generateEvents(template: ScheduleTemplate, startDate: string, endDate: string) {
  const allDates = getDatesInRange(startDate, endDate)
  const matchingDates = filterDatesByDayType(allDates, template.dayType)

  return matchingDates.flatMap((date) => {
    const dateStr = formatDateISO(date)
    return template.timeBlocks.map((block: TimeBlock) => ({
      summary: block.label || template.name,
      start: `${dateStr}T${block.startTime}:00`,
      end: `${dateStr}T${block.endTime}:00`,
      calendarId: block.calendarId || 'primary',
    }))
  })
}

export default function DeploySchedule({ templates, onStatusChange, onBack }: DeployScheduleProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [showConflicts, setShowConflicts] = useState(false)
  const [previewEvents, setPreviewEvents] = useState<ReturnType<typeof generateEvents>>([])

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  async function handlePreview() {
    if (!selectedTemplate || !startDate || !endDate) return

    const events = generateEvents(selectedTemplate, startDate, endDate)
    setPreviewEvents(events)

    if (events.length === 0) {
      onStatusChange('NO MATCHING DATES IN RANGE')
      return
    }

    onStatusChange('CHECKING FOR CONFLICTS...')
    const result = await checkConflicts(events)
    if (result.data?.hasConflicts) {
      setConflicts(result.data.conflicts)
      setShowConflicts(true)
      onStatusChange(`${result.data.conflicts.length} CONFLICTS FOUND`)
    } else {
      setConflicts([])
      setShowConflicts(false)
      onStatusChange(`${events.length} EVENTS READY TO DEPLOY`)
    }
  }

  async function handleDeploy() {
    if (previewEvents.length === 0) return
    onStatusChange(`DEPLOYING ${previewEvents.length} EVENTS...`)
    const result = await batchCreateEvents(previewEvents)
    if (result.data) {
      onStatusChange(`${result.data.created} EVENTS CREATED (${result.data.failed} FAILED)`)
    } else {
      onStatusChange(`ERROR: ${result.error}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>DEPLOY SCHEDULE</div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <label style={{ textTransform: 'uppercase', fontSize: '12px', width: '90px' }}>TEMPLATE:</label>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">SELECT TEMPLATE</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name.toUpperCase()} ({t.dayType.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <label style={{ textTransform: 'uppercase', fontSize: '12px', width: '90px' }}>START:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: 1 }} aria-label="Start date" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <label style={{ textTransform: 'uppercase', fontSize: '12px', width: '90px' }}>END:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: 1 }} aria-label="End date" />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
        <RetroButton onClick={handlePreview} disabled={!selectedTemplate || !startDate || !endDate} style={{ flex: 1 }}>
          CHECK CONFLICTS
        </RetroButton>
        <RetroButton onClick={onBack} style={{ flex: 1 }}>
          BACK
        </RetroButton>
      </div>

      {previewEvents.length > 0 && (
        <div style={{ border: '1px solid var(--crt-primary)', padding: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '12px', marginBottom: '8px' }}>
            PREVIEW: {previewEvents.length} EVENTS
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {previewEvents.slice(0, 20).map((e, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--crt-secondary)', padding: '2px 0' }}>
                {e.start.split('T')[0]} {e.start.split('T')[1]?.slice(0, 5)}-{e.end.split('T')[1]?.slice(0, 5)} {e.summary}
              </div>
            ))}
            {previewEvents.length > 20 && (
              <div style={{ color: 'var(--crt-tertiary)', fontSize: '11px' }}>
                ...AND {previewEvents.length - 20} MORE
              </div>
            )}
          </div>
        </div>
      )}

      {showConflicts && conflicts.length > 0 && (
        <div style={{ border: '1px solid var(--crt-danger)', padding: 'var(--space-2)' }}>
          <div style={{ color: 'var(--crt-danger)', textTransform: 'uppercase', fontSize: '12px', marginBottom: '8px' }}>
            {conflicts.length} CONFLICTS DETECTED
          </div>
          {conflicts.slice(0, 10).map((c, i) => (
            <div key={i} style={{ fontSize: '11px', padding: '4px 0', borderBottom: '1px solid var(--crt-primary)', opacity: 0.5 }}>
              <span style={{ color: 'var(--crt-warning)' }}>{c.proposed.summary}</span>
              {' vs '}
              <span style={{ color: 'var(--crt-danger)' }}>{c.existing.summary}</span>
            </div>
          ))}
        </div>
      )}

      {previewEvents.length > 0 && (
        <ActionButtons
          buttons={[
            { key: 'deploy', label: 'DEPLOY SCHEDULE', onClick: handleDeploy },
            ...(showConflicts ? [{ key: 'force', label: 'DEPLOY ANYWAY', variant: 'danger' as const, onClick: handleDeploy }] : []),
          ]}
        />
      )}
    </div>
  )
}

export { generateEvents }
