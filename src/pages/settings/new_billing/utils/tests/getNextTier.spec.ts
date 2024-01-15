import {
    convertPrice1,
    convertPrice2,
    convertPrice3,
    convertPrice4,
    convertPrice5,
    convertProduct,
} from 'fixtures/productPrices'
import {getNextTier} from '../getNextTier'

describe('getNextTier', () => {
    it.each([
        [convertPrice1, convertPrice2],
        [convertPrice3, convertPrice5],
        [convertPrice4, convertPrice5],
        [convertPrice5, undefined],
    ])('should return next tier from list', (input, output) => {
        const result = getNextTier(convertProduct.prices, input)
        expect(result).toBe(output)
    })
})
