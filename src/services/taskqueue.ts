import type { ApiResponse, TaskQueueItem } from '../utils/types'

const STORAGE_KEY = 'con-core-task-queue'

function loadQueue(): TaskQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(items: TaskQueueItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function getQueue(): Promise<ApiResponse<TaskQueueItem[]>> {
  return { data: loadQueue(), error: null, meta: {} }
}

export async function addToQueue(text: string): Promise<ApiResponse<TaskQueueItem>> {
  const items = loadQueue()
  const newItem: TaskQueueItem = {
    id: crypto.randomUUID(),
    text,
    position: items.length,
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  saveQueue(items)
  return { data: newItem, error: null, meta: {} }
}

export async function popQueue(): Promise<ApiResponse<TaskQueueItem | null>> {
  const items = loadQueue()
  if (items.length === 0) {
    return { data: null, error: null, meta: { empty: true } }
  }
  const [first, ...rest] = items
  saveQueue(rest.map((item, i) => ({ ...item, position: i })))
  return { data: first, error: null, meta: {} }
}

export async function removeFromQueue(id: string): Promise<ApiResponse<{ removed: boolean }>> {
  const items = loadQueue()
  const filtered = items.filter(i => i.id !== id)
  if (filtered.length === items.length) {
    return { data: null, error: 'Item not found', meta: {} }
  }
  saveQueue(filtered.map((item, i) => ({ ...item, position: i })))
  return { data: { removed: true }, error: null, meta: {} }
}
