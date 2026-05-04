import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLocalStorageWithExpiry } from '@repo/hooks'
import { history } from '@repo/routing'
import { shortcutManager } from '@repo/utils'
import { useLocation } from 'react-router-dom'

import { Box, Heading, Modal, ModalSize, Skeleton } from '@gorgias/axiom'

import {
    RECENT_ITEMS_TABLES,
    SEARCH_ADVANCED_PATHS,
    SEARCH_INPUT_PLACEHOLDER,
    SEARCH_QUERY_EXPIRY_TIME,
    SEARCH_QUERY_STORAGE_KEY,
    SEARCH_RESULT_PREFETCH_DISTANCE,
} from '../constants'
import { useRecentItems } from '../hooks/useRecentItems'
import { useSearchSpotlightData } from '../hooks/useSearchSpotlightData'
import { useSearchSpotlightKeyboard } from '../hooks/useSearchSpotlightKeyboard'
import type { RawSearchItem, SearchRow, SearchSectionSummary } from '../types'
import { toCallRow, toCustomerRow, toTicketRow } from '../utils'
import { SearchSpotlightFooter } from './SearchSpotlightFooter'
import { SearchSpotlightHeader } from './SearchSpotlightHeader'
import { SearchSpotlightSection } from './SearchSpotlightSection'
import { SearchSpotlightTabs } from './SearchSpotlightTabs'
import {
    getRowsForSection,
    getSectionTitle,
    isCallRow,
    isCustomerRow,
    isTicketRow,
    stripRowHighlights,
    toRecentRows,
} from './utils/searchSpotlightUtils'

import css from './SearchSpotlightRoot.module.less'

export type SearchSpotlightRootProps = {
    isOpen: boolean
    onClose: () => void
    showCalls?: boolean
}

const SEARCH_SPOTLIGHT_SHORTCUT_SCOPE = 'SearchSpotlightModal'

function scheduleNavigation(callback: () => void) {
    // Let the modal close and finish its focus restoration before the next
    // route mounts, otherwise the advanced-search input loses autofocus.
    if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => {
            callback()
        })
        return
    }

    window.setTimeout(callback, 0)
}

