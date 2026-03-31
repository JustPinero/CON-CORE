import { describe, it, expect, beforeEach } from 'vitest'
import { getQueue, addToQueue, popQueue, removeFromQueue } from './taskqueue'

describe('taskqueue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty queue', async () => {
    const result = await getQueue()
    expect(result.data).toHaveLength(0)
  })

  it('adds item to queue', async () => {
    await addToQueue('Buy groceries')
    const result = await getQueue()
    expect(result.data).toHaveLength(1)
    expect(result.data![0].text).toBe('Buy groceries')
  })

  it('pops first item (FIFO)', async () => {
    await addToQueue('First')
    await addToQueue('Second')
    const popped = await popQueue()
    expect(popped.data?.text).toBe('First')
    const remaining = await getQueue()
    expect(remaining.data).toHaveLength(1)
    expect(remaining.data![0].text).toBe('Second')
  })

  it('pop returns null for empty queue', async () => {
    const result = await popQueue()
    expect(result.data).toBeNull()
  })

  it('removes specific item', async () => {
    const added = await addToQueue('Remove me')
    await removeFromQueue(added.data!.id)
    const result = await getQueue()
    expect(result.data).toHaveLength(0)
  })

  it('maintains FIFO order', async () => {
    await addToQueue('A')
    await addToQueue('B')
    await addToQueue('C')
    const result = await getQueue()
    expect(result.data![0].text).toBe('A')
    expect(result.data![1].text).toBe('B')
    expect(result.data![2].text).toBe('C')
  })
})
