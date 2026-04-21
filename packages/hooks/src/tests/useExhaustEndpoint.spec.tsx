import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'

import { useExhaustEndpoint } from '../useExhaustEndpoint'

describe('useExhaustEndpoint', () => {
    it('fetches and flattens paginated data', async () => {
        const mockFetch = vi
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

        const { result } = renderHook(() =>
            useExhaustEndpoint(['test'], (cursor) => mockFetch(cursor)),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })

    it('returns empty array while loading', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            data: {
                data: [],
                meta: { next_cursor: null },
            },
        })

        const { result } = renderHook(() =>
            useExhaustEndpoint(['test-empty'], (cursor) => {
                return mockFetch(cursor)
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual([])
    })
})
