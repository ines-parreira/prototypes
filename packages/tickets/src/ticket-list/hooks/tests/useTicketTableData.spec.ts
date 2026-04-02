import { act, renderHook, waitFor } from '@testing-library/react'

import { useSearchTickets } from '@gorgias/helpdesk-queries'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            }),
        )

        expect(result.current.items).toEqual(persistedTickets.slice(0, 20))
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: true,
                enableStaleUpdates: true,
            }),
        )
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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: true,
                },
            }),
        )

        expect(result.current.items).toEqual(dirtyItems)
        expect(result.current.hasNextPage).toBe(true)
        expect(useTicketsListMock).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                enabled: false,
            }),
        )
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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: false,
                },
            }),
        )

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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: true,
                },
            }),
        )

        result.current.onRefresh()

        expect(searchRefetchMock).toHaveBeenCalled()
        expect(persistedRefetchMock).not.toHaveBeenCalled()
    })

    it('refreshes the persisted query when dirty mode is disabled', () => {
        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            }),
        )

        result.current.onRefresh()

        expect(persistedRefetchMock).toHaveBeenCalled()
        expect(searchRefetchMock).not.toHaveBeenCalled()
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

        const { result, rerender } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: true,
                },
            }),
        )

        act(() => {
            result.current.onPageChange('next')
        })

        rerender()

        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                cursor: 'cursor-next',
            }),
            expect.anything(),
        )

        act(() => {
            result.current.onPageChange('previous')
        })

        rerender()

        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                cursor: 'cursor-prev',
            }),
            expect.anything(),
        )
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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            }),
        )

        act(() => {
            result.current.onPageChange('next')
        })

        expect(fetchNextPageMock).toHaveBeenCalled()
    })

    it('resets persisted pagination when the page size changes', () => {
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

        const { result } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
            }),
        )

        act(() => {
            result.current.onPageChange('next')
        })

        expect(result.current.items).toEqual(persistedTickets.slice(20, 40))

        act(() => {
            result.current.onPageSizeChange(10)
        })

        expect(result.current.pageSize).toBe(10)
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

        const { result, rerender } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: true,
                },
            }),
        )

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
        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                cursor: undefined,
            }),
            expect.anything(),
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

        const { result, rerender } = renderHook(() =>
            useTicketTableData({
                viewId: 123,
                enablePersistedUpdates: true,
                pauseUpdates: false,
                dirtyView: {
                    enabled: true,
                    search: 'vip',
                    filters: 'status:open',
                    areFiltersValid: true,
                },
            }),
        )

        act(() => {
            result.current.onPageChange('next')
        })
        rerender()

        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                cursor: 'cursor-next',
                limit: 20,
            }),
            expect.anything(),
        )

        act(() => {
            result.current.onPageSizeChange(50)
        })
        rerender()

        expect(result.current.pageSize).toBe(50)
        expect(useSearchTicketsMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                cursor: undefined,
                limit: 50,
            }),
            expect.anything(),
        )
    })
})
