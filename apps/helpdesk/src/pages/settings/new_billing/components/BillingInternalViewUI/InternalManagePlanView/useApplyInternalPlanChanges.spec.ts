import { payingWithCreditCard } from '@repo/billing/fixtures'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { Button, toast } from '@gorgias/axiom'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import { ProductType } from 'models/billing/types'

import { useApplyInternalPlanChanges } from './useApplyInternalPlanChanges'
import type { ResolvedPlan } from './useInternalPlanEditor'

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('models/billing/queries')
jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    toast: {
        dismiss: jest.fn(),
        error: jest.fn(),
        success: jest.fn(),
    },
}))

const mockMutateAsync = jest.fn()
const mockToastError = assumeMock(toast.error)
const mockToastSuccess = assumeMock(toast.success)

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

        expect(mockToastSuccess).toHaveBeenCalledWith('Subscription updated')
        expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining('internal'),
        )
    })

    it('shows stale-state toast with Refresh button when BE reports modified subscription', async () => {
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

        expect(mockToastError).toHaveBeenCalledWith(
            'This subscription was modified since you loaded this page.',
            expect.objectContaining({
                duration: Infinity,
                inlineActions: expect.objectContaining({
                    props: expect.objectContaining({
                        children: 'Refresh',
                        size: 'sm',
                        variant: 'tertiary',
                    }),
                    type: Button,
                }),
            }),
        )
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows toast with BE error message on non-stale API failure', async () => {
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

        expect(mockToastError).toHaveBeenCalledWith(
            'Internal server error from BE',
            expect.objectContaining({
                duration: Infinity,
            }),
        )
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows fallback toast for unknown errors', async () => {
        mockMutateAsync.mockRejectedValue(new Error('unknown'))
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        expect(mockToastError).toHaveBeenCalledWith(
            'Failed to update subscription. Please try again.',
            expect.objectContaining({
                duration: Infinity,
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

    it('sends subscription_renewal_ramp_resource_version when billing state has schedule_resource_version', async () => {
        const billingStateWithSchedule = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                schedule_resource_version: 999888777,
            },
        }

        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(
                billingStateWithSchedule,
                resolvedPlans,
            ),
        )

        await act(() => result.current.apply(true))

        expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                subscription_renewal_ramp_resource_version: 999888777,
            }),
        )
    })

    it('sends subscription_renewal_ramp_resource_version as undefined when schedule_resource_version is absent', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true))

        const payload = mockMutateAsync.mock.calls[0][0]
        expect(
            payload.subscription_renewal_ramp_resource_version,
        ).toBeUndefined()
    })

    it('sends reactivate: true in payload when reactivate flag is passed', async () => {
        const { result } = renderHook(() =>
            useApplyInternalPlanChanges(payingWithCreditCard, resolvedPlans),
        )

        await act(() => result.current.apply(true, true))

        expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({ reactivate: true }),
        )
    })
})
