import React, { memo, useState } from 'react'

import { LoadingSpinner } from '@gorgias/axiom'

import Filters from './filters/Filters'
import { useTimelineFilters } from './filters/hooks/useTimelineFilters'
import { useTimelineData } from './hooks/useTimelineData'
import { NoResults } from './NoResults'
import { Sort } from './Sort'
import { SortedTicketList } from './SortedTicketList'

import css from './Timeline.less'

type Props = {
    ticketId?: number
    shopperId: number | null
    onLoaded?: () => unknown
    containerRef?: React.RefObject<HTMLDivElement>
}

export function Timeline({
    ticketId = 0,
    shopperId,
    onLoaded,
    containerRef,
}: Props) {
    const [hasCalledOnLoaded, setHasCalledOnLoaded] = useState(false)
    const { items, isLoading } = useTimelineData(shopperId ?? undefined)

    const {
        activeFilters,
        selectedTypeKeys,
        selectedStatusKeys,
        setActiveFilters,
        rangeFilter,
        setRangeFilter,
        setSortOption,
        sortedTickets,
        sortOptions,
        sortOption,
    } = useTimelineFilters({ items })

    const isTypeFilterDisabled =
        activeFilters.type.order && !activeFilters.type.ticket

    if (isLoading) {
        return (
            <div className={css.centeringContainer}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (!hasCalledOnLoaded && !isLoading) {
        setHasCalledOnLoaded(true)
        onLoaded?.()
    }

    if (!isLoading && items.length === 0) {
        return (
            <NoResults>This customer doesn’t have any tickets yet.</NoResults>
        )
    }

    return (
        <>
            <div>
                <div className={css.toolbar}>
                    <Filters
                        isTypeFilterDisabled={isTypeFilterDisabled}
                        setActiveFilters={setActiveFilters}
                        setRangeFilter={setRangeFilter}
                        selectedTypeKeys={selectedTypeKeys}
                        selectedStatusKeys={selectedStatusKeys}
                        rangeFilter={rangeFilter}
                    />
                    <Sort
                        value={sortOption}
                        onChange={setSortOption}
                        sortOptions={sortOptions}
                    />
                </div>
                {sortedTickets.length === 0 ? (
                    <NoResults>
                        <b>No matching tickets</b>
                        <br />
                        Try adjusting filters to get results
                    </NoResults>
                ) : (
                    <SortedTicketList
                        ticketId={ticketId}
                        sortedItems={sortedTickets}
                        sortOption={sortOption}
                        containerRef={containerRef}
                    />
                )}
            </div>
        </>
    )
}

export default memo(Timeline)
