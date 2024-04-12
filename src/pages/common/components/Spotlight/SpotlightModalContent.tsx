import _isEmpty from 'lodash/isEmpty'
import React, {RefObject, MouseEvent, useRef, useEffect} from 'react'
import {VirtuosoHandle} from 'react-virtuoso'
import {
    CustomerWithHighlights,
    isCustomer,
    isCustomerWithHighlights,
    isTicket,
    isTicketWithHighlights,
    PickedCustomer,
    TicketWithHighlights,
} from 'models/search/types'
import {SearchRank} from 'hooks/useSearchRankScenario'
import {ViewType} from 'models/view/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import css from 'pages/common/components/Spotlight/SpotlightModal.less'
import SpotlightNoResults from 'pages/common/components/Spotlight/SpotlightNoResults'
import SpotlightScrollArea from 'pages/common/components/Spotlight/SpotlightScrollArea'
import SpotlightTicketRow, {
    PickedTicket,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'

const hasNoResults = (
    tickets: unknown[],
    customers: unknown[],
    resultsWithHighlights: unknown[],
    searchItemsType: ViewType,
    isSearchWithHighlights: boolean
) =>
    (_isEmpty(tickets) &&
        searchItemsType === ViewType.TicketList &&
        !isSearchWithHighlights) ||
    (_isEmpty(customers) &&
        searchItemsType === ViewType.CustomerList &&
        !isSearchWithHighlights) ||
    (_isEmpty(resultsWithHighlights) && isSearchWithHighlights)

const hasNoRecentResults = (
    tickets: unknown[],
    customers: unknown[],
    searchItemsType: ViewType
) =>
    (_isEmpty(tickets) && searchItemsType === ViewType.TicketList) ||
    (_isEmpty(customers) && searchItemsType === ViewType.CustomerList)

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
}: Props) => {
    const virtuosoRef = useRef<VirtuosoHandle>(null)

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
            ? resultsWithHighlights
            : tickets
        : recentTickets
    const displayedCustomers = hasSearched
        ? isSearchWithHighlights
            ? resultsWithHighlights
            : customers
        : recentCustomers

    const header =
        !hasSearched &&
        ((!_isEmpty(recentTickets) &&
            searchItemsType === ViewType.TicketList) ||
            (!_isEmpty(recentCustomers) &&
                searchItemsType === ViewType.CustomerList))
            ? () => (
                  <div className={css.recentItemsHeader}>Recently accessed</div>
              )
            : undefined

    const data =
        searchItemsType === ViewType.CustomerList
            ? displayedCustomers
            : displayedTickets

    const tickerOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-ticket')
    }
    const customerOnClickHandler = () => {
        logRecentlyAccessedSegmentEvent('spotlight-customer')
    }

    return (
        <SearchRankScenarioContext.Provider value={searchRank}>
            <SpotlightScrollArea
                ref={virtuosoRef}
                scrollerRef={modalBodyRef}
                data={data}
                canLoadMore={!!nextCursor}
                loadMore={handleLoadMore}
                isLoading={isFetchingMore}
                itemContent={(index, item) => {
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
                                onClick={tickerOnClickHandler}
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
                                onClick={tickerOnClickHandler}
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
                }}
                header={header}
            ></SpotlightScrollArea>
        </SearchRankScenarioContext.Provider>
    )
}
