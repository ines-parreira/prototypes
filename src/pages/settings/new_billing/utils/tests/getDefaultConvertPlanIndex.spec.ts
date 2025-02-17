import {convertAvailablePlans} from 'fixtures/productPrices'
import {Cadence} from 'models/billing/types'

import {getDefaultConvertPlanIndex} from '../getDefaultConvertPlanIndex'

describe('getDefaultConvertPlanIndex', () => {
    it.each([
        [undefined, undefined, undefined, 0],
        [[], undefined, undefined, -1],
        [[], Cadence.Month, 'Pro', -1],
        [convertAvailablePlans, Cadence.Month, 'Unknown', 1],
        [convertAvailablePlans, Cadence.Month, 'Starter', 1],
        [convertAvailablePlans, Cadence.Month, 'Basic', 1],
        [convertAvailablePlans, Cadence.Month, 'Pro', 1],
        [convertAvailablePlans, Cadence.Month, 'Advanced', 2],
        [convertAvailablePlans, Cadence.Month, 'Custom', 3],
        [convertAvailablePlans, Cadence.Year, 'Starter', 6],
        [convertAvailablePlans, Cadence.Year, 'Advanced', -1],
    ])(
        "should return the correct default convert price index ( '%s',  '%s')",
        (availablePlans, cadence, helpdeskPlanName, expectedValue) => {
            expect(
                getDefaultConvertPlanIndex(
                    cadence,
                    availablePlans,
                    helpdeskPlanName
                )
            ).toBe(expectedValue)
        }
    )
})
