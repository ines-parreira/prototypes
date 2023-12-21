import {
    convertPrice1,
    convertPrice2,
    convertPrice3,
    convertProduct,
} from 'fixtures/productPrices'
import {getNextTier} from '../getNextTier'

describe('getNextTier', () => {
    it('should return next tier from list', () => {
        const result = getNextTier(convertProduct.prices, convertPrice1)
        expect(result).toBe(convertPrice2)
    })
    it("should return undefined when it's the last tier", () => {
        const result = getNextTier(convertProduct.prices, convertPrice3)
        expect(result).toBe(undefined)
    })
})
