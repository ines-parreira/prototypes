import { afterEach, beforeEach, vi } from 'vitest'

import { isCardExpired } from '../isCardExpired'

describe('isCardExpired', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return false if expiration date is in the future', () => {
        vi.setSystemTime(new Date(2024, 10, 4))

        const cardNotExpired = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 12,
            exp_year: 2024,
        }
        expect(isCardExpired(cardNotExpired)).toBe(false)
    })

    it('should return false if expiration date is same month', () => {
        vi.setSystemTime(new Date(2024, 10, 4))

        const cardNotExpired = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 11,
            exp_year: 2024,
        }
        expect(isCardExpired(cardNotExpired)).toBe(false)
    })

    it('should return true if expiration date is in the past of same year', () => {
        vi.setSystemTime(new Date(2024, 10, 4))

        const cardExpired = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 10,
            exp_year: 2024,
        }
        expect(isCardExpired(cardExpired)).toBe(true)
    })

    it('should return true if expiration date is in the past of different year', () => {
        const cardExpired = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 12,
            exp_year: 2020,
        }
        expect(isCardExpired(cardExpired)).toBe(true)
    })
})
