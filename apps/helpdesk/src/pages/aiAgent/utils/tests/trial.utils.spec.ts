import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type { AutomatePlan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { AccountFeature } from 'state/currentAccount/types'

import { hasAutomatePlanAboveGen6 } from '../trial.utils'

const createMockAutomatePlan = (generation?: number): AutomatePlan => ({
    product: ProductType.Automation,
    num_quota_tickets: 100,
    amount: 1000,
    currency: 'USD',
    custom: false,
    extra_ticket_cost: 10,
    plan_id: 'test-plan',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Test Automate Plan',
    public: true,
    generation,
    features: {
        [AccountFeature.AutomationTrackOrderFlow]: { enabled: true },
        [AccountFeature.AutomationReportIssueFlow]: { enabled: true },
        [AccountFeature.AutomationCancellationsFlow]: { enabled: true },
        [AccountFeature.AutomationReturnFlow]: { enabled: true },
        [AccountFeature.AutomationSelfServiceStatistics]: { enabled: true },
        [AccountFeature.AutomationManagedRules]: { enabled: true },
    },
})

describe('trial.utils', () => {
    describe('hasAutomatePlanAboveGen6', () => {
        describe('returns true for generation 6 and above', () => {
            test.each([
                [6, 'exactly generation 6'],
                [7, 'generation 7'],
                [100, 'generation 100'],
            ])(
                'should return true when generation is %i (%s)',
                (generation) => {
                    const plan = createMockAutomatePlan(generation)

                    expect(hasAutomatePlanAboveGen6(plan)).toBe(true)
                },
            )
        })

        describe('returns false for generation below 6', () => {
            test.each([
                [4, 'generation 4'],
                [5, 'generation 5 (just below boundary)'],
            ])(
                'should return false when generation is %i (%s)',
                (generation) => {
                    const plan = createMockAutomatePlan(generation)

                    expect(hasAutomatePlanAboveGen6(plan)).toBe(false)
                },
            )
        })

        describe('edge cases', () => {
            it('should return false when automate plan is undefined', () => {
                expect(hasAutomatePlanAboveGen6(undefined)).toBe(false)
            })

            it('should return false when generation is undefined', () => {
                const plan = createMockAutomatePlan(undefined)

                expect(hasAutomatePlanAboveGen6(plan)).toBe(false)
            })

            it('should return false when generation property is missing', () => {
                const plan = createMockAutomatePlan()
                delete plan.generation

                expect(hasAutomatePlanAboveGen6(plan)).toBe(false)
            })
        })
    })
})
