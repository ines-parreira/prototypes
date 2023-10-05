import {convertProduct} from 'fixtures/productPrices'
import {getDefaultConvertPriceIndex} from '../getDefaultConvertPriceIndex'

describe('getDefaultConvertPriceIndex', () => {
    it.each([
        [undefined, undefined, 0],
        [[], undefined, -1],
        [[], 'Pro', -1],
        [convertProduct.prices, 'Unknown', 1],
        [convertProduct.prices, 'Basic', 1],
        [convertProduct.prices, 'Pro', 3],
    ])(
        'should return the correct default convert price index',
        (prices, helpdeskPlanName, expectedValue) => {
            expect(getDefaultConvertPriceIndex(prices, helpdeskPlanName)).toBe(
                expectedValue
            )
        }
    )
})
