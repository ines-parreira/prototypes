import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    basicYearlyHelpdeskPlan2,
    legacyAutomatePlan,
} from 'fixtures/productPrices'
import { Cadence } from 'models/billing/types'
import { getCorrespondingPlanAtCadence } from 'pages/settings/new_billing/utils/getCorrespondingPlanAtCadence'

describe('getCorrespondingPlanAtInterval', () => {
    it('should return the plan for the given cadence if it exists', () => {
        const result = getCorrespondingPlanAtCadence({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: basicMonthlyHelpdeskPlan,
            cadence: Cadence.Year,
        })
        expect(result).toBe(basicYearlyHelpdeskPlan)

        const result2 = getCorrespondingPlanAtCadence({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: basicYearlyHelpdeskPlan,
            cadence: Cadence.Month,
        })
        expect(result2).toBe(basicMonthlyHelpdeskPlan)

        const result3 = getCorrespondingPlanAtCadence({
            availablePlans: [
                basicMonthlyHelpdeskPlan,
                basicYearlyHelpdeskPlan2,
            ],
            currentPlan: basicMonthlyHelpdeskPlan,
            cadence: Cadence.Year,
        })
        expect(result3).toBe(basicYearlyHelpdeskPlan2)
    })

    it('should thow an error if the price for the given cadence does not exist', () => {
        try {
            getCorrespondingPlanAtCadence({
                availablePlans: [],
                currentPlan: basicMonthlyHelpdeskPlan,
                cadence: Cadence.Year,
            })
        } catch (e) {
            expect(e).toEqual(
                new Error(
                    'Plan not found at this cadence: basic-monthly-usd-4',
                ),
            )
        }
    })

    it('should not return the current plan if the plan id does not contain a cadence', () => {
        try {
            getCorrespondingPlanAtCadence({
                availablePlans: [legacyAutomatePlan],
                currentPlan: legacyAutomatePlan,
                cadence: Cadence.Year,
            })
        } catch (e) {
            expect(e).toEqual(
                new Error('Plan not found at this cadence: free-automation'),
            )
        }
    })

    it('should return undefined if the currentPrice is not provided', () => {
        const result = getCorrespondingPlanAtCadence({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: undefined,
            cadence: Cadence.Year,
        })
        expect(result).toBeUndefined() // The currentPrice is not provided, so the result is undefined
    })
})