export function SearchSpotlightRoot({
    isOpen,
    onClose,
    showCalls = true,
}: SearchSpotlightRootProps) {
    const { pathname } = useLocation()
    const previousPathnameRef = useRef(pathname)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const rowRefs = useRef(new Map<number, HTMLTableRowElement>())
    const resultsViewportRef = useRef<HTMLDivElement>(null)
    const shouldScrollSelectedRowIntoViewRef = useRef(false)
    const { state: recentSearchQuery, setState: setRecentSearchQuery } =
        useLocalStorageWithExpiry<string>(
            SEARCH_QUERY_STORAGE_KEY,
            SEARCH_QUERY_EXPIRY_TIME,
            '',
        )
    const [searchQuery, setSearchQuery] = useState(recentSearchQuery)
    const [selectedSection, setSelectedSection] = useState<
        'all' | 'customers' | 'tickets' | 'calls'
    >('all')
    const [selectedIndex, setSelectedIndex] = useState(0)

    const {
        items: recentCustomerItems,
        isGettingItems: isGettingRecentCustomers,
        setRecentItem: setRecentCustomerItem,
    } = useRecentItems<RawSearchItem>(RECENT_ITEMS_TABLES.customers)
    const {
        items: recentTicketItems,
        isGettingItems: isGettingRecentTickets,
        setRecentItem: setRecentTicketItem,
    } = useRecentItems<RawSearchItem>(RECENT_ITEMS_TABLES.tickets)
    const {
        items: recentCallItems,
        isGettingItems: isGettingRecentCalls,
        setRecentItem: setRecentCallItem,
    } = useRecentItems<RawSearchItem>(RECENT_ITEMS_TABLES.calls)

    const {
        isLoading,
        isSearchMode,
        calls,
        customers,
        tickets,
        totals,
        pagination,
    } = useSearchSpotlightData({
        query: searchQuery,
        isOpen,
        showCalls,
    })

    const recentCustomers = useMemo(
        () =>
            toRecentRows(recentCustomerItems, toCustomerRow)
                .filter(isCustomerRow)
                .map(stripRowHighlights),
        [recentCustomerItems],
    )
    const recentTickets = useMemo(
        () =>
            toRecentRows(recentTicketItems, toTicketRow)
                .filter(isTicketRow)
                .map(stripRowHighlights),
        [recentTicketItems],
    )
    const recentCalls = useMemo(
        () =>
            toRecentRows(recentCallItems, toCallRow)
                .filter(isCallRow)
                .map(stripRowHighlights),
        [recentCallItems],
    )

    const customerRows = isSearchMode ? customers : recentCustomers
    const ticketRows = isSearchMode ? tickets : recentTickets
    const callRows = isSearchMode ? calls : recentCalls

    const sectionSummaries = useMemo<SearchSectionSummary[]>(() => {
        const sections: SearchSectionSummary[] = [
            {
                id: 'customers',
                title: getSectionTitle('customers', isSearchMode),
                recentTitle: 'Recently accessed customers',
                rows: getRowsForSection(
                    customerRows,
                    selectedSection === 'all',
                ),
                totalCount: isSearchMode
                    ? totals.customers
                    : recentCustomers.length,
                emptyMessage: isSearchMode
                    ? 'No customers found'
                    : 'No recently accessed customers',
            },
            {
                id: 'tickets',
                title: getSectionTitle('tickets', isSearchMode),
                recentTitle: 'Recently accessed tickets',
                rows: getRowsForSection(ticketRows, selectedSection === 'all'),
                totalCount: isSearchMode
                    ? totals.tickets
                    : recentTickets.length,
                emptyMessage: isSearchMode
                    ? 'No tickets found'
                    : 'No recently accessed tickets',
            },
        ]

        if (showCalls) {
            sections.push({
                id: 'calls',
                title: getSectionTitle('calls', isSearchMode),
                recentTitle: 'Recently accessed calls',
                rows: getRowsForSection(callRows, selectedSection === 'all'),
                totalCount: isSearchMode ? totals.calls : recentCalls.length,
                emptyMessage: isSearchMode
                    ? 'No calls found'
                    : 'No recently accessed calls',
            })
        }

        if (selectedSection === 'all') {
            return sections
        }

        return sections.filter((section) => section.id === selectedSection)
    }, [
        callRows,
        customerRows,
        isSearchMode,
        recentCalls.length,
        recentCustomers.length,
        recentTickets.length,
        selectedSection,
        showCalls,
        ticketRows,
        totals.calls,
        totals.customers,
        totals.tickets,
    ])

    const rowsWithSelection = useMemo(() => {
        let currentIndex = 0

        return sectionSummaries.map((section) => ({
            ...section,
            rows: section.rows.map((row) => ({
                row,
                globalIndex: currentIndex++,
            })),
        }))
    }, [sectionSummaries])

    const flatRows = useMemo(
        () => rowsWithSelection.flatMap((section) => section.rows),
        [rowsWithSelection],
    )
    const hasVisibleRows = flatRows.length > 0

    const buttonCounts = useMemo(
        () => ({
            all: isSearchMode
                ? totals.customers +
                  totals.tickets +
                  (showCalls ? totals.calls : 0)
                : null,
            customers: isSearchMode ? totals.customers : null,
            tickets: isSearchMode ? totals.tickets : null,
            calls: isSearchMode ? totals.calls : null,
        }),
        [
            isSearchMode,
            showCalls,
            totals.calls,
            totals.customers,
            totals.tickets,
        ],
    )

    const activePagination = useMemo(() => {
        if (!isSearchMode || selectedSection === 'all') {
            return undefined
        }

        return pagination[selectedSection]
    }, [isSearchMode, pagination, selectedSection])

    const isLoadingRecents =
        !isSearchMode &&
        (isGettingRecentCustomers ||
            isGettingRecentTickets ||
            (showCalls && isGettingRecentCalls))

    const goToAdvancedSearch = useCallback(() => {
        if (selectedSection === 'calls') {
            return
        }

        const pathname =
            SEARCH_ADVANCED_PATHS[
                selectedSection === 'all' ? 'all' : selectedSection
            ]
        const search = searchQuery.trim()

        onClose()
        scheduleNavigation(() => {
            history.push({
                pathname,
                search: search
                    ? `?${new URLSearchParams({ q: search }).toString()}`
                    : '',
            })
        })
    }, [onClose, searchQuery, selectedSection])

    const handleSearchQueryChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            setRecentSearchQuery(query)
        },
        [setRecentSearchQuery],
    )

    const persistRecentItem = useCallback(
        (row: SearchRow) => {
            switch (row.kind) {
                case 'customer':
                    setRecentCustomerItem(row.raw)
                    return
                case 'ticket':
                    setRecentTicketItem(row.raw)
                    return
                case 'call':
                    setRecentCallItem(row.raw)
                    return
            }
        },
        [setRecentCallItem, setRecentCustomerItem, setRecentTicketItem],
    )

    const openRow = useCallback(
        async (row: SearchRow, openInNewTab: boolean) => {
            if (!row.url) {
                return
            }

            persistRecentItem(row)

            if (openInNewTab) {
                window.open(row.url, '_blank', 'noopener')
                return
            }

            onClose()
            history.push(row.url)
        },
        [onClose, persistRecentItem],
    )

    const setRowRef = useCallback(
        (index: number, element: HTMLTableRowElement | null) => {
            if (element) {
                rowRefs.current.set(index, element)
                return
            }

            rowRefs.current.delete(index)
        },
        [],
    )

    useSearchSpotlightKeyboard({
        flatRows,
        goToAdvancedSearch,
        isOpen,
        openRow,
        onKeyboardSelectionChange: () => {
            shouldScrollSelectedRowIntoViewRef.current = true
        },
        selectedIndex,
        setSelectedIndex,
    })

    useEffect(() => {
        if (selectedIndex >= flatRows.length) {
            setSelectedIndex(0)
        }
    }, [flatRows.length, selectedIndex])

    useEffect(() => {
        if (!shouldScrollSelectedRowIntoViewRef.current) {
            return
        }

        if (!isOpen) {
            shouldScrollSelectedRowIntoViewRef.current = false
            return
        }

        const row = rowRefs.current.get(selectedIndex)

        if (row && typeof row.scrollIntoView === 'function') {
            row.scrollIntoView({
                block: 'nearest',
            })
        }
        shouldScrollSelectedRowIntoViewRef.current = false
    }, [isOpen, selectedIndex])

    useEffect(() => {
        if (isOpen) {
            setSearchQuery(recentSearchQuery)
            return
        }

        setSelectedSection('all')
        setSelectedIndex(0)
    }, [isOpen, recentSearchQuery])

    useEffect(() => {
        setSelectedIndex(0)
    }, [selectedSection, isSearchMode])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        shortcutManager.bind(SEARCH_SPOTLIGHT_SHORTCUT_SCOPE, {
            GO_ADVANCED_SEARCH: {
                action: () => {
                    if (selectedSection !== 'calls') {
                        goToAdvancedSearch()
                    }
                },
            },
        })

        return () => {
            shortcutManager.unbind(SEARCH_SPOTLIGHT_SHORTCUT_SCOPE)
        }
    }, [goToAdvancedSearch, isOpen, selectedSection])

    useEffect(() => {
        if (isOpen) {
            shortcutManager.pause([SEARCH_SPOTLIGHT_SHORTCUT_SCOPE])
            return
        }

        shortcutManager.unpause()
    }, [isOpen])

    useEffect(() => {
        if (isOpen && previousPathnameRef.current !== pathname) {
            onClose()
        }

        previousPathnameRef.current = pathname
    }, [isOpen, onClose, pathname])

    const handleResultsViewportScroll = useCallback(() => {
        if (!activePagination || !resultsViewportRef.current) {
            return
        }

        const { scrollHeight, scrollTop, clientHeight } =
            resultsViewportRef.current
        const remainingScrollDistance = scrollHeight - scrollTop - clientHeight

        if (
            remainingScrollDistance <= SEARCH_RESULT_PREFETCH_DISTANCE &&
            activePagination.hasNextPage &&
            !activePagination.isFetchingNextPage
        ) {
            activePagination.fetchNextPage()
        }
    }, [activePagination])

    useEffect(() => {
        return () => {
            shortcutManager.unpause()
            shortcutManager.unbind(SEARCH_SPOTLIGHT_SHORTCUT_SCOPE)
        }
    }, [])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            size={ModalSize.Xl}
        >
            <Box
                className={css.root}
                flexDirection="column"
                gap="md"
                h={680}
                minHeight={680}
            >
                <Heading slot="title" style={{ display: 'none' }}>
                    Search
                </Heading>
                <SearchSpotlightHeader
                    placeholder={SEARCH_INPUT_PLACEHOLDER}
                    searchInputRef={searchInputRef}
                    searchQuery={searchQuery}
                    selectedSection={selectedSection}
                    onGoToAdvancedSearch={goToAdvancedSearch}
                    onSearchQueryChange={handleSearchQueryChange}
                />
                <SearchSpotlightTabs
                    buttonCounts={buttonCounts}
                    selectedSection={selectedSection}
                    showCalls={showCalls}
                    onSelectionChange={setSelectedSection}
                />
                <Box
                    aria-label="Search results"
                    flexDirection="column"
                    flexGrow={1}
                    gap="lg"
                    minHeight={0}
                    ref={resultsViewportRef}
                    role="region"
                    style={{ overflowY: 'auto' }}
                    onScroll={handleResultsViewportScroll}
                >
                    {(isLoading && !hasVisibleRows) ||
                    (isLoadingRecents && !hasVisibleRows) ? (
                        <Skeleton />
                    ) : (
                        <SearchSpotlightSection
                            isSearchMode={isSearchMode}
                            onOpenRow={openRow}
                            onSelectSection={(section) => {
                                setSelectedSection(section)
                            }}
                            selectedSection={selectedSection}
                            sections={rowsWithSelection}
                            selectedIndex={selectedIndex}
                            showLoadingMoreRows={Boolean(
                                activePagination?.isFetchingNextPage,
                            )}
                            setRowRef={setRowRef}
                            setSelectedIndex={setSelectedIndex}
                        />
                    )}
                </Box>
                <SearchSpotlightFooter />
            </Box>
        </Modal>
    )
}
