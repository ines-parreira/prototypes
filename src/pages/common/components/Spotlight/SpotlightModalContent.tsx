import _isEmpty from 'lodash/isEmpty'
import React, {MouseEvent, RefObject, useEffect, useRef} from 'react'
import {GroupedVirtuosoHandle, VirtuosoHandle} from 'react-virtuoso'

import {SearchRank} from 'hooks/useSearchRankScenario'
import {
    isCustomer,
    isTicket,
    PickedCustomer,
    PickedCustomerWithHighlights,
    PickedTicket,
    PickedTicketWithHighlights,
    PicketVoiceCallWithHighlights,
} from 'models/search/types'
import {ViewType} from 'models/view/types'
import {isVoiceCall} from 'models/voiceCall/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import {
    CUSTOMERS_LABEL,
    FEDERATED_SEARCH_GROUP_SIZE,
    TICKETS_LABEL,
    CALLS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import css from 'pages/common/components/Spotlight/SpotlightModal.less'
import SpotlightNoResults from 'pages/common/components/Spotlight/SpotlightNoResults'
import SpotlightScrollArea, {
    GroupedSpotlightScrollArea,
} from 'pages/common/components/Spotlight/SpotlightScrollArea'
import SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'
import {Tabs} from 'pages/common/components/Spotlight/useSearch'

import SpotlightCallRow from './SpotlightCallRow'

export const RECENTLY_ACCESSED_LABEL = 'Recently accessed'
export const MORE_RESULTS_LABEL = 'More results'

const hasNoResults = (
    tickets: unknown[],
    customers: unknown[],
    searchItemsType: ViewType
) => {
    switch (searchItemsType) {
        case ViewType.All:
            return _isEmpty(customers) && _isEmpty(tickets)
        case ViewType.CustomerList:
            return _isEmpty(customers)
        case ViewType.TicketList:
            return _isEmpty(tickets)
        case ViewType.CallList:
            return true
    }
}
const hasNoRecentResults = (
    tickets: unknown[],
    customers: unknown[],
    calls: unknown[],
    searchItemsType: ViewType
) => {
    switch (searchItemsType) {
        case ViewType.All:
            return _isEmpty(tickets) && _isEmpty(customers)
        case ViewType.CustomerList:
            return _isEmpty(customers)
        case ViewType.TicketList:
            return _isEmpty(tickets)
        case ViewType.CallList:
            return _isEmpty(calls)
    }
}

const getData = (
    searchItemsType: ViewType,
    displayedCustomers: PickedCustomerWithHighlights[],
    displayedTicket: PickedTicketWithHighlights[],
    displayedCalls: PicketVoiceCallWithHighlights[],
    showCallsTab?: boolean
): (
    | PickedCustomerWithHighlights
    | PickedTicketWithHighlights
    | PicketVoiceCallWithHighlights
)[] => {
    switch (searchItemsType) {
        case ViewType.CustomerList: {
            return displayedCustomers
        }
        case ViewType.TicketList: {
            return displayedTicket
        }
        case ViewType.All: {
            const tickets = displayedTicket.slice(
                0,
                FEDERATED_SEARCH_GROUP_SIZE
            )
            const calls = displayedCalls.slice(0, FEDERATED_SEARCH_GROUP_SIZE)
            const customers = displayedCustomers.slice(
                0,
                FEDERATED_SEARCH_GROUP_SIZE
            )
            if (showCallsTab) {
                return [...tickets, ...calls, ...customers]
            }
            return [...tickets, ...customers]
        }
        case ViewType.CallList: {
            return showCallsTab ? displayedCalls : []
        }
    }
}

