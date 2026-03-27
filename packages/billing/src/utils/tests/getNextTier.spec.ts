import { Cadence, ProductType } from '../../types'
import { getNextTier } from '../getNextTier'

describe('getNextTier', () => {
    const convertPlan1 = {
        product: ProductType.Convert,
        num_quota_tickets: 100,
        amount: 1000,
        currency: 'usd',
        custom: false,
        extra_ticket_cost: 0,
        plan_id: 'convert-1-monthly',
        cadence: Cadence.Month,
        invoice_cadence: 'month',
        name: 'Starter',
        public: true,
        tier: 1,
    } as const
    const convertPlan2 = {
        ...convertPlan1,
        num_quota_tickets: 200,
        amount: 2000,
        plan_id: 'convert-2-monthly',
        tier: 2,
    }
    const convertPlan3 = {
        ...convertPlan1,
        num_quota_tickets: 300,
        amount: 3000,
        plan_id: 'convert-3-monthly',
        tier: 3,
    }

    it.each([
        [convertPlan1, convertPlan2],
        [convertPlan2, convertPlan3],
        [convertPlan3, undefined],
    ])('should return next tier from list', (input, output) => {
        const result = getNextTier(
            [convertPlan1, convertPlan2, convertPlan3],
            input,
        )
        expect(result).toBe(output)
    })
})
