import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { useUnmount, useUpdateEffect } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import { isMacOs, shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import { stringify } from 'qs'
import { useLocation } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { ViewType } from 'models/view/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import Search from 'pages/common/components/Search'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {
    CALLS_LABEL,
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import css from 'pages/common/components/Spotlight/SpotlightModal.less'
import { SpotlightModalContent } from 'pages/common/components/Spotlight/SpotlightModalContent'
import { Tabs, useSearch } from 'pages/common/components/Spotlight/useSearch'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import { getCurrentUser } from 'state/currentUser/selectors'

type Props = {
    isOpen: boolean
    onCloseModal: () => void
}

export const FEDERATED_SEARCH_TAB_LABEL = 'All'
export const TICKETS_ADVANCED_SEARCH_PATH = '/app/tickets/search'
export const CUSTOMERS_ADVANCED_SEARCH_PATH = '/app/customers/search'

const navigatorTabsWithFederatedSearch = [
    { label: FEDERATED_SEARCH_TAB_LABEL, value: Tabs.All },
    { label: TICKETS_LABEL, value: Tabs.Tickets },
    { label: CALLS_LABEL, value: Tabs.Calls },
    { label: CUSTOMERS_LABEL, value: Tabs.Customers },
]

const viewToTabMap: Record<ViewType, Tabs> = {
    [ViewType.All]: Tabs.All,
    [ViewType.TicketList]: Tabs.Tickets,
    [ViewType.CallList]: Tabs.Calls,
    [ViewType.CustomerList]: Tabs.Customers,
}

const viewToAdvancedSearchPath: Record<
    ViewType.TicketList | ViewType.CustomerList,
    string
> = {
    [ViewType.TicketList]: TICKETS_ADVANCED_SEARCH_PATH,
    [ViewType.CustomerList]: CUSTOMERS_ADVANCED_SEARCH_PATH,
}

const SpotlightModal = ({ isOpen, onCloseModal }: Props) => {
    const { pathname } = useLocation()
    const currentUser = useAppSelector(getCurrentUser)

    const modalBodyRef = useRef<HTMLDivElement>(null)

    const search = useSearch()
    const {
        searchItemsType,
        handleSearchInput,
        hasSearched,
        isFooterClean,
        nextIndex,
        previousIndex,
        reinitializeSearchQuery,
        resetSearch,
        searchCallback,
        searchQuery,
        searchRank,
        setSearchItemsType,
        showCallsTab,
    } = search

    const hasAdvancedSearch = searchItemsType !== ViewType.CallList

    const goToAdvancedSearch = useCallback(() => {
        onCloseModal()

        if (hasAdvancedSearch) {
            const searchPathKey =
                searchItemsType === ViewType.All
                    ? ViewType.TicketList
                    : searchItemsType
            const advancedSearchPathname =
                viewToAdvancedSearchPath[searchPathKey]

            history.push({
                pathname: advancedSearchPathname,
                ...(searchQuery && {
                    search: stringify({
                        q: searchQuery,
                    }),
                }),
            })
        }
    }, [searchItemsType, onCloseModal, searchQuery, hasAdvancedSearch])

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
        if (isOpen) {
            reinitializeSearchQuery()
        } else {
            resetSearch()
        }
    }, [isOpen])

    const handleKeyDown = async (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            previousIndex()
        } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            nextIndex()
        } else if (event.key === 'Enter') {
            await searchCallback(event, logRecentlyAccessedSegmentEvent)
        }
    }

    const handleTabChange = (tab: string) => {
        searchRank.endScenario()
        switch (tab) {
            case Tabs.Customers:
                setSearchItemsType(ViewType.CustomerList)
                logEvent(SegmentEvent.GlobalSearchCustomerTabClick)
                break
            case Tabs.Tickets:
                setSearchItemsType(ViewType.TicketList)
                logEvent(SegmentEvent.GlobalSearchTicketTabClick)
                break
            case Tabs.All:
                setSearchItemsType(ViewType.All)
                logEvent(SegmentEvent.GlobalSearchAllTabClick)
                break
            case Tabs.Calls:
                setSearchItemsType(ViewType.CallList)
                logEvent(SegmentEvent.GlobalSearchCallTabClick)
                break
        }
    }

    const logRecentlyAccessedSegmentEvent = useCallback(
        (
            type: 'spotlight-ticket' | 'spotlight-customer' | 'spotlight-call',
        ) => {
            if (!hasSearched) {
                logEvent(SegmentEvent.RecentItemAccessed, {
                    type,
                    user_id: currentUser.get('id'),
                })
            }
        },
        [hasSearched, currentUser],
    )

    const tabs = navigatorTabsWithFederatedSearch.filter(
        (tab) => showCallsTab || tab.value !== Tabs.Calls,
    )

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
                    'shortcuts-enable',
                )}
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
            />
            <TabNavigator
                tabs={tabs}
                activeTab={viewToTabMap[searchItemsType]}
                onTabChange={handleTabChange}
                className={css.tabNavigator}
            />
            <ModalBody className={css.modalBody} ref={modalBodyRef}>
                <SpotlightModalContent
                    {...search}
                    onTabChange={handleTabChange}
                    onCloseModal={onCloseModal}
                    modalBodyRef={modalBodyRef}
                    goToAdvancedSearch={goToAdvancedSearch}
                    logRecentlyAccessedSegmentEvent={
                        logRecentlyAccessedSegmentEvent
                    }
                    showCallsTab={showCallsTab}
                />
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
                {hasAdvancedSearch && (
                    <Button
                        intent="secondary"
                        fillStyle="ghost"
                        size="small"
                        onClick={() => {
                            goToAdvancedSearch()
                            logEvent(
                                SegmentEvent.GlobalSearchAdvancedButtonClick,
                            )
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
                )}
            </ModalFooter>
        </Modal>
    )
}

export default SpotlightModal
