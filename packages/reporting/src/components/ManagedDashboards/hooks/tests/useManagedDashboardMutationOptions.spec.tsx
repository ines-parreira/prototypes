import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
    managedDashboardKeys,
} from '../constants'
import { useManagedDashboardMutationOptions } from '../useManagedDashboardMutationOptions'

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return {
        queryClient,
        wrapper: ({ children }: { children?: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    }
}

describe('useManagedDashboardMutationOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('onSuccess', () => {
        it('invalidates the dashboard list query', () => {
            const { queryClient, wrapper } = makeWrapper()
            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            const { result } = renderHook(
                () => useManagedDashboardMutationOptions(),
                { wrapper },
            )

            act(() => {
                result.current.onSuccess()
            })

            expect(invalidateSpy).toHaveBeenCalledWith(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
            )
        })

        it('shows a success toast by default', async () => {
            const { wrapper } = makeWrapper()
            const { result } = renderHook(
                () => useManagedDashboardMutationOptions(),
                { wrapper },
            )

            act(() => {
                result.current.onSuccess()
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('does not show a toast when silent is true', () => {
            const { wrapper } = makeWrapper()
            const { result } = renderHook(
                () => useManagedDashboardMutationOptions({ silent: true }),
                { wrapper },
            )

            act(() => {
                result.current.onSuccess()
            })

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })

    describe('onError', () => {
        it('shows the API error message in a destructive toast', async () => {
            const { wrapper } = makeWrapper()
            const { result } = renderHook(
                () => useManagedDashboardMutationOptions(),
                { wrapper },
            )

            const apiError = {
                response: { data: { error: { msg: 'Boom from API' } } },
            }
            act(() => {
                result.current.onError(apiError)
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Boom from API',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('falls back to the generic error message for unknown errors', async () => {
            const { wrapper } = makeWrapper()
            const { result } = renderHook(
                () => useManagedDashboardMutationOptions(),
                { wrapper },
            )

            act(() => {
                result.current.onError(new Error('network down'))
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('still shows the error toast even when silent is true', async () => {
            const { wrapper } = makeWrapper()
            const { result } = renderHook(
                () => useManagedDashboardMutationOptions({ silent: true }),
                { wrapper },
            )

            act(() => {
                result.current.onError(new Error('network down'))
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
