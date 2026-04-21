import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewItemsHandler,
    mockTicketCompact,
} from '@gorgias/helpdesk-mocks'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'
import type {
    ListViewItemsUpdatesOrderBy as ListViewItemsUpdatesOrderByType,
    TicketCompact,
} from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import * as useSortOrderModule from '../../ticket-list/hooks/useSortOrder'
import { useTicketsList } from '../../ticket-list/hooks/useTicketsList'
import { useCachedTicketViewNavigation } from '../useCachedTicketViewNavigation'

const VIEW_ID = 1

const ticketsBySortOrder: Partial<
    Record<ListViewItemsUpdatesOrderByType, TicketCompact[]>
> = {
    [ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc]: [
        mockTicketCompact({ id: 122 }),
        mockTicketCompact({ id: 123 }),
        mockTicketCompact({ id: 124 }),
    ],
    [ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc]: [
        mockTicketCompact({ id: 224 }),
        mockTicketCompact({ id: 123 }),
        mockTicketCompact({ id: 222 }),
    ],
    [ListViewItemsUpdatesOrderBy.CreatedDatetimeAsc]: [],
    [ListViewItemsUpdatesOrderBy.CreatedDatetimeDesc]: [],
}

const mockListViewItems = mockListViewItemsHandler(async ({ request }) => {
    const url = new URL(request.url)
    const orderBy =
        (url.searchParams.get('order_by') as ListViewItemsUpdatesOrderByType) ??
        ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc

    return HttpResponse.json({
        data: ticketsBySortOrder[orderBy] ?? [],
        meta: {
            current_cursor: null,
            next_items: null,
            prev_items: null,
        },
        object: 'list',
        uri: `/api/views/${VIEW_ID}/items/`,
    } as any)
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    ticketsBySortOrder[ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc] = [
        mockTicketCompact({ id: 122 }),
        mockTicketCompact({ id: 123 }),
        mockTicketCompact({ id: 124 }),
    ]
    ticketsBySortOrder[ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc] = [
        mockTicketCompact({ id: 224 }),
        mockTicketCompact({ id: 123 }),
        mockTicketCompact({ id: 222 }),
    ]
    server.use(mockListViewItems.handler)
    vi.spyOn(useSortOrderModule, 'useSortOrder').mockReturnValue([
        ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        vi.fn(),
    ])
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function useHooks({
    ticketId,
    viewId,
    orderBy,
}: {
    ticketId?: number
    viewId?: number
    orderBy?: ListViewItemsUpdatesOrderByType
}) {
    const effectiveViewId = viewId ?? 0
    const list = useTicketsList(effectiveViewId, {
        enabled: viewId != null,
        enableStaleUpdates: false,
        params: orderBy ? { order_by: orderBy } : undefined,
    })
    const navigation = useCachedTicketViewNavigation({
        viewId,
        ticketId,
    })

    return { list, navigation }
}

describe('useCachedTicketViewNavigation', () => {
    it('returns undefined when not in a view context', () => {
        const { result } = renderHook(() => useCachedTicketViewNavigation({}), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        expect(result.current).toBeUndefined()
    })

    it('derives previous and next ticket ids from the loaded tickets list', async () => {
        const { result } = renderHook(() =>
            useHooks({
                viewId: VIEW_ID,
                ticketId: 123,
                orderBy: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            }),
        )

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
            expect(result.current.navigation).toMatchObject({
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                isPreviousEnabled: true,
                isNextEnabled: true,
            })
        })
    })

    it('returns undefined when the loaded tickets list does not contain the ticket', async () => {
        ticketsBySortOrder[ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc] =
            [mockTicketCompact({ id: 122 }), mockTicketCompact({ id: 124 })]

        const { result } = renderHook(() =>
            useHooks({
                viewId: VIEW_ID,
                ticketId: 123,
                orderBy: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            }),
        )

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
            expect(result.current.navigation).toBeUndefined()
        })
    })

    it('updates when the sort-order-specific query changes after mount', async () => {
        const sortOrderState: {
            current: ListViewItemsUpdatesOrderByType
        } = {
            current: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        }

        vi.spyOn(useSortOrderModule, 'useSortOrder').mockImplementation(() => [
            sortOrderState.current,
            vi.fn(),
        ])

        const { result, rerender } = renderHook(() =>
            useHooks({
                viewId: VIEW_ID,
                ticketId: 123,
                orderBy: sortOrderState.current,
            }),
        )

        await waitFor(() => {
            expect(result.current.navigation).toMatchObject({
                previousTicketId: 122,
                nextTicketId: 124,
            })
        })

        sortOrderState.current =
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc
        rerender()

        await waitFor(() => {
            expect(result.current.navigation).toMatchObject({
                previousTicketId: 224,
                nextTicketId: 222,
            })
        })
    })

    it('reacts to refetched query data without mounting a second tickets list hook', async () => {
        ticketsBySortOrder[ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc] =
            [mockTicketCompact({ id: 123 }), mockTicketCompact({ id: 124 })]

        const { result } = renderHook(() =>
            useHooks({
                viewId: VIEW_ID,
                ticketId: 123,
                orderBy: ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
            }),
        )

        await waitFor(() => {
            expect(result.current.navigation).toMatchObject({
                previousTicketId: undefined,
                nextTicketId: 124,
                isPreviousEnabled: false,
                isNextEnabled: true,
            })
        })

        ticketsBySortOrder[ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc] =
            [
                mockTicketCompact({ id: 122 }),
                mockTicketCompact({ id: 123 }),
                mockTicketCompact({ id: 124 }),
            ]

        await act(async () => {
            await result.current.list.refetch()
        })

        await waitFor(() => {
            expect(result.current.navigation).toMatchObject({
                previousTicketId: 122,
                nextTicketId: 124,
                isPreviousEnabled: true,
                isNextEnabled: true,
            })
        })
    })
})
