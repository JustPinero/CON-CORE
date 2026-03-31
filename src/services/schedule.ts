import type { ApiResponse, ScheduleTemplate, TimeBlock } from '../utils/types'

const API_BASE = '/api/calendar'

export function validateTimeBlocks(blocks: TimeBlock[]): string | null {
  for (const block of blocks) {
    if (block.endTime <= block.startTime) {
      return `End time must be after start time for "${block.label}"`
    }
  }

  const sorted = [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime))
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].endTime > sorted[i + 1].startTime) {
      return `Time blocks "${sorted[i].label}" and "${sorted[i + 1].label}" overlap`
    }
  }

  return null
}

// In-memory store for templates (Supabase integration in future)
// For now, use localStorage as lightweight persistence
const STORAGE_KEY = 'con-core-schedule-templates'

function loadTemplates(): ScheduleTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: ScheduleTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export async function getTemplates(): Promise<ApiResponse<ScheduleTemplate[]>> {
  return { data: loadTemplates(), error: null, meta: {} }
}

export async function createTemplate(
  template: Omit<ScheduleTemplate, 'id'>,
): Promise<ApiResponse<ScheduleTemplate>> {
  const validationError = validateTimeBlocks(template.timeBlocks)
  if (validationError) {
    return { data: null, error: validationError, meta: {} }
  }

  const newTemplate: ScheduleTemplate = {
    ...template,
    id: crypto.randomUUID(),
  }

  const templates = loadTemplates()
  templates.push(newTemplate)
  saveTemplates(templates)

  return { data: newTemplate, error: null, meta: {} }
}

export async function updateTemplate(
  id: string,
  updates: Partial<Omit<ScheduleTemplate, 'id'>>,
): Promise<ApiResponse<ScheduleTemplate>> {
  const templates = loadTemplates()
  const index = templates.findIndex((t) => t.id === id)
  if (index === -1) {
    return { data: null, error: 'Template not found', meta: {} }
  }

  if (updates.timeBlocks) {
    const validationError = validateTimeBlocks(updates.timeBlocks)
    if (validationError) {
      return { data: null, error: validationError, meta: {} }
    }
  }

  templates[index] = { ...templates[index], ...updates }
  saveTemplates(templates)

  return { data: templates[index], error: null, meta: {} }
}

export async function deleteTemplate(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const templates = loadTemplates()
  const filtered = templates.filter((t) => t.id !== id)
  if (filtered.length === templates.length) {
    return { data: null, error: 'Template not found', meta: {} }
  }
  saveTemplates(filtered)
  return { data: { deleted: true }, error: null, meta: {} }
}

export { API_BASE }
