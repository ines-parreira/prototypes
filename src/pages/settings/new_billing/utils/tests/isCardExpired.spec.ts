import type {CreditCard} from 'models/billing/types'
import {isCardExpired} from 'pages/settings/new_billing/utils/isCardExpired'

describe('isCardExpired', () => {
    it('should return false if expiration date is in the future', () => {
        // Given we are on November 2024
        const mockCurrentDate = new Date(2024, 10, 4) // months are 0-indexed, so 10 represents November
        jest.useFakeTimers({now: mockCurrentDate})

        // with a card expiring on December 2024
        const cardNotExpired: CreditCard = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 12,
            exp_year: 2024,
        }
        expect(isCardExpired(cardNotExpired)).toBe(false)
    })

    it('should return false if expiration date is same month', () => {
        // Given we are on November 2024
        const mockCurrentDate = new Date(2024, 10, 4) // months are 0-indexed, so 10 represents November
        jest.useFakeTimers({now: mockCurrentDate})

        // with a card expiring on November 2024 (cards expire at the end of the expiring month)
        const cardNotExpired: CreditCard = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 11,
            exp_year: 2024,
        }
        expect(isCardExpired(cardNotExpired)).toBe(false)
    })

    it('should return true if expiration date is in the past of same year', () => {
        // Given we are on November 2024
        const mockCurrentDate = new Date(2024, 10, 4) // months are 0-indexed, so 10 represents November
        jest.useFakeTimers({now: mockCurrentDate})

        // with a card expiring on October 2024 (cards expire at the end of the expiring month)
        const cardExpired: CreditCard = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 10,
            exp_year: 2024,
        }
        expect(isCardExpired(cardExpired)).toBe(true)
    })

    it('should return true if expiration date is in the past of different year', () => {
        // with a card expiring on December 2020 (cards expire at the end of the expiring month)
        const cardExpired: CreditCard = {
            brand: 'Visa',
            last4: '1324',
            exp_month: 12,
            exp_year: 2020,
        }
        expect(isCardExpired(cardExpired)).toBe(true)
    })
})
