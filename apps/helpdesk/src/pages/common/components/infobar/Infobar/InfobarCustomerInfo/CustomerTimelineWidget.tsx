import { useEffect } from 'react'

import { history } from '@repo/routing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { useParams } from 'react-router-dom'

import {
    Button,
    Icon,
    LegacyButton,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-queries'

import useAppSelector from 'hooks/useAppSelector'
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

const getTicketCountText = (
    ticketCount: number,
    openTicketCount: number,
    snoozedTicketCount: number,
    hasNoTickets: boolean,
    hasNoHistory: boolean,
    showToggle: boolean,
): string => {
    if (hasNoTickets && !showToggle)
        return "This customer doesn't have any tickets yet."
    if (showToggle && hasNoHistory) return 'No other tickets'
    if (ticketCount === 0) return 'No other tickets'

    let text = `${ticketCount} ticket${ticketCount > 1 ? 's' : ''}`
    if (openTicketCount > 0) {
        text += `, ${openTicketCount} open`
    }
    if (snoozedTicketCount > 0) {
        text += `, ${snoozedTicketCount} snoozed`
    }
    return text
}

const TimelineFieldButton = ({
    isPrimary,
    isOpen,
    isDisabled,
    onClick,
    ticketCount,
    openTicketCount,
    snoozedTicketCount,
    hasNoTickets,
    hasNoHistory,
    showToggle,
    hasUIVisionMS1,
}: {
    isPrimary: boolean
    isOpen: boolean
    isDisabled: boolean
    onClick: () => void
    ticketCount: number
    openTicketCount: number
    snoozedTicketCount: number
    hasNoTickets: boolean
    hasNoHistory: boolean
    showToggle: boolean
    hasUIVisionMS1: boolean
}) => {
    return (
        <div className={css.fieldContainer}>
            {hasUIVisionMS1 ? (
                <Button
                    leadingSlot="history"
                    variant={isPrimary ? 'primary' : 'secondary'}
                    onClick={onClick}
                    size="sm"
                    isDisabled={isDisabled}
                >
                    <span>{isOpen ? 'Close' : 'Open'} timeline</span>
                </Button>
            ) : (
                <LegacyButton
                    leadingIcon="history"
                    intent={isPrimary ? 'primary' : 'secondary'}
                    onClick={onClick}
                    size="small"
                    isDisabled={isDisabled}
                >
                    <span>{isOpen ? 'Close' : 'Open'} timeline</span>
                </LegacyButton>
            )}
            <Text size="sm">
                <span className={isDisabled ? css.fieldContentDisabled : ''}>
                    {getTicketCountText(
                        ticketCount,
                        openTicketCount,
                        snoozedTicketCount,
                        hasNoTickets,
                        hasNoHistory,
                        showToggle,
                    )}
                </span>
            </Text>
        </div>
    )
}

export function CustomerTimelineWidget({ isEditing, shopperId }: Props) {
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
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

    const otherCustomerTickets = tickets.filter(
        (ticket) => ticket.id.toString() !== activeTicketId,
    )

    const ticketCount = tickets.length
    const hasNoTickets = !isLoading && ticketCount === 0
    const hasNoHistory = !isLoading && otherCustomerTickets.length === 0

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

    const textContent = getTicketCountText(
        ticketCount,
        openTicketCount,
        snoozedTicketCount,
        hasNoTickets,
        hasNoHistory,
        showToggle,
    )

    const handleToggleTimeline = () => {
        if (isAnotherTimelineOpen) return openTimeline(shopperId)
        if (isOpen) return closeTimeline()
        openTimeline(shopperId)
    }

    if (hasUIVisionMS1) {
        const isPrimary = showButtonAsPrimary(tickets, activeTicketId)
        const isDisabled = hasNoHistory

        return (
            <div className={css.timelineWidget}>
                {showToggle ? (
                    <TimelineFieldButton
                        isPrimary={isPrimary}
                        isOpen={isOpen}
                        isDisabled={isDisabled}
                        onClick={handleToggleTimeline}
                        ticketCount={ticketCount}
                        openTicketCount={openTicketCount}
                        snoozedTicketCount={snoozedTicketCount}
                        hasNoTickets={hasNoTickets}
                        hasNoHistory={hasNoHistory}
                        showToggle={showToggle}
                        hasUIVisionMS1={hasUIVisionMS1}
                    />
                ) : (
                    <div className={css.fieldContainer}>
                        <div className={css.fieldButton}>
                            <Icon name="comm-chat-conversation" />
                        </div>
                        <div className={css.fieldContent}>
                            <span>{textContent}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            className={`${css.timelineWidget} ${hasNoHistory ? css.noTimeline : ''}`}
        >
            {showToggle ? (
                <LegacyButton
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
                </LegacyButton>
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
