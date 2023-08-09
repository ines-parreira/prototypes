import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from '../utils'

describe('creditCardNormalizer', () => {
    it('should format the credit card number with spaces', () => {
        const value = '1234567890123456'
        const previousValue = ''
        const formattedValue = creditCardNormalizer(value, previousValue)
        expect(formattedValue).toBe('1234 5678 9012 3456')
    })

    it('should not modify the previous value if the new value is invalid', () => {
        const value = '12345ABC67890'
        const previousValue = '1234 5678 9012 3456'
        const formattedValue = creditCardNormalizer(value, previousValue)
        expect(formattedValue).toBe(previousValue)
    })
})

describe('creditCardCVCNormalizer', () => {
    it('should keep the new value if it consists of up to 4 digits', () => {
        const value = '123'
        const previousValue = '4567'
        const normalizedValue = creditCardCVCNormalizer(value, previousValue)
        expect(normalizedValue).toBe(value)
    })

    it('should not modify the previous value if the new value is invalid', () => {
        const value = '12345'
        const previousValue = '4567'
        const normalizedValue = creditCardCVCNormalizer(value, previousValue)
        expect(normalizedValue).toBe(previousValue)
    })
})

describe('creditCardExpDateNormalizer', () => {
    it('should format the expiration date with a space after the month', () => {
        const value = '1222'
        const previousValue = ''
        const formattedValue = creditCardExpDateNormalizer(value, previousValue)
        expect(formattedValue).toBe('12 / 22')
    })

    it('should return the previous value if new value is more than 4 characters but not 6 characters', () => {
        const value = '12 / 345'
        const previousValue = '12 / 34'
        const formattedValue = creditCardExpDateNormalizer(value, previousValue)
        expect(formattedValue).toBe(previousValue)
    })

    it('should format the expiration date if the new value is exactly 6 characters', () => {
        const value = '12 / 2026'
        const previousValue = '12 / 26'
        const formattedValue = creditCardExpDateNormalizer(value, previousValue)
        expect(formattedValue).toBe(previousValue)
    })
})
