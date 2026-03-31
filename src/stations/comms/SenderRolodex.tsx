import Rolodex, { type RolodexItem } from '../../components/Rolodex'
import type { SenderEntry } from '../../services/gmail'

interface SenderRolodexProps {
  senders: SenderEntry[]
  selectedAddress: string | null
  onSelect: (address: string) => void
}

export default function SenderRolodex({ senders, selectedAddress, onSelect }: SenderRolodexProps) {
  const items: RolodexItem[] = senders.map((s) => ({
    id: s.senderAddress,
    label: s.senderName,
    detail: String(s.messageCount),
  }))

  return (
    <Rolodex
      items={items}
      selectedId={selectedAddress}
      onSelect={onSelect}
      placeholder="SEARCH SENDERS..."
      emptyMessage="NO SENDERS FOUND"
    />
  )
}
