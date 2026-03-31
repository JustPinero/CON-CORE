import { describe, it, expect } from 'vitest'
import { COLORS, SPACING, PIE_PALETTE, FONT_FAMILY, BORDER } from './tokens'

describe('tokens', () => {
  describe('COLORS', () => {
    it('exports all 7 color tokens', () => {
      expect(COLORS.primary).toBe('#33ff33')
      expect(COLORS.secondary).toBe('#22aa22')
      expect(COLORS.tertiary).toBe('#1a661a')
      expect(COLORS.bg).toBe('#0a1a0a')
      expect(COLORS.bgLight).toBe('#0d220d')
      expect(COLORS.danger).toBe('#ff5555')
      expect(COLORS.warning).toBe('#ffaa00')
    })

    it('has exactly 7 color entries', () => {
      expect(Object.keys(COLORS)).toHaveLength(7)
    })
  })

  describe('SPACING', () => {
    it('exports 4 spacing values based on 8px unit', () => {
      expect(SPACING[1]).toBe('8px')
      expect(SPACING[2]).toBe('16px')
      expect(SPACING[3]).toBe('24px')
      expect(SPACING[4]).toBe('32px')
    })
  })

  describe('PIE_PALETTE', () => {
    it('exports at least 6 green palette colors', () => {
      expect(PIE_PALETTE.length).toBeGreaterThanOrEqual(6)
    })

    it('starts with primary color', () => {
      expect(PIE_PALETTE[0]).toBe(COLORS.primary)
    })
  })

  describe('FONT_FAMILY', () => {
    it('uses Courier New monospace stack', () => {
      expect(FONT_FAMILY).toContain('Courier New')
      expect(FONT_FAMILY).toContain('monospace')
    })
  })

  describe('BORDER', () => {
    it('defines thin and thick border styles', () => {
      expect(BORDER.thin).toContain('1px solid')
      expect(BORDER.thick).toContain('2px solid')
      expect(BORDER.thin).toContain(COLORS.primary)
      expect(BORDER.thick).toContain(COLORS.primary)
    })

    it('defines danger border', () => {
      expect(BORDER.danger).toContain(COLORS.danger)
    })
  })
})
