import React, {
    KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {stringify} from 'qs'
import {useLocation} from 'react-router-dom'
import classnames from 'classnames'
import {usePrevious, useUnmount, useUpdateEffect} from 'react-use'
import _isEmpty from 'lodash/isEmpty'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {CancelToken} from 'axios'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import Search from 'pages/common/components/Search'
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
import {Customer} from 'state/customers/types'
import history from 'pages/history'

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

const SpotlightModal = ({isOpen, onCloseModal}: Props) => {
    const {pathname} = useLocation()
    const dispatch = useAppDispatch()
    const spotlightSearchInputRef = useRef<HTMLInputElement>(null)
    const featureFlags = useFlags()
    const isOnCustomerPage = useMemo(
        () => pathname.includes('/app/customer'),
        [pathname]
    )

    const [searchQuery, setSearchQuery] = useState<string>()
    const previousSearchQuery = usePrevious(searchQuery)
    const [hasSearched, setHasSearched] = useState<boolean>(false)
    const [items, setItems] = useState<Ticket[] | Customer[]>([])
    const [itemsType, setItemsType] = useState<ViewType | undefined>()

    const goToAdvancedSearch = useCallback(() => {
        onCloseModal()

        const advancedSearchPathname = isOnCustomerPage
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
    }, [isOnCustomerPage, onCloseModal, searchQuery])

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
        !_isEmpty(items) && setItems([])
        hasSearched && setHasSearched(false)
        itemsType && setItemsType(undefined)
    }

    const createFetchSearchItems = useCallback(
        (cancelToken: CancelToken) =>
            async (searchTerm: string, viewType: ViewType) => {
                let promise

                if (
                    featureFlags[FeatureFlagKey.ElasticsearchTicketSearch] &&
                    viewType === ViewType.TicketList
                ) {
                    promise = searchTickets({
                        search: searchTerm,
                        filters: '',
                        cancelToken,
                    })
                } else {
                    const url = `/api/views/${0}/items/`
                    promise = client.put<ApiListResponsePagination<Ticket[]>>(
                        url,
                        {
                            view: {search: searchTerm, type: viewType},
                        },
                        {cancelToken}
                    )
                }

                try {
                    const {data} = await promise
                    setItems(data.data)
                } catch (e) {
                    void dispatch(
                        notify({
                            message: 'Failed to fetch search results',
                            status: NotificationStatus.Error,
                        })
                    )
                }
            },
        [featureFlags, dispatch]
    )

    const [cancellableFetchSearchItems] = useCancellableRequest(
        createFetchSearchItems
    )

    const [{loading: isLoading}, fetchSearchItems] = useDelayedAsyncFn(
        cancellableFetchSearchItems,
        [],
        300
    )

    const handleSearch = (query: string) => {
        if (!query && searchQuery) {
            setHasSearched(false)
            setItems([])
        }
        setSearchQuery(query)
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (
            event.key === 'Enter' &&
            searchQuery &&
            previousSearchQuery !== searchQuery
        ) {
            const searchItemsType = isOnCustomerPage
                ? ViewType.CustomerList
                : ViewType.TicketList
            await fetchSearchItems(searchQuery, searchItemsType)
            setItemsType(searchItemsType)
            setHasSearched(true)
        }
    }

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
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                externalInputRef={spotlightSearchInputRef}
                shouldResetInput={!isOpen}
            />
            {(hasSearched || isLoading) && (
                <ModalBody className={css.modalBody}>
                    {isLoading ? (
                        <SpotlightLoader className={css.loader} />
                    ) : (
                        <>
                            {_isEmpty(items) ? (
                                <SpotlightNoResults
                                    handleAdvancedSearch={goToAdvancedSearch}
                                />
                            ) : (
                                <SpotlightScrollArea>
                                    {itemsType &&
                                        items.map((item) => {
                                            if (
                                                itemsType ===
                                                ViewType.TicketList
                                            ) {
                                                return (
                                                    <SpotlightTicketRow
                                                        key={item.id}
                                                        item={item as Ticket}
                                                        onCloseModal={
                                                            onCloseModal
                                                        }
                                                    />
                                                )
                                            } else if (
                                                itemsType ===
                                                ViewType.CustomerList
                                            ) {
                                                return (
                                                    <SpotlightCustomerRow
                                                        key={item.id}
                                                        item={item as Customer}
                                                        onCloseModal={
                                                            onCloseModal
                                                        }
                                                    />
                                                )
                                            }
                                        })}
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
