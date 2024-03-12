import classnames from 'classnames'
import {stringify} from 'qs'
import React, {
    KeyboardEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import {useLocation} from 'react-router-dom'
import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import useUnmount from 'hooks/useUnmount'
import useUpdateEffect from 'hooks/useUpdateEffect'
import {ViewType} from 'models/view/types'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import Search from 'pages/common/components/Search'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'

import {SpotlightModalContent} from 'pages/common/components/Spotlight/SpotlightModalContent'
import {Tabs, useSearch} from 'pages/common/components/Spotlight/useSearch'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import history from 'pages/history'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isMacOs} from 'utils/platform'
import css from './SpotlightModal.less'

type Props = {
    isOpen: boolean
    onCloseModal: () => void
}

const navigatorTabs = [
    {label: 'Tickets', value: Tabs.Tickets},
    {label: 'Customers', value: Tabs.Customers},
]

const SpotlightModal = ({isOpen, onCloseModal}: Props) => {
    const {pathname} = useLocation()
    const currentUser = useAppSelector(getCurrentUser)

    const modalBodyRef = useRef<HTMLDivElement>(null)
    const spotlightSearchInputRef = useRef<HTMLInputElement>(null)

    const search = useSearch()
    const {
        searchItemsType,
        handleSearchInput,
        resetSearch,
        searchRank,
        searchQuery,
        previousIndex,
        nextIndex,
        isFooterClean,
        hasSearched,
        setSearchItemsType,
        setSelectedIndex,
        searchCallback,
    } = search

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

    const activeTab: string = useMemo(
        () =>
            searchItemsType === ViewType.TicketList
                ? Tabs.Tickets
                : Tabs.Customers,
        [searchItemsType]
    )

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
                <SpotlightModalContent
                    {...search}
                    handleHover={handleHover}
                    onCloseModal={onCloseModal}
                    modalBodyRef={modalBodyRef}
                    goToAdvancedSearch={goToAdvancedSearch}
                    logRecentlyAccessedSegmentEvent={
                        logRecentlyAccessedSegmentEvent
                    }
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
