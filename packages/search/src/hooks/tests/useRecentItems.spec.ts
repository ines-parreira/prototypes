import { localForageManager } from '@repo/browser-storage'
import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'

import { useRecentItems } from '../useRecentItems'

const browserStorageMocks = vi.hoisted(() => {
    let storedItems: Record<string, unknown> = {}

    const table = {
        ready: vi.fn(async () => {}),
        getItems: vi.fn(async () => storedItems),
        length: vi.fn(async () => Object.keys(storedItems).length),
        iterate: vi.fn(
            async (callback: (value: unknown, key: string) => unknown) => {
                for (const [key, value] of Object.entries(storedItems)) {
                    const result = callback(value, key)
                    if (result !== undefined) {
                        return result
                    }
                }

                return undefined
            },
        ),
        setItem: vi.fn(async (key: string, value: unknown) => {
            storedItems[key] = value
        }),
        removeItem: vi.fn(async (key: string) => {
            delete storedItems[key]
        }),
        keys: vi.fn(async () => Object.keys(storedItems)),
        removeItems: vi.fn(async (keys: string[]) => {
            keys.forEach((key) => {
                delete storedItems[key]
            })
        }),
    }

    return {
        getStoredItems: () => storedItems,
        observeTable: vi.fn(() => ({
            unsubscribe: vi.fn(),
        })),
        resetStoredItems: (items: Record<string, unknown>) => {
            storedItems = items
        },
        table,
    }
})

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => browserStorageMocks.table),
        observeTable: browserStorageMocks.observeTable,
    },
}))

describe('useRecentItems', () => {
    beforeEach(() => {
        browserStorageMocks.resetStoredItems({})
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('loads recent items newest-first and dedupes by id', async () => {
        browserStorageMocks.resetStoredItems({
            '1': { id: 1, label: 'older' },
            '3': { id: 1, label: 'newer' },
            '2': { id: 2, label: 'second' },
        })

        const { result } = renderHook(() =>
            useRecentItems<{ id: number; label: string }>('recent-tickets'),
        )

        await waitFor(() => {
            expect(result.current.isGettingItems).toBe(false)
        })

        expect(result.current.items).toEqual([
            { id: 1, label: 'newer' },
            { id: 2, label: 'second' },
        ])
        expect(localForageManager.observeTable).toHaveBeenCalled()
    })

    it('writes new recent items after the debounce and reloads them', async () => {
        vi.useFakeTimers()

        const { result } = renderHook(() =>
            useRecentItems<{ id: number; label: string }>('recent-tickets'),
        )

        await act(async () => {
            result.current.setRecentItem({ id: 5, label: 'fresh' })
            await vi.advanceTimersByTimeAsync(300)
        })

        expect(browserStorageMocks.table.setItem).toHaveBeenCalled()

        expect(
            Object.values(browserStorageMocks.getStoredItems()),
        ).toContainEqual({
            id: 5,
            label: 'fresh',
        })
    })

    it('removes the oldest stored item when the max is reached', async () => {
        browserStorageMocks.resetStoredItems({
            '1': { id: 1, label: 'oldest' },
            '2': { id: 2, label: 'newest' },
        })

        const { result } = renderHook(() =>
            useRecentItems<{ id: number; label: string }>('recent-tickets', 2),
        )

        await waitFor(() => {
            expect(result.current.isGettingItems).toBe(false)
        })

        vi.useFakeTimers()

        await act(async () => {
            result.current.setRecentItem({ id: 3, label: 'latest' })
            await vi.advanceTimersByTimeAsync(300)
        })

        expect(browserStorageMocks.table.removeItems).toHaveBeenCalledWith([
            '1',
        ])
    })
})
