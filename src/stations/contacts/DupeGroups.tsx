import RetroButton from '../../components/RetroButton'
import type { ContactRecord } from '../../utils/types'

interface DupeGroupsProps {
  groups: ContactRecord[][]
  onMerge: (group: ContactRecord[]) => void
}

export default function DupeGroups({ groups, onMerge }: DupeGroupsProps) {
  if (groups.length === 0) {
    return (
      <div style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase', padding: 'var(--space-3)', textAlign: 'center' }}>
        NO DUPLICATES DETECTED
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ fontSize: '12px', color: 'var(--crt-warning)', textTransform: 'uppercase' }}>
        {groups.length} DUPLICATE GROUPS FOUND
      </div>

      {groups.map((group, gi) => (
        <div key={gi} style={{ border: '1px solid var(--crt-warning)', padding: 'var(--space-2)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--crt-warning)' }}>
            GROUP {gi + 1} — {group.length} CONTACTS
          </div>
          {group.map((contact) => (
            <div key={contact.id} style={{ padding: '4px 0', fontSize: '12px', borderBottom: '1px solid var(--crt-primary)', opacity: 0.5, display: 'flex', gap: '16px' }}>
              <span style={{ width: '150px' }}>{contact.name}</span>
              <span style={{ width: '200px', color: 'var(--crt-secondary)' }}>{contact.email}</span>
              <span style={{ color: 'var(--crt-tertiary)' }}>{contact.phone}</span>
            </div>
          ))}
          <RetroButton
            onClick={() => onMerge(group)}
            style={{ marginTop: '8px', minHeight: '32px', fontSize: '12px' }}
          >
            MERGE GROUP
          </RetroButton>
        </div>
      ))}
    </div>
  )
}
