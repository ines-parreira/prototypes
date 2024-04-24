import axios, {CancelToken} from 'axios'
import _isEmpty from 'lodash/isEmpty'
import {
    KeyboardEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useState,
} from 'react'
import {
    customersWithHighlightsLoadedAction,
    resultsWithHighlightsReducer,
    ticketsWithHighlightsLoadedAction,
} from 'pages/common/components/Spotlight/resultsWithHighlightsReducer'
import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import usePrevious from 'hooks/usePrevious'
import {RecentItems} from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import useSelectedIndex from 'hooks/useSelectedIndex'
import {ApiListResponseCursorPagination, CursorMeta} from 'models/api/types'
import {searchCustomers} from 'models/customer/resources'
import {Customer} from 'models/customer/types'
import {
    CustomerWithHighlights,
    CustomerWithHighlightsResponse,
    isCustomer,
    isCustomerWithHighlights,
    isTicket,
    isTicketWithHighlights,
    PickedCustomer,
    SearchEngine,
    TicketWithHighlights,
    TicketWithHighlightsResponse,
} from 'models/search/types'
import {searchTickets} from 'models/ticket/resources'
import {Ticket} from 'models/ticket/types'
import {ViewType} from 'models/view/types'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'
import history from 'pages/history'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isMacOs} from 'utils/platform'

type OldSearchPaginationMeta = {
    prev_items: string
    next_items: string
}
type MetaType = CursorMeta | OldSearchPaginationMeta

export enum Tabs {
    All = 'all',
    Tickets = 'tickets',
    Customers = 'customers',
}

const searchRankScenarioSource: Record<ViewType, SearchRankSource> = {
    [ViewType.CustomerList]: SearchRankSource.SpotlightCustomer,
    [ViewType.TicketList]: SearchRankSource.SpotlightTicket,
    [ViewType.All]: SearchRankSource.SpotlightAll,
}

type ResultWithHighlights<T> = T extends ViewType.TicketList
    ? TicketWithHighlights
    : T extends ViewType.CustomerList
    ? CustomerWithHighlights
    : never

function getTypedHighlightResults<T extends ViewType>(
    data: TicketWithHighlightsResponse[] | CustomerWithHighlightsResponse[],
    viewType: T
): ResultWithHighlights<T>[] {
    const entityType = viewType === ViewType.TicketList ? 'Ticket' : 'Customer'
    return data
        .map((result) => ({
            type: entityType,
            ...result,
        }))
        .filter(
            (result) => result.type === entityType
        ) as ResultWithHighlights<T>[]
}

const getSelectedItemUrl = (
    selectedItem:
        | PickedTicket
        | PickedCustomer
        | TicketWithHighlights
        | CustomerWithHighlights
) => {
    if (isTicket(selectedItem)) {
        return `/app/ticket/${selectedItem.id}`
    } else if (isTicketWithHighlights(selectedItem)) {
        return `/app/ticket/${selectedItem.entity.id}`
    } else if (isCustomer(selectedItem)) {
        return `/app/customer/${selectedItem.id}`
    } else if (isCustomerWithHighlights(selectedItem)) {
        return `/app/customer/${selectedItem.entity.id}`
    }
    return ''
}

