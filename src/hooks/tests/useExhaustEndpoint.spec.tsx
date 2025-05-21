import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { useExhaustEndpoint } from '../useExhaustEndpoint'

function createWrapper() {
    const queryClient = new QueryClient()
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useExhaustEndpoint', () => {
    it('fetches and flattens paginated data', async () => {
        const mockFetch = jest
            .fn()
            .mockResolvedValueOnce({
                data: {
                    data: [{ id: 1 }, { id: 2 }],
                    meta: { next_cursor: 'cursor-2' },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: [{ id: 3 }],
                    meta: { next_cursor: null },
                },
            })

        const { result } = renderHook(
            () => useExhaustEndpoint(['test'], (cursor) => mockFetch(cursor)),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })

    it('returns empty array while loading', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
            data: {
                data: [],
                meta: { next_cursor: null },
            },
        })

        const { result } = renderHook(
            () =>
                useExhaustEndpoint(['test-empty'], (cursor) => {
                    return mockFetch(cursor)
                }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual([])
    })
})
