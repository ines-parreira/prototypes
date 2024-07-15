import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {getCorrespondingPlanAtInterval} from 'pages/settings/new_billing/utils/getCorrespondingPlanAtInterval'

describe('getCorrespondingPlanAtInterval', () => {
    it('should return the plan for the given interval if it exists', () => {
        const result = getCorrespondingPlanAtInterval({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: basicMonthlyHelpdeskPlan,
            interval: PlanInterval.Year,
        })
        expect(result).toBe(basicYearlyHelpdeskPlan)

        const result2 = getCorrespondingPlanAtInterval({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: basicYearlyHelpdeskPlan,
            interval: PlanInterval.Month,
        })
        expect(result2).toBe(basicMonthlyHelpdeskPlan)
    })

    it('should return the currentPlan if the price for the given interval does not exist', () => {
        const result = getCorrespondingPlanAtInterval({
            availablePlans: [],
            currentPlan: basicMonthlyHelpdeskPlan,
            interval: PlanInterval.Year,
        })
        expect(result).toBe(basicMonthlyHelpdeskPlan)
    })

    it('should return undefined if the currentPrice is not provided', () => {
        const result = getCorrespondingPlanAtInterval({
            availablePlans: [basicMonthlyHelpdeskPlan, basicYearlyHelpdeskPlan],
            currentPlan: undefined,
            interval: PlanInterval.Year,
        })
        expect(result).toBeUndefined() // The currentPrice is not provided, so the result is undefined
    })
})
