import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import {
    act,
    renderHook as renderHookPrimitive,
    waitFor,
} from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewItemsUpdatesHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-queries'

import { useRefreshStaleTickets } from '../useRefreshStaleTickets'

const viewId = 123
const OLD_DATETIME = '2024-01-01T10:00:00.000Z'
const NEW_DATETIME = '2024-01-02T10:00:00.000Z'

const mockTicket1 = mockTicket({ id: 1, updated_datetime: OLD_DATETIME })
const mockTicket2 = mockTicket({ id: 2, updated_datetime: OLD_DATETIME })

const mockNoUpdates = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: {},
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockNoUpdates.handler)
})

afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
})

afterAll(() => {
    server.close()
})

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: Infinity,
                staleTime: 0,
            },
        },
    })
}

function makeWrapper(queryClient: QueryClient) {
    return ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)
}

function seedViewListCache(queryClient: QueryClient, tickets: Ticket[]) {
    queryClient.setQueryData<InfiniteData<{ data: Ticket[]; meta: object }>>(
        queryKeys.views.listViewItems(viewId, undefined),
        {
            pages: [
                {
                    data: tickets,
                    meta: {
                        next_items: null,
                        prev_items: null,
                        current_cursor: null,
                    },
                },
            ],
            pageParams: [undefined],
        },
    )
}

function seedTicketCache(queryClient: QueryClient, ticket: Ticket) {
    queryClient.setQueryData(queryKeys.tickets.getTicket(ticket.id), {
        data: ticket,
    })
}

function renderHook(queryClient: QueryClient) {
    return renderHookPrimitive(
        () =>
            useRefreshStaleTickets({
                viewId,
                params: undefined,
                upToCursor: undefined,
                enabled: true,
            }),
        { wrapper: makeWrapper(queryClient) },
    )
}

