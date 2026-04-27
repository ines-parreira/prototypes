import { renderHook } from '@repo/testing'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { useInternalConfirmChangesEstimate } from './useInternalConfirmChangesEstimate'
import type { ResolvedPlan } from './useInternalPlanEditor'

const mockUseGetBillingInternalEstimatesSubscription = jest.fn()
jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetBillingInternalEstimatesSubscription: (...args: unknown[]) =>
        mockUseGetBillingInternalEstimatesSubscription(...args),
}))

function makeResolved(
    overrides: Partial<ResolvedPlan> & { productType: ProductType },
): ResolvedPlan {
    return {
        plan: null,
        currentPlan: null,
        status: 'unchanged',
        action: null,
        ...overrides,
    }
}

const defaultPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: basicMonthlyHelpdeskPlan,
        currentPlan: basicMonthlyHelpdeskPlan,
    }),
    makeResolved({ productType: ProductType.Automation }),
    makeResolved({ productType: ProductType.Voice }),
    makeResolved({ productType: ProductType.SMS }),
    makeResolved({ productType: ProductType.Convert }),
]

describe('useInternalConfirmChangesEstimate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGetBillingInternalEstimatesSubscription.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })
    })

    it('disables query when modal is closed', () => {
        renderHook(() =>
            useInternalConfirmChangesEstimate(false, defaultPlans, 123),
        )

        expect(
            mockUseGetBillingInternalEstimatesSubscription,
        ).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('disables query when helpdesk has no resolved plan', () => {
        const noHelpdeskPlans: ResolvedPlan[] = [
            makeResolved({ productType: ProductType.Helpdesk }),
            ...defaultPlans.slice(1),
        ]

        renderHook(() =>
            useInternalConfirmChangesEstimate(true, noHelpdeskPlans, 123),
        )

        expect(
            mockUseGetBillingInternalEstimatesSubscription,
        ).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('enables query and builds params from resolved plans', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
            makeResolved({
                productType: ProductType.Automation,
                plan: basicMonthlyAutomationPlan,
                currentPlan: basicMonthlyAutomationPlan,
            }),
            makeResolved({ productType: ProductType.Voice }),
            makeResolved({ productType: ProductType.SMS }),
            makeResolved({ productType: ProductType.Convert }),
        ]

        renderHook(() => useInternalConfirmChangesEstimate(true, plans, 456))

        const [params, options] =
            mockUseGetBillingInternalEstimatesSubscription.mock.calls[0]
        expect(params).toEqual(
            expect.objectContaining({
                new_helpdesk_plan_id: proMonthlyHelpdeskPlan.plan_id,
                new_automate_plan_id: basicMonthlyAutomationPlan.plan_id,
                new_voice_plan_id: undefined,
                new_sms_plan_id: undefined,
                new_convert_plan_id: undefined,
                subscription_resource_version: 456,
            }),
        )
        expect(options).toEqual(
            expect.objectContaining({
                query: expect.objectContaining({ enabled: true }),
            }),
        )
    })

    it('omits plan id for products marked as removed', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
            makeResolved({
                productType: ProductType.Voice,
                plan: voicePlan0,
                currentPlan: voicePlan0,
                status: 'removed',
            }),
            makeResolved({ productType: ProductType.Automation }),
            makeResolved({ productType: ProductType.SMS }),
            makeResolved({ productType: ProductType.Convert }),
        ]

        renderHook(() => useInternalConfirmChangesEstimate(true, plans, 456))

        const [params] =
            mockUseGetBillingInternalEstimatesSubscription.mock.calls[0]
        expect(params.new_voice_plan_id).toBeUndefined()
    })

    it('passes subscription_renewal_ramp_resource_version when provided', () => {
        renderHook(() =>
            useInternalConfirmChangesEstimate(true, defaultPlans, 100, 200),
        )

        const [params] =
            mockUseGetBillingInternalEstimatesSubscription.mock.calls[0]
        expect(params.subscription_resource_version).toBe(100)
        expect(params.subscription_renewal_ramp_resource_version).toBe(200)
    })

    it('unwraps response body and converts balance_due from cents via select', () => {
        renderHook(() =>
            useInternalConfirmChangesEstimate(true, defaultPlans, 100),
        )

        const [, options] =
            mockUseGetBillingInternalEstimatesSubscription.mock.calls[0]
        const { select } = options.query

        expect(select({ data: { balance_due: 2500 } })).toEqual({
            balance_due: 25,
        })
        expect(select({ data: { balance_due: null } })).toEqual({
            balance_due: null,
        })
    })
})
