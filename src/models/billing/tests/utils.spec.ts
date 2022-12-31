import {
    basicMonthlyHelpdeskPrice,
    basicMonthlyAutomationPrice,
    smsProduct,
} from 'fixtures/productPrices'

import {
    getCheapestPrice,
    getFormattedAmount,
    getFullPrice,
    isHelpdeskPrice,
} from '../utils'

describe('getFullPrice', () => {
    it('should return the full price from discounted price and the percentage of discount presented in decimal', () => {
        const result = getFullPrice(1000, 0.2)
        expect(result).toBe(1250)
    })

    it('should return the discount price as full price if there is no discount', () => {
        const result = getFullPrice(1000, 0)
        expect(result).toBe(1000)
    })

    it('should throw if the discount is a value lesser than 0 or equal to 1 or bigger', () => {
        expect(() => getFullPrice(1000, -1)).toThrow()
        expect(() => getFullPrice(1000, 1)).toThrow()
        expect(() => getFullPrice(1000, 2)).toThrow()
    })
})

describe('isHelpdeskPrice', () => {
    it.each([
        [basicMonthlyHelpdeskPrice, true],
        [basicMonthlyAutomationPrice, false],
    ])(
        'should validate if the price is of helpdesk price',
        (price, expectedResult) => {
            expect(isHelpdeskPrice(price)).toBe(expectedResult)
        }
    )
})

describe('getFormattedAmount', () => {
    it('should return a formatted amount', () => {
        expect(getFormattedAmount(1234)).toBe(12.34)
    })
})

describe('getCheapestPrice', () => {
    it('returns cheapest non-null amount amongst prices', () => {
        expect(
            getCheapestPrice(smsProduct.prices, smsProduct.prices[0].interval)
        ).toEqual(smsProduct.prices[0])
    })
})
