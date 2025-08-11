import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import { Button, LoadingSpinner } from '@gorgias/axiom'
import { TicketCompact } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { TIMELINE_SEARCH_PARAM } from 'timeline/constants'
import { useTicketList } from 'timeline/hooks/useTicketList'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'
import { useTrackTimelineToggle } from 'timeline/hooks/useTrackTimelineToggle'

import css from './CustomerTimelineWidget.less'

type Props = {
    isEditing: boolean
    shopperId: number
}

const ForumIcon = () => (
    <span className={`material-icons ${css.mr} ${css.forumIcon}`}>forum</span>
)

export function CustomerTimelineWidget({ isEditing, shopperId }: Props) {
    const {
        isOpen,
        openTimeline,
        closeTimeline,
        shopperId: timelineShopperId,
    } = useTimelinePanel()
    const { tickets, isLoading } = useTicketList(shopperId)

    let isAnotherTimelineOpen = isOpen && timelineShopperId !== shopperId

    useTrackTimelineToggle()

    // We want to remove the timeline if the customer related to it
    // is not displayed anymore.
    useEffect(() => {
        return () => {
            const searchParams = new URLSearchParams(window.location.search)
            if (
                searchParams.get(TIMELINE_SEARCH_PARAM) === shopperId.toString()
            ) {
                searchParams.delete(TIMELINE_SEARCH_PARAM)
                history.replace({ search: searchParams.toString() })
            }
        }
    }, [shopperId])

    const { ticketId: activeTicketId } = useParams<{ ticketId?: string }>()

    const widgetContext = useAppSelector(getContext)

    const ticketCount = tickets.length
    const hasNoTickets = !isLoading && ticketCount === 0
    const hasNoHistory = !isLoading && ticketCount < 2
    const { openTicketCount, snoozedTicketCount } = getTicketsCount(tickets)

    const showToggle = !(
        isEditing || widgetContext === WidgetEnvironment.Customer
    )

    if (isLoading) {
        return (
            <div className={css.timelineWidget}>
                <LoadingSpinner size="small" className={css.mr} />
            </div>
        )
    }

    let textContent: React.ReactNode = (
        <>
            {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
            {openTicketCount > 0 && <>, {openTicketCount} open</>}
            {snoozedTicketCount > 0 && <>, {snoozedTicketCount} snoozed</>}
        </>
    )
    if (hasNoTickets)
        textContent = 'This customer doesn’t have any tickets yet.'
    if (showToggle && hasNoHistory) textContent = 'No other tickets'

    const handleToggleTimeline = () => {
        if (isAnotherTimelineOpen) return openTimeline(shopperId)
        if (isOpen) return closeTimeline()
        openTimeline(shopperId)
    }

    return (
        <div
            className={`${css.timelineWidget} ${hasNoHistory ? css.noTimeline : ''}`}
        >
            {showToggle ? (
                <Button
                    className={css.mr}
                    intent={
                        showButtonAsPrimary(tickets, activeTicketId)
                            ? 'primary'
                            : 'secondary'
                    }
                    onClick={handleToggleTimeline}
                    size="small"
                    leadingIcon={
                        isAnotherTimelineOpen
                            ? 'forum'
                            : isOpen
                              ? 'close'
                              : 'forum'
                    }
                    data-candu-trigger-timeline={!hasNoHistory}
                    isDisabled={hasNoHistory}
                >
                    {isAnotherTimelineOpen
                        ? 'Open this'
                        : isOpen
                          ? 'Close'
                          : 'Open'}{' '}
                    Timeline
                </Button>
            ) : (
                <ForumIcon />
            )}
            <span className={css.ticketCount}>{textContent}</span>
        </div>
    )
}

function getTicketsCount(tickets: TicketCompact[]) {
    return {
        openTicketCount: tickets.filter((ticket) => ticket.status !== 'closed')
            .length,
        closedTicketCount: tickets.filter(
            (ticket) => ticket.status === 'closed',
        ).length,
        snoozedTicketCount: tickets.filter(
            (ticket) => ticket.status === 'closed' && ticket.snooze_datetime,
        ).length,
    }
}

function showButtonAsPrimary(
    tickets: TicketCompact[],
    activeTicketId: string | undefined,
) {
    return tickets.some(
        (ticket) =>
            ticket.status === 'open' && ticket.id.toString() !== activeTicketId,
    )
}
