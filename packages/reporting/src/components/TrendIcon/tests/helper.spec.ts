import { ARROW_DOWN, ARROW_UP, getIconNameFromValue } from '../helper'

describe('getIconNameFromValue', () => {
    it('returns "arrow-up" when the sign is positive', () => {
        expect(getIconNameFromValue(1)).toBe(ARROW_UP)
    })

    it('returns "arrow-down" when the sign is negative', () => {
        expect(getIconNameFromValue(-1)).toBe(ARROW_DOWN)
    })

    it('returns null when the sign is zero', () => {
        expect(getIconNameFromValue(0)).toBeNull()
    })

    it('returns "arrow-up" when the sign is a positive non-integer', () => {
        expect(getIconNameFromValue(0.5)).toBe(ARROW_UP)
    })

    it('returns "arrow-down" when the sign is a negative non-integer', () => {
        expect(getIconNameFromValue(-0.5)).toBe(ARROW_DOWN)
    })
})
