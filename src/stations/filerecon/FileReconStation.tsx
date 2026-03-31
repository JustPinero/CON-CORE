import { useState } from 'react'
import Shell from '../../components/Shell'
import HorizontalNav from '../../components/HorizontalNav'
import RetroButton from '../../components/RetroButton'
import { sortBySize, sortByDate, detectDuplicateFiles, getStorageSummary, formatSize, type FileEntry } from '../../services/filerecon'

const TABS = ['LARGEST', 'OLDEST', 'DUPES', 'SUMMARY']

export default function FileReconStation() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [activeTab, setActiveTab] = useState('LARGEST')
  const [statusMessage, setStatusMessage] = useState('AWAITING FILE SCAN')

  function handleMockScan() {
    // Placeholder: in production this would use Google Drive API or file upload
    const mockFiles: FileEntry[] = [
      { name: 'vacation-photos.zip', size: 524288000, lastModified: '2024-06-15', type: 'zip', path: '/downloads' },
      { name: 'project-backup.tar', size: 209715200, lastModified: '2025-01-10', type: 'tar', path: '/backups' },
      { name: 'old-resume.docx', size: 51200, lastModified: '2022-03-01', type: 'docx', path: '/documents' },
      { name: 'screenshot.png', size: 2097152, lastModified: '2026-03-30', type: 'png', path: '/desktop' },
      { name: 'project-backup.tar', size: 209715200, lastModified: '2025-02-15', type: 'tar', path: '/downloads' },
      { name: 'notes.txt', size: 1024, lastModified: '2023-08-01', type: 'txt', path: '/documents' },
    ]
    setFiles(mockFiles)
    setStatusMessage(`${mockFiles.length} FILES SCANNED`)
  }

  const largest = sortBySize(files)
  const oldest = sortByDate(files)
  const dupes = detectDuplicateFiles(files)
  const summary = getStorageSummary(files)

  return (
    <Shell stationName="FILE RECON" statusMessage={statusMessage}>
      {files.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 'var(--space-3)' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '14px' }}>FILE RECONNAISSANCE</div>
          <div style={{ color: 'var(--crt-secondary)', fontSize: '12px', textTransform: 'uppercase' }}>
            SCAN FILES TO IDENTIFY LARGE, OLD, AND DUPLICATE FILES
          </div>
          <RetroButton onClick={handleMockScan} style={{ minHeight: '64px', padding: '16px 48px' }}>
            RUN SCAN
          </RetroButton>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <HorizontalNav items={TABS} selectedItem={activeTab} onSelect={setActiveTab} />

          {activeTab === 'LARGEST' && (
            <div style={{ border: '1px solid var(--crt-primary)' }}>
              {largest.map((f, i) => (
                <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--crt-primary)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{f.name}</span>
                  <span style={{ color: 'var(--crt-secondary)' }}>{formatSize(f.size)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'OLDEST' && (
            <div style={{ border: '1px solid var(--crt-primary)' }}>
              {oldest.map((f, i) => (
                <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid var(--crt-primary)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{f.name}</span>
                  <span style={{ color: 'var(--crt-tertiary)' }}>{f.lastModified}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'DUPES' && (
            <div>
              {dupes.length === 0 ? (
                <div style={{ color: 'var(--crt-tertiary)', textTransform: 'uppercase', padding: 'var(--space-3)', textAlign: 'center' }}>
                  NO DUPLICATES FOUND
                </div>
              ) : (
                dupes.map((group, gi) => (
                  <div key={gi} style={{ border: '1px solid var(--crt-warning)', padding: 'var(--space-2)', marginBottom: '8px' }}>
                    <div style={{ color: 'var(--crt-warning)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {group[0].name} — {group.length} COPIES
                    </div>
                    {group.map((f, fi) => (
                      <div key={fi} style={{ fontSize: '11px', color: 'var(--crt-secondary)', paddingLeft: '8px' }}>
                        {f.path}/{f.name} ({formatSize(f.size)})
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'SUMMARY' && (
            <div style={{ border: '1px solid var(--crt-primary)', padding: 'var(--space-2)' }}>
              <div style={{ fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px' }}>
                TOTAL: {formatSize(summary.total)}
              </div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>BY TYPE:</div>
              {Object.entries(summary.byType).sort(([,a], [,b]) => b - a).map(([ext, size]) => (
                <div key={ext} style={{ padding: '4px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>.{ext.toUpperCase()}</span>
                  <span style={{ color: 'var(--crt-secondary)' }}>{formatSize(size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  )
}
