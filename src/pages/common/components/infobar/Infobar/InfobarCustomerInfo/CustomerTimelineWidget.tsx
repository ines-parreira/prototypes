import React from 'react'

import { List } from 'immutable'

import { TicketSummary } from '@gorgias/api-queries'
import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ReduxCustomerHistory } from 'pages/common/components/timeline/types'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { toggleHistory } from 'state/ticket/actions'
import { getDisplayHistory, getTicketState } from 'state/ticket/selectors'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'

import css from './CustomerTimelineWidget.less'

type Props = {
    isEditing: boolean
}

const ForumIcon = () => (
    <span className={`material-icons ${css.mr} ${css.forumIcon}`}>forum</span>
)

export function CustomerTimelineWidget({ isEditing }: Props) {
    const dispatch = useAppDispatch()

    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    const widgetContext = useAppSelector(getContext)
    const ticket = useAppSelector(getTicketState)

    // get history info
    const isHistoryLoading = !!useAppSelector(getLoading).toJS().history
    const customerHistory = useAppSelector(
        getCustomerHistory,
    ).toJS() as ReduxCustomerHistory

    const ticketCount = customerHistory.tickets.length
    const hasNoTickets = customerHistory.triedLoading && ticketCount === 0
    const hasNoHistory = customerHistory.triedLoading && ticketCount < 2
    const { openTicketCount, snoozedTicketCount } = getTicketsCount(
        customerHistory.tickets,
    )

    const showToggle = !(
        isEditing || widgetContext === WidgetEnvironment.Customer
    )
    const handleToggleClick = () => {
        dispatch(toggleHistory(!isHistoryDisplayed))

        logEvent(SegmentEvent.UserHistoryToggled, {
            open: !isHistoryDisplayed,
            nbOfTicketsInTimeline: customerHistory.tickets.length,
            nbOfMessagesInTicket:
                (ticket.get('messages') as List<any>)?.size ?? 0,
        })
    }

    if (isHistoryLoading) {
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

    return (
        <div
            className={`${css.timelineWidget} ${hasNoHistory ? css.noTimeline : ''}`}
        >
            {showToggle ? (
                <Button
                    className={css.mr}
                    intent={openTicketCount ? 'primary' : 'secondary'}
                    onClick={handleToggleClick}
                    size="small"
                    leadingIcon={isHistoryDisplayed ? 'close' : 'forum'}
                    isDisabled={hasNoHistory}
                >
                    {isHistoryDisplayed ? 'Close' : 'Open'} Timeline
                </Button>
            ) : (
                <ForumIcon />
            )}
            <span className={css.ticketCount}>{textContent}</span>
        </div>
    )
}

function getTicketsCount(tickets: TicketSummary[]) {
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
