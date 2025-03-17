import type { FeedStoreState } from '@knocklabs/client'
import { useKnockFeed } from '@knocklabs/react'
import { renderHook } from '@testing-library/react-hooks'

import { assumeMock } from 'utils/testing'

import useCount from '../useCount'

jest.mock('@knocklabs/react', () => ({ useKnockFeed: jest.fn() }))
const useKnockFeedMock = assumeMock(useKnockFeed)

describe('useCount', () => {
    let fetch: jest.Mock
    let useFeedStore: jest.Mock

    beforeEach(() => {
        fetch = jest.fn()
        useFeedStore = jest.fn(() => 0)

        useKnockFeedMock.mockReturnValue({
            feedClient: { fetch },
            useFeedStore,
        } as unknown as ReturnType<typeof useKnockFeed>)
    })

    it('should return the unread count from the store', () => {
        useFeedStore = jest.fn((fn: (state: FeedStoreState) => number) =>
            fn({ metadata: { unread_count: 3 } } as FeedStoreState),
        )
        useKnockFeedMock.mockReturnValue({
            feedClient: { fetch },
            useFeedStore,
        } as unknown as ReturnType<typeof useKnockFeed>)
        const { result } = renderHook(() => useCount())
        expect(result.current).toBe(3)
    })

    it('should fetch the feed if the unread count is 0 on first render', () => {
        renderHook(() => useCount())
        expect(fetch).toHaveBeenCalledWith()
    })
})
