import _isEmpty from 'lodash/isEmpty'
import React, {RefObject, MouseEvent, useRef, useEffect} from 'react'
import {VirtuosoHandle} from 'react-virtuoso'
import {SearchRank} from 'hooks/useSearchRankScenario'
import {Customer} from 'models/customer/types'
import {Ticket} from 'models/ticket/types'
import {ViewType} from 'models/view/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import css from 'pages/common/components/Spotlight/SpotlightModal.less'
import SpotlightNoResults from 'pages/common/components/Spotlight/SpotlightNoResults'
import SpotlightScrollArea from 'pages/common/components/Spotlight/SpotlightScrollArea'
import SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'

type Props = {
    isLoading: boolean
    searchItemsType: ViewType
    tickets: Ticket[]
    customers: Customer[]
    recentTickets: Ticket[]
    recentCustomers: Customer[]
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
        ((_isEmpty(tickets) && searchItemsType === ViewType.TicketList) ||
            (_isEmpty(customers) && searchItemsType === ViewType.CustomerList))
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
        ((_isEmpty(recentTickets) && searchItemsType === ViewType.TicketList) ||
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
                  <div className={css.recentItemsHeader}>Recently accessed</div>
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
                                highlight={{}}
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
                                highlight={{}}
                            />
                        )
                    }
                }}
                header={header}
            ></SpotlightScrollArea>
        </SearchRankScenarioContext.Provider>
    )
}
