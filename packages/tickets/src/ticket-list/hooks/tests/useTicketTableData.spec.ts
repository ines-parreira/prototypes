import { act, renderHook, waitFor } from '@testing-library/react'

import { useSearchTickets } from '@gorgias/helpdesk-queries'
import {
    ListViewItemsUpdatesOrderBy,
    SearchTicketsOrderBy,
} from '@gorgias/helpdesk-types'

import { useSortOrder } from '../useSortOrder'
import { useTicketsList } from '../useTicketsList'
import { useTicketTableData } from '../useTicketTableData'

vi.mock('@gorgias/helpdesk-queries', () => ({
    useSearchTickets: vi.fn(),
}))

vi.mock('../useSortOrder', () => ({
    useSortOrder: vi.fn(),
}))

vi.mock('../useTicketsList', () => ({
    useTicketsList: vi.fn(),
}))

const useSearchTicketsMock = vi.mocked(useSearchTickets)
const useSortOrderMock = vi.mocked(useSortOrder)
const useTicketsListMock = vi.mocked(useTicketsList)

const persistedRefetchMock = vi.fn()
const fetchNextPageMock = vi.fn()
const searchRefetchMock = vi.fn()
const setSortOrderMock = vi.fn()

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
    expect(useSearchTicketsMock).toHaveBeenCalledWith(
        {
            search: 'vip',
            filters: 'status:open',
        },
        expect.objectContaining(expected),
        expect.objectContaining({
            query: expect.objectContaining({
                enabled: true,
            }),
        }),
    )
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

function makeDirtyQueryResult(
    overrides: Partial<ReturnType<typeof useSearchTickets>> = {},
): ReturnType<typeof useSearchTickets> {
    return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: searchRefetchMock,
        ...overrides,
    } as ReturnType<typeof useSearchTickets>
}

function makeSearchQueryResult(
    overrides: Partial<ReturnType<typeof useSearchTickets>> = {},
): ReturnType<typeof useSearchTickets> {
    return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: searchRefetchMock,
        ...overrides,
    } as ReturnType<typeof useSearchTickets>
}

beforeEach(() => {
    persistedRefetchMock.mockReset()
    fetchNextPageMock.mockReset()
    searchRefetchMock.mockReset()
    setSortOrderMock.mockReset()

    useSortOrderMock.mockReturnValue([
        ListViewItemsUpdatesOrderBy.LastMessageDatetimeAsc,
        setSortOrderMock,
    ])
    useTicketsListMock.mockReturnValue(makePersistedResult())
    useSearchTicketsMock.mockReturnValue(makeDirtyQueryResult())
})