type Props = {
    isLoading: boolean
    searchItemsType: ViewType
    tickets: PickedTicket[]
    customers: PickedCustomer[]
    recentTickets: PickedTicket[]
    recentCustomers: PickedCustomer[]
    goToAdvancedSearch: () => void
    searchRank: SearchRank
    modalBodyRef: RefObject<HTMLDivElement>
    nextCursor: string | undefined
    handleLoadMore: () => Promise<void>
    isFetchingMore: boolean
    onCloseModal: () => void
    handleHover: (e: MouseEvent) => void
    selectedIndex: number
    hasSearched: boolean
    logRecentlyAccessedSegmentEvent: (
        type: 'spotlight-ticket' | 'spotlight-customer' | 'spotlight-call'
    ) => void
    onTabChange: (tab: string) => void
    showCallsTab?: boolean
    recentCalls: PicketVoiceCallWithHighlights[]
}

export const SpotlightModalContent = ({
    isLoading,
    searchItemsType,
    tickets,
    customers,
    recentTickets,
    recentCustomers,
    goToAdvancedSearch,
    searchRank,
    modalBodyRef,
    nextCursor,
    handleLoadMore,
    isFetchingMore,
    onCloseModal,
    handleHover,
    selectedIndex,
    hasSearched,
    logRecentlyAccessedSegmentEvent,
    onTabChange,
    showCallsTab,
    recentCalls,
}: Props) => {
    const virtuosoRef = useRef<VirtuosoHandle | GroupedVirtuosoHandle>(null)
    const groupedVirtuosoRef = useRef<GroupedVirtuosoHandle>(null)
    const showAdvancedSearch = searchItemsType !== ViewType.CallList

    useEffect(() => {
        const virtuosoScrollArea = virtuosoRef.current
        if (!virtuosoScrollArea) return
        virtuosoScrollArea.scrollIntoView({index: selectedIndex})
    }, [selectedIndex])

    useEffect(() => {
        const virtuosoScrollArea = groupedVirtuosoRef.current
        if (!virtuosoScrollArea) return
        virtuosoScrollArea.scrollIntoView({index: selectedIndex})
    }, [selectedIndex])

    if (isLoading) {
        return <SkeletonLoader className={css.loader} />
    }

    if (hasSearched && hasNoResults(tickets, customers, searchItemsType)) {
        return (
            <SpotlightNoResults
                title="No results"
                bodyText="You may want to try using different keywords or check for typos."
                handleAdvancedSearch={goToAdvancedSearch}
                showAdvancedSearch={showAdvancedSearch}
            />
        )
    }

    if (
        !hasSearched &&
        hasNoRecentResults(
            recentTickets,
            recentCustomers,
            recentCalls,
            searchItemsType
        )
    ) {
        const message = showCallsTab
            ? 'Try searching for a ticket, call or customer.'
            : 'Try searching for a ticket or customer.'
        return (
            <SpotlightNoResults
                title="No recent results"
                bodyText={message}
                handleAdvancedSearch={goToAdvancedSearch}
                showAdvancedSearch={showAdvancedSearch}
            />
        )
    }

    const displayedTickets = hasSearched ? tickets : recentTickets
    const displayedCustomers = hasSearched ? customers : recentCustomers
    const displayedCalls = hasSearched ? [] : recentCalls

    const shouldDisplayRecentItems =
        !hasSearched &&
        ((searchItemsType === ViewType.TicketList &&
            !_isEmpty(recentTickets)) ||
            (searchItemsType === ViewType.CustomerList &&
                !_isEmpty(recentCustomers)) ||
            (showCallsTab &&
                searchItemsType === ViewType.CallList &&
                !_isEmpty(recentCalls)) ||
            (searchItemsType === ViewType.All &&
                (!_isEmpty(recentCustomers) || !_isEmpty(recentTickets))))

    const data = getData(
        searchItemsType,
        displayedCustomers,
        displayedTickets,
        displayedCalls,
        showCallsTab
    )

    const ticketOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-ticket')
    }
    const customerOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-customer')
    }
    const callOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-call')
    }

    const itemContentCallback = (
        index: number,
        item:
            | PickedTicket
            | PickedCustomer
            | PickedCustomerWithHighlights
            | PickedTicketWithHighlights
            | PicketVoiceCallWithHighlights
    ) => {
        const selected = index === selectedIndex
        if (isTicket(item)) {
            return (
                <SpotlightTicketRow
                    id={item.id}
                    index={index}
                    item={item}
                    onCloseModal={onCloseModal}
                    onHover={handleHover}
                    selected={selected}
                    onClick={ticketOnClickHandler}
                />
            )
        }
        if (isCustomer(item)) {
            return (
                <SpotlightCustomerRow
                    id={item.id}
                    index={index}
                    item={item}
                    onCloseModal={onCloseModal}
                    onHover={handleHover}
                    selected={selected}
                    onClick={customerOnClickHandler}
                />
            )
        }
        if (isVoiceCall(item)) {
            return (
                <SpotlightCallRow
                    id={item.id}
                    index={index}
                    item={item}
                    onCloseModal={onCloseModal}
                    onHover={handleHover}
                    selected={selected}
                    onClick={callOnClickHandler}
                />
            )
        }
    }

    return (
        <SearchRankScenarioContext.Provider value={searchRank}>
            {searchItemsType === ViewType.All && !shouldDisplayRecentItems ? (
                <GroupedSpotlightScrollArea
                    ref={groupedVirtuosoRef}
                    scrollerRef={modalBodyRef}
                    canLoadMore={false}
                    isLoading={isFetchingMore}
                    groupCounts={[
                        Math.min(
                            displayedTickets.length,
                            FEDERATED_SEARCH_GROUP_SIZE
                        ),
                        ...(showCallsTab
                            ? [
                                  Math.min(
                                      displayedCalls.length,
                                      FEDERATED_SEARCH_GROUP_SIZE
                                  ),
                              ]
                            : []),
                        Math.min(
                            displayedCustomers.length,
                            FEDERATED_SEARCH_GROUP_SIZE
                        ),
                    ]}
                    itemContent={(index) =>
                        itemContentCallback(index, data[index])
                    }
                    groupContent={(index) => (
                        <GroupHeader
                            index={index}
                            onTabChange={onTabChange}
                            showCallsTab={showCallsTab}
                        />
                    )}
                ></GroupedSpotlightScrollArea>
            ) : (
                <SpotlightScrollArea
                    ref={virtuosoRef}
                    scrollerRef={modalBodyRef}
                    data={data}
                    canLoadMore={!!nextCursor}
                    loadMore={handleLoadMore}
                    isLoading={isFetchingMore}
                    itemContent={itemContentCallback}
                    header={
                        shouldDisplayRecentItems
                            ? RecentlyAccessedHeader
                            : undefined
                    }
                ></SpotlightScrollArea>
            )}
        </SearchRankScenarioContext.Provider>
    )
}

const RecentlyAccessedHeader = () => (
    <div className={css.recentItemsHeader}>{RECENTLY_ACCESSED_LABEL}</div>
)

const GroupHeader = ({
    index,
    onTabChange,
    showCallsTab,
}: {
    index: number
    onTabChange: (tab: string) => void
    showCallsTab?: boolean
}) => {
    const getTabDetails = (index: number) => {
        if (index === 0) {
            return {
                title: TICKETS_LABEL,
                targetTab: Tabs.Tickets,
            }
        }
        if (index === 1 && showCallsTab) {
            return {
                title: CALLS_LABEL,
                targetTab: Tabs.Calls,
            }
        }
        return {
            title: CUSTOMERS_LABEL,
            targetTab: Tabs.Customers,
        }
    }
    const {title, targetTab} = getTabDetails(index)

    return (
        <div className={css.groupContent}>
            <span>{title}</span>
            <a href={'#'} onClick={() => onTabChange(targetTab)}>
                {MORE_RESULTS_LABEL}
            </a>
        </div>
    )
}
