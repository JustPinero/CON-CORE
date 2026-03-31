import { useState } from 'react'
import PieChart, { type PieSlice } from '../../components/PieChart'
import ActionButtons, { type ActionButton } from '../../components/ActionButtons'
import { analyzeSender, type AnalysisResponse } from '../../services/claude'
import { batchDelete, batchArchive, type SenderEntry } from '../../services/gmail'
import type { CategoryBreakdown } from '../../utils/types'

interface SourceIntelProps {
  sender: SenderEntry
  onStatusChange: (message: string, variant: 'ready' | 'processing' | 'error') => void
  onSenderUpdated: () => void
}

type ViewState = 'loading' | 'chart' | 'actions' | 'result'

export default function SourceIntel({ sender, onStatusChange, onSenderUpdated }: SourceIntelProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [resultMessage, setResultMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-analyze on mount via key change (parent should key this component by sender)
  if (viewState === 'loading' && !loading) {
    setLoading(true)
    onStatusChange(`ANALYZING ${sender.senderName}...`, 'processing')
    analyzeSender(sender.senderAddress).then((result) => {
      if (result.data) {
        setAnalysis(result.data)
        setViewState('chart')
        onStatusChange(`${sender.senderName} — ${result.data.dossier}`, 'ready')
      } else {
        onStatusChange(`ERROR: ${result.error}`, 'error')
        setViewState('chart')
      }
      setLoading(false)
    })
  }

  function handleSliceClick(key: string) {
    setSelectedCategory(key)
    setViewState('actions')
  }

  async function handleDelete() {
    onStatusChange(`DELETING ${sender.senderName} EMAILS...`, 'processing')
    const result = await batchDelete(sender.senderAddress)
    if (result.data) {
      setResultMessage(`${result.data.deleted} EMAILS DELETED`)
      onStatusChange(`${result.data.deleted} EMAILS DELETED`, 'ready')
    } else {
      setResultMessage(`ERROR: ${result.error}`)
      onStatusChange(`ERROR: ${result.error}`, 'error')
    }
    setViewState('result')
    onSenderUpdated()
  }

  async function handleArchive() {
    onStatusChange(`ARCHIVING ${sender.senderName} EMAILS...`, 'processing')
    const result = await batchArchive(sender.senderAddress)
    if (result.data) {
      setResultMessage(`${result.data.archived} EMAILS ARCHIVED`)
      onStatusChange(`${result.data.archived} EMAILS ARCHIVED`, 'ready')
    } else {
      setResultMessage(`ERROR: ${result.error}`)
      onStatusChange(`ERROR: ${result.error}`, 'error')
    }
    setViewState('result')
    onSenderUpdated()
  }

  function handleCancel() {
    setSelectedCategory(null)
    setViewState('chart')
  }

  const slices: PieSlice[] = analysis
    ? (Object.entries(analysis.categoryBreakdown) as [keyof CategoryBreakdown, number][])
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
        }))
    : []

  if (viewState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: 'var(--crt-warning)', textTransform: 'uppercase' }}>
          ANALYZING SENDER...
        </span>
      </div>
    )
  }

  if (viewState === 'result') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
        <span style={{ color: 'var(--crt-primary)', fontSize: '16px', textTransform: 'uppercase' }}>
          {resultMessage}
        </span>
        <ActionButtons
          buttons={[{ key: 'back', label: 'BACK TO CHART', onClick: () => setViewState('chart') }]}
        />
      </div>
    )
  }

  if (viewState === 'actions' && selectedCategory) {
    return (
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>
          {sender.senderName} — {selectedCategory.toUpperCase()}
        </div>
        <div style={{ color: 'var(--crt-secondary)', fontSize: '12px' }}>
          {sender.messageCount} TOTAL MESSAGES FROM THIS SENDER
        </div>
        <ActionButtons
          buttons={[
            { key: 'delete', label: 'DELETE ALL', variant: 'danger', onClick: handleDelete },
            { key: 'archive', label: 'ARCHIVE ALL', onClick: handleArchive },
            { key: 'cancel', label: 'CANCEL', onClick: handleCancel },
          ] satisfies ActionButton[]}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textTransform: 'uppercase', fontSize: '14px', marginBottom: '4px' }}>
        {sender.senderName}
      </div>
      <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', marginBottom: '16px' }}>
        {analysis?.dossier || sender.senderAddress}
      </div>
      <PieChart
        slices={slices}
        selectedKey={selectedCategory}
        onSliceClick={handleSliceClick}
      />
    </div>
  )
}
