import { AutomatePlan } from 'models/billing/types'

import { getCollapsedSectionName } from '../utils'

describe('getCollapsedSectionName', () => {
    const createAutomatePlan = (generation?: number): AutomatePlan => ({
        product: 'automation' as any,
        num_quota_tickets: 100,
        amount: 50,
        currency: 'USD',
        custom: false,
        extra_ticket_cost: 1,
        plan_id: 'test-plan',
        cadence: 'month' as any,
        name: 'Test Plan',
        price_id: 'price_test',
        public: true,
        generation,
        features: {} as any,
    })

    describe('when store has or had a trial', () => {
        it('should return "Get started" with automate plan', () => {
            const automatePlan = createAutomatePlan(5)
            const result = getCollapsedSectionName(true, automatePlan)
            expect(result).toBe('Get started')
        })

        it('should return "Get started" without automate plan', () => {
            const result = getCollapsedSectionName(true, undefined)
            expect(result).toBe('Get started')
        })
    })

    describe('when store has automate plan generation 6 or higher', () => {
        it('should return "Get started" for generation 6', () => {
            const automatePlan = createAutomatePlan(6)
            const result = getCollapsedSectionName(false, automatePlan)
            expect(result).toBe('Get started')
        })

        it('should return "Get started" for generation 7', () => {
            const automatePlan = createAutomatePlan(7)
            const result = getCollapsedSectionName(false, automatePlan)
            expect(result).toBe('Get started')
        })
    })

    describe('when store has no automate plan', () => {
        it('should return "Try for free"', () => {
            const result = getCollapsedSectionName(false, undefined)
            expect(result).toBe('Try for free')
        })
    })

    describe('when store has automate plan but no trial', () => {
        it('should return "Try for 14 days" for generation below 6', () => {
            const automatePlan = createAutomatePlan(5)
            const result = getCollapsedSectionName(false, automatePlan)
            expect(result).toBe('Try for 14 days')
        })

        it('should return "Try for 14 days" when generation is undefined', () => {
            const automatePlan = createAutomatePlan(undefined)
            const result = getCollapsedSectionName(false, automatePlan)
            expect(result).toBe('Try for 14 days')
        })
    })
})
