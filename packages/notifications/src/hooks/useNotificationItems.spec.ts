import type { FeedItem, FeedStoreState } from '@knocklabs/client'
import { useKnockFeed } from '@knocklabs/react'
import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'

import type { RawNotification } from '../types'
import { useNotificationItems } from './useNotificationItems'

vi.mock('@knocklabs/react', () => ({ useKnockFeed: vi.fn() }))

const makeFeedItem = (
    overrides: Partial<FeedItem<RawNotification>> = {},
): FeedItem<RawNotification> =>
    ({
        id: 'item-1',
        inserted_at: '2024-01-01T12:00:00Z',
        read_at: null,
        seen_at: null,
        data: {
            type: 'ticket-message.created',
            payload: { ticketId: 42 },
        } as unknown as RawNotification,
        ...overrides,
    }) as FeedItem<RawNotification>

const setupFeed = (rawItems: FeedItem<RawNotification>[] = []) => {
    const markAllAsRead = vi.fn()
    const markAsRead = vi.fn()
    const fetchNextPage = vi.fn()
    const useFeedStore = vi.fn((fn: (state: FeedStoreState) => unknown) =>
        fn({ items: rawItems } as unknown as FeedStoreState),
    )

    vi.mocked(useKnockFeed).mockReturnValue({
        feedClient: { markAllAsRead, markAsRead, fetchNextPage },
        useFeedStore,
    } as unknown as ReturnType<typeof useKnockFeed>)

    return { markAllAsRead, markAsRead, fetchNextPage }
}

describe('useNotificationItems', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('maps raw feed items into notification items', () => {
        setupFeed([
            makeFeedItem({ id: 'item-1', inserted_at: '2024-01-01T12:00:00Z' }),
        ])

        const { result } = renderHook(() => useNotificationItems())

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]).toMatchObject({
            id: 'item-1',
            title: 'ticket-message.created',
            createdDatetime: '2024-01-01T12:00:00Z',
            readDatetime: null,
        })
    })

    it('filters out items that cannot be transformed', () => {
        setupFeed([
            makeFeedItem({ id: 'item-1' }),
            makeFeedItem({ id: 'item-2', data: null }),
        ])

        const { result } = renderHook(() => useNotificationItems())

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0].id).toBe('item-1')
    })

    it('calls feedClient.markAllAsRead when markAllAsRead is invoked', () => {
        const { markAllAsRead } = setupFeed()

        const { result } = renderHook(() => useNotificationItems())
        act(() => result.current.markAllAsRead())

        expect(markAllAsRead).toHaveBeenCalledTimes(1)
    })

    it('calls feedClient.fetchNextPage when fetchNextPage is invoked', () => {
        const { fetchNextPage } = setupFeed()

        const { result } = renderHook(() => useNotificationItems())
        act(() => result.current.fetchNextPage())

        expect(fetchNextPage).toHaveBeenCalledTimes(1)
    })

    it('marks the matching item as read and calls onNotificationClick on item onClick', () => {
        const rawItem = makeFeedItem({ id: 'item-1' })
        const { markAsRead } = setupFeed([rawItem])
        const onNotificationClick = vi.fn()

        const { result } = renderHook(() =>
            useNotificationItems(onNotificationClick),
        )

        act(() => result.current.items[0].onClick?.())

        expect(markAsRead).toHaveBeenCalledWith(rawItem)
        expect(onNotificationClick).toHaveBeenCalledTimes(1)
    })
})
