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
import history from 'pages/history'
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
import {searchCustomers} from 'models/customer/resources'
import {Customer} from 'models/customer/types'
import {SearchEngine} from 'models/search/types'
import {searchTickets} from 'models/ticket/resources'
import {Ticket} from 'models/ticket/types'
import {ViewType} from 'models/view/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isMacOs} from 'utils/platform'

type OldSearchPaginationMeta = {
    prev_items: string
    next_items: string
}
type MetaType = CursorMeta | OldSearchPaginationMeta

export enum Tabs {
    Tickets = 'tickets',
    Customers = 'customers',
}

const searchRankScenarioSource = {
    [ViewType.CustomerList]: SearchRankSource.SpotlightCustomer,
    [ViewType.TicketList]: SearchRankSource.SpotlightTicket,
}

export const useSearch = () => {
    const dispatch = useAppDispatch()
    const [searchItemsType, setSearchItemsType] = useState<ViewType>(
        ViewType.TicketList
    )
    const [searchQuery, setSearchQuery] = useState<string>()

    const searchRank = useSearchRankScenario(
        searchRankScenarioSource[searchItemsType]
    )
    const [ticketsSearchMeta, setTicketsSearchMeta] = useState<MetaType>()
    const [customersSearchMeta, setCustomersSearchMeta] = useState<MetaType>()
    const [lastSearchQueries, setLastSearchQueries] = useState<{
        [Tabs.Tickets]: string
        [Tabs.Customers]: string
    }>({customers: '', tickets: ''})

    const previousSearchItemsType = usePrevious(searchItemsType)
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const {items: recentTickets} = useRecentItems<Ticket>(RecentItems.Tickets)
    const {items: recentCustomers} = useRecentItems<Customer>(
        RecentItems.Customers
    )
    const maxIndex = useMemo(
        () =>
            searchItemsType === ViewType.CustomerList
                ? hasSearched
                    ? customers.length - 1
                    : recentCustomers.length - 1
                : hasSearched
                ? tickets.length - 1
                : recentTickets.length - 1,
        [
            customers,
            searchItemsType,
            tickets,
            hasSearched,
            recentTickets,
            recentCustomers,
        ]
    )

    const {
        index: selectedIndex,
        next: nextIndex,
        previous: previousIndex,
        reset: resetSelectedIndex,
        setIndex: setSelectedIndex,
    } = useSelectedIndex(maxIndex, {loop: true})
    useEffect(resetSelectedIndex, [resetSelectedIndex, searchItemsType])

    const selectedItem = useMemo(
        () =>
            searchItemsType === ViewType.CustomerList
                ? hasSearched
                    ? customers[selectedIndex]
                    : recentCustomers[selectedIndex]
                : hasSearched
                ? tickets[selectedIndex]
                : recentTickets[selectedIndex],
        [
            customers,
            searchItemsType,
            selectedIndex,
            tickets,
            hasSearched,
            recentTickets,
            recentCustomers,
        ]
    )

    const selectedItemUrl = useMemo(
        () =>
            !selectedItem
                ? undefined
                : searchItemsType === ViewType.CustomerList
                ? `/app/customer/${selectedItem.id}`
                : `/app/ticket/${selectedItem.id}`,
        [searchItemsType, selectedItem]
    )

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType, cursor?: string) => {
                searchRank.endScenario()
                searchRank.registerResultsRequest({
                    query: searchTerm,
                    requestTime: Date.now(),
                })
                let promise
                const searchEngine = SearchEngine.ES

                if (viewType === ViewType.TicketList) {
                    promise = searchTickets({
                        search: searchTerm,
                        filters: '',
                        cursor,
                        cancelToken,
                    })
                } else {
                    promise = searchCustomers({
                        search: searchTerm,
                        orderBy: '_score:desc',
                        cursor,
                        cancelToken,
                    })
                }

                try {
                    const {data} = await promise
                    searchRank.registerResultsResponse({
                        responseTime: Date.now(),
                        numberOfResults: data.data.length,
                        searchEngine,
                    })
                    if (viewType === ViewType.TicketList) {
                        setLastSearchQueries({
                            ...lastSearchQueries,
                            tickets: searchTerm,
                        })
                        setTickets((tickets) =>
                            cursor
                                ? ([...tickets, ...data.data] as Ticket[])
                                : (data.data as Ticket[])
                        )
                        setTicketsSearchMeta(data.meta)
                    } else if (viewType === ViewType.CustomerList) {
                        setLastSearchQueries({
                            ...lastSearchQueries,
                            customers: searchTerm,
                        })
                        setCustomers((tickets) =>
                            cursor
                                ? ([...tickets, ...data.data] as Customer[])
                                : (data.data as Customer[])
                        )
                        setCustomersSearchMeta(data.meta)
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
        [searchRank, dispatch, lastSearchQueries]
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
        setSearchItemsType(ViewType.TicketList)
        setLastSearchQueries({customers: '', tickets: ''})
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

    const searchCallback = async (
        event: KeyboardEvent,
        logRecentlyAccessedSegmentEvent: (
            type: 'spotlight-ticket' | 'spotlight-customer'
        ) => void
    ) => {
        if (selectedItemUrl) {
            logRecentlyAccessedSegmentEvent(
                searchItemsType === ViewType.CustomerList
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
                lastSearchQueries.customers !== searchQuery) ||
                (searchItemsType === ViewType.TicketList &&
                    lastSearchQueries.tickets !== searchQuery) ||
                !hasSearched)
        ) {
            await delayedFetchSearchItems(searchQuery, searchItemsType)
            setHasSearched(true)
        }
    }

    const handleLoadMore = useCallback(async () => {
        await fetchMoreSearchItems(searchQuery!, searchItemsType, nextCursor)
    }, [fetchMoreSearchItems, searchQuery, searchItemsType, nextCursor])

    return {
        isLoading,
        isFetchingMore,
        fetchSearchItems,
        searchItemsType,
        handleSearchInput,
        resetSearch,
        searchRank,
        searchQuery,
        previousIndex,
        nextIndex,
        selectedIndex,
        isFooterClean,
        tickets,
        customers,
        recentTickets,
        recentCustomers,
        hasSearched,
        nextCursor,
        setSearchItemsType,
        setSelectedIndex,
        searchCallback,
        handleLoadMore,
    }
}
