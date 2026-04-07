import { assumeMock } from '@repo/testing'
import { act, renderHook } from '@testing-library/react'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import { ProductType } from 'models/billing/types'
import { payingWithCreditCard } from 'pages/settings/new_billing/fixtures'

import { useApplyInternalPlanChanges } from './useApplyInternalPlanChanges'
import type { ResolvedPlan } from './useInternalPlanEditor'

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('models/billing/queries')

const mockDispatch = jest.fn()
const mockMutateAsync = jest.fn()

const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseUpdateInternalSubscription = assumeMock(
    useUpdateInternalSubscription,
)

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

const resolvedPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: proMonthlyHelpdeskPlan,
        currentPlan: basicMonthlyHelpdeskPlan,
        status: 'upgraded',
    }),
    makeResolved({
        productType: ProductType.Voice,
        plan: null,
        currentPlan: voicePlan0,
        status: 'removed',
    }),
]

beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppDispatch.mockReturnValue(mockDispatch)
    mockUseUpdateInternalSubscription.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isLoading: false,
    } as any)
    mockMutateAsync.mockResolvedValue({ products: {} })
})

describe('useApplyInternalPlanChanges', () => {
    it('builds correct payload with new_plans, resource_version, and invoice.generate=true', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockMutateAsync).toHaveBeenCalledWith({
            current_resource_version:
                payingWithCreditCard.subscription.resource_version,
            new_plans: {
                [ProductType.Helpdesk]: proMonthlyHelpdeskPlan.plan_id,
            },
            invoice: { generate: true },
        })
    })

    it('sends invoice.generate=false when applying without invoice', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(false))

        expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                invoice: { generate: false },
            }),
        )
    })

    it('omits removed products from new_plans', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        const payload = mockMutateAsync.mock.calls[0][0]
        expect(payload.new_plans).not.toHaveProperty(ProductType.Voice)
    })

    it('dispatches success toast and navigates on success', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining('internal'),
        )
    })

    it('dispatches error toast and does not navigate on failure', async () => {
        mockMutateAsync.mockRejectedValue(new Error('update failed'))
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockDispatch).toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('exposes isSubmitting from mutation state', () => {
        mockUseUpdateInternalSubscription.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        expect(result.current.isSubmitting).toBe(true)
    })

    it('does nothing when billingState is undefined', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(undefined, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })
})