export const useSearch = (isSearchWithHighlights: boolean) => {
    const dispatch = useAppDispatch()
    const defaultSearchItemsType = isSearchWithHighlights
        ? ViewType.All
        : ViewType.TicketList
    const [searchItemsType, setSearchItemsType] = useState<ViewType>(
        defaultSearchItemsType
    )
    const [searchQuery, setSearchQuery] = useState<string>()

    const searchRank = useSearchRankScenario(
        searchRankScenarioSource[searchItemsType]
    )
    const [ticketsSearchMeta, setTicketsSearchMeta] = useState<MetaType>()
    const [customersSearchMeta, setCustomersSearchMeta] = useState<MetaType>()
    const [lastSearchQueries, setLastSearchQueries] = useState<
        Record<Tabs, string>
    >({
        [Tabs.Customers]: '',
        [Tabs.Tickets]: '',
        [Tabs.All]: '',
    })

    const previousSearchItemsType = usePrevious(searchItemsType)
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [tickets, setTickets] = useState<PickedTicket[]>([])
    const [customers, setCustomers] = useState<PickedCustomer[]>([])
    const [resultsWithHighlights, dispatchResultsWithHighlightsAction] =
        useReducer(resultsWithHighlightsReducer, [])
    const {items: recentTickets} = useRecentItems<PickedTicket>(
        RecentItems.Tickets
    )
    const {items: recentCustomers} = useRecentItems<PickedCustomer>(
        RecentItems.Customers
    )

    const maxIndex = useMemo(() => {
        const customersLength = isSearchWithHighlights
            ? resultsWithHighlights.length
            : customers.length
        const ticketsLength = isSearchWithHighlights
            ? resultsWithHighlights.length
            : tickets.length

        return searchItemsType === ViewType.CustomerList
            ? hasSearched
                ? customersLength - 1
                : recentCustomers.length - 1
            : hasSearched
            ? ticketsLength - 1
            : recentTickets.length - 1
    }, [
        isSearchWithHighlights,
        resultsWithHighlights.length,
        customers.length,
        tickets.length,
        searchItemsType,
        hasSearched,
        recentCustomers.length,
        recentTickets.length,
    ])

    const {
        index: selectedIndex,
        next: nextIndex,
        previous: previousIndex,
        reset: resetSelectedIndex,
        setIndex: setSelectedIndex,
    } = useSelectedIndex(maxIndex, {loop: true})
    useEffect(resetSelectedIndex, [resetSelectedIndex, searchItemsType])

    const selectedItem = useMemo(() => {
        switch (searchItemsType) {
            case ViewType.TicketList:
                return hasSearched
                    ? isSearchWithHighlights
                        ? resultsWithHighlights[selectedIndex]
                        : tickets[selectedIndex]
                    : recentTickets[selectedIndex]
            case ViewType.CustomerList:
                return hasSearched
                    ? isSearchWithHighlights
                        ? resultsWithHighlights[selectedIndex]
                        : customers[selectedIndex]
                    : recentCustomers[selectedIndex]
            case ViewType.All:
                return hasSearched
                    ? [
                          ...resultsWithHighlights
                              .filter(isTicketWithHighlights)
                              .slice(0, 5),
                          ...resultsWithHighlights
                              .filter(isCustomerWithHighlights)
                              .slice(0, 5),
                      ][selectedIndex]
                    : [
                          ...recentTickets.slice(0, 5),
                          ...recentCustomers.slice(0, 5),
                      ][selectedIndex]
        }
    }, [
        searchItemsType,
        hasSearched,
        isSearchWithHighlights,
        resultsWithHighlights,
        selectedIndex,
        tickets,
        recentTickets,
        customers,
        recentCustomers,
    ])
    const handleCustomerSearchResult = useCallback(
        (
            data: ApiListResponseCursorPagination<
                Customer[] | CustomerWithHighlightsResponse[]
            >,
            viewType: ViewType.All | ViewType.CustomerList,
            searchTerm: string,
            cursor?: string
        ) => {
            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: data.data.length,
                searchEngine: SearchEngine.ES,
            })
            if (isSearchWithHighlights) {
                setLastSearchQueries({
                    [Tabs.Tickets]: '',
                    [Tabs.Customers]:
                        viewType === ViewType.CustomerList ? searchTerm : '',
                    [Tabs.All]: viewType === ViewType.All ? searchTerm : '',
                })
            } else {
                setLastSearchQueries({
                    ...lastSearchQueries,
                    [Tabs.Customers]: searchTerm,
                })
            }
            if (isSearchWithHighlights) {
                const typedResults = getTypedHighlightResults(
                    data.data as
                        | TicketWithHighlightsResponse[]
                        | CustomerWithHighlightsResponse[],
                    ViewType.CustomerList
                )
                dispatchResultsWithHighlightsAction(
                    customersWithHighlightsLoadedAction(
                        typedResults,
                        viewType,
                        cursor
                    )
                )
            } else {
                setCustomers((tickets) =>
                    cursor
                        ? ([...tickets, ...data.data] as PickedCustomer[])
                        : (data.data as PickedCustomer[])
                )
            }

            setCustomersSearchMeta(data.meta)
        },
        [isSearchWithHighlights, lastSearchQueries, searchRank]
    )

    const handleTicketSearchResult = useCallback(
        (
            data: ApiListResponseCursorPagination<
                Ticket[] | TicketWithHighlightsResponse[]
            >,
            viewType: ViewType.All | ViewType.TicketList,
            searchTerm: string,
            cursor?: string
        ) => {
            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: data.data.length,
                searchEngine: SearchEngine.ES,
            })
            if (isSearchWithHighlights) {
                setLastSearchQueries({
                    [Tabs.Customers]: '',
                    [Tabs.Tickets]:
                        viewType === ViewType.TicketList ? searchTerm : '',
                    [Tabs.All]: viewType === ViewType.All ? searchTerm : '',
                })
            } else {
                setLastSearchQueries({
                    ...lastSearchQueries,
                    [Tabs.Tickets]: searchTerm,
                })
            }

            if (isSearchWithHighlights) {
                const typedResults = getTypedHighlightResults(
                    data.data as
                        | TicketWithHighlightsResponse[]
                        | CustomerWithHighlightsResponse[],
                    ViewType.TicketList
                )
                dispatchResultsWithHighlightsAction(
                    ticketsWithHighlightsLoadedAction(
                        typedResults,
                        viewType,
                        cursor
                    )
                )
            } else {
                setTickets((tickets) =>
                    cursor
                        ? ([...tickets, ...data.data] as PickedTicket[])
                        : (data.data as PickedTicket[])
                )
            }
            setTicketsSearchMeta(data.meta)
        },
        [isSearchWithHighlights, lastSearchQueries, searchRank]
    )

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType, cursor?: string) => {
                searchRank.endScenario()
                searchRank.registerResultsRequest({
                    query: searchTerm,
                    requestTime: Date.now(),
                })
                try {
                    let ticketPromise
                    let customerPromise
                    if (
                        viewType === ViewType.TicketList ||
                        viewType === ViewType.All
                    ) {
                        ticketPromise = searchTickets({
                            search: searchTerm,
                            filters: '',
                            cursor,
                            cancelToken,
                            withHighlights: isSearchWithHighlights,
                        })
                        const ticketData = await ticketPromise
                        if (ticketData) {
                            handleTicketSearchResult(
                                ticketData?.data,
                                viewType,
                                searchTerm,
                                cursor
                            )
                        }
                    }
                    if (
                        viewType === ViewType.CustomerList ||
                        viewType === ViewType.All
                    ) {
                        customerPromise = searchCustomers({
                            search: searchTerm,
                            orderBy: '_score:desc',
                            cursor,
                            cancelToken,
                            withHighlights: isSearchWithHighlights,
                        })
                        const customerData = await customerPromise

                        if (customerData) {
                            handleCustomerSearchResult(
                                customerData?.data,
                                viewType,
                                searchTerm,
                                cursor
                            )
                        }
                    }
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        void dispatch(
                            notify({
                                message: 'Failed to fetch search results',
                                status: NotificationStatus.Error,
                            })
                        )
                        searchRank.registerResultsResponse({
                            responseTime: Date.now(),
                            numberOfResults: 0,
                            searchEngine: undefined,
                        })
                    }
                }
            },
        [
            searchRank,
            isSearchWithHighlights,
            handleCustomerSearchResult,
            handleTicketSearchResult,
            dispatch,
        ]
    )

    const [cancellableFetchSearchItems, cancelSearch] = useCancellableRequest(
        createFetchSearchItems
    )
    const [{loading: isRequestLoading}, fetchSearchItems] = useAsyncFn(
        cancellableFetchSearchItems,
        [cancellableFetchSearchItems]
    )

    const [{loading: isDelayedRequestLoading}, delayedFetchSearchItems] =
        useDelayedAsyncFn(
            cancellableFetchSearchItems,
            [cancellableFetchSearchItems],
            300
        )

    const isLoading = useMemo(
        () => isRequestLoading || isDelayedRequestLoading,
        [isRequestLoading, isDelayedRequestLoading]
    )
    const [{loading: isFetchingMore}, fetchMoreSearchItems] = useAsyncFn(
        cancellableFetchSearchItems,
        [cancellableFetchSearchItems]
    )
    const resetSearch = () => {
        searchQuery && setSearchQuery('')
        !_isEmpty(tickets) && setTickets([])
        !_isEmpty(customers) && setCustomers([])
        hasSearched && setHasSearched(false)
        !_isEmpty(ticketsSearchMeta) && setTicketsSearchMeta(undefined)
        !_isEmpty(customersSearchMeta) && setCustomersSearchMeta(undefined)
        setSearchItemsType(defaultSearchItemsType)
        setLastSearchQueries({customers: '', tickets: '', all: ''})
        cancelSearch()
        searchRank.endScenario()
        resetSelectedIndex()
    }

    const handleSearchInput = (query: string) => {
        if (!query && searchQuery) {
            cancelSearch()
            setHasSearched(false)
            setTicketsSearchMeta(undefined)
            setCustomersSearchMeta(undefined)
            setTickets([])
            setCustomers([])
        }
        setSearchQuery(query)
        resetSelectedIndex()
    }

    const isFooterClean = useMemo(() => {
        return (
            !hasSearched &&
            !isLoading &&
            ((searchItemsType === ViewType.TicketList &&
                _isEmpty(recentTickets)) ||
                (searchItemsType === ViewType.CustomerList &&
                    _isEmpty(recentCustomers)))
        )
    }, [
        hasSearched,
        isLoading,
        searchItemsType,
        recentTickets,
        recentCustomers,
    ])

    const nextCursor = useMemo(
        () =>
            searchItemsType === ViewType.CustomerList
                ? (customersSearchMeta as CursorMeta)?.next_cursor ||
                  (customersSearchMeta as OldSearchPaginationMeta)?.next_items
                : searchItemsType === ViewType.TicketList
                ? (ticketsSearchMeta as CursorMeta)?.next_cursor ||
                  (ticketsSearchMeta as OldSearchPaginationMeta)?.next_items
                : undefined,
        [searchItemsType, customersSearchMeta, ticketsSearchMeta]
    )

    useLayoutEffect(() => {
        if (
            searchItemsType !== previousSearchItemsType &&
            searchQuery &&
            (hasSearched || isLoading)
        ) {
            if (
                searchItemsType === ViewType.CustomerList &&
                lastSearchQueries[Tabs.Customers] !== searchQuery
            ) {
                const query =
                    lastSearchQueries[Tabs.Tickets] &&
                    searchQuery !== lastSearchQueries[Tabs.Tickets]
                        ? lastSearchQueries[Tabs.Tickets]
                        : searchQuery
                void fetchSearchItems(query, ViewType.CustomerList)
            } else if (
                searchItemsType === ViewType.TicketList &&
                lastSearchQueries[Tabs.Tickets] !== searchQuery
            ) {
                const query =
                    lastSearchQueries[Tabs.Customers] &&
                    searchQuery !== lastSearchQueries[Tabs.Customers]
                        ? lastSearchQueries[Tabs.Customers]
                        : searchQuery
                void fetchSearchItems(query, ViewType.TicketList)
            } else if (searchItemsType === ViewType.All) {
                void fetchSearchItems(searchQuery, ViewType.All)
            }
        }
    }, [
        fetchSearchItems,
        cancelSearch,
        hasSearched,
        isLoading,
        searchItemsType,
        previousSearchItemsType,
        searchQuery,
        lastSearchQueries,
        nextCursor,
    ])

    const searchCallback = useCallback(
        async (
            event: KeyboardEvent,
            logRecentlyAccessedSegmentEvent: (
                type: 'spotlight-ticket' | 'spotlight-customer'
            ) => void
        ) => {
            if (selectedItem) {
                const selectedItemUrl = getSelectedItemUrl(selectedItem)
                logRecentlyAccessedSegmentEvent(
                    isCustomer(selectedItem)
                        ? 'spotlight-customer'
                        : 'spotlight-ticket'
                )
                if ((isMacOs && event.metaKey) || (!isMacOs && event.ctrlKey)) {
                    window.open(selectedItemUrl, '_blank', 'noopener')
                    return
                }

                history.push(selectedItemUrl)
                return
            }

            if (
                searchQuery &&
                ((searchItemsType === ViewType.CustomerList &&
                    lastSearchQueries[Tabs.Customers] !== searchQuery) ||
                    (searchItemsType === ViewType.TicketList &&
                        lastSearchQueries[Tabs.Tickets] !== searchQuery) ||
                    (searchItemsType === ViewType.All &&
                        lastSearchQueries[Tabs.All] !== searchQuery) ||
                    !hasSearched)
            ) {
                await delayedFetchSearchItems(searchQuery, searchItemsType)
                setHasSearched(true)
            }
        },
        [
            delayedFetchSearchItems,
            hasSearched,
            lastSearchQueries,
            searchItemsType,
            searchQuery,
            selectedItem,
        ]
    )

    const handleLoadMore = useCallback(async () => {
        if (searchQuery) {
            await fetchMoreSearchItems(searchQuery, searchItemsType, nextCursor)
        }
    }, [fetchMoreSearchItems, searchQuery, searchItemsType, nextCursor])

    return {
        customers,
        fetchSearchItems,
        handleLoadMore,
        handleSearchInput,
        hasSearched,
        isFetchingMore,
        isFooterClean,
        isLoading,
        nextCursor,
        nextIndex,
        previousIndex,
        recentCustomers,
        recentTickets,
        resetSearch,
        resultsWithHighlights,
        searchCallback,
        searchItemsType,
        searchQuery,
        searchRank,
        selectedIndex,
        setSearchItemsType,
        setSelectedIndex,
        tickets,
    }
}
