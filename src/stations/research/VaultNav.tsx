import HorizontalNav from '../../components/HorizontalNav'
import type { BookmarkVault } from '../../services/bookmarks'

interface VaultNavProps {
  vaults: BookmarkVault[]
  selectedVault: string | null
  onSelect: (vaultName: string) => void
}

export default function VaultNav({ vaults, selectedVault, onSelect }: VaultNavProps) {
  const vaultNames = vaults.map((v) => v.name)

  return (
    <HorizontalNav
      items={vaultNames}
      selectedItem={selectedVault}
      onSelect={onSelect}
    />
  )
}
