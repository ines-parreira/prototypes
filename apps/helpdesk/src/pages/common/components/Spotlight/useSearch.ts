import type { KeyboardEvent } from 'react'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react'

import {
    useAsyncFn,
    useDelayedAsyncFn,
    useLocalStorageWithExpiry,
    usePrevious,
    useSelectedIndex,
} from '@repo/hooks'
import { history } from '@repo/routing'
import { isMacOs } from '@repo/utils'
import type { CancelToken } from 'axios'
import { isCancel } from 'axios'
import _isEmpty from 'lodash/isEmpty'

import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useCancellableRequest from 'hooks/useCancellableRequest'
import { RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import { ProductType } from 'models/billing/types'
import { searchCustomersWithHighlights } from 'models/customer/resources'
import type {
    PickedCustomer,
    PickedCustomerWithHighlights,
    PickedTicket,
    PickedTicketWithHighlights,
    PicketVoiceCallWithHighlights,
} from 'models/search/types'
import {
    CUSTOMER_SEARCH_ORDERING,
    isCustomer,
    isTicket,
    SearchEngine,
} from 'models/search/types'
import { searchTicketsWithHighlights } from 'models/ticket/resources'
import { ViewType } from 'models/view/types'
import { searchVoiceCallsWithHighlights } from 'models/voiceCall/resources'
import { isVoiceCall } from 'models/voiceCall/types'
import {
    FEDERATED_SEARCH_GROUP_SIZE,
    SEARCH_QUERY_EXPIRY_TIME,
} from 'pages/common/components/Spotlight/constants'
import { currentAccountHasProduct } from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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

type CallSearchResponse = {
    data?: PicketVoiceCallWithHighlights[]
    meta: MetaType
}

type MetaType =
    | Omit<CursorPaginationMeta, 'total_resources'>
    | OldSearchPaginationMeta

export enum Tabs {
    All = 'all',
    Tickets = 'tickets',
    Customers = 'customers',
    Calls = 'calls',
}

const searchRankScenarioSource: Record<ViewType, SearchRankSource> = {
    [ViewType.CustomerList]: SearchRankSource.SpotlightCustomer,
    [ViewType.TicketList]: SearchRankSource.SpotlightTicket,
    [ViewType.All]: SearchRankSource.SpotlightAll,
    [ViewType.CallList]: SearchRankSource.SpotlightAll,
}

const getSelectedItemUrl = (
    selectedItem:
        | PickedTicket
        | PickedCustomer
        | PickedTicketWithHighlights
        | PickedCustomerWithHighlights
        | PicketVoiceCallWithHighlights,
) => {
    if (isTicket(selectedItem)) {
        return `/app/ticket/${selectedItem.id}`
    }
    if (isVoiceCall(selectedItem)) {
        return `/app/ticket/${selectedItem.ticket_id}?call_id=${selectedItem.id}`
    }
    return `/app/customer/${selectedItem.id}`
}

export const useSearch = () => {
    const dispatch = useAppDispatch()
    const defaultSearchItemsType = ViewType.All
    const [searchItemsType, setSearchItemsType] = useState<ViewType>(
        defaultSearchItemsType,
    )
    const showCallsTab = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )

    const { state: recentSearchQuery, setState: setRecentSearchQuery } =
        useLocalStorageWithExpiry<string>(
            'recent-search-query',
            SEARCH_QUERY_EXPIRY_TIME,
            '',
        )
    const [searchQuery, setSearchQuery] = useState<string | undefined>(
        recentSearchQuery,
    )

    const searchRank = useSearchRankScenario(
        searchRankScenarioSource[searchItemsType],
    )
    const [ticketsSearchMeta, setTicketsSearchMeta] = useState<MetaType>()
    const [customersSearchMeta, setCustomersSearchMeta] = useState<MetaType>()
    const [callSearchMeta, setCallSearchMeta] = useState<MetaType>()
    const [lastSearchQueries, setLastSearchQueries] = useState<
        Record<Tabs, string>
    >({
        [Tabs.Customers]: '',
        [Tabs.Tickets]: '',
        [Tabs.All]: '',
        [Tabs.Calls]: '',
    })

    const previousSearchItemsType = usePrevious(searchItemsType)
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [tickets, setTickets] = useState<PickedTicketWithHighlights[]>([])
    const [customers, setCustomers] = useState<PickedCustomerWithHighlights[]>(
        [],
    )
    const [calls, setCalls] = useState<PicketVoiceCallWithHighlights[]>([])
    const { items: recentTickets } = useRecentItems<PickedTicket>(
        RecentItems.Tickets,
    )
    const { items: recentCustomers } = useRecentItems<PickedCustomer>(
        RecentItems.Customers,
    )
    const { items: recentCalls } =
        useRecentItems<PicketVoiceCallWithHighlights>(RecentItems.Calls)

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
                          ...(showCallsTab
                              ? calls.slice(0, FEDERATED_SEARCH_GROUP_SIZE)
                              : []),
                          ...customers.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                      ].length - 1
                    : [
                          ...recentTickets.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE,
                          ),
                          ...(showCallsTab
                              ? recentCalls.slice(
                                    0,
                                    FEDERATED_SEARCH_GROUP_SIZE,
                                )
                              : []),
                          ...recentCustomers.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE,
                          ),
                      ].length - 1
            case ViewType.CallList:
                return hasSearched ? calls.length - 1 : recentCalls.length - 1
        }
    }, [
        searchItemsType,
        hasSearched,
        tickets,
        recentTickets,
        customers,
        recentCustomers,
        calls,
        recentCalls,
        showCallsTab,
    ])

    const {
        index: selectedIndex,
        next: nextIndex,
        previous: previousIndex,
        reset: resetSelectedIndex,
        setIndex: setSelectedIndex,
    } = useSelectedIndex(maxIndex, { loop: true })
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
            case ViewType.CallList:
                return hasSearched
                    ? calls[selectedIndex]
                    : recentCalls[selectedIndex]
            case ViewType.All:
                return hasSearched
                    ? [
                          ...tickets.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                          ...(showCallsTab
                              ? calls.slice(0, FEDERATED_SEARCH_GROUP_SIZE)
                              : []),
                          ...customers.slice(0, FEDERATED_SEARCH_GROUP_SIZE),
                      ][selectedIndex]
                    : [
                          ...recentTickets.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE,
                          ),
                          ...(showCallsTab
                              ? recentCalls.slice(
                                    0,
                                    FEDERATED_SEARCH_GROUP_SIZE,
                                )
                              : []),
                          ...recentCustomers.slice(
                              0,
                              FEDERATED_SEARCH_GROUP_SIZE,
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
        calls,
        recentCalls,
        showCallsTab,
    ])
    const handleCustomerSearchResult = useCallback(
        (
            data: CustomerSearchResponse,
            viewType: ViewType,
            searchTerm: string,
            cursor?: string,
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
                [Tabs.Calls]: '',
            })
            setCustomers((customers) =>
                cursor ? [...customers, ...results] : results,
            )
            setCustomersSearchMeta(data.meta)
        },
        [searchRank],
    )

    const handleTicketSearchResult = useCallback(
        (
            data: TicketSearchResponse,
            viewType: ViewType,
            searchTerm: string,
            cursor?: string,
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
                [Tabs.Calls]: '',
            })
            setTickets((tickets) =>
                cursor ? [...tickets, ...results] : results,
            )
            setTicketsSearchMeta(data.meta)
        },
        [searchRank],
    )

    const handleCallSearchResult = useCallback(
        (
            data: CallSearchResponse,
            viewType: ViewType,
            searchTerm: string,
            cursor?: string,
        ) => {
            const results = data?.data ?? []
            searchRank.registerResultsResponse({
                responseTime: Date.now(),
                numberOfResults: results.length,
                searchEngine: SearchEngine.ES,
            })
            setLastSearchQueries({
                [Tabs.Tickets]: '',
                [Tabs.Customers]: '',
                [Tabs.All]: viewType === ViewType.All ? searchTerm : '',
                [Tabs.Calls]: viewType === ViewType.CallList ? searchTerm : '',
            })
            setCalls((calls) => (cursor ? [...calls, ...results] : results))
            setCallSearchMeta(data.meta)
        },
        [searchRank],
    )

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType, cursor?: string) => {
                searchRank.endScenario()
                searchRank.registerResultsRequest({
                    query: searchTerm,
                    requestTime: Date.now(),
                })
                setRecentSearchQuery(searchTerm)
                try {
                    let ticketPromise
                    let customerPromise
                    let callPromise
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
                    if (
                        showCallsTab &&
                        (viewType === ViewType.CallList ||
                            viewType === ViewType.All)
                    ) {
                        callPromise = searchVoiceCallsWithHighlights({
                            search: searchTerm,
                            cancelToken,
                            cursor,
                        })
                    }
                    const [ticketData, customerData, callData] =
                        await Promise.all([
                            ticketPromise,
                            customerPromise,
                            callPromise,
                        ])
                    if (ticketData) {
                        handleTicketSearchResult(
                            ticketData.data,
                            viewType,
                            searchTerm,
                            cursor,
                        )
                    }
                    if (customerData) {
                        handleCustomerSearchResult(
                            customerData.data,
                            viewType,
                            searchTerm,
                            cursor,
                        )
                    }
                    if (callData) {
                        handleCallSearchResult(
                            callData.data,
                            viewType,
                            searchTerm,
                            cursor,
                        )
                    }
                } catch (e) {
                    if (!isCancel(e)) {
                        void dispatch(
                            notify({
                                message: 'Failed to fetch search results',
                                status: NotificationStatus.Error,
                            }),
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
            setRecentSearchQuery,
            searchRank,
            handleCustomerSearchResult,
            handleTicketSearchResult,
            handleCallSearchResult,
            dispatch,
            showCallsTab,
        ],
    )

    const [cancellableFetchSearchItems, cancelSearch] = useCancellableRequest(
        createFetchSearchItems,
    )
    const [{ loading: isRequestLoading }, fetchSearchItems] = useAsyncFn(
        cancellableFetchSearchItems,
        [cancellableFetchSearchItems],
    )

    const [{ loading: isDelayedRequestLoading }, delayedFetchSearchItems] =
        useDelayedAsyncFn(
            cancellableFetchSearchItems,
            [cancellableFetchSearchItems],
            300,
        )

    const isLoading = useMemo(
        () => isRequestLoading || isDelayedRequestLoading,
        [isRequestLoading, isDelayedRequestLoading],
    )
    const [{ loading: isFetchingMore }, fetchMoreSearchItems] = useAsyncFn(
        cancellableFetchSearchItems,
        [cancellableFetchSearchItems],
    )

    const reinitializeSearchQuery = () => {
        setSearchQuery(recentSearchQuery)
    }

    const resetSearch = () => {
        !_isEmpty(tickets) && setTickets([])
        !_isEmpty(customers) && setCustomers([])
        !_isEmpty(calls) && setCalls([])
        hasSearched && setHasSearched(false)
        !_isEmpty(ticketsSearchMeta) && setTicketsSearchMeta(undefined)
        !_isEmpty(customersSearchMeta) && setCustomersSearchMeta(undefined)
        !_isEmpty(callSearchMeta) && setCallSearchMeta(undefined)
        setSearchItemsType(defaultSearchItemsType)
        setLastSearchQueries({
            customers: '',
            tickets: '',
            all: '',
            calls: '',
        })
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
            setCallSearchMeta(undefined)
            setTickets([])
            setCustomers([])
            setCalls([])
        }
        setSearchQuery(query)
        setRecentSearchQuery(query)
        resetSelectedIndex()
    }

    const isFooterClean = useMemo(() => {
        return (
            !hasSearched &&
            !isLoading &&
            ((searchItemsType === ViewType.TicketList &&
                _isEmpty(recentTickets)) ||
                (searchItemsType === ViewType.CustomerList &&
                    _isEmpty(recentCustomers)) ||
                (showCallsTab &&
                    searchItemsType === ViewType.CallList &&
                    _isEmpty(recentCalls)))
        )
    }, [
        hasSearched,
        isLoading,
        searchItemsType,
        recentTickets,
        recentCustomers,
        recentCalls,
        showCallsTab,
    ])

    const nextCursor = useMemo(() => {
        switch (searchItemsType) {
            case ViewType.CustomerList:
                return (
                    (customersSearchMeta as CursorPaginationMeta)
                        ?.next_cursor ||
                    (customersSearchMeta as OldSearchPaginationMeta)?.next_items
                )
            case ViewType.TicketList:
                return (
                    (ticketsSearchMeta as CursorPaginationMeta)?.next_cursor ||
                    (ticketsSearchMeta as OldSearchPaginationMeta)?.next_items
                )
            case ViewType.CallList:
                return (
                    (callSearchMeta as CursorPaginationMeta)?.next_cursor ||
                    (callSearchMeta as OldSearchPaginationMeta)?.next_items
                )
            default:
                return undefined
        }
    }, [
        searchItemsType,
        customersSearchMeta,
        ticketsSearchMeta,
        callSearchMeta,
    ])

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
            } else if (searchItemsType === ViewType.CallList) {
                const query =
                    lastSearchQueries[Tabs.Calls] &&
                    searchQuery !== lastSearchQueries[Tabs.Calls]
                        ? lastSearchQueries[Tabs.Calls]
                        : searchQuery
                void fetchSearchItems(query, ViewType.CallList)
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
                type:
                    | 'spotlight-ticket'
                    | 'spotlight-customer'
                    | 'spotlight-call',
            ) => void,
        ) => {
            if (selectedItem) {
                const selectedItemUrl = getSelectedItemUrl(selectedItem)
                logRecentlyAccessedSegmentEvent(
                    isCustomer(selectedItem)
                        ? 'spotlight-customer'
                        : isTicket(selectedItem)
                          ? 'spotlight-ticket'
                          : 'spotlight-call',
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
                    (showCallsTab &&
                        searchItemsType === ViewType.CallList &&
                        lastSearchQueries[Tabs.Calls] !== searchQuery) ||
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
            showCallsTab,
        ],
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
        reinitializeSearchQuery,
        resetSearch,
        searchCallback,
        searchItemsType,
        searchQuery,
        searchRank,
        selectedIndex,
        setSearchItemsType,
        setSelectedIndex,
        tickets,
        calls,
        recentCalls,
        showCallsTab,
    }
}