afterEach(() => {
    vi.clearAllMocks()
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

    it('uses the search query baseline instead of persisted view items for draft views', () => {
        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 9001 }] as never[],
                    meta: {},
                },
            }),
        )

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
        expect(useSearchTicketsMock).toHaveBeenCalledWith(
            {
                search: '',
                filters: '',
            },
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
        expect(result.current.items).toEqual([{ id: 9001 }])
    })

    it('returns dirty search results when the dirty filters are valid', () => {
        const dirtyItems = [{ id: 9001 }, { id: 9002 }]

        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: dirtyItems as never[],
                    meta: {
                        next_cursor: 'next-cursor',
                        prev_cursor: null,
                    },
                },
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
                areFiltersValid: true,
            },
        })

        expect(result.current.items).toEqual(dirtyItems)
        expect(result.current.hasNextPage).toBe(true)
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('selects the dirty search response into ticket data and meta', () => {
        renderTicketTableDataHook({
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

        const dirtyQueryOptions = useSearchTicketsMock.mock.calls[0]?.[2]
        const select = dirtyQueryOptions?.query?.select

        expect(select).toEqual(expect.any(Function))
        const response = {
            data: {
                data: [{ id: 9001 }] as never[],
                meta: {
                    next_cursor: 'cursor-next',
                    prev_cursor: null,
                },
            },
        } as unknown as Parameters<NonNullable<typeof select>>[0]

        expect(select?.(response)).toEqual({
            data: [{ id: 9001 }],
            meta: {
                next_cursor: 'cursor-next',
                prev_cursor: null,
            },
        })
    })

    it('uses the dedicated search query in search mode', () => {
        useSearchTicketsMock
            .mockReturnValueOnce(makeDirtyQueryResult())
            .mockReturnValueOnce(
                makeSearchQueryResult({
                    data: {
                        data: {
                            data: [{ id: 42 }] as never[],
                            meta: {
                                next_cursor: 'search-next',
                                prev_cursor: null,
                                total_resources: 99,
                            },
                        },
                    },
                }),
            )

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

        expect(result.current.items).toEqual([{ id: 42 }])
        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.totalResources).toBe(99)
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            {
                search: 'hello',
                filters: '',
            },
            expect.objectContaining({
                order_by: SearchTicketsOrderBy.LastMessageDatetimeAsc,
                with_highlights: true,
                track_total_hits: true,
            }),
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
    })

    it('tracks initial search requests and responses in search mode', () => {
        vi.useFakeTimers()
        const onRequest = vi.fn()
        const onResponse = vi.fn()

        let searchRenderCount = 0
        useSearchTicketsMock.mockImplementation((params) => {
            if (params.search !== 'hello') {
                return makeDirtyQueryResult()
            }

            searchRenderCount += 1

            if (searchRenderCount === 1) {
                return makeSearchQueryResult({
                    isFetching: true,
                })
            }

            return makeSearchQueryResult({
                data: {
                    data: {
                        data: [{ id: 42 }] as never[],
                        meta: {},
                    },
                    headers: {
                        'x-gorgias-search-engine': 'PG',
                    },
                },
                isFetching: false,
            })
        })

        const setCursor = vi.fn()
        const { rerender } = renderHook(
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

        rerender({
            searchTracking: {
                onRequest,
                onResponse,
            },
        })

        expect(onRequest).toHaveBeenCalledWith({
            query: 'hello',
            requestTime: expect.any(Number),
        })

        rerender({
            searchTracking: {
                onRequest,
                onResponse,
            },
        })

        expect(onResponse).toHaveBeenCalledWith({
            responseTime: expect.any(Number),
            numberOfResults: 1,
            searchEngine: 'PG',
        })

        vi.useRealTimers()
    })

    it('treats search mode as a search-query mode and disables persisted list loading', () => {
        useSearchTicketsMock
            .mockReturnValueOnce(makeDirtyQueryResult())
            .mockReturnValueOnce(makeDirtyQueryResult())

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
        expect(useSearchTicketsMock).toHaveBeenNthCalledWith(
            2,
            {
                search: 'hello',
                filters: 'status:open',
            },
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
    })

    it('normalizes highlighted search rows from wrapped and flat search responses', () => {
        useSearchTicketsMock
            .mockReturnValueOnce(makeDirtyQueryResult())
            .mockReturnValueOnce(
                makeSearchQueryResult({
                    data: {
                        data: {
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
                                { foo: 'ignored' } as never,
                                { id: 43, subject: 'Flat ticket' } as never,
                            ] as never[],
                            meta: {},
                        },
                        headers: {},
                    },
                }),
            )

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
        expect(result.current.totalResources).toBeUndefined()
    })

    it('treats null search total_resources as unavailable', () => {
        useSearchTicketsMock
            .mockReturnValueOnce(makeDirtyQueryResult())
            .mockReturnValueOnce(
                makeSearchQueryResult({
                    data: {
                        data: {
                            data: [{ id: 42 }] as never[],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: null,
                            } as never,
                        },
                        headers: {},
                    },
                }),
            )

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
        expect(useSearchTicketsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                search: 'vip',
                filters: 'status:open',
            }),
            expect.anything(),
            expect.objectContaining({
                query: expect.objectContaining({
                    enabled: false,
                }),
            }),
        )
    })

    it('refreshes the search query when dirty results are active', () => {
        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 10 }] as never[],
                    meta: {},
                },
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
                areFiltersValid: true,
            },
        })

        result.current.onRefresh()

        expect(searchRefetchMock).toHaveBeenCalled()
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

        expect(searchRefetchMock).not.toHaveBeenCalled()
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
        expect(searchRefetchMock).not.toHaveBeenCalled()
    })

    it('refreshes the search query when search mode is active', () => {
        useSearchTicketsMock
            .mockReturnValueOnce(makeDirtyQueryResult())
            .mockReturnValueOnce(
                makeDirtyQueryResult({
                    data: {
                        data: [{ id: 42 }] as never[],
                        meta: {},
                    },
                }),
            )

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

        result.current.onRefresh()

        expect(searchRefetchMock).toHaveBeenCalled()
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

        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 77 }] as never[],
                    meta: {},
                },
            }),
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
            ReturnType<typeof useTicketTableData>,
            HookProps
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

        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 9001 }, { id: 9002 }] as never[],
                    meta: {},
                },
            }),
        )

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

    it('uses dirty cursors for pagination in dirty mode', () => {
        const dirtyResponse = {
            data: [{ id: 50 }] as never[],
            meta: {
                next_cursor: 'cursor-next',
                prev_cursor: 'cursor-prev',
            },
        }

        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: dirtyResponse,
            }),
        )

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

        act(() => {
            result.current.onPageChange('next')
        })

        rerender()

        expectDirtySearchQueryCalledWith({
            cursor: 'cursor-next',
        })

        act(() => {
            result.current.onPageChange('previous')
        })

        rerender()

        expectDirtySearchQueryCalledWith({
            cursor: 'cursor-prev',
        })
    })

    it('uses URL cursors for pagination in search mode', () => {
        useSearchTicketsMock.mockImplementation((params) =>
            params.search === 'vip'
                ? makeSearchQueryResult({
                      data: {
                          data: {
                              data: [{ id: 50 }] as never[],
                              meta: {
                                  next_cursor: 'search-next',
                                  prev_cursor: 'search-prev',
                              },
                          },
                          headers: {},
                      },
                  })
                : makeDirtyQueryResult(),
        )

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

        act(() => {
            result.current.onPageChange('next')
        })

        expect(setCursor).toHaveBeenCalledWith('search-next')

        act(() => {
            result.current.onPageChange('previous')
        })

        expect(setCursor).toHaveBeenCalledWith('search-prev')
    })

    it('does not advance search pagination when the next cursor is missing', () => {
        useSearchTicketsMock.mockImplementation((params) =>
            params.search === 'vip'
                ? makeSearchQueryResult({
                      data: {
                          data: {
                              data: [{ id: 50 }] as never[],
                              meta: {
                                  next_cursor: null,
                                  prev_cursor: 'search-prev',
                              },
                          },
                          headers: {},
                      },
                  })
                : makeDirtyQueryResult(),
        )

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

        act(() => {
            result.current.onPageChange('next')
        })

        expect(setCursor).not.toHaveBeenCalled()
    })

    it('updates search rows when the cursor changes', async () => {
        useSearchTicketsMock.mockImplementation((params, queryParams) => {
            if (params.search !== 'vip') {
                return makeDirtyQueryResult()
            }

            if (queryParams?.cursor === 'search-next') {
                return makeSearchQueryResult({
                    data: {
                        data: {
                            data: [{ id: 51 }] as never[],
                            meta: {
                                next_cursor: null,
                                prev_cursor: 'search-prev',
                            },
                        },
                        headers: {},
                    },
                })
            }

            return makeSearchQueryResult({
                data: {
                    data: {
                        data: [{ id: 50 }] as never[],
                        meta: {
                            next_cursor: 'search-next',
                            prev_cursor: null,
                        },
                    },
                    headers: {},
                },
            })
        })

        const setCursor = vi.fn()
        const { result, rerender } = renderHook<
            ReturnType<typeof useTicketTableData>,
            { cursor?: string }
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

        expect(result.current.items).toEqual([{ id: 50 }])

        act(() => {
            result.current.onPageChange('next')
        })

        rerender({ cursor: 'search-next' })

        await waitFor(() => {
            expect(result.current.items).toEqual([{ id: 51 }])
        })
    })

    it('resets the search cursor when the search query changes', () => {
        useSearchTicketsMock.mockImplementation((params) =>
            params.search === 'vip'
                ? makeSearchQueryResult({
                      data: {
                          data: {
                              data: [{ id: 50 }] as never[],
                              meta: {
                                  next_cursor: 'search-next',
                              },
                          },
                          headers: {},
                      },
                  })
                : makeDirtyQueryResult(),
        )

        const setCursor = vi.fn()
        const onPaginationReset = vi.fn()
        const { result, rerender } = renderHook<
            ReturnType<typeof useTicketTableData>,
            { query: string; cursor?: string }
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

    it('updates sort order and resets dirty cursor on sort change', () => {
        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 10 }] as never[],
                    meta: {
                        next_cursor: 'cursor-next',
                    },
                },
            }),
        )

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

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()

        act(() => {
            result.current.onSortChange([
                { id: 'last_message_datetime', desc: true },
            ])
        })
        rerender()

        expect(setSortOrderMock).toHaveBeenCalledWith(
            ListViewItemsUpdatesOrderBy.LastMessageDatetimeDesc,
        )
        expectDirtySearchQueryCalledWith({
            cursor: undefined,
        })
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

    it('resets the dirty cursor when the page size changes in dirty mode', () => {
        useSearchTicketsMock.mockReturnValue(
            makeDirtyQueryResult({
                data: {
                    data: [{ id: 10 }] as never[],
                    meta: {
                        next_cursor: 'cursor-next',
                    },
                },
            }),
        )

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

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()

        expectDirtySearchQueryCalledWith({
            cursor: 'cursor-next',
            limit: 20,
        })

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

        expectDirtySearchQueryCalledWith({
            cursor: undefined,
            limit: 50,
        })
    })
})
