import {formatPercentage, formatPrice} from '../number'

describe('formatPrice()', () => {
    describe('with fractional currency', () => {
        const currencyCode = 'USD'

        it('should format given price when it is a string', () => {
            const price = '9.99'
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('9.99')
        })

        it('should format given price when it is a number', () => {
            const price = 9.99
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('9.99')
        })

        it('should format given price when it is a too precise number, using ceil', () => {
            const price = 9.999
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('10.00')
        })

        it('should format given price when it is a too precise number, using floor', () => {
            const price = 9.111
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('9.11')
        })

        it('should format given price when it is a too precise number, using floor because it is specified', () => {
            const price = 9.999
            const result = formatPrice(price, currencyCode, true)
            expect(result).toBe('9.99')
        })
    })

    describe('with non-fractional currency', () => {
        const currencyCode = 'JPY'

        it('should format given price when it is a string', () => {
            const price = '999'
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('999')
        })

        it('should format given price when it is a number', () => {
            const price = 999
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('999')
        })

        it('should format given price when it is a too precise number, using ceil', () => {
            const price = 999.9
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('1000')
        })

        it('should format given price when it is a too precise number, using floor', () => {
            const price = 999.1
            const result = formatPrice(price, currencyCode)
            expect(result).toBe('999')
        })

        it('should format given price when it is a too precise number, using floor because it is specified', () => {
            const price = 999.9
            const result = formatPrice(price, currencyCode, true)
            expect(result).toBe('999')
        })
    })
})

describe('formatPercentage()', () => {
    it('should format given value when it is a string', () => {
        const value = '50'
        const result = formatPercentage(value)
        expect(result).toBe('50.00')
    })

    it('should format given value when it is a number', () => {
        const value = 50
        const result = formatPercentage(value)
        expect(result).toBe('50.00')
    })

    it('should format given value when it is a too precise number, using ceil', () => {
        const value = 99.999
        const result = formatPercentage(value)
        expect(result).toBe('100.00')
    })

    it('should format given value when it is a too precise number, using floor', () => {
        const value = 99.111
        const result = formatPercentage(value)
        expect(result).toBe('99.11')
    })
})
