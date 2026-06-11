import type { PlansByProduct, SelectedPlans } from '@repo/billing'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetBillingEstimatesSubscriptionHandler,
    mockGetBillingEstimatesSubscriptionResponse,
} from '@gorgias/helpdesk-mocks'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import type { ConfirmChangesModalProps } from '../ConfirmChangesModal'
import { useConfirmChangesEstimate } from '../useConfirmChangesEstimate'

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'MidCycleUpgradeBillingLogic',
    },
    useFlag: (...args: unknown[]) => mockUseFlag(...args),
}))

const estimateRequests: URL[] = []
const server = setupServer(
    mockGetBillingEstimatesSubscriptionHandler(async ({ request }) => {
        estimateRequests.push(new URL(request.url))

        return HttpResponse.json(mockGetBillingEstimatesSubscriptionResponse())
    }).handler,
)

const baseSelectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
    },
    [ProductType.Automation]: { isSelected: false },
    [ProductType.Voice]: { isSelected: false },
    [ProductType.SMS]: { isSelected: false },
    [ProductType.Convert]: { isSelected: false },
}

const basePlansByProduct: ConfirmChangesModalProps['plansByProduct'] = {
    [ProductType.Helpdesk]: {
        current: basicMonthlyHelpdeskPlan,
        available: [basicMonthlyHelpdeskPlan, proMonthlyHelpdeskPlan],
    },
    [ProductType.Automation]: {
        available: [basicMonthlyAutomationPlan],
    },
    [ProductType.Voice]: { available: [voicePlan1] },
    [ProductType.SMS]: { available: [smsPlan1] },
    [ProductType.Convert]: { available: [convertPlan1] },
}

describe('useConfirmChangesEstimate', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        estimateRequests.length = 0
        mockUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('disables query when modal is closed', () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                false,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        expect(estimateRequests).toHaveLength(0)
    })

    it('disables query when feature flag is off', () => {
        mockUseFlag.mockReturnValue(false)

        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        expect(estimateRequests).toHaveLength(0)
    })

    it('sends current plan IDs for products the user has not changed', async () => {
        const selectedPlans: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Automation]: {
                plan: basicMonthlyAutomationPlan,
                isSelected: true,
            },
        }
        const plansByProduct: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Automation]: {
                current: basicMonthlyAutomationPlan,
                available: [basicMonthlyAutomationPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, selectedPlans, plansByProduct, 456),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })
        const params = estimateRequests[0].searchParams
        expect(params.get('new_helpdesk_plan_id')).toBe(
            basicMonthlyHelpdeskPlan.plan_id,
        )
        expect(params.get('new_automate_plan_id')).toBe(
            basicMonthlyAutomationPlan.plan_id,
        )
    })

    it('omits plan ID when a product is deselected (removal)', async () => {
        const selectedPlans: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Automation]: {
                plan: basicMonthlyAutomationPlan,
                isSelected: false,
            },
        }
        const plansByProduct: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Automation]: {
                current: basicMonthlyAutomationPlan,
                available: [basicMonthlyAutomationPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, selectedPlans, plansByProduct, 456),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })
        expect(
            estimateRequests[0].searchParams.has('new_automate_plan_id'),
        ).toBe(false)
    })

    it('sends selected plan ID when user has changed a product', async () => {
        const plansWithUpgrade: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                plansWithUpgrade,
                basePlansByProduct,
                456,
            ),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })
        expect(
            estimateRequests[0].searchParams.get('new_helpdesk_plan_id'),
        ).toBe(proMonthlyHelpdeskPlan.plan_id)
    })

    it('passes subscription_renewal_ramp_resource_version when provided', async () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                100,
                200,
            ),
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

    it('passes reactivate=true when reactivate is true', async () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
                undefined,
                true,
            ),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })
        expect(estimateRequests[0].searchParams.get('reactivate')).toBe('true')
    })

    it('omits reactivate from params when not provided', async () => {
        renderHook(() =>
            useConfirmChangesEstimate(
                true,
                baseSelectedPlans,
                basePlansByProduct,
                123,
            ),
        )

        await waitFor(() => {
            expect(estimateRequests).toHaveLength(1)
        })
        expect(estimateRequests[0].searchParams.has('reactivate')).toBe(false)
    })

    it('disables query when helpdesk has no current plan and no selection', () => {
        const noHelpdeskPlan: SelectedPlans = {
            ...baseSelectedPlans,
            [ProductType.Helpdesk]: { isSelected: false },
        }
        const noCurrent: PlansByProduct = {
            ...basePlansByProduct,
            [ProductType.Helpdesk]: {
                available: [basicMonthlyHelpdeskPlan],
            },
        }

        renderHook(() =>
            useConfirmChangesEstimate(true, noHelpdeskPlan, noCurrent, 123),
        )

        expect(estimateRequests).toHaveLength(0)
    })
})
