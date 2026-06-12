import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockSearchTicketsHandler,
    mockSearchTicketsResponse,
} from '@gorgias/helpdesk-mocks'
import {
    ListViewItemsUpdatesOrderBy,
    SearchTicketsOrderBy,
} from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useSortOrder } from '../useSortOrder'
import { useTicketsList } from '../useTicketsList'
import { useTicketTableData } from '../useTicketTableData'

vi.mock('../useSortOrder', () => ({
    useSortOrder: vi.fn(),
}))

vi.mock('../useTicketsList', () => ({
    useTicketsList: vi.fn(),
}))

const useSortOrderMock = vi.mocked(useSortOrder)
const useTicketsListMock = vi.mocked(useTicketsList)

const persistedRefetchMock = vi.fn()
const fetchNextPageMock = vi.fn()
const setSortOrderMock = vi.fn()

type SearchTicketsRequest = {
    search: string
    filters: string
    cursor: string | null
    limit: string | null
    orderBy: string | null
    withHighlights: string | null
    trackTotalHits: string | null
}

type SearchTicketsMockResponse = {
    data?: unknown[]
    meta?: Record<string, unknown>
    headers?: Record<string, string>
}

let searchTicketsRequests: SearchTicketsRequest[] = []
let searchTicketsResolver: (
    request: SearchTicketsRequest,
) => SearchTicketsMockResponse | Promise<SearchTicketsMockResponse> = () => ({
    data: [],
    meta: {},
})

type CallProps = Omit<
    Parameters<typeof useTicketTableData>[0],
    'pageIndex' | 'pageSize' | 'onPaginationReset'
>

type RenderHookProps = CallProps & {
    pageIndex: number
    pageSize: number
}

function renderTicketTableDataHook(
    props: CallProps,
    initial: { pageIndex?: number; pageSize?: number } = {},
) {
    const onPaginationReset = vi.fn()
    let currentProps: RenderHookProps = {
        ...props,
        pageIndex: initial.pageIndex ?? 0,
        pageSize: initial.pageSize ?? 20,
    }
    const { result, rerender: baseRerender } = renderHook(() => {
        const { pageIndex, pageSize, ...rest } = currentProps
        return useTicketTableData({
            ...rest,
            pageIndex,
            pageSize,
            onPaginationReset,
        })
    })
    const rerender = (next?: Partial<RenderHookProps>) => {
        if (next) currentProps = { ...currentProps, ...next }
        baseRerender()
    }
    return { result, rerender, onPaginationReset }
}

function expectDirtySearchQueryCalledWith(expected: Record<string, unknown>) {
    expect(searchTicketsRequests).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                search: 'vip',
                filters: 'status:open',
                ...expected,
            }),
        ]),
    )
}

function mockSearchTickets() {
    return mockSearchTicketsHandler(async ({ request }) => {
        const body = (await request.json()) as {
            search?: string
            filters?: string
        }
        const searchParams = new URL(request.url).searchParams
        const searchRequest = {
            search: body.search ?? '',
            filters: body.filters ?? '',
            cursor: searchParams.get('cursor'),
            limit: searchParams.get('limit'),
            orderBy: searchParams.get('order_by'),
            withHighlights: searchParams.get('with_highlights'),
            trackTotalHits: searchParams.get('track_total_hits'),
        }
        searchTicketsRequests.push(searchRequest)

        const response = await searchTicketsResolver(searchRequest)

        return HttpResponse.json(
            mockSearchTicketsResponse({
                data: response.data as never[],
                meta: response.meta as never,
            }),
            { headers: response.headers },
        )
    }).handler
}

function setSearchTicketsResponse(response: SearchTicketsMockResponse) {
    searchTicketsResolver = () => response
}

async function waitForSearchTicketsRequest(
    expected: Partial<SearchTicketsRequest>,
) {
    await waitFor(() => {
        expect(searchTicketsRequests).toEqual(
            expect.arrayContaining([expect.objectContaining(expected)]),
        )
    })
}

