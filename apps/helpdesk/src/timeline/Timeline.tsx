import React, { memo, useState } from 'react'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import * as timelineItem from './helpers/timelineItem'
import { useRangeFilter } from './hooks/useRangeFilter'
import { useSort } from './hooks/useSort'
import { useStatusFilter } from './hooks/useStatusFilter'
import { useTimelineData } from './hooks/useTimelineData'
import { NoResults } from './NoResults'
import { RangeFilter } from './RangeFilter'
import { Sort } from './Sort'
import { SortedTicketList } from './SortedTicketList'
import { StatusFilter } from './StatusFilter'

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

    const { tickets, isLoading } = useTimelineData(shopperId || undefined)

    const { rangeFilter, rangeFilteredTickets, setRangeFilter } =
        useRangeFilter(tickets)
    const { selectedStatus, statusFilteredTickets, toggleSelectedStatus } =
        useStatusFilter(rangeFilteredTickets)
    const { sortedTickets, sortOption, setSortOption } = useSort(
        statusFilteredTickets,
    )

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

    if (!isLoading && tickets.length === 0) {
        return (
            <NoResults>This customer doesn’t have any tickets yet.</NoResults>
        )
    }

    return (
        <>
            <div>
                <div className={css.toolbar}>
                    <div className={css.filters}>
                        <RangeFilter
                            range={rangeFilter}
                            setRangeFilter={setRangeFilter}
                        />
                        <StatusFilter
                            selectedStatus={selectedStatus}
                            toggleSelectedStatus={toggleSelectedStatus}
                        />
                    </div>
                    <Sort value={sortOption} onChange={setSortOption} />
                </div>
                {tickets.length && sortedTickets.length === 0 ? (
                    <NoResults>
                        <b>No matching tickets</b>
                        <br />
                        Try adjusting filters to get results
                    </NoResults>
                ) : (
                    <SortedTicketList
                        ticketId={ticketId}
                        sortedItems={sortedTickets.map(timelineItem.fromTicket)}
                        sortOption={sortOption}
                        containerRef={containerRef}
                    />
                )}
            </div>
        </>
    )
}

export default memo(Timeline)