describe('useRefreshStaleTickets', () => {
    it('should not run queries when disabled', () => {
        const queryClient = createQueryClient()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        renderHookPrimitive(
            () =>
                useRefreshStaleTickets({
                    viewId,
                    params: undefined,
                    upToCursor: undefined,
                    enabled: false,
                }),
            { wrapper: makeWrapper(queryClient) },
        )

        expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it.each([
        {
            scenario: 'updates list is empty',
            cachedTickets: [mockTicket1, mockTicket2],
            updates: [] as Array<{
                id?: number
                updated_datetime?: string | null
                customer: {}
            }>,
        },
        {
            scenario: 'update timestamp is not newer than cached data',
            cachedTickets: [mockTicket1],
            updates: [{ id: 1, updated_datetime: OLD_DATETIME, customer: {} }],
        },
        {
            scenario: 'no cache entry exists for the view',
            cachedTickets: [] as Ticket[],
            updates: [{ id: 1, updated_datetime: NEW_DATETIME, customer: {} }],
        },
        {
            scenario: 'update items have no id',
            cachedTickets: [mockTicket1],
            updates: [{ updated_datetime: NEW_DATETIME, customer: {} }],
        },
        {
            scenario: 'update has null updated_datetime',
            cachedTickets: [mockTicket1],
            updates: [{ id: 1, updated_datetime: null, customer: {} }],
        },
        {
            scenario:
                'cached ticket is absent from updates but its updated_datetime is older than all returned updates',
            cachedTickets: [
                mockTicket({ id: 1, updated_datetime: OLD_DATETIME }),
                mockTicket({ id: 2, updated_datetime: NEW_DATETIME }),
            ],
            // ticket 1 is absent but OLD_DATETIME < NEW_DATETIME (the oldest
            // returned updated_datetime), so it does not meet the removal threshold
            updates: [{ id: 2, updated_datetime: NEW_DATETIME, customer: {} }],
        },
    ])(
        'should not invalidate when $scenario',
        async ({ cachedTickets, updates }) => {
            const queryClient = createQueryClient()
            if (cachedTickets.length > 0) {
                seedViewListCache(queryClient, cachedTickets)
            }

            const handler = mockListViewItemsUpdatesHandler(async () =>
                HttpResponse.json({
                    data: updates,
                    meta: {},
                }),
            )
            const waitForRequest = handler.waitForRequest(server)
            server.use(handler.handler)

            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            renderHook(queryClient)

            await act(() => waitForRequest(() => {}))

            expect(invalidateSpy).not.toHaveBeenCalled()
        },
    )

    describe('surgical per-page invalidation for stale tickets', () => {
        it('should call invalidateQueries with refetchPage when a ticket is stale', async () => {
            const queryClient = createQueryClient()
            seedViewListCache(queryClient, [mockTicket1, mockTicket2])
            seedTicketCache(queryClient, mockTicket1)

            server.use(
                mockListViewItemsUpdatesHandler(async () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 1,
                                updated_datetime: NEW_DATETIME,
                                customer: {},
                            },
                        ],
                        meta: {},
                    }),
                ).handler,
            )

            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            renderHook(queryClient)

            await waitFor(() => {
                expect(invalidateSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        queryKey: queryKeys.views.listViewItems(
                            viewId,
                            undefined,
                        ),
                        refetchPage: expect.any(Function),
                    }),
                )
            })
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: queryKeys.tickets.getTicket(1),
            })
        })

        it('should only refetch pages containing the stale ticket', async () => {
            const queryClient = createQueryClient()
            seedViewListCache(queryClient, [mockTicket1, mockTicket2])

            server.use(
                mockListViewItemsUpdatesHandler(async () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 1,
                                updated_datetime: NEW_DATETIME,
                                customer: {},
                            },
                        ],
                        meta: {},
                    }),
                ).handler,
            )

            let capturedRefetchPage:
                | ((page: { data: Array<{ id?: number }> }) => boolean)
                | undefined

            vi.spyOn(queryClient, 'invalidateQueries').mockImplementation(
                async (filters: any) => {
                    capturedRefetchPage = filters?.refetchPage
                },
            )

            renderHook(queryClient)

            await waitFor(() => {
                expect(capturedRefetchPage).toBeDefined()
            })

            expect(capturedRefetchPage?.({ data: [{ id: 1 }] })).toBe(true)
            expect(capturedRefetchPage?.({ data: [{ id: 2 }] })).toBe(false)
            expect(
                capturedRefetchPage?.({ data: [{ id: 1 }, { id: 2 }] }),
            ).toBe(true)
            expect(
                capturedRefetchPage?.({ data: [{ id: 3 }, { id: 4 }] }),
            ).toBe(false)
        })
    })

    describe('full invalidation for structural changes', () => {
        it('should do a full invalidate when a new ticket enters the view', async () => {
            const queryClient = createQueryClient()
            seedViewListCache(queryClient, [mockTicket1])

            server.use(
                mockListViewItemsUpdatesHandler(async () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 99,
                                updated_datetime: NEW_DATETIME,
                                customer: {},
                            },
                        ],
                        meta: {},
                    }),
                ).handler,
            )

            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            renderHook(queryClient)

            await waitFor(() => {
                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: queryKeys.views.listViewItems(viewId, undefined),
                })
            })
        })

        it('should do a full invalidate when a cached ticket has left the view', async () => {
            const ticket1 = mockTicket({
                id: 1,
                updated_datetime: NEW_DATETIME,
            })
            const ticket2 = mockTicket({
                id: 2,
                updated_datetime: NEW_DATETIME,
            })
            const queryClient = createQueryClient()
            seedViewListCache(queryClient, [ticket1, ticket2])

            // ticket2 is absent from updates but its timestamp is >= the oldest
            // timestamp returned, so it should have appeared — it left the view
            server.use(
                mockListViewItemsUpdatesHandler(async () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 1,
                                updated_datetime: NEW_DATETIME,
                                customer: {},
                            },
                        ],
                        meta: {},
                    }),
                ).handler,
            )

            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            renderHook(queryClient)

            await waitFor(() => {
                expect(invalidateSpy).toHaveBeenCalledWith({
                    queryKey: queryKeys.views.listViewItems(viewId, undefined),
                })
            })
        })

        it('should skip removal detection when cache exceeds the API result limit', async () => {
            const manyTickets = Array.from({ length: 301 }, (_, i) => ({
                ...mockTicket1,
                id: i + 1,
                updated_datetime: NEW_DATETIME,
            }))
            const queryClient = createQueryClient()
            seedViewListCache(queryClient, manyTickets)

            // Only ticket 1 returned — the 300 absent tickets would normally
            // trigger removal detection, but the cache is over the API limit
            server.use(
                mockListViewItemsUpdatesHandler(async () =>
                    HttpResponse.json({
                        data: [
                            {
                                id: 1,
                                updated_datetime: NEW_DATETIME,
                                customer: {},
                            },
                        ],
                        meta: {},
                    }),
                ).handler,
            )

            const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

            renderHook(queryClient)

            await waitFor(() => {
                expect(
                    queryClient.getQueryState(
                        queryKeys.views.listViewItemsUpdates(viewId, {
                            order_by: undefined,
                            up_to_cursor: undefined,
                        }),
                    )?.status,
                ).toBe('success')
            })

            await act(async () => {})

            expect(invalidateSpy).not.toHaveBeenCalled()
        })
    })
})
