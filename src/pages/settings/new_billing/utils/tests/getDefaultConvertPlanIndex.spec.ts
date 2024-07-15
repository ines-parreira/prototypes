import {convertAvailablePlans} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {getDefaultConvertPlanIndex} from '../getDefaultConvertPlanIndex'

describe('getDefaultConvertPlanIndex', () => {
    it.each([
        [undefined, undefined, undefined, 0],
        [[], undefined, undefined, -1],
        [[], PlanInterval.Month, 'Pro', -1],
        [convertAvailablePlans, PlanInterval.Month, 'Unknown', 1],
        [convertAvailablePlans, PlanInterval.Month, 'Starter', 1],
        [convertAvailablePlans, PlanInterval.Month, 'Basic', 1],
        [convertAvailablePlans, PlanInterval.Month, 'Pro', 1],
        [convertAvailablePlans, PlanInterval.Month, 'Advanced', 2],
        [convertAvailablePlans, PlanInterval.Month, 'Custom', 3],
        [convertAvailablePlans, PlanInterval.Year, 'Starter', 6],
        [convertAvailablePlans, PlanInterval.Year, 'Advanced', -1],
    ])(
        'should return the correct default convert price index',
        (availablePlans, interval, helpdeskPlanName, expectedValue) => {
            expect(
                getDefaultConvertPlanIndex(
                    interval,
                    availablePlans,
                    helpdeskPlanName
                )
            ).toBe(expectedValue)
        }
    )
})
