import { payingWithCreditCard } from '@repo/billing/fixtures'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import { ProductType } from 'models/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useApplyInternalPlanChanges } from './useApplyInternalPlanChanges'
import type { ResolvedPlan } from './useInternalPlanEditor'

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('models/billing/queries')
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn((payload) => ({ type: 'NOTIFY', payload })),
}))

const mockDispatch = jest.fn()
const mockMutateAsync = jest.fn()
const mockNotify = assumeMock(notify)

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

        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Success,
                message: 'Subscription updated',
            }),
        )
        expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining('internal'),
        )
    })

    it('dispatches stale-state toast with Refresh button when BE reports modified subscription', async () => {
        const staleError = {
            isAxiosError: true,
            response: {
                status: 400,
                data: {
                    error: {
                        msg: "We couldn't process your request because the subscription got modified in the meantime, please reload the page.",
                    },
                },
            },
        }
        mockMutateAsync.mockRejectedValue(staleError)
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                message:
                    'This subscription was modified since you loaded this page.',
                noAutoDismiss: true,
                showDismissButton: true,
                buttons: [
                    expect.objectContaining({
                        name: 'Refresh',
                    }),
                ],
            }),
        )
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('dispatches toast with BE error message on non-stale API failure', async () => {
        const beError = {
            isAxiosError: true,
            response: {
                status: 500,
                data: {
                    error: { msg: 'Internal server error from BE' },
                },
            },
        }
        mockMutateAsync.mockRejectedValue(beError)
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                message: 'Internal server error from BE',
            }),
        )
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('dispatches fallback toast for unknown errors', async () => {
        mockMutateAsync.mockRejectedValue(new Error('unknown'))
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                status: NotificationStatus.Error,
                message: 'Failed to update subscription. Please try again.',
            }),
        )
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
