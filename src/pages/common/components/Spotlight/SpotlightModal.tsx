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
import {useAsyncFn, usePrevious, useUnmount, useUpdateEffect} from 'react-use'
import _isEmpty from 'lodash/isEmpty'
import {useFlags} from 'launchdarkly-react-client-sdk'
import axios, {CancelToken} from 'axios'

import useSelectedIndex from 'hooks/useSelectedIndex'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import Search from 'pages/common/components/Search'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {ViewType} from 'models/view/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {searchTickets} from 'models/ticket/resources'
import client from 'models/api/resources'
import {ApiListResponsePagination} from 'models/api/types'
import {Ticket} from 'models/ticket/types'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useAppDispatch from 'hooks/useAppDispatch'
import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import {notify} from 'state/notifications/actions'
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
import SpotlightLoader from './SpotlightLoader'
import SpotlightNoResults from './SpotlightNoResults'
import SpotlightTicketRow from './SpotlightTicketRow'
import SpotlightCustomerRow from './SpotlightCustomerRow'
import css from './SpotlightModal.less'

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
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const spotlightSearchInputRef = useRef<HTMLInputElement>(null)
    const isESTicketSearchEnabled =
        useFlags()[FeatureFlagKey.ElasticsearchTicketSearch]
    const isESCustomerSearchEnabled =
        useFlags()[FeatureFlagKey.ElasticsearchCustomerSearch]

    const [searchQuery, setSearchQuery] = useState<string>()
    const [lastSearchQueries, setLastSearchQueries] = useState<{
        [Tabs.Tickets]: string
        [Tabs.Customers]: string
    }>({customers: '', tickets: ''})
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
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
                ? customers.length - 1
                : tickets.length - 1,
        [customers, searchItemsType, tickets]
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
        const scrollArea = scrollAreaRef.current
        if (!scrollArea) return

        const selectedNode = scrollArea.children[selectedIndex]
        if (!selectedNode) return

        selectedNode.scrollIntoView({block: 'nearest'})
    }, [selectedIndex])

    const selectedItem = useMemo(
        () =>
            searchItemsType === ViewType.CustomerList
                ? customers[selectedIndex]
                : tickets[selectedIndex],
        [customers, searchItemsType, selectedIndex, tickets]
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

    useEffect(() => {
        if (isOpen) {
            spotlightSearchInputRef?.current?.focus()
        }
    }, [isOpen])

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
        setSearchItemsType(ViewType.CustomerList)
        setLastSearchQueries({customers: '', tickets: ''})
        cancelSearch()
        searchRank.endScenario()
        resetSelectedIndex()
    }

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType) => {
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
                        cancelToken,
                    })
                    searchEngine = SearchEngine.ES
                } else if (
                    isESCustomerSearchEnabled &&
                    viewType === ViewType.CustomerList
                ) {
                    promise = searchCustomers({
                        search: searchTerm,
                        cancelToken,
                        orderBy: '_score:desc',
                    })
                    searchEngine = SearchEngine.ES
                } else {
                    const url = `/api/views/${0}/items/`
                    promise = client.put<
                        ApiListResponsePagination<Ticket[] | Customer[]>
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
                        setTickets(data.data as Ticket[])
                    } else if (viewType === ViewType.CustomerList) {
                        setLastSearchQueries({
                            ...lastSearchQueries,
                            customers: searchTerm,
                        })
                        setCustomers(data.data as Customer[])
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
            dispatch,
            isESCustomerSearchEnabled,
            isESTicketSearchEnabled,
            lastSearchQueries,
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

    const handleSearchInput = (query: string) => {
        if (!query && searchQuery) {
            cancelSearch()
            setHasSearched(false)
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

        spotlightSearchInputRef.current?.focus()
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
            const scrollArea = scrollAreaRef.current
            if (!scrollArea) return

            const index = Array.prototype.indexOf.call(
                scrollArea.children,
                e.target
            )
            if (index === -1) return

            setSelectedIndex(index)
            spotlightSearchInputRef.current?.focus()
        },
        [setSelectedIndex]
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCloseModal}
            size="large"
            className={css.spotlightModal}
            classNameContent={css.spotlightModalContent}
            isScrollable
        >
            <Search
                className={css.searchInput}
                textInputClassName={classnames(
                    css.textInput,
                    'shortcuts-enable'
                )}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                externalInputRef={spotlightSearchInputRef}
                shouldResetInput={!isOpen}
            />
            <TabNavigator
                tabs={navigatorTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange as (tab: string) => void}
                className={css.tabNavigator}
            />
            {(hasSearched || isLoading) && (
                <ModalBody className={css.modalBody}>
                    {isLoading ? (
                        <SpotlightLoader className={css.loader} />
                    ) : (
                        <>
                            {(_isEmpty(tickets) &&
                                searchItemsType === ViewType.TicketList) ||
                            (_isEmpty(customers) &&
                                searchItemsType === ViewType.CustomerList) ? (
                                <SpotlightNoResults
                                    handleAdvancedSearch={goToAdvancedSearch}
                                />
                            ) : (
                                <SpotlightScrollArea ref={scrollAreaRef}>
                                    <SearchRankScenarioContext.Provider
                                        value={searchRank}
                                    >
                                        {searchItemsType ===
                                            ViewType.TicketList &&
                                            tickets.map((ticket, index) => (
                                                <SpotlightTicketRow
                                                    key={ticket.id}
                                                    item={ticket}
                                                    onCloseModal={onCloseModal}
                                                    onHover={handleHover}
                                                    id={ticket.id}
                                                    index={index}
                                                    selected={
                                                        index === selectedIndex
                                                    }
                                                />
                                            ))}
                                        {searchItemsType ===
                                            ViewType.CustomerList &&
                                            customers.map((customer, index) => (
                                                <SpotlightCustomerRow
                                                    key={customer.id}
                                                    item={customer}
                                                    onCloseModal={onCloseModal}
                                                    onHover={handleHover}
                                                    id={customer.id}
                                                    index={index}
                                                    selected={
                                                        index === selectedIndex
                                                    }
                                                />
                                            ))}
                                    </SearchRankScenarioContext.Provider>
                                </SpotlightScrollArea>
                            )}
                        </>
                    )}
                </ModalBody>
            )}
            <ModalFooter
                className={classnames(css.footer, {
                    [css.cleanSearchFooter]: !hasSearched && !isLoading,
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
