import type { Query } from '@tanstack/react-query'

import {
    clearPersistedQueryCache,
    createLocalForageStorage,
    shouldPersistQuery,
} from '../queryPersister'

const { mockGetItem, mockSetItem, mockRemoveItem } = vi.hoisted(() => ({
    mockGetItem: vi.fn(),
    mockSetItem: vi.fn(),
    mockRemoveItem: vi.fn(),
}))

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: mockGetItem,
            setItem: mockSetItem,
            removeItem: mockRemoveItem,
        })),
    },
}))

function createMockQuery(
    overrides: Partial<{
        status: string
        cacheTime: number
        queryKey: unknown[]
    }> = {},
) {
    return {
        state: { status: overrides.status ?? 'success' },
        options: { cacheTime: overrides.cacheTime ?? undefined },
        queryKey: overrides.queryKey ?? ['views', 'listViews'],
    } as unknown as Query
}

describe('shouldPersistQuery', () => {
    it('returns true for successful view queries', () => {
        expect(shouldPersistQuery(createMockQuery())).toBe(true)
    })

    it('returns true for non-item view queries', () => {
        expect(
            shouldPersistQuery(
                createMockQuery({ queryKey: ['views', 'getView', 1] }),
            ),
        ).toBe(true)
    })

    it('returns false for listViewItems queries', () => {
        expect(
            shouldPersistQuery(
                createMockQuery({ queryKey: ['views', 'listViewItems', 5] }),
            ),
        ).toBe(false)
    })

    it('returns false for non-view queries', () => {
        expect(
            shouldPersistQuery(
                createMockQuery({ queryKey: ['tickets', 'list'] }),
            ),
        ).toBe(false)
        expect(
            shouldPersistQuery(
                createMockQuery({ queryKey: ['macros', 'getMacro', 1] }),
            ),
        ).toBe(false)
    })

    it('returns false for queries that are not successful', () => {
        expect(shouldPersistQuery(createMockQuery({ status: 'loading' }))).toBe(
            false,
        )
        expect(shouldPersistQuery(createMockQuery({ status: 'error' }))).toBe(
            false,
        )
    })

    it('returns false for queries with cacheTime 0', () => {
        expect(shouldPersistQuery(createMockQuery({ cacheTime: 0 }))).toBe(
            false,
        )
    })

    it('returns true for view queries with a non-zero cacheTime', () => {
        expect(shouldPersistQuery(createMockQuery({ cacheTime: 60000 }))).toBe(
            true,
        )
    })
})

describe('createLocalForageStorage', () => {
    const storage = createLocalForageStorage()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getItem', () => {
        it('returns the stored value', async () => {
            mockGetItem.mockResolvedValue('cached-data')

            const result = await storage.getItem('key')

            expect(result).toBe('cached-data')
            expect(mockGetItem).toHaveBeenCalledWith('key')
        })

        it('returns null when no data is stored', async () => {
            mockGetItem.mockResolvedValue(null)

            const result = await storage.getItem('key')

            expect(result).toBeNull()
        })

        it('returns null on read failure', async () => {
            mockGetItem.mockRejectedValue(new Error('IDB unavailable'))

            const result = await storage.getItem('key')

            expect(result).toBeNull()
        })
    })

    describe('setItem', () => {
        it('writes to IndexedDB', async () => {
            mockSetItem.mockResolvedValue('value')

            await storage.setItem('key', 'value')

            expect(mockSetItem).toHaveBeenCalledWith('key', 'value')
        })

        it('silently handles write failures', async () => {
            mockSetItem.mockRejectedValue(new Error('quota exceeded'))

            await expect(storage.setItem('key', 'value')).resolves.not.toThrow()
        })
    })

    describe('removeItem', () => {
        it('deletes from IndexedDB', async () => {
            mockRemoveItem.mockResolvedValue(undefined)

            await storage.removeItem('key')

            expect(mockRemoveItem).toHaveBeenCalledWith('key')
        })

        it('silently handles delete failures', async () => {
            mockRemoveItem.mockRejectedValue(new Error('IDB unavailable'))

            await expect(storage.removeItem('key')).resolves.not.toThrow()
        })
    })
})

describe('clearPersistedQueryCache', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('deletes the cache from IndexedDB', async () => {
        mockRemoveItem.mockResolvedValue(undefined)

        await clearPersistedQueryCache()

        expect(mockRemoveItem).toHaveBeenCalledTimes(1)
    })

    it('silently handles failures', async () => {
        mockRemoveItem.mockRejectedValue(new Error('IDB unavailable'))

        await expect(clearPersistedQueryCache()).resolves.not.toThrow()
    })
})
