import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    type AutomatePlan,
    Cadence,
    type HelpdeskPlan,
    HelpdeskPlanTier,
    ProductType,
} from '../../types'
import { getCorrespondingPlanAtCadence } from '../getCorrespondingPlanAtCadence'

describe('getCorrespondingPlanAtInterval', () => {
    const basicMonthlyHelpdeskPlan: HelpdeskPlan = {
        product: ProductType.Helpdesk,
        num_quota_tickets: 100,
        amount: 1000,
        currency: 'usd',
        custom: false,
        extra_ticket_cost: 0,
        plan_id: 'basic-monthly',
        cadence: Cadence.Month,
        invoice_cadence: InvoiceCadence.Month,
        name: 'Basic',
        public: true,
        integrations: 1,
        is_legacy: false,
        features: {} as never,
        tier: HelpdeskPlanTier.BASIC,
    }
    const basicYearlyHelpdeskPlan: HelpdeskPlan = {
        ...basicMonthlyHelpdeskPlan,
        plan_id: 'basic-yearly',
        cadence: Cadence.Year,
    }
    const basicYearlyHelpdeskPlan2: HelpdeskPlan = {
        ...basicMonthlyHelpdeskPlan,
        plan_id: 'basic-annual',
        cadence: Cadence.Year,
    }
    const legacyAutomatePlan: AutomatePlan = {
        product: ProductType.Automation,
        num_quota_tickets: 0,
        amount: 1000,
        currency: 'usd',
        custom: false,
        extra_ticket_cost: 0,
        plan_id: 'legacy-automation',
        cadence: Cadence.Month,
        invoice_cadence: InvoiceCadence.Month,
        name: 'Legacy',
        public: true,
        features: {} as never,
    }

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
        expect(result).toBeUndefined()
    })
})
