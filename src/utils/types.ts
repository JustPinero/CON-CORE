export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta: Record<string, unknown>
}

export interface EmailSource {
  id: string
  senderAddress: string
  senderName: string
  messageCount: number
  categoryBreakdown: CategoryBreakdown
  lastAnalyzed: string | null
  unsubscribeVector: boolean
  dossierSummary: string | null
}

export interface CategoryBreakdown {
  promo: number
  transactional: number
  work: number
  personal: number
  newsletter: number
  system: number
}

export interface ScheduleTemplate {
  id: string
  name: string
  dayType: 'weekday' | 'weekend'
  timeBlocks: TimeBlock[]
}

export interface TimeBlock {
  startTime: string
  endTime: string
  label: string
  calendarId: string
}

export interface BookmarkVault {
  id: string
  vaultName: string
}

export interface Bookmark {
  id: string
  vaultId: string
  url: string
  title: string
  status: 'alive' | 'dead' | 'dupe'
  dupeCount: number
  lastChecked: string | null
}

export interface Subscription {
  id: string
  serviceName: string
  monthlyCost: number
  category: string
  detectedSince: string
  lastCharge: string
  lifetimeSpend: number
  usageStatus: 'active' | 'forgotten'
  cancellationUrl: string | null
}

export interface TaskQueueItem {
  id: string
  text: string
  position: number
  createdAt: string
}

export interface PasswordAuditResult {
  accountName: string
  threatLevel: 'green' | 'yellow' | 'red'
  issues: string[]
  recommendation: string
}

export interface ContactRecord {
  id: string
  name: string
  email: string
  phone: string
  source: string
  duplicateGroupId: string | null
}

export type StationId =
  | 'comms'
  | 'schedule'
  | 'research'
  | 'security'
  | 'subscriptions'
  | 'contacts'
  | 'filerecon'
  | 'taskqueue'
  | 'terminal'

export interface StationConfig {
  id: StationId
  name: string
  fkey: string
  path: string
}

export const STATIONS: StationConfig[] = [
  { id: 'comms', name: 'COMMS', fkey: 'F1', path: '/station/comms' },
  { id: 'schedule', name: 'SCHEDULE', fkey: 'F2', path: '/station/schedule' },
  { id: 'research', name: 'RESEARCH', fkey: 'F3', path: '/station/research' },
  { id: 'security', name: 'SECURITY', fkey: 'F4', path: '/station/security' },
  { id: 'subscriptions', name: 'SUBSCRIPTIONS', fkey: 'F5', path: '/station/subscriptions' },
  { id: 'contacts', name: 'CONTACTS', fkey: 'F6', path: '/station/contacts' },
  { id: 'filerecon', name: 'FILE RECON', fkey: 'F7', path: '/station/filerecon' },
  { id: 'taskqueue', name: 'TASK QUEUE', fkey: 'F8', path: '/station/taskqueue' },
  { id: 'terminal', name: 'TERMINAL', fkey: 'F9', path: '/station/terminal' },
]
