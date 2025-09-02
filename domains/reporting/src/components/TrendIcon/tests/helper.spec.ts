import { getIconNameFromValue } from '../helper'

describe('getIconNameFromValue', () => {
    it('returns "arrow_upward" when the sign is positive', () => {
        expect(getIconNameFromValue(1)).toBe('arrow_upward')
    })

    it('returns "arrow_downward" when the sign is negative', () => {
        expect(getIconNameFromValue(-1)).toBe('arrow_downward')
    })

    it('returns null when the sign is zero', () => {
        expect(getIconNameFromValue(0)).toBeNull()
    })

    it('returns "arrow_upward" when the sign is a positive non-integer', () => {
        expect(getIconNameFromValue(0.5)).toBe('arrow_upward')
    })

    it('returns "arrow_downward" when the sign is a negative non-integer', () => {
        expect(getIconNameFromValue(-0.5)).toBe('arrow_downward')
    })
})
