import { useState, useEffect, useCallback } from 'react'
import Shell from '../../components/Shell'
import RetroButton from '../../components/RetroButton'
import TemplateEditor from './TemplateEditor'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/schedule'
import type { ScheduleTemplate } from '../../utils/types'

type ViewState = 'list' | 'create' | 'edit'

export default function ScheduleStation() {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([])
  const [viewState, setViewState] = useState<ViewState>('list')
  const [editTarget, setEditTarget] = useState<ScheduleTemplate | null>(null)
  const [statusMessage, setStatusMessage] = useState('LOADING TEMPLATES...')

  const loadTemplates = useCallback(async () => {
    const result = await getTemplates()
    if (result.data) {
      setTemplates(result.data)
      setStatusMessage(`${result.data.length} TEMPLATES LOADED`)
    }
  }, [])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  async function handleCreate(data: Omit<ScheduleTemplate, 'id'>) {
    const result = await createTemplate(data)
    if (result.error) {
      setStatusMessage(`ERROR: ${result.error}`)
      return
    }
    setStatusMessage(`TEMPLATE "${data.name}" CREATED`)
    setViewState('list')
    loadTemplates()
  }

  async function handleUpdate(data: Omit<ScheduleTemplate, 'id'>) {
    if (!editTarget) return
    const result = await updateTemplate(editTarget.id, data)
    if (result.error) {
      setStatusMessage(`ERROR: ${result.error}`)
      return
    }
    setStatusMessage(`TEMPLATE "${data.name}" UPDATED`)
    setViewState('list')
    setEditTarget(null)
    loadTemplates()
  }

  async function handleDelete(id: string, name: string) {
    const result = await deleteTemplate(id)
    if (result.error) {
      setStatusMessage(`ERROR: ${result.error}`)
      return
    }
    setStatusMessage(`TEMPLATE "${name}" DELETED`)
    loadTemplates()
  }

  if (viewState === 'create') {
    return (
      <Shell stationName="SCHEDULE" statusMessage={statusMessage}>
        <TemplateEditor onSave={handleCreate} onCancel={() => setViewState('list')} />
      </Shell>
    )
  }

  if (viewState === 'edit' && editTarget) {
    return (
      <Shell stationName="SCHEDULE" statusMessage={statusMessage}>
        <TemplateEditor template={editTarget} onSave={handleUpdate} onCancel={() => { setViewState('list'); setEditTarget(null) }} />
      </Shell>
    )
  }

  return (
    <Shell stationName="SCHEDULE" statusMessage={statusMessage}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ textTransform: 'uppercase', fontSize: '14px' }}>SCHEDULE TEMPLATES</span>
          <RetroButton onClick={() => setViewState('create')} style={{ minHeight: '32px', fontSize: '12px' }}>
            + NEW TEMPLATE
          </RetroButton>
        </div>

        {templates.length === 0 ? (
          <div style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase', padding: 'var(--space-3)', textAlign: 'center' }}>
            NO TEMPLATES. CREATE ONE TO GET STARTED.
          </div>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              style={{
                border: '1px solid var(--crt-primary)',
                padding: 'var(--space-2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>{t.name}</div>
                <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
                  {t.dayType} — {t.timeBlocks.length} BLOCKS
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <RetroButton
                  onClick={() => { setEditTarget(t); setViewState('edit') }}
                  style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
                >
                  EDIT
                </RetroButton>
                <RetroButton
                  variant="danger"
                  onClick={() => handleDelete(t.id, t.name)}
                  style={{ minHeight: '32px', padding: '4px 12px', fontSize: '12px' }}
                >
                  DELETE
                </RetroButton>
              </div>
            </div>
          ))
        )}
      </div>
    </Shell>
  )
}
