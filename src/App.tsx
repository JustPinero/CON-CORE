import { useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import Homepage from './components/Homepage'
import Shell from './components/Shell'
import StationPlaceholder from './components/StationPlaceholder'
import BootSequence, { SESSION_KEY } from './components/BootSequence'
import { STATIONS } from './utils/types'

function StationRoute() {
  const { stationId } = useParams<{ stationId: string }>()
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
