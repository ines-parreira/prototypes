import { isEvoliTicket } from '../utils'

describe('isEvoliTicket', () => {
    it('returns true when an evoli tag is present', () => {
        expect(isEvoliTicket(['support', 'ai_evolution'])).toBe(true)
        expect(isEvoliTicket(['ai_next_gen'])).toBe(true)
    })

    it('returns false when no evoli tags are present', () => {
        expect(isEvoliTicket(['support', 'billing'])).toBe(false)
    })

    it('returns false when tags are missing or empty', () => {
        expect(isEvoliTicket()).toBe(false)
        expect(isEvoliTicket([])).toBe(false)
    })

    it('ignores empty values while checking iterables', () => {
        expect(isEvoliTicket([undefined, null, 'ai_next_gen'])).toBe(true)
    })
})