function makePersistedResult(
    overrides: Partial<ReturnType<typeof useTicketsList>> = {},
): ReturnType<typeof useTicketsList> {
    return {
        tickets: [],
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: fetchNextPageMock,
        refetch: persistedRefetchMock,
        error: null,
        data: undefined,
        ...overrides,
    }
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    persistedRefetchMock.mockReset()
    fetchNextPageMock.mockReset()
    setSortOrderMock.mockReset()
    searchTicketsRequests = []
    setSearchTicketsResponse({ data: [], meta: {} })
    server.use(mockSearchTickets())

    useSortOrderMock.mockReturnValue([
        ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        setSortOrderMock,
    ])
    useTicketsListMock.mockReturnValue(makePersistedResult())
})

afterEach(() => {
    vi.clearAllMocks()
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketTableData', () => {
    it('returns paginated persisted tickets when dirty mode is disabled', () => {
        const persistedTickets = Array.from({ length: 25 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        expect(result.current.items).toEqual(persistedTickets.slice(0, 20))
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: true,
                enableStaleUpdates: true,
            }),
        )
    })

    it('uses the search query baseline instead of persisted view items for draft views', async () => {
        setSearchTicketsResponse({
            data: [{ id: 9001 }],
            meta: {},
        })

        const { result } = renderTicketTableDataHook({
            viewId: 0,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            isDraftView: true,
            dirtyView: {
                enabled: false,
                search: '',
                filters: '',
                areFiltersValid: true,
            },
        })

        expect(useTicketsListMock).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                enabled: false,
            }),
        )
        await waitForSearchTicketsRequest({
            search: '',
            filters: '',
        })
        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 9001 }])
        })
    })

    it('returns dirty search results when the dirty filters are valid', async () => {
        const dirtyItems = [{ id: 9001 }, { id: 9002 }]

        setSearchTicketsResponse({
            data: dirtyItems,
            meta: {
                next_cursor: 'next-cursor',
                prev_cursor: null,
            },
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual(dirtyItems)
            expect(result.current.hasNextPage).toBe(true)
        })
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('selects the dirty search response into ticket data and meta', async () => {
        setSearchTicketsResponse({
            data: [{ id: 9001 }],
            meta: {
                next_cursor: 'cursor-next',
                prev_cursor: null,
            },
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 9001 }])
            expect(result.current.hasNextPage).toBe(true)
            expect(result.current.hasPreviousPage).toBe(false)
        })
    })

    it('uses the dedicated search query in search mode', async () => {
        setSearchTicketsResponse({
            data: [{ id: 42 }],
            meta: {
                next_cursor: 'search-next',
                prev_cursor: null,
                total_resources: 99,
            },
        })

        const setCursor = vi.fn()
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'hello',
                filters: '',
                cursor: undefined,
                setCursor,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 42 }])
            expect(result.current.hasNextPage).toBe(true)
            expect(result.current.totalResources).toBe(99)
        })
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
        await waitForSearchTicketsRequest({
            search: 'hello',
            filters: '',
            orderBy: SearchTicketsOrderBy.LastMessageDatetimeAsc,
            withHighlights: 'true',
            trackTotalHits: 'true',
        })
    })

    it('tracks initial search requests and responses in search mode', async () => {
        const onRequest = vi.fn()
        const onResponse = vi.fn()

        setSearchTicketsResponse({
            data: [{ id: 42 }],
            meta: {},
            headers: {
                'x-gorgias-search-engine': 'PG',
            },
        })

        const setCursor = vi.fn()
        renderHook(
            ({ searchTracking }) =>
                useTicketTableData({
                    viewId: 123,
                    pageIndex: 0,
                    pageSize: 20,
                    onPaginationReset: () => {},
                    enablePersistedUpdates: true,
                    pauseUpdates: false,
                    searchTracking,
                    searchView: {
                        enabled: true,
                        query: 'hello',
                        filters: '',
                        cursor: undefined,
                        setCursor,
                    },
                }),
            {
                initialProps: {
                    searchTracking: {
                        onRequest,
                        onResponse,
                    },
                },
            },
        )

        await waitFor(() => {
            expect(onRequest).toHaveBeenCalledWith({
                query: 'hello',
                requestTime: expect.any(Number),
            })
        })

        await waitFor(() => {
            expect(onResponse).toHaveBeenCalledWith({
                responseTime: expect.any(Number),
                numberOfResults: 1,
                searchEngine: 'PG',
            })
        })
    })

    it('treats search mode as a search-query mode and disables persisted list loading', async () => {
        renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'hello',
                filters: 'status:open',
                cursor: undefined,
                setCursor: vi.fn(),
            },
        })

        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
        await waitForSearchTicketsRequest({
            search: 'hello',
            filters: 'status:open',
        })
    })

    it('normalizes highlighted search rows from wrapped and flat search responses', async () => {
        setSearchTicketsResponse({
            data: [
                {
                    entity: {
                        id: 42,
                        subject: 'Wrapped ticket',
                    },
                    highlights: {
                        subject: ['<em>Wrapped</em> ticket'],
                    },
                },
                { foo: 'ignored' },
                { id: 43, subject: 'Flat ticket' },
            ],
            meta: {},
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'wrapped',
                filters: '',
                cursor: undefined,
                setCursor: vi.fn(),
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([
                {
                    id: 42,
                    subject: 'Wrapped ticket',
                    highlights: {
                        subject: ['<em>Wrapped</em> ticket'],
                    },
                },
                {
                    id: 43,
                    subject: 'Flat ticket',
                },
            ])
        })
        expect(result.current.totalResources).toBeUndefined()
    })

    it('treats null search total_resources as unavailable', async () => {
        setSearchTicketsResponse({
            data: [{ id: 42 }],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: null,
            },
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'hello',
                filters: '',
                cursor: undefined,
                setCursor: vi.fn(),
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 42 }])
        })
        expect(result.current.totalResources).toBeUndefined()
    })

    it('falls back to persisted items when the dirty filters are invalid', () => {
        const persistedTickets = [{ id: 1 }, { id: 2 }]

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: false,
            },
        })

        expect(result.current.items).toEqual(persistedTickets)
        expect(searchTicketsRequests).toHaveLength(0)
    })

    it('refreshes the search query when dirty results are active', async () => {
        setSearchTicketsResponse({
            data: [{ id: 10 }],
            meta: {},
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 10 }])
        })
        const requestCountBeforeRefresh = searchTicketsRequests.length

        result.current.onRefresh()

        await waitFor(() => {
            expect(searchTicketsRequests.length).toBeGreaterThan(
                requestCountBeforeRefresh,
            )
        })
        expect(persistedRefetchMock).not.toHaveBeenCalled()
    })

    it('falls back to refreshing the persisted query when dirty filters are invalid', () => {
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: false,
            },
        })

        result.current.onRefresh()

        expect(searchTicketsRequests).toHaveLength(0)
        expect(persistedRefetchMock).toHaveBeenCalled()
    })

    it('refreshes the persisted query when dirty mode is disabled', () => {
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        result.current.onRefresh()

        expect(persistedRefetchMock).toHaveBeenCalled()
        expect(searchTicketsRequests).toHaveLength(0)
    })

    it('refreshes the search query when search mode is active', async () => {
        setSearchTicketsResponse({
            data: [{ id: 42 }],
            meta: {},
        })

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'hello',
                filters: '',
                cursor: undefined,
                setCursor: vi.fn(),
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 42 }])
        })
        const requestCountBeforeRefresh = searchTicketsRequests.length

        result.current.onRefresh()

        await waitFor(() => {
            expect(searchTicketsRequests.length).toBeGreaterThan(
                requestCountBeforeRefresh,
            )
        })
        expect(persistedRefetchMock).not.toHaveBeenCalled()
    })

    it('falls back to persisted items when valid dirty filters become invalid', async () => {
        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: [{ id: 12 }] as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        setSearchTicketsResponse({
            data: [{ id: 77 }],
            meta: {},
        })

        const { result, rerender } = renderHook(
            ({
                dirtyView,
            }: {
                dirtyView: Parameters<typeof useTicketTableData>[0]['dirtyView']
            }) =>
                useTicketTableData({
                    viewId: 123,
                    pageIndex: 0,
                    pageSize: 20,
                    onPaginationReset: () => {},
                    enablePersistedUpdates: true,
                    pauseUpdates: false,
                    dirtyView,
                }),
            {
                initialProps: {
                    dirtyView: {
                        enabled: true,
                        search: 'vip',
                        filters: 'status:open',
                        areFiltersValid: true,
                    },
                },
            },
        )

        rerender({
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 77 }])
        })

        rerender({
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: false,
            },
        })

        expect(result.current.items).toEqual([{ id: 12 }])
    })

    it('resets to the first page when filters change after browsing persisted results', async () => {
        const persistedTickets = Array.from({ length: 25 }, (_, index) => ({
            id: index + 1,
        }))
        type HookProps = {
            dirtyView?: Parameters<typeof useTicketTableData>[0]['dirtyView']
        }

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        const onPaginationReset = vi.fn()
        const { result, rerender } = renderHook<
            HookProps,
            ReturnType<typeof useTicketTableData>
        >(
            ({ dirtyView }) =>
                useTicketTableData({
                    viewId: 123,
                    pageIndex: 0,
                    pageSize: 20,
                    onPaginationReset,
                    enablePersistedUpdates: true,
                    pauseUpdates: false,
                    dirtyView,
                }),
            {
                initialProps: {
                    dirtyView: undefined,
                } satisfies HookProps,
            },
        )

        // pageIndex is owned by the DataTable now — the hook only signals
        // "reset to first page" via onPaginationReset.
        act(() => {
            result.current.onPageChange('next')
        })

        setSearchTicketsResponse({
            data: [{ id: 9001 }, { id: 9002 }],
            meta: {},
        })

        const nextProps: HookProps = {
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        }

        rerender(nextProps)

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 9001 }, { id: 9002 }])
        })
        expect(onPaginationReset).toHaveBeenCalled()
    })

    it('uses dirty cursors for pagination in dirty mode', async () => {
        setSearchTicketsResponse({
            data: [{ id: 50 }],
            meta: {
                next_cursor: 'cursor-next',
                prev_cursor: 'cursor-prev',
            },
        })

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 50 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()

        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: 'cursor-next',
            }),
        )

        act(() => {
            result.current.onPageChange('previous')
        })
        rerender()

        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: 'cursor-prev',
            }),
        )
    })

    it('uses URL cursors for pagination in search mode', async () => {
        setSearchTicketsResponse({
            data: [{ id: 50 }],
            meta: {
                next_cursor: 'search-next',
                prev_cursor: 'search-prev',
            },
        })

        const setCursor = vi.fn()
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'vip',
                filters: '',
                cursor: undefined,
                setCursor,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 50 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })

        expect(setCursor).toHaveBeenCalledWith('search-next')

        act(() => {
            result.current.onPageChange('previous')
        })

        expect(setCursor).toHaveBeenCalledWith('search-prev')
    })

    it('does not advance search pagination when the next cursor is missing', async () => {
        setSearchTicketsResponse({
            data: [{ id: 50 }],
            meta: {
                next_cursor: null,
                prev_cursor: 'search-prev',
            },
        })

        const setCursor = vi.fn()
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            searchView: {
                enabled: true,
                query: 'vip',
                filters: '',
                cursor: undefined,
                setCursor,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 50 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })

        expect(setCursor).not.toHaveBeenCalled()
    })

    it('updates search rows when the cursor changes', async () => {
        searchTicketsResolver = (request) =>
            request.cursor === 'search-next'
                ? {
                      data: [{ id: 51 }],
                      meta: {
                          next_cursor: null,
                          prev_cursor: 'search-prev',
                      },
                  }
                : {
                      data: [{ id: 50 }],
                      meta: {
                          next_cursor: 'search-next',
                          prev_cursor: null,
                      },
                  }

        const setCursor = vi.fn()
        const { result, rerender } = renderHook<
            { cursor?: string },
            ReturnType<typeof useTicketTableData>
        >(
            ({ cursor }) =>
                useTicketTableData({
                    viewId: 123,
                    pageIndex: 0,
                    pageSize: 20,
                    onPaginationReset: () => {},
                    enablePersistedUpdates: true,
                    pauseUpdates: false,
                    searchView: {
                        enabled: true,
                        query: 'vip',
                        filters: '',
                        cursor,
                        setCursor,
                    },
                }),
            {
                initialProps: {
                    cursor: undefined,
                },
            },
        )

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 50 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })

        rerender({ cursor: 'search-next' })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 51 }])
        })
    })

    it('resets the search cursor when the search query changes', async () => {
        setSearchTicketsResponse({
            data: [{ id: 50 }],
            meta: {
                next_cursor: 'search-next',
            },
        })

        const setCursor = vi.fn()
        const onPaginationReset = vi.fn()
        const { result, rerender } = renderHook<
            { query: string; cursor?: string },
            ReturnType<typeof useTicketTableData>
        >(
            ({ cursor, query }) =>
                useTicketTableData({
                    viewId: 123,
                    pageIndex: 0,
                    pageSize: 20,
                    onPaginationReset,
                    enablePersistedUpdates: true,
                    pauseUpdates: false,
                    searchView: {
                        enabled: true,
                        query,
                        filters: '',
                        cursor,
                        setCursor,
                    },
                }),
            {
                initialProps: {
                    query: 'vip',
                    cursor: undefined,
                },
            },
        )

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 50 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })
        expect(setCursor).toHaveBeenCalledWith('search-next')

        rerender({
            query: 'hello',
            cursor: 'search-next',
        })

        expect(setCursor).toHaveBeenLastCalledWith(undefined)
        expect(onPaginationReset).toHaveBeenCalled()
    })

    it('fetches the next persisted page when local persisted items are exhausted', () => {
        const persistedTickets = Array.from({ length: 20 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
                hasNextPage: true,
            }),
        )

        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        act(() => {
            result.current.onPageChange('next')
        })

        expect(fetchNextPageMock).toHaveBeenCalled()
    })

    it('fetches the next persisted page when a hydrated pageIndex is outside the local cache', async () => {
        const firstPageTickets = Array.from({ length: 100 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: firstPageTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
                hasNextPage: true,
            }),
        )

        const { result } = renderTicketTableDataHook(
            {
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            },
            {
                pageIndex: 5,
                pageSize: 100,
            },
        )

        expect(result.current.items).toEqual([])
        expect(result.current.isLoading).toBe(true)
        await waitFor(() => {
            expect(fetchNextPageMock).toHaveBeenCalled()
        })
    })

    it('fetches the next persisted page when a hydrated pageIndex has a partial slice', async () => {
        const partialPageTickets = Array.from({ length: 550 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: partialPageTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
                hasNextPage: true,
            }),
        )

        const { result } = renderTicketTableDataHook(
            {
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            },
            {
                pageIndex: 5,
                pageSize: 100,
            },
        )

        expect(result.current.items).toEqual(partialPageTickets.slice(500, 600))
        expect(result.current.isLoading).toBe(true)
        await waitFor(() => {
            expect(fetchNextPageMock).toHaveBeenCalled()
        })
    })

    it('returns the next persisted slice once the DataTable advances and the new page arrives', async () => {
        const firstPageTickets = Array.from({ length: 20 }, (_, index) => ({
            id: index + 1,
        }))
        const secondPageTickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
        }))
        let hasFetchedNextPage = false

        useTicketsListMock.mockImplementation(() =>
            makePersistedResult({
                tickets: (hasFetchedNextPage
                    ? secondPageTickets
                    : firstPageTickets) as ReturnType<
                    typeof useTicketsList
                >['tickets'],
                hasNextPage: !hasFetchedNextPage,
            }),
        )

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        act(() => {
            result.current.onPageChange('next')
        })

        expect(fetchNextPageMock).toHaveBeenCalled()
        hasFetchedNextPage = true

        // Simulate the DataTable bumping its internal pageIndex via
        // table.nextPage() — the parent's mirror updates and re-runs the hook.
        rerender({
            viewId: 123,
            pageIndex: 1,
            pageSize: 20,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        await waitFor(() => {
            expect(result.current.items).toEqual(
                secondPageTickets.slice(20, 40),
            )
        })
    })

    it('returns the previous persisted slice when the DataTable goes back', () => {
        const persistedTickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        // pageIndex 0 → first slice
        expect(result.current.items).toEqual(persistedTickets.slice(0, 20))

        // DataTable advances to pageIndex 1
        rerender({
            viewId: 123,
            pageIndex: 1,
            pageSize: 20,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        expect(result.current.items).toEqual(persistedTickets.slice(20, 40))

        fetchNextPageMock.mockClear()

        act(() => {
            result.current.onPageChange('previous')
        })

        // Hook is a no-op for "previous" — DataTable owns pageIndex, no
        // extra fetch is needed for already-loaded pages.
        expect(fetchNextPageMock).not.toHaveBeenCalled()
    })

    it('returns the persisted slice for the given pageIndex/pageSize', () => {
        const persistedTickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
        }))

        useTicketsListMock.mockReturnValue(
            makePersistedResult({
                tickets: persistedTickets as ReturnType<
                    typeof useTicketsList
                >['tickets'],
            }),
        )

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        // pageIndex 1, pageSize 20 → slice (20, 40)
        rerender({
            viewId: 123,
            pageIndex: 1,
            pageSize: 20,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })
        expect(result.current.items).toEqual(persistedTickets.slice(20, 40))

        // pageSize change shrinks the page; DataTable also auto-resets
        // pageIndex to 0, which the parent mirrors.
        rerender({
            viewId: 123,
            pageIndex: 0,
            pageSize: 10,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })
        expect(result.current.items).toEqual(persistedTickets.slice(0, 10))
    })

    it('updates sort order and resets dirty cursor on sort change', async () => {
        setSearchTicketsResponse({
            data: [{ id: 10 }],
            meta: {
                next_cursor: 'cursor-next',
            },
        })

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 10 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()
        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: 'cursor-next',
            }),
        )
        searchTicketsRequests = []

        act(() => {
            result.current.onSortChange([
                { id: 'last_message_datetime', desc: true },
            ])
        })
        rerender()

        expect(setSortOrderMock).toHaveBeenCalledWith(
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
        )
        useSortOrderMock.mockReturnValue([
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
            setSortOrderMock,
        ])
        rerender()

        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: null,
            }),
        )
    })

    it('maps snooze column sorting to snooze datetime order', () => {
        const { result } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
        })

        act(() => {
            result.current.onSortChange([{ id: 'snooze', desc: true }])
        })

        expect(setSortOrderMock).toHaveBeenCalledWith(
            ListViewItemsUpdatesOrderBy.SnoozeDatetimeDesc,
        )
    })

    it('resets the dirty cursor when the page size changes in dirty mode', async () => {
        setSearchTicketsResponse({
            data: [{ id: 10 }],
            meta: {
                next_cursor: 'cursor-next',
            },
        })

        const { result, rerender } = renderTicketTableDataHook({
            viewId: 123,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 10 }])
        })

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()

        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: 'cursor-next',
                limit: '20',
            }),
        )
        searchTicketsRequests = []

        // Simulate the DataTable applying a new page size — it auto-resets
        // pageIndex to 0 and the parent mirror fires the same shape into the
        // hook. The hook drops the dirty cursor in its reset effect.
        rerender({
            viewId: 123,
            pageIndex: 0,
            pageSize: 50,
            enablePersistedUpdates: true,
            pauseUpdates: false,
            dirtyView: {
                enabled: true,
                search: 'vip',
                filters: 'status:open',
                areFiltersValid: true,
            },
        })

        await waitFor(() =>
            expectDirtySearchQueryCalledWith({
                cursor: null,
                limit: '50',
            }),
        )
    })
})
