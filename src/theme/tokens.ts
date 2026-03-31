export const COLORS = {
  primary: '#33ff33',
  secondary: '#22aa22',
  tertiary: '#1a661a',
  bg: '#0a1a0a',
  bgLight: '#0d220d',
  danger: '#ff5555',
  warning: '#ffaa00',
} as const

export const SPACING = {
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
} as const

export const PIE_PALETTE = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.tertiary,
  '#2dcc2d',
  '#178817',
  '#0f5c0f',
] as const

export const FONT_FAMILY = "'Courier New', Courier, monospace"
export const FONT_SIZE_BASE = '14px'
export const LINE_HEIGHT_BASE = '1.4'
export const LETTER_SPACING_UPPER = '0.05em'

export const BORDER = {
  thin: `1px solid ${COLORS.primary}`,
  thick: `2px solid ${COLORS.primary}`,
  danger: `2px solid ${COLORS.danger}`,
} as const
