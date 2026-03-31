import { Routes, Route, useParams } from 'react-router-dom'
import Homepage from './components/Homepage'
import Shell from './components/Shell'
import StationPlaceholder from './components/StationPlaceholder'
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
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/station/:stationId" element={<StationRoute />} />
    </Routes>
  )
}
