import { memo, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import { CustomField, ObjectType } from '@gorgias/api-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { TicketModal, useTicketModal } from 'timeline/ticket-modal'

import DisplayedDate from './DisplayedDate'
import { useRangeFilter } from './hooks/useRangeFilter'
import { useSort } from './hooks/useSort'
import { useStatusFilter } from './hooks/useStatusFilter'
import { useTimelineData } from './hooks/useTimelineData'
import { NoResults } from './NoResults'
import { RangeFilter } from './RangeFilter'
import { Sort } from './Sort'
import { StatusFilter } from './StatusFilter'
import TicketCard from './TicketCard'

import css from './Timeline.less'

type Props = {
    ticketId?: number
    shopperId: number | null
    onLoaded?: () => unknown
}

export function Timeline({ ticketId = 0, shopperId, onLoaded }: Props) {
    const hasTicketModal = useFlag(FeatureFlagKey.TimelineTicketModal)
    const [hasCalledOnLoaded, setHasCalledOnLoaded] = useState(false)

    const {
        data: { data: customFieldDefinitions } = {},
        isLoading: isLoadingCFDefinitions,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: ObjectType.Ticket,
    })

    const { tickets, isLoading } = useTimelineData(shopperId || undefined)

    const { rangeFilter, rangeFilteredTickets, setRangeFilter } =
        useRangeFilter(tickets)
    const { selectedStatus, statusFilteredTickets, toggleSelectedStatus } =
        useStatusFilter(rangeFilteredTickets)
    const { sortedTickets, sortOption, setSortOption } = useSort(
        statusFilteredTickets,
    )

    const ticketIds = useMemo(
        () => sortedTickets.map((ticket) => ticket.id),
        [sortedTickets],
    )

    const {
        onOpen,
        ticketId: modalTicketId,
        ...modalProps
    } = useTicketModal(ticketIds)

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

    const ticketSummary = modalTicketId
        ? sortedTickets.find((ticket) => ticket.id === modalTicketId)
        : undefined

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
                    <ol className={css.list}>
                        {sortedTickets
                            .filter((ticket) => ticket.channel)
                            .map((ticket) => {
                                const isCurrentTicket = ticketId === ticket.id
                                const card = (
                                    <TicketCard
                                        className={css.card}
                                        ticket={ticket}
                                        isHighlighted={isCurrentTicket}
                                        isLoadingCFDefinitions={
                                            isLoadingCFDefinitions
                                        }
                                        customFieldDefinitions={
                                            (customFieldDefinitions ||
                                                []) as CustomField[]
                                        }
                                        displayedDate={DisplayedDate(
                                            sortOption,
                                            ticket,
                                        )}
                                    />
                                )
                                return (
                                    <li key={ticket.id}>
                                        {hasTicketModal ? (
                                            <button
                                                className={css.cardContainer}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    onOpen(ticket.id)
                                                    logEvent(
                                                        SegmentEvent.CustomerTimelineTicketClicked,
                                                    )
                                                }}
                                            >
                                                {card}
                                            </button>
                                        ) : (
                                            <Link
                                                to={`/app/ticket/${ticket.id}`}
                                                onClick={() => {
                                                    logEvent(
                                                        SegmentEvent.CustomerTimelineTicketClicked,
                                                    )
                                                }}
                                            >
                                                {card}
                                            </Link>
                                        )}
                                    </li>
                                )
                            })}
                    </ol>
                )}
            </div>
            {!!modalTicketId && (
                <TicketModal
                    summary={ticketSummary}
                    ticketId={modalTicketId}
                    {...modalProps}
                />
            )}
        </>
    )
}

export default memo(Timeline)
