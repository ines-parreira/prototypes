import React, {
    KeyboardEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {stringify} from 'qs'
import {useLocation} from 'react-router-dom'
import classnames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import {useFlags} from 'launchdarkly-react-client-sdk'
import axios, {CancelToken} from 'axios'
import {VirtuosoHandle} from 'react-virtuoso'

import {logEvent, SegmentEvent} from 'common/segment'
import useSelectedIndex from 'hooks/useSelectedIndex'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import Search from 'pages/common/components/Search'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {ViewType} from 'models/view/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {searchTickets} from 'models/ticket/resources'
import client from 'models/api/resources'
import {ApiListResponsePagination, CursorMeta} from 'models/api/types'
import {Ticket} from 'models/ticket/types'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import {RecentItems} from 'hooks/useRecentItems/constants'
import usePrevious from 'hooks/usePrevious'
import useAsyncFn from 'hooks/useAsyncFn'
import useUpdateEffect from 'hooks/useUpdateEffect'
import useUnmount from 'hooks/useUnmount'
import {notify} from 'state/notifications/actions'
import {getCurrentUser} from 'state/currentUser/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {Customer} from 'models/customer/types'
import history from 'pages/history'
import {searchCustomers} from 'models/customer/resources'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {SearchEngine} from 'models/search/types'
import {isMacOs} from 'utils/platform'

import SpotlightScrollArea from './SpotlightScrollArea'
import SpotlightNoResults from './SpotlightNoResults'
import SpotlightTicketRow from './SpotlightTicketRow'
import SpotlightCustomerRow from './SpotlightCustomerRow'
import css from './SpotlightModal.less'

type OldSearchPaginationMeta = {
    prev_items: string
    next_items: string
}

type MetaType = CursorMeta | OldSearchPaginationMeta

type Props = {
    isOpen: boolean
    onCloseModal: () => void
}

enum Tabs {
    Tickets = 'tickets',
    Customers = 'customers',
}

const navigatorTabs = [
    {label: 'Tickets', value: Tabs.Tickets},
    {label: 'Customers', value: Tabs.Customers},
]

const searchRankScenarioSource = {
    [ViewType.CustomerList]: SearchRankSource.SpotlightCustomer,
    [ViewType.TicketList]: SearchRankSource.SpotlightTicket,
}

const SpotlightModal = ({isOpen, onCloseModal}: Props) => {
    const {pathname} = useLocation()
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)

    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const modalBodyRef = useRef<HTMLDivElement>(null)
    const spotlightSearchInputRef = useRef<HTMLInputElement>(null)

    const isESTicketSearchEnabled =
        useFlags()[FeatureFlagKey.ElasticsearchTicketSearch]

    const [searchQuery, setSearchQuery] = useState<string>()
    const [lastSearchQueries, setLastSearchQueries] = useState<{
        [Tabs.Tickets]: string
        [Tabs.Customers]: string
    }>({customers: '', tickets: ''})
    const [ticketsSearchMeta, setTicketsSearchMeta] = useState<MetaType>()
    const [customersSearchMeta, setCustomersSearchMeta] = useState<MetaType>()
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const {items: recentTickets} = useRecentItems<Ticket>(RecentItems.Tickets)
    const {items: recentCustomers} = useRecentItems<Customer>(
        RecentItems.Customers
    )
    const [searchItemsType, setSearchItemsType] = useState<ViewType>(
        ViewType.TicketList
    )
    const previousSearchItemsType = usePrevious(searchItemsType)

    const searchRank = useSearchRankScenario(
        searchRankScenarioSource[searchItemsType]
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

    useEffect(() => {
        const virtuosoScrollArea = virtuosoRef.current
        if (!virtuosoScrollArea) return
        virtuosoScrollArea.scrollIntoView({index: selectedIndex})
    }, [selectedIndex])

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

    const goToAdvancedSearch = useCallback(() => {
        onCloseModal()

        const advancedSearchPathname =
            searchItemsType === ViewType.CustomerList
                ? '/app/customers/search'
                : '/app/tickets/search'

        history.push({
            pathname: advancedSearchPathname,
            ...(searchQuery && {
                search: stringify({
                    q: searchQuery,
                }),
            }),
        })
    }, [searchItemsType, onCloseModal, searchQuery])

    useEffect(() => {
        shortcutManager.bind('SpotlightModal', {
            GO_ADVANCED_SEARCH: {
                action: () => {
                    if (isOpen) {
                        goToAdvancedSearch()
                        logEvent(SegmentEvent.GlobalSearchAdvancedShortcut)
                    }
                },
            },
        })
    }, [isOpen, goToAdvancedSearch])

    useUpdateEffect(() => {
        if (isOpen) {
            shortcutManager.pause(['SpotlightModal'])
        } else {
            shortcutManager.unpause()
        }
    }, [isOpen])

    useUnmount(() => {
        shortcutManager.unpause()
        shortcutManager.unbind('SpotlightModal')
    })

    useUpdateEffect(() => {
        onCloseModal()
    }, [pathname])

    useUpdateEffect(() => {
        if (!isOpen) {
            resetSearch()
        }
    }, [isOpen])

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

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType, cursor?: string) => {
                searchRank.endScenario()
                searchRank.registerResultsRequest({
                    query: searchTerm,
                    requestTime: Date.now(),
                })
                let promise
                let searchEngine = SearchEngine.PG

                if (
                    isESTicketSearchEnabled &&
                    viewType === ViewType.TicketList
                ) {
                    promise = searchTickets({
                        search: searchTerm,
                        filters: '',
                        cursor,
                        cancelToken,
                    })
                    searchEngine = SearchEngine.ES
                } else if (viewType === ViewType.CustomerList) {
                    promise = searchCustomers({
                        search: searchTerm,
                        orderBy: '_score:desc',
                        cursor,
                        cancelToken,
                    })
                    searchEngine = SearchEngine.ES
                } else {
                    const url = cursor || `/api/views/${0}/items/`
                    promise = client.put<
                        ApiListResponsePagination<
                            Ticket[] | Customer[],
                            OldSearchPaginationMeta
                        >
                    >(
                        url,
                        {
                            view: {search: searchTerm, type: viewType},
                        },
                        {cancelToken}
                    )
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
        [searchRank, dispatch, isESTicketSearchEnabled, lastSearchQueries]
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

    const [{loading: isFetchingMore}, fetchMoreSearchItems] = useAsyncFn(
        cancellableFetchSearchItems,
        [cancellableFetchSearchItems]
    )

    const isLoading = useMemo(
        () => isRequestLoading || isDelayedRequestLoading,
        [isRequestLoading, isDelayedRequestLoading]
    )

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

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            previousIndex()
        } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            nextIndex()
        } else if (event.key === 'Enter') {
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
    }

    const handleTabChange = (tab: Tabs) => {
        searchRank.endScenario()
        if (tab === Tabs.Customers) {
            setSearchItemsType(ViewType.CustomerList)
            logEvent(SegmentEvent.GlobalSearchCustomerTabClick)
        } else if (tab === Tabs.Tickets) {
            setSearchItemsType(ViewType.TicketList)
            logEvent(SegmentEvent.GlobalSearchTicketTabClick)
        }
    }

    const activeTab: string = useMemo(() => {
        if (searchItemsType === ViewType.CustomerList) {
            return Tabs.Customers
        } else if (searchItemsType === ViewType.TicketList) {
            return Tabs.Tickets
        }

        return Tabs.Customers
    }, [searchItemsType])

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
    ])

    const handleHover = useCallback(
        (e: MouseEvent) => {
            const index =
                e.currentTarget.parentElement?.getAttribute('data-index')
            if (!index) return

            setSelectedIndex(parseInt(index))
            spotlightSearchInputRef.current?.focus()
        },
        [setSelectedIndex]
    )

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

    const handleLoadMore = useCallback(async () => {
        await fetchMoreSearchItems(searchQuery!, searchItemsType, nextCursor)
    }, [fetchMoreSearchItems, searchQuery, searchItemsType, nextCursor])

    const logRecentlyAccessedSegmentEvent = useCallback(
        (type: 'spotlight-ticket' | 'spotlight-customer') => {
            if (!hasSearched) {
                logEvent(SegmentEvent.RecentItemAccessed, {
                    type,
                    user_id: currentUser.get('id'),
                })
            }
        },
        [hasSearched, currentUser]
    )

    const modalContent = useMemo(() => {
        if (isLoading) {
            return <SkeletonLoader className={css.loader} />
        }

        if (
            hasSearched &&
            ((_isEmpty(tickets) && searchItemsType === ViewType.TicketList) ||
                (_isEmpty(customers) &&
                    searchItemsType === ViewType.CustomerList))
        ) {
            return (
                <SpotlightNoResults
                    title="No results"
                    bodyText="You may want to try using different keywords or check for typos."
                    handleAdvancedSearch={goToAdvancedSearch}
                />
            )
        }

        if (
            !hasSearched &&
            ((_isEmpty(recentTickets) &&
                searchItemsType === ViewType.TicketList) ||
                (_isEmpty(recentCustomers) &&
                    searchItemsType === ViewType.CustomerList))
        ) {
            return (
                <SpotlightNoResults
                    title="No recent results"
                    bodyText="Try searching for a ticket or customer."
                    handleAdvancedSearch={goToAdvancedSearch}
                />
            )
        }

        const displayedTickets = hasSearched ? tickets : recentTickets
        const displayedCustomers = hasSearched ? customers : recentCustomers

        const header =
            !hasSearched &&
            ((!_isEmpty(recentTickets) &&
                searchItemsType === ViewType.TicketList) ||
                (!_isEmpty(recentCustomers) &&
                    searchItemsType === ViewType.CustomerList))
                ? () => (
                      <div className={css.recentItemsHeader}>
                          Recently accessed
                      </div>
                  )
                : undefined

        return (
            <SearchRankScenarioContext.Provider value={searchRank}>
                <SpotlightScrollArea
                    ref={virtuosoRef}
                    scrollerRef={modalBodyRef}
                    data={
                        searchItemsType === ViewType.CustomerList
                            ? displayedCustomers
                            : searchItemsType === ViewType.TicketList
                            ? displayedTickets
                            : undefined
                    }
                    canLoadMore={!!nextCursor}
                    loadMore={handleLoadMore}
                    isLoading={isFetchingMore}
                    itemContent={(index, item) => {
                        if (searchItemsType === ViewType.TicketList) {
                            return (
                                <SpotlightTicketRow
                                    id={item.id}
                                    index={index}
                                    item={item as Ticket}
                                    onCloseModal={onCloseModal}
                                    onHover={handleHover}
                                    selected={index === selectedIndex}
                                    onClick={() => {
                                        logRecentlyAccessedSegmentEvent(
                                            'spotlight-ticket'
                                        )
                                    }}
                                />
                            )
                        } else if (searchItemsType === ViewType.CustomerList) {
                            return (
                                <SpotlightCustomerRow
                                    id={item.id}
                                    index={index}
                                    item={item as Customer}
                                    onCloseModal={onCloseModal}
                                    onHover={handleHover}
                                    selected={index === selectedIndex}
                                    onClick={() => {
                                        logRecentlyAccessedSegmentEvent(
                                            'spotlight-customer'
                                        )
                                    }}
                                />
                            )
                        }
                    }}
                    header={header}
                ></SpotlightScrollArea>
            </SearchRankScenarioContext.Provider>
        )
    }, [
        isLoading,
        searchItemsType,
        tickets,
        customers,
        recentTickets,
        recentCustomers,
        goToAdvancedSearch,
        searchRank,
        virtuosoRef,
        modalBodyRef,
        nextCursor,
        handleLoadMore,
        isFetchingMore,
        onCloseModal,
        handleHover,
        selectedIndex,
        hasSearched,
        logRecentlyAccessedSegmentEvent,
    ])

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCloseModal}
            size="large"
            className={css.spotlightModal}
            classNameContent={css.spotlightModalContent}
            isScrollable
            forceFocus
        >
            <Search
                className={css.searchInput}
                textInputClassName={classnames(
                    css.textInput,
                    'shortcuts-enable'
                )}
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                ref={spotlightSearchInputRef}
                autoFocus
            />
            <TabNavigator
                tabs={navigatorTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange as (tab: string) => void}
                className={css.tabNavigator}
            />
            <ModalBody className={css.modalBody} ref={modalBodyRef}>
                {modalContent}
            </ModalBody>
            <ModalFooter
                className={classnames(css.footer, {
                    [css.cleanSearchFooter]: isFooterClean,
                })}
            >
                <div className={css.navigationShortcutWrapper}>
                    <ShortcutIcon
                        fillStyle="ghost"
                        className={css.navigationShortcut}
                    >
                        ↑↓ Select
                    </ShortcutIcon>
                    <ShortcutIcon
                        fillStyle="ghost"
                        className={css.navigationShortcut}
                    >
                        ↩ Open
                    </ShortcutIcon>
                    <ShortcutIcon
                        fillStyle="ghost"
                        className={css.navigationShortcut}
                    >
                        {`${isMacOs ? '⌘' : 'ctrl'} + ↩ Open in a new tab`}
                    </ShortcutIcon>
                </div>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                    onClick={() => {
                        goToAdvancedSearch()
                        logEvent(SegmentEvent.GlobalSearchAdvancedButtonClick)
                    }}
                >
                    <span>Advanced Search</span>
                    <ShortcutIcon className={css.advancedShortcut}>
                        ⇧
                    </ShortcutIcon>
                    <ShortcutIcon className={css.advancedShortcut}>
                        ↩
                    </ShortcutIcon>
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default SpotlightModal
