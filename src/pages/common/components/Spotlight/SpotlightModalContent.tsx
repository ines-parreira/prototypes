import _isEmpty from 'lodash/isEmpty'
import React, {MouseEvent, RefObject, useEffect, useRef} from 'react'
import {GroupedVirtuosoHandle, VirtuosoHandle} from 'react-virtuoso'
import {SearchRank} from 'hooks/useSearchRankScenario'
import {
    CustomerWithHighlights,
    isCustomer,
    isCustomerWithHighlights,
    isTicket,
    isTicketWithHighlights,
    PickedCustomer,
    TicketWithHighlights,
} from 'models/search/types'
import {ViewType} from 'models/view/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import {
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import css from 'pages/common/components/Spotlight/SpotlightModal.less'
import SpotlightNoResults from 'pages/common/components/Spotlight/SpotlightNoResults'
import SpotlightScrollArea, {
    GroupedSpotlightScrollArea,
} from 'pages/common/components/Spotlight/SpotlightScrollArea'
import SpotlightTicketRow, {
    PickedTicket,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'
import {Tabs} from 'pages/common/components/Spotlight/useSearch'

export const RECENTLY_ACCESSED_LABEL = 'Recently accessed'
export const MORE_RESULTS_LABEL = 'More results'
const GROUP_SIZE = 5

const hasNoResults = (
    tickets: unknown[],
    customers: unknown[],
    resultsWithHighlights: unknown[],
    searchItemsType: ViewType,
    isSearchWithHighlights: boolean
) => {
    if (isSearchWithHighlights) {
        return _isEmpty(resultsWithHighlights)
    }

    switch (searchItemsType) {
        case ViewType.All:
            return _isEmpty(resultsWithHighlights)
        case ViewType.CustomerList:
            return _isEmpty(customers)
        case ViewType.TicketList:
            return _isEmpty(tickets)
    }
}
const hasNoRecentResults = (
    tickets: unknown[],
    customers: unknown[],
    searchItemsType: ViewType
) => {
    switch (searchItemsType) {
        case ViewType.All:
            return _isEmpty(tickets) && _isEmpty(customers)
        case ViewType.CustomerList:
            return _isEmpty(customers)
        case ViewType.TicketList:
            return _isEmpty(tickets)
    }
}

const getData = (
    searchItemsType: ViewType,
    displayedCustomers: PickedCustomer[] | CustomerWithHighlights[],
    displayedTicket: PickedTicket[] | TicketWithHighlights[]
):
    | PickedCustomer[]
    | CustomerWithHighlights[]
    | PickedTicket[]
    | TicketWithHighlights[]
    | (
          | CustomerWithHighlights
          | TicketWithHighlights
          | PickedCustomer
          | PickedTicket
      )[] => {
    switch (searchItemsType) {
        case ViewType.CustomerList: {
            return displayedCustomers
        }
        case ViewType.TicketList: {
            return displayedTicket
        }
        case ViewType.All: {
            const tickets = displayedTicket.slice(0, GROUP_SIZE)
            const customers = displayedCustomers.slice(0, GROUP_SIZE)
            return [...tickets, ...customers]
        }
    }
}

type Props = {
    isLoading: boolean
    searchItemsType: ViewType
    tickets: PickedTicket[]
    customers: PickedCustomer[]
    resultsWithHighlights: (CustomerWithHighlights | TicketWithHighlights)[]
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
        type: 'spotlight-ticket' | 'spotlight-customer'
    ) => void
    isSearchWithHighlights: boolean
    onTabChange: (tab: string) => void
}

export const SpotlightModalContent = ({
    isLoading,
    searchItemsType,
    tickets,
    customers,
    resultsWithHighlights,
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
    isSearchWithHighlights,
    onTabChange,
}: Props) => {
    const virtuosoRef = useRef<VirtuosoHandle | GroupedVirtuosoHandle>(null)
    const groupedVirtuosoRef = useRef<GroupedVirtuosoHandle>(null)

    useEffect(() => {
        const virtuosoScrollArea = virtuosoRef.current
        if (!virtuosoScrollArea) return
        virtuosoScrollArea.scrollIntoView({index: selectedIndex})
    }, [selectedIndex])

    if (isLoading) {
        return <SkeletonLoader className={css.loader} />
    }

    if (
        hasSearched &&
        hasNoResults(
            tickets,
            customers,
            resultsWithHighlights,
            searchItemsType,
            isSearchWithHighlights
        )
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
        hasNoRecentResults(recentTickets, recentCustomers, searchItemsType)
    ) {
        return (
            <SpotlightNoResults
                title="No recent results"
                bodyText="Try searching for a ticket or customer."
                handleAdvancedSearch={goToAdvancedSearch}
            />
        )
    }

    const displayedTickets = hasSearched
        ? isSearchWithHighlights
            ? resultsWithHighlights.filter(isTicketWithHighlights)
            : tickets
        : recentTickets
    const displayedCustomers = hasSearched
        ? isSearchWithHighlights
            ? resultsWithHighlights.filter(isCustomerWithHighlights)
            : customers
        : recentCustomers

    const shouldDisplayRecentItems =
        !hasSearched &&
        ((searchItemsType === ViewType.TicketList &&
            !_isEmpty(recentTickets)) ||
            (searchItemsType === ViewType.CustomerList &&
                !_isEmpty(recentCustomers)) ||
            (searchItemsType === ViewType.All &&
                (!_isEmpty(recentCustomers) || !_isEmpty(recentTickets))))

    const data = getData(searchItemsType, displayedCustomers, displayedTickets)

    const ticketOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-ticket')
    }
    const customerOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-customer')
    }

    const itemContentCallback = (
        index: number,
        item:
            | PickedTicket
            | PickedCustomer
            | (CustomerWithHighlights | TicketWithHighlights)
    ) => {
        const selected = index === selectedIndex
        if (isTicketWithHighlights(item)) {
            return (
                <SpotlightTicketRow
                    id={item.entity.id}
                    index={index}
                    item={item.entity}
                    highlights={item.highlights}
                    onCloseModal={onCloseModal}
                    onHover={handleHover}
                    selected={selected}
                    onClick={ticketOnClickHandler}
                />
            )
        } else if (isTicket(item)) {
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
        } else if (isCustomerWithHighlights(item)) {
            return (
                <SpotlightCustomerRow
                    id={item.entity.id}
                    index={index}
                    item={item.entity}
                    highlights={item.highlights}
                    onCloseModal={onCloseModal}
                    onHover={handleHover}
                    selected={selected}
                    onClick={customerOnClickHandler}
                />
            )
        } else if (isCustomer(item)) {
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
                        Math.min(displayedTickets.length, GROUP_SIZE),
                        Math.min(displayedCustomers.length, GROUP_SIZE),
                    ]}
                    itemContent={(index) =>
                        itemContentCallback(index, data[index])
                    }
                    groupContent={(index) => (
                        <GroupHeader index={index} onTabChange={onTabChange} />
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
}: {
    index: number
    onTabChange: (tab: string) => void
}) => {
    const title = index === 0 ? TICKETS_LABEL : CUSTOMERS_LABEL
    const targetTab = index === 0 ? Tabs.Tickets : Tabs.Customers

    return (
        <div className={css.groupContent}>
            <span>{title}</span>
            <a href={'#'} onClick={() => onTabChange(targetTab)}>
                {MORE_RESULTS_LABEL}
            </a>
        </div>
    )
}
