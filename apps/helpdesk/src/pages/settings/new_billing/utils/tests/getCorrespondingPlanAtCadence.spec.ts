import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    basicYearlyHelpdeskPlan2,
    legacyAutomatePlan,
} from 'fixtures/plans'
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
    })

    it('should return undefined if the price for the given cadence does not exist', () => {
        const result = getCorrespondingPlanAtCadence({
            availablePlans: [],
            currentPlan: basicMonthlyHelpdeskPlan,
            cadence: Cadence.Year,
        })

        expect(result).toBeUndefined()

        const result2 = getCorrespondingPlanAtCadence({
            availablePlans: [
                basicMonthlyHelpdeskPlan,
                basicYearlyHelpdeskPlan2,
            ],
            currentPlan: basicMonthlyHelpdeskPlan,
            cadence: Cadence.Year,
        })
        expect(result2).toBeUndefined()
    })

    it('should not return the current plan if the plan id does not contain a cadence', () => {
        const result = getCorrespondingPlanAtCadence({
            availablePlans: [legacyAutomatePlan],
            currentPlan: legacyAutomatePlan,
            cadence: Cadence.Year,
        })
        expect(result).toBeUndefined()
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
