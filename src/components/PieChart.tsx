import { PIE_PALETTE } from '../theme/tokens'

export interface PieSlice {
  label: string
  value: number
  key: string
}

interface PieChartProps {
  slices: PieSlice[]
  selectedKey: string | null
  onSliceClick: (key: string) => void
  size?: number
}

const OUTER_RADIUS = 100
const INNER_RADIUS = 60
const CENTER = 120

function describeArc(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
): string {
  const startOuter = polarToCartesian(CENTER, CENTER, outerR, endAngle)
  const endOuter = polarToCartesian(CENTER, CENTER, outerR, startAngle)
  const startInner = polarToCartesian(CENTER, CENTER, innerR, startAngle)
  const endInner = polarToCartesian(CENTER, CENTER, innerR, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function PieChart({
  slices,
  selectedKey,
  onSliceClick,
  size = 240,
}: PieChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (total === 0 || slices.length === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--crt-tertiary)',
          textTransform: 'uppercase',
          fontSize: '12px',
        }}
      >
        NO DATA
      </div>
    )
  }

  const viewBox = `0 0 ${CENTER * 2} ${CENTER * 2}`
  let currentAngle = 0

  const arcs = slices
    .filter((s) => s.value > 0)
    .map((slice, i) => {
      const angle = (slice.value / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      // For a full circle (single slice), use special handling
      const isFullCircle = angle >= 359.99

      const midAngle = startAngle + angle / 2
      const labelR = (OUTER_RADIUS + INNER_RADIUS) / 2
      const labelPos = polarToCartesian(CENTER, CENTER, labelR, midAngle)
      const pct = Math.round((slice.value / total) * 100)
      const isSelected = selectedKey === slice.key
      const color = PIE_PALETTE[i % PIE_PALETTE.length]

      return {
        slice,
        startAngle,
        endAngle,
        isFullCircle,
        labelPos,
        pct,
        isSelected,
        color,
        index: i,
      }
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        role="img"
        aria-label="Category breakdown chart"
      >
        {arcs.map((arc) =>
          arc.isFullCircle ? (
            <g key={arc.slice.key}>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={OUTER_RADIUS}
                fill={arc.color}
                opacity={arc.isSelected ? 1 : 0.8}
                style={{ cursor: 'pointer' }}
                onClick={() => onSliceClick(arc.slice.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSliceClick(arc.slice.key)}
                aria-label={`${arc.slice.label}: ${arc.pct}%`}
              />
              <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="var(--crt-bg)" />
            </g>
          ) : (
            <path
              key={arc.slice.key}
              d={describeArc(arc.startAngle, arc.endAngle, OUTER_RADIUS, INNER_RADIUS)}
              fill={arc.color}
              stroke="var(--crt-bg)"
              strokeWidth={2}
              opacity={arc.isSelected ? 1 : 0.8}
              style={{ cursor: 'pointer' }}
              onClick={() => onSliceClick(arc.slice.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSliceClick(arc.slice.key)}
              aria-label={`${arc.slice.label}: ${arc.pct}%`}
            />
          ),
        )}

        {/* Percentage labels */}
        {arcs.map(
          (arc) =>
            arc.pct >= 5 && (
              <text
                key={`label-${arc.slice.key}`}
                x={arc.labelPos.x}
                y={arc.labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--crt-bg)"
                fontSize="11"
                fontFamily="'Courier New', Courier, monospace"
                fontWeight="normal"
                style={{ pointerEvents: 'none' }}
              >
                {arc.pct}%
              </text>
            ),
        )}

        {/* Center text for selected slice */}
        {selectedKey && (
          <>
            <text
              x={CENTER}
              y={CENTER - 8}
              textAnchor="middle"
              fill="var(--crt-primary)"
              fontSize="11"
              fontFamily="'Courier New', Courier, monospace"
              textDecoration="none"
            >
              {arcs.find((a) => a.slice.key === selectedKey)?.slice.label.toUpperCase() || ''}
            </text>
            <text
              x={CENTER}
              y={CENTER + 10}
              textAnchor="middle"
              fill="var(--crt-primary)"
              fontSize="16"
              fontFamily="'Courier New', Courier, monospace"
            >
              {arcs.find((a) => a.slice.key === selectedKey)?.pct || 0}%
            </text>
          </>
        )}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: '16px', width: '100%' }}>
        {arcs.map((arc) => (
          <div
            key={`legend-${arc.slice.key}`}
            onClick={() => onSliceClick(arc.slice.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              cursor: 'pointer',
              color:
                selectedKey === arc.slice.key ? 'var(--crt-primary)' : 'var(--crt-secondary)',
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '0.05em',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                background: arc.color,
                flexShrink: 0,
              }}
            />
            <span>{arc.slice.label}</span>
            <span style={{ marginLeft: 'auto' }}>{arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
