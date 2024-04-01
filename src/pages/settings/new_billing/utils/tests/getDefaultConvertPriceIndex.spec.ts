import {convertProduct} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {getDefaultConvertPriceIndex} from '../getDefaultConvertPriceIndex'

describe('getDefaultConvertPriceIndex', () => {
    it.each([
        [undefined, undefined, undefined, 0],
        [[], undefined, undefined, -1],
        [[], PlanInterval.Month, 'Pro', -1],
        [convertProduct.prices, PlanInterval.Month, 'Unknown', 1],
        [convertProduct.prices, PlanInterval.Month, 'Starter', 1],
        [convertProduct.prices, PlanInterval.Month, 'Basic', 1],
        [convertProduct.prices, PlanInterval.Month, 'Pro', 1],
        [convertProduct.prices, PlanInterval.Month, 'Advanced', 2],
        [convertProduct.prices, PlanInterval.Month, 'Custom', 3],
        [convertProduct.prices, PlanInterval.Year, 'Starter', 6],
        [convertProduct.prices, PlanInterval.Year, 'Advanced', -1],
    ])(
        'should return the correct default convert price index',
        (prices, interval, helpdeskPlanName, expectedValue) => {
            expect(
                getDefaultConvertPriceIndex(interval, prices, helpdeskPlanName)
            ).toBe(expectedValue)
        }
    )
})
