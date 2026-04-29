import { useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTicketHandler,
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'
import { queryKeys, useGetTicket } from '@gorgias/helpdesk-queries'
import type {
    ListViewItems200,
    ListViewItemsUpdates200,
    Ticket,
} from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { getNextCursorFromMeta } from '../../utils/cursors'
import { useRefreshStaleTickets } from '../useRefreshStaleTickets'
import { useTicketsList } from '../useTicketsList'

const viewId = 123
const ROOT_CURSOR = '__root__'
const NO_CURSOR = '__undefined__'
const NEXT_CURSOR = 'cursor-1'
const OLD_DATETIME = '2024-01-01T10:00:00.000Z'
const NEW_DATETIME = '2024-01-02T10:00:00.000Z'

const ticket1 = mockTicket({ id: 1, updated_datetime: OLD_DATETIME })
const ticket2 = mockTicket({ id: 2, updated_datetime: OLD_DATETIME })
const ticket3 = mockTicket({ id: 3, updated_datetime: OLD_DATETIME })

type UpdatesItem = {
    id?: number
    updated_datetime: string | null
    customer: object
}

type ListPageConfig = {
    tickets: Ticket[]
    nextCursor: string | null
}

type HarnessProps = {
    enabled?: boolean
    loadList?: boolean
    observeTicketId?: number
    overrideUpToCursor?: string
}

let listPages = new Map<string, ListPageConfig>()
let updatesData: UpdatesItem[] = []
let listRequestCounts = new Map<string, number>()
let updatesRequestCounts = new Map<string, number>()
let ticketRequestCounts = new Map<number, number>()
let ticketResponses = new Map<number, Ticket>()

function incrementMapCount<T>(map: Map<T, number>, key: T) {
    map.set(key, (map.get(key) ?? 0) + 1)
}

function createListPageResponse(cursor: string | null) {
    const page = listPages.get(cursor ?? ROOT_CURSOR) ?? {
        tickets: [],
        nextCursor: null,
    }

    return HttpResponse.json<ListViewItems200>({
        data: page.tickets as unknown as ListViewItems200['data'],
        meta: {
            current_cursor: cursor ?? undefined,
            next_items: page.nextCursor
                ? `/api/views/${viewId}/items/?cursor=${page.nextCursor}`
                : undefined,
            prev_items: undefined,
        },
    })
}

function setSinglePageList(
    tickets: Ticket[],
    options?: {
        nextCursor?: string | null
    },
) {
    listPages = new Map([
        [
            ROOT_CURSOR,
            {
                tickets,
                nextCursor: options?.nextCursor ?? null,
            },
        ],
    ])
}

function setTwoPageList(firstPage: Ticket[], secondPage: Ticket[]) {
    listPages = new Map([
        [
            ROOT_CURSOR,
            {
                tickets: firstPage,
                nextCursor: NEXT_CURSOR,
            },
        ],
        [
            NEXT_CURSOR,
            {
                tickets: secondPage,
                nextCursor: null,
            },
        ],
    ])
}

function getListRequestCount(cursor?: string | null) {
    return listRequestCounts.get(cursor ?? ROOT_CURSOR) ?? 0
}

function getUpdatesRequestCount(upToCursor?: string) {
    return updatesRequestCounts.get(upToCursor ?? NO_CURSOR) ?? 0
}

function getTicketRequestCount(ticketId: number) {
    return ticketRequestCounts.get(ticketId) ?? 0
}

function makeUpdateItem(
    ticket: Ticket,
    updatedDatetime = ticket.updated_datetime,
): UpdatesItem {
    return {
        id: ticket.id,
        updated_datetime: updatedDatetime,
        customer: {},
    }
}

const mockListViewItems = mockListViewItemsHandler(async ({ request }) => {
    const cursor = new URL(request.url).searchParams.get('cursor')
    incrementMapCount(listRequestCounts, cursor ?? ROOT_CURSOR)

    return createListPageResponse(cursor)
})

const mockListViewItemsUpdates = mockListViewItemsUpdatesHandler(
    async ({ request }) => {
        const upToCursor =
            new URL(request.url).searchParams.get('up_to_cursor') ?? NO_CURSOR
        incrementMapCount(updatesRequestCounts, upToCursor)

        return HttpResponse.json<ListViewItemsUpdates200>({
            data: updatesData as unknown as ListViewItemsUpdates200['data'],
            meta: {},
        })
    },
)

const mockGetTicket = mockGetTicketHandler(async ({ params }) => {
    const id = Number(params?.id)
    incrementMapCount(ticketRequestCounts, id)

    return HttpResponse.json(ticketResponses.get(id) ?? mockTicket({ id }))
})

const server = setupServer()

function useRefreshHarness({
    enabled = true,
    loadList = true,
    observeTicketId,
    overrideUpToCursor,
}: HarnessProps = {}) {
    const list = useTicketsList(viewId, {
        enabled: loadList,
        enableStaleUpdates: false,
    })
    const observedTicket = useGetTicket(observeTicketId ?? 0, undefined, {
        query: {
            enabled: observeTicketId != null,
        },
    })
    const upToCursor = useMemo(() => {
        if (overrideUpToCursor !== undefined) {
            return overrideUpToCursor
        }

        const pages = list.data?.pages
        if (!pages?.length) return undefined

        return getNextCursorFromMeta(pages[pages.length - 1]?.meta)
    }, [list.data, overrideUpToCursor])

    useRefreshStaleTickets({
        viewId,
        params: undefined,
        upToCursor,
        enabled: enabled && (!loadList || !list.isLoading),
    })

    const queryClient = useQueryClient()

    return {
        list,
        observedTicket,
        upToCursor,
        listCache: queryClient.getQueryData<
            InfiniteData<{
                data: Ticket[]
                meta?: { next_items?: string | null }
            }>
        >(queryKeys.views.listViewItems(viewId, undefined)),
        updatesStatus: queryClient.getQueryState(
            queryKeys.views.listViewItemsUpdates(viewId, {
                order_by: undefined,
                up_to_cursor: upToCursor,
            }),
        )?.status,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    listRequestCounts = new Map()
    updatesRequestCounts = new Map()
    ticketRequestCounts = new Map()
    ticketResponses = new Map([
        [ticket1.id, ticket1],
        [ticket2.id, ticket2],
        [ticket3.id, ticket3],
    ])
    updatesData = []
    setSinglePageList([ticket1, ticket2])

    server.use(
        mockListViewItems.handler,
        mockListViewItemsUpdates.handler,
        mockGetTicket.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useRefreshStaleTickets', () => {
    it('does not request updates when disabled', async () => {
        const { result } = renderHook(() =>
            useRefreshHarness({
                enabled: false,
            }),
        )

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
        })

        expect(getUpdatesRequestCount()).toBe(0)
        expect(result.current.list.tickets.map((ticket) => ticket.id)).toEqual([
            1, 2,
        ])
    })

    it('keeps the cached list unchanged when the update timestamp is not newer than cached data', async () => {
        setSinglePageList([ticket1])
        updatesData = [makeUpdateItem(ticket1, OLD_DATETIME)]

        const { result } = renderHook(() => useRefreshHarness())

        await waitFor(() => {
            expect(result.current.updatesStatus).toBe('success')
        })

        expect(
            result.current.listCache?.pages[0]?.data.map((ticket) => ticket.id),
        ).toEqual([1])
        expect(getListRequestCount()).toBe(1)
    })

    it('keeps the cached list unchanged when the update timestamp is null', async () => {
        setSinglePageList([ticket1])
        updatesData = [
            {
                id: ticket1.id,
                updated_datetime: null,
                customer: {},
            },
        ]

        const { result } = renderHook(() => useRefreshHarness())

        await waitFor(() => {
            expect(result.current.updatesStatus).toBe('success')
        })

        expect(
            result.current.listCache?.pages[0]?.data.map((ticket) => ticket.id),
        ).toEqual([1])
        expect(getListRequestCount()).toBe(1)
    })

    it('is a no-op when no list cache exists', async () => {
        updatesData = [makeUpdateItem(ticket1, NEW_DATETIME)]

        const { result } = renderHook(() =>
            useRefreshHarness({
                loadList: false,
            }),
        )

        await waitFor(() => {
            expect(result.current.updatesStatus).toBe('success')
        })

        expect(result.current.listCache).toBeUndefined()
        expect(getListRequestCount()).toBe(0)
    })

    it('refetches the authoritative list when updates returns no items', async () => {
        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
            },
        })

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2])
        })

        const initialRootRequests = getListRequestCount()

        rerender({
            enabled: true,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2])
        })
    })

    it('refetches only the stale page and active ticket query', async () => {
        setTwoPageList([ticket1, ticket2], [ticket3])
        updatesData = [
            makeUpdateItem(ticket1, NEW_DATETIME),
            makeUpdateItem(ticket2, OLD_DATETIME),
            makeUpdateItem(ticket3, OLD_DATETIME),
        ]

        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
                observeTicketId: ticket1.id,
            },
        })

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
            expect(result.current.observedTicket.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.list.fetchNextPage()
        })

        await waitFor(() => {
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2, 3])
        })

        const initialRootRequests = getListRequestCount()
        const initialSecondPageRequests = getListRequestCount(NEXT_CURSOR)
        const initialTicketRequests = getTicketRequestCount(ticket1.id)

        rerender({
            enabled: true,
            observeTicketId: ticket1.id,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(getListRequestCount(NEXT_CURSOR)).toBe(
                initialSecondPageRequests,
            )
            expect(getTicketRequestCount(ticket1.id)).toBeGreaterThan(
                initialTicketRequests,
            )
        })
    })

    it('refetches only the first page when a new ticket enters the first cached page', async () => {
        setTwoPageList([ticket1, ticket2], [ticket3])
        updatesData = [
            makeUpdateItem(ticket1),
            {
                id: 99,
                updated_datetime: NEW_DATETIME,
                customer: {},
            },
            makeUpdateItem(ticket2),
            makeUpdateItem(ticket3),
        ]

        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
            },
        })

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.list.fetchNextPage()
        })

        await waitFor(() => {
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2, 3])
        })

        const initialRootRequests = getListRequestCount()
        const initialSecondPageRequests = getListRequestCount(NEXT_CURSOR)

        rerender({
            enabled: true,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(getListRequestCount(NEXT_CURSOR)).toBe(
                initialSecondPageRequests,
            )
        })
    })

    it('refetches all loaded pages when a new ticket enters after the first cached page', async () => {
        setTwoPageList([ticket1, ticket2], [ticket3])
        updatesData = [
            makeUpdateItem(ticket1),
            makeUpdateItem(ticket2),
            {
                id: 99,
                updated_datetime: NEW_DATETIME,
                customer: {},
            },
            makeUpdateItem(ticket3),
        ]

        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
            },
        })

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.list.fetchNextPage()
        })

        const initialRootRequests = getListRequestCount()
        const initialSecondPageRequests = getListRequestCount(NEXT_CURSOR)

        rerender({
            enabled: true,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(getListRequestCount(NEXT_CURSOR)).toBeGreaterThan(
                initialSecondPageRequests,
            )
        })
    })

    it('refetches the authoritative list when cached tickets are no longer in the covered updates window', async () => {
        const currentTicket1 = mockTicket({
            id: ticket1.id,
            updated_datetime: NEW_DATETIME,
        })
        const currentTicket2 = mockTicket({
            id: ticket2.id,
            updated_datetime: NEW_DATETIME,
        })

        setSinglePageList([currentTicket1, currentTicket2])

        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
            },
        })

        await waitFor(() => {
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2])
        })

        setSinglePageList([currentTicket1])
        updatesData = [makeUpdateItem(currentTicket1)]

        const initialRootRequests = getListRequestCount()

        rerender({
            enabled: true,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1])
        })
    })

    it('prefers a full authoritative refetch when updates include both insertions and removals', async () => {
        const insertedTicket = mockTicket({
            id: 99,
            updated_datetime: NEW_DATETIME,
        })

        setTwoPageList([ticket1, ticket2], [ticket3])
        updatesData = [
            makeUpdateItem(ticket1),
            makeUpdateItem(ticket2),
            makeUpdateItem(ticket3),
        ]

        const { result, rerender } = renderHook(useRefreshHarness, {
            initialProps: {
                enabled: false,
            },
        })

        await waitFor(() => {
            expect(result.current.list.isLoading).toBe(false)
        })

        await act(async () => {
            await result.current.list.fetchNextPage()
        })

        await waitFor(() => {
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2, 3])
        })

        setTwoPageList([ticket1, insertedTicket], [ticket3])
        updatesData = [
            makeUpdateItem(ticket1),
            makeUpdateItem(insertedTicket),
            makeUpdateItem(ticket3),
        ]

        const initialRootRequests = getListRequestCount()
        const initialSecondPageRequests = getListRequestCount(NEXT_CURSOR)

        rerender({
            enabled: true,
        })

        await waitFor(() => {
            expect(getListRequestCount()).toBeGreaterThan(initialRootRequests)
            expect(getListRequestCount(NEXT_CURSOR)).toBeGreaterThan(
                initialSecondPageRequests,
            )
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 99, 3])
        })
    })

    it('does not trim the cached list when the updates cursor no longer matches the loaded window', async () => {
        setSinglePageList([ticket1, ticket2], {
            nextCursor: 'newer-cursor',
        })
        updatesData = [makeUpdateItem(ticket1, NEW_DATETIME)]

        const { result } = renderHook(() =>
            useRefreshHarness({
                overrideUpToCursor: 'older-cursor',
            }),
        )

        await waitFor(() => {
            expect(result.current.updatesStatus).toBe('success')
        })

        await waitFor(() => {
            expect(
                result.current.list.tickets.map((ticket) => ticket.id),
            ).toEqual([1, 2])
        })
    })
})
