import {
    clearViewsCountV3,
    getLastFetchAllAtV3,
    markViewAsViewedV3,
    setLastFetchAllAtV3,
    viewsCountStoreV3,
} from '../viewsCountStoreV3'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

beforeEach(() => {
    clearViewsCountV3()
})

describe('markViewAsViewedV3', () => {
    it('stamps a viewedAt timestamp on the recent map', () => {
        markViewAsViewedV3(1)

        const entry = viewsCountStoreV3.getState().recent[1]
        expect(entry).toBeDefined()
        expect(entry?.viewedAt).toEqual(expect.any(String))
    })

    it('overwrites the viewedAt timestamp on a subsequent activation', () => {
        vi.useFakeTimers()
        try {
            vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
            markViewAsViewedV3(1)
            const first = viewsCountStoreV3.getState().recent[1]?.viewedAt

            vi.setSystemTime(new Date('2025-01-01T00:00:01.000Z'))
            markViewAsViewedV3(1)
            const second = viewsCountStoreV3.getState().recent[1]?.viewedAt

            expect(second).not.toBe(first)
        } finally {
            vi.useRealTimers()
        }
    })
})

describe('lastFetchAllAt', () => {
    it('defaults to null', () => {
        expect(getLastFetchAllAtV3()).toBeNull()
    })

    it('round-trips through the setter', () => {
        setLastFetchAllAtV3('2025-01-15T10:00:00.000Z')

        expect(getLastFetchAllAtV3()).toBe('2025-01-15T10:00:00.000Z')
    })

    it('is reset by clearViewsCountV3', () => {
        setLastFetchAllAtV3('2025-01-15T10:00:00.000Z')

        clearViewsCountV3()

        expect(getLastFetchAllAtV3()).toBeNull()
    })
})
