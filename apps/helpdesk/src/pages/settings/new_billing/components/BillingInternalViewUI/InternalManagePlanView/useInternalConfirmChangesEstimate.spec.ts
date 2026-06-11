import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetBillingInternalEstimatesSubscriptionHandler,
    mockGetBillingInternalEstimatesSubscriptionResponse,
} from '@gorgias/helpdesk-mocks'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { useInternalConfirmChangesEstimate } from './useInternalConfirmChangesEstimate'
import type { ResolvedPlan } from './useInternalPlanEditor'

let estimateRequests: URL[] = []

const estimateHandler = mockGetBillingInternalEstimatesSubscriptionHandler(
    async ({ request }) => {
        estimateRequests.push(new URL(request.url))

        return HttpResponse.json(
            mockGetBillingInternalEstimatesSubscriptionResponse({
                balance_due: 2500,
            }),
        )
    },
)

const server = setupServer(estimateHandler.handler)

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
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        estimateRequests = []
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('disables query when modal is closed', async () => {
        renderHook(() =>
            useInternalConfirmChangesEstimate(false, defaultPlans, 123),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(0)
        })
    })

    it('disables query when helpdesk has no resolved plan', async () => {
        const noHelpdeskPlans: ResolvedPlan[] = [
            makeResolved({ productType: ProductType.Helpdesk }),
            ...defaultPlans.slice(1),
        ]

        renderHook(() =>
            useInternalConfirmChangesEstimate(true, noHelpdeskPlans, 123),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(0)
        })
    })

    it('enables query and builds params from resolved plans', async () => {
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

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })

        const params = estimateRequests[0].searchParams
        expect(params.get('new_helpdesk_plan_id')).toBe(
            proMonthlyHelpdeskPlan.plan_id,
        )
        expect(params.get('new_automate_plan_id')).toBe(
            basicMonthlyAutomationPlan.plan_id,
        )
        expect(params.has('new_voice_plan_id')).toBe(false)
        expect(params.has('new_sms_plan_id')).toBe(false)
        expect(params.has('new_convert_plan_id')).toBe(false)
        expect(params.get('subscription_resource_version')).toBe('456')
    })

    it('omits plan id for products marked as removed', async () => {
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

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })

        expect(estimateRequests[0].searchParams.has('new_voice_plan_id')).toBe(
            false,
        )
    })

    it('passes subscription_renewal_ramp_resource_version when provided', async () => {
        renderHook(() =>
            useInternalConfirmChangesEstimate(true, defaultPlans, 100, 200),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })

        const params = estimateRequests[0].searchParams
        expect(params.get('subscription_resource_version')).toBe('100')
        expect(params.get('subscription_renewal_ramp_resource_version')).toBe(
            '200',
        )
    })

    it('unwraps response body and converts balance_due from cents via select', async () => {
        const { result } = renderHook(() =>
            useInternalConfirmChangesEstimate(true, defaultPlans, 100),
        )

        await waitFor(() => {
            expect(result.current.data?.balance_due).toBe(25)
        })
    })

    it('keeps null balance_due unchanged', async () => {
        server.use(
            mockGetBillingInternalEstimatesSubscriptionHandler(async () =>
                HttpResponse.json(
                    mockGetBillingInternalEstimatesSubscriptionResponse({
                        balance_due: null,
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() =>
            useInternalConfirmChangesEstimate(true, defaultPlans, 101),
        )

        await waitFor(() => {
            expect(result.current.data?.balance_due).toBeNull()
        })
    })
})
