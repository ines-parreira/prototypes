import React, {
    KeyboardEvent,
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
    {label: 'Customers', value: Tabs.Customers},
    {label: 'Tickets', value: Tabs.Tickets},
]

const SpotlightModal = ({isOpen, onCloseModal}: Props) => {
    const {pathname} = useLocation()
    const dispatch = useAppDispatch()
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
        ViewType.CustomerList
    )
    const previousSearchItemsType = usePrevious(searchItemsType)

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
    }

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType) => {
                let promise

                if (
                    isESTicketSearchEnabled &&
                    viewType === ViewType.TicketList
                ) {
                    promise = searchTickets({
                        search: searchTerm,
                        filters: '',
                        cancelToken,
                    })
                } else if (
                    isESCustomerSearchEnabled &&
                    viewType === ViewType.CustomerList
                ) {
                    promise = searchCustomers({
                        search: searchTerm,
                        cancelToken,
                        orderBy: '_score:desc',
                    })
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
                    }
                }
            },
        [
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
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (
            event.key === 'Enter' &&
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

    const handleTabChange = (tab: Tabs) => {
        if (tab === Tabs.Customers) {
            setSearchItemsType(ViewType.CustomerList)
        } else if (tab === Tabs.Tickets) {
            setSearchItemsType(ViewType.TicketList)
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
                                <SpotlightScrollArea>
                                    {searchItemsType === ViewType.TicketList &&
                                        tickets.map((ticket) => (
                                            <SpotlightTicketRow
                                                key={ticket.id}
                                                item={ticket}
                                                onCloseModal={onCloseModal}
                                            />
                                        ))}
                                    {searchItemsType ===
                                        ViewType.CustomerList &&
                                        customers.map((customer) => (
                                            <SpotlightCustomerRow
                                                key={customer.id}
                                                item={customer}
                                                onCloseModal={onCloseModal}
                                            />
                                        ))}
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
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    size="small"
                    onClick={goToAdvancedSearch}
                >
                    <span>Advanced Search</span>
                    <ShortcutIcon className={css.shortcut}>⇧</ShortcutIcon>
                    <ShortcutIcon className={css.shortcut}>↩</ShortcutIcon>
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default SpotlightModal
