import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useSubscription } from 'models/billing/queries'

import useProductCancellations from '../useProductCancellations'

jest.mock('models/billing/queries', () => ({
    ...jest.requireActual('models/billing/queries'),
    useSubscription: jest.fn(),
}))

const mockUseSubscription = useSubscription as jest.MockedFunction<
    typeof useSubscription
>

describe('useProductCancellations', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should return empty Map when subscription has no cancellations', () => {
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: '2025-01-31T23:59:59Z',
                downgrades: [
                    {
                        current_plan_id: 'plan-change-1',
                        scheduled_plan: 'new-plan-123',
                    },
                ],
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useProductCancellations(), {
            wrapper,
        })

        expect(result.current.data).toBeInstanceOf(Map)
        expect(result.current.data?.size).toBe(0)
    })

    it('should map cancellations and filter out plan changes', () => {
        const endDate = '2025-01-31T23:59:59Z'
        mockUseSubscription.mockReturnValue({
            data: {
                current_billing_cycle_end_datetime: endDate,
                downgrades: [
                    {
                        current_plan_id: 'plan-cancel-1',
                        scheduled_plan: null,
                    },
                    {
                        current_plan_id: 'plan-change-1',
                        scheduled_plan: 'new-plan-123',
                    },
                    {
                        current_plan_id: 'plan-cancel-2',
                        scheduled_plan: null,
                    },
                ],
            },
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useProductCancellations(), {
            wrapper,
        })

        expect(result.current.data?.size).toBe(2)
        expect(result.current.data?.get('plan-cancel-1')).toBe(endDate)
        expect(result.current.data?.get('plan-cancel-2')).toBe(endDate)
        expect(result.current.data?.has('plan-change-1')).toBe(false)
    })
})
