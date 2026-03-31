import { useState, useEffect, useCallback } from 'react'
import Shell from '../../components/Shell'
import RetroButton from '../../components/RetroButton'
import { getQueue, addToQueue, popQueue, removeFromQueue } from '../../services/taskqueue'
import type { TaskQueueItem } from '../../utils/types'

export default function TaskQueueStation() {
  const [items, setItems] = useState<TaskQueueItem[]>([])
  const [inputText, setInputText] = useState('')
  const [statusMessage, setStatusMessage] = useState('LOADING QUEUE...')

  const loadQueue = useCallback(async () => {
    const result = await getQueue()
    if (result.data) {
      setItems(result.data)
      setStatusMessage(result.data.length > 0 ? `${result.data.length} ITEMS IN QUEUE` : 'QUEUE EMPTY')
    }
  }, [])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  async function handleAdd() {
    if (!inputText.trim()) return
    await addToQueue(inputText.trim())
    setInputText('')
    loadQueue()
    setStatusMessage('ITEM ADDED')
  }

  async function handlePop() {
    const result = await popQueue()
    if (result.data) {
      setStatusMessage(`POPPED: ${result.data.text}`)
    } else {
      setStatusMessage('QUEUE EMPTY')
    }
    loadQueue()
  }

  async function handleRemove(id: string) {
    await removeFromQueue(id)
    loadQueue()
  }

  return (
    <Shell stationName="TASK QUEUE" statusMessage={statusMessage}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '600px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="ADD TASK..."
            aria-label="New task"
            style={{ flex: 1 }}
          />
          <RetroButton onClick={handleAdd} style={{ minHeight: '40px' }}>ADD</RetroButton>
          <RetroButton onClick={handlePop} style={{ minHeight: '40px' }}>NEXT</RetroButton>
        </div>

        <div style={{ border: '1px solid var(--crt-primary)' }}>
          {items.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--crt-tertiary)', textTransform: 'uppercase' }}>
              QUEUE EMPTY
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--crt-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ color: 'var(--crt-tertiary)', marginRight: '8px', fontSize: '12px' }}>
                    [{String(i + 1).padStart(2, '0')}]
                  </span>
                  {item.text}
                </div>
                <RetroButton
                  variant="danger"
                  onClick={() => handleRemove(item.id)}
                  style={{ minHeight: '28px', padding: '2px 8px', fontSize: '11px' }}
                >
                  [X]
                </RetroButton>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  )
}
