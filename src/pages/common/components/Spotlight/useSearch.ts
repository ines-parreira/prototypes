import axios, {CancelToken} from 'axios'
import _isEmpty from 'lodash/isEmpty'
import {
    KeyboardEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'
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
import {CursorMeta} from 'models/api/types'
import {searchCustomersWithHighlights} from 'models/customer/resources'
import {
    CUSTOMER_SEARCH_ORDERING,
    isCustomer,
    isTicket,
    PickedCustomer,
    PickedCustomerWithHighlights,
    PickedTicket,
    PickedTicketWithHighlights,
    SearchEngine,
} from 'models/search/types'
import {searchTicketsWithHighlights} from 'models/ticket/resources'
import {ViewType} from 'models/view/types'
import {FEDERATED_SEARCH_GROUP_SIZE} from 'pages/common/components/Spotlight/constants'
import history from 'pages/history'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isMacOs} from 'utils/platform'

type OldSearchPaginationMeta = {
    prev_items: string
    next_items: string
}

type CustomerSearchResponse = {
    data?: PickedCustomerWithHighlights[]
    meta: MetaType
}

type TicketSearchResponse = {
    data?: PickedTicketWithHighlights[]
    meta: MetaType
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

const getSelectedItemUrl = (
    selectedItem:
        | PickedTicket
        | PickedCustomer
        | PickedTicketWithHighlights
        | PickedCustomerWithHighlights
) => {
    if (isTicket(selectedItem)) {
        return `/app/ticket/${selectedItem.id}`
    }
    return `/app/customer/${selectedItem.id}`
}

export const useSearch = () => {
    const dispatch = useAppDispatch()
    const defaultSearchItemsType = ViewType.All
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
    const [tickets, setTickets] = useState<PickedTicketWithHighlights[]>([])
    const [customers, setCustomers] = useState<PickedCustomerWithHighlights[]>(
        []
    )
    const {items: recentTickets} = useRecentItems<PickedTicket>(
        RecentItems.Tickets
    )
    const {items: recentCustomers} = useRecentItems<PickedCustomer>(
        RecentItems.Customers
    )

    const maxIndex = useMemo(() => {
        switch (searchItemsType) {
            case ViewType.TicketList:
                return hasSearched
                    ? tickets.length - 1
                    : recentTickets.length - 1
            case ViewType.CustomerList:
                return hasSearched
                    ? customers.length - 1
                    : recentCustomers.length - 1
            case ViewType.All:
                return hasSearched
                    ? [
                          ...tickets.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                          ...customers.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                      ].length - 1
                    : [
                          ...recentTickets.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE
                          ),
                          ...recentCustomers.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE
                          ),
                      ].length - 1
        }
    }, [
        searchItemsType,
        hasSearched,
        tickets,
        recentTickets,
        customers,
        recentCustomers,
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
                    ? tickets[selectedIndex]
                    : recentTickets[selectedIndex]
            case ViewType.CustomerList:
                return hasSearched
                    ? customers[selectedIndex]
                    : recentCustomers[selectedIndex]
            case ViewType.All:
                return hasSearched
                    ? [
                          ...tickets.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                          ...customers.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                      ][selectedIndex]
                    : [
                          ...recentTickets.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE
                          ),
                          ...recentCustomers.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE
                          ),
                      ][selectedIndex]
        }
    }, [
        searchItemsType,
        hasSearched,
        selectedIndex,
        tickets,
        recentTickets,
        customers,
        recentCustomers,
    ])
    const handleCustomerSearchResult = useCallback(
        (
            data: CustomerSearchResponse,
            viewType: ViewType,
            searchTerm: string,
            cursor?: string
        ) => {
            const results = data?.data ?? []
            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: results.length,
                searchEngine: SearchEngine.ES,
            })
            setLastSearchQueries({
                [Tabs.Tickets]: '',
                [Tabs.Customers]:
                    viewType === ViewType.CustomerList ? searchTerm : '',
                [Tabs.All]: viewType === ViewType.All ? searchTerm : '',
            })
            setCustomers((customers) =>
                cursor ? [...customers, ...results] : results
            )
            setCustomersSearchMeta(data.meta)
        },
        [searchRank]
    )

    const handleTicketSearchResult = useCallback(
        (
            data: TicketSearchResponse,
            viewType: ViewType,
            searchTerm: string,
            cursor?: string
        ) => {
            const results = data?.data ?? []

            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: results.length,
                searchEngine: SearchEngine.ES,
            })
            setLastSearchQueries({
                [Tabs.Customers]: '',
                [Tabs.Tickets]:
                    viewType === ViewType.TicketList ? searchTerm : '',
                [Tabs.All]: viewType === ViewType.All ? searchTerm : '',
            })
            setTickets((tickets) =>
                cursor ? [...tickets, ...results] : results
            )
            setTicketsSearchMeta(data.meta)
        },
        [searchRank]
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
                        ticketPromise = searchTicketsWithHighlights({
                            search: searchTerm,
                            filters: '',
                            cursor,
                            cancelToken,
                        })
                    }
                    if (
                        viewType === ViewType.CustomerList ||
                        viewType === ViewType.All
                    ) {
                        customerPromise = searchCustomersWithHighlights({
                            search: searchTerm,
                            orderBy: CUSTOMER_SEARCH_ORDERING,
                            cursor,
                            cancelToken,
                        })
                    }
                    const [ticketData, customerData] = await Promise.all([
                        ticketPromise,
                        customerPromise,
                    ])
                    if (ticketData) {
                        handleTicketSearchResult(
                            ticketData.data,
                            viewType,
                            searchTerm,
                            cursor
                        )
                    }
                    if (customerData) {
                        handleCustomerSearchResult(
                            customerData.data,
                            viewType,
                            searchTerm,
                            cursor
                        )
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
