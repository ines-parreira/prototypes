import { validatePostalCode } from '../validations'

const noError = undefined
const error = 'Postal code is invalid'

describe('validatePostalCode for the US', () => {
    it('should return no error if between 00501 and 99950 (inclusive)', () => {
        for (let postalCode = 501; postalCode <= 99950; postalCode++) {
            const postalCodeString = postalCode.toString().padStart(5, '0')
            expect(validatePostalCode(postalCodeString, 'US')).toBe(noError)
        }

        expect(validatePostalCode('00500', 'US')).toBe(error)

        expect(validatePostalCode('99951', 'US')).toBe(error)
    })

    it('should return an error if not a 5 characters string exactly (without counting spaces)', () => {
        expect(validatePostalCode('123456', 'US')).toBe(error)
        expect(validatePostalCode('123 456', 'US')).toBe(error)
        expect(validatePostalCode('123 45', 'US')).toBe(noError)
    })
})

describe('validatePostalCode for Canada', () => {
    it('should return an error if not a 6 characters string exactly (without counting spaces)', () => {
        expect(validatePostalCode('a1a1a', 'CA')).toBe(error)
        expect(validatePostalCode('a1a1a1', 'CA')).toBe(noError)
        expect(validatePostalCode('a1a1a1a', 'CA')).toBe(error)
    })

    it('should return no error if of the form A1A 1A1, with our without spaces', () => {
        for (const postalCode of [
            'A1A 1A1',
            'A1A1A1',
            'a1a 1a1',
            'a1a1a1',
            'K1A 0B1',
            'K8N 5W6',
        ]) {
            expect(validatePostalCode(postalCode, 'CA')).toBe(noError)
        }
    })
})
