import { useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Homepage from './components/Homepage'
import Shell from './components/Shell'
import StationPlaceholder from './components/StationPlaceholder'
import BootSequence, { SESSION_KEY } from './components/BootSequence'
import TerminalStation from './stations/terminal/TerminalStation'
import CommsStation from './stations/comms/CommsStation'
import ScheduleStation from './stations/schedule/ScheduleStation'
import SubscrStation from './stations/subscriptions/SubscrStation'
import ResearchStation from './stations/research/ResearchStation'
import SecurityStation from './stations/security/SecurityStation'
import ContactsStation from './stations/contacts/ContactsStation'
import { STATIONS } from './utils/types'

function StationRoute() {
  const { stationId } = useParams<{ stationId: string }>()

  if (stationId === 'terminal') {
    return <TerminalStation />
  }

  if (stationId === 'comms') {
    return <CommsStation />
  }

  if (stationId === 'schedule') {
    return <ScheduleStation />
  }

  if (stationId === 'subscriptions') {
    return <SubscrStation />
  }

  if (stationId === 'research') {
    return <ResearchStation />
  }

  if (stationId === 'security') {
    return <SecurityStation />
  }

  if (stationId === 'contacts') {
    return <ContactsStation />
  }

  const station = STATIONS.find((s) => s.id === stationId)
  const name = station ? station.name : 'UNKNOWN'

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
