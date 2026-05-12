import type { FeedStoreState } from '@knocklabs/client'
import { useKnockFeed } from '@knocklabs/react'
import { renderHook } from '@repo/testing/vitest'

import { useUnreadCount } from './useUnreadCount'

vi.mock('@knocklabs/react', () => ({ useKnockFeed: vi.fn() }))

describe('useUnreadCount', () => {
    let fetch: ReturnType<typeof vi.fn>
    let useFeedStore: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetch = vi.fn()
        useFeedStore = vi.fn((fn: (state: FeedStoreState) => number) =>
            fn({ metadata: { unread_count: 0 } } as FeedStoreState),
        )

        vi.mocked(useKnockFeed).mockReturnValue({
            feedClient: { fetch },
            useFeedStore,
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    it('returns the unread count from the store', () => {
        useFeedStore = vi.fn((fn: (state: FeedStoreState) => number) =>
            fn({ metadata: { unread_count: 3 } } as FeedStoreState),
        )
        vi.mocked(useKnockFeed).mockReturnValue({
            feedClient: { fetch },
            useFeedStore,
        } as unknown as ReturnType<typeof useKnockFeed>)

        const { result } = renderHook(() => useUnreadCount())

        expect(result.current).toBe(3)
    })

    it('always fetches the feed on first render regardless of unread count', () => {
        renderHook(() => useUnreadCount())

        expect(fetch).toHaveBeenCalledWith()
    })

    it('fetches the feed even when the unread count is already non-zero', () => {
        useFeedStore = vi.fn((fn: (state: FeedStoreState) => number) =>
            fn({ metadata: { unread_count: 5 } } as FeedStoreState),
        )
        vi.mocked(useKnockFeed).mockReturnValue({
            feedClient: { fetch },
            useFeedStore,
        } as unknown as ReturnType<typeof useKnockFeed>)

        renderHook(() => useUnreadCount())

        expect(fetch).toHaveBeenCalledWith()
    })
})
