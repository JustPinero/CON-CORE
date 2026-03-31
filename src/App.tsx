import { lazy, Suspense, useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Homepage from './components/Homepage'
import Shell from './components/Shell'
import StationPlaceholder from './components/StationPlaceholder'
import LoadingFallback from './components/LoadingFallback'
import BootSequence, { SESSION_KEY } from './components/BootSequence'
import type { StationId } from './utils/types'

const stationModules: Record<StationId, React.LazyExoticComponent<React.ComponentType>> = {
  terminal: lazy(() => import('./stations/terminal/TerminalStation')),
  comms: lazy(() => import('./stations/comms/CommsStation')),
  schedule: lazy(() => import('./stations/schedule/ScheduleStation')),
  subscriptions: lazy(() => import('./stations/subscriptions/SubscrStation')),
  research: lazy(() => import('./stations/research/ResearchStation')),
  security: lazy(() => import('./stations/security/SecurityStation')),
  contacts: lazy(() => import('./stations/contacts/ContactsStation')),
  filerecon: lazy(() => import('./stations/filerecon/FileReconStation')),
  taskqueue: lazy(() => import('./stations/taskqueue/TaskQueueStation')),
}

function StationRoute() {
  const { stationId } = useParams<{ stationId: string }>()
  const StationComponent = stationModules[stationId as StationId]

  if (StationComponent) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <StationComponent />
      </Suspense>
    )
  }

  const name = stationId?.toUpperCase() || 'UNKNOWN'
  return (
    <Shell stationName={name}>
      <StationPlaceholder />
    </Shell>
  )
}

export default function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/station/:stationId" element={<StationRoute />} />
    </Routes>
  )
}
