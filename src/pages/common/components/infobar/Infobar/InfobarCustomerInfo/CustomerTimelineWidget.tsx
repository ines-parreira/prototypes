import { TicketSummary } from '@gorgias/api-queries'
import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import { useTimeline } from 'pages/common/components/timeline/hooks/useTimeline'
import { getContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'

import css from './CustomerTimelineWidget.less'

type Props = {
    isEditing: boolean
    customerId: number
}

const ForumIcon = () => (
    <span className={`material-icons ${css.mr} ${css.forumIcon}`}>forum</span>
)

export function CustomerTimelineWidget({ isEditing, customerId }: Props) {
    const {
        tickets,
        isOpen,
        hasTriedLoading,
        isLoading,
        openTimeline,
        closeTimeline,
    } = useTimeline()
    const widgetContext = useAppSelector(getContext)

    const ticketCount = tickets.length
    const hasNoTickets = hasTriedLoading && ticketCount === 0
    const hasNoHistory = hasTriedLoading && ticketCount < 2
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

    return (
        <div
            className={`${css.timelineWidget} ${hasNoHistory ? css.noTimeline : ''}`}
        >
            {showToggle ? (
                <Button
                    className={css.mr}
                    intent={openTicketCount ? 'primary' : 'secondary'}
                    onClick={() =>
                        isOpen ? closeTimeline() : openTimeline(customerId)
                    }
                    size="small"
                    leadingIcon={isOpen ? 'close' : 'forum'}
                    isDisabled={hasNoHistory}
                >
                    {isOpen ? 'Close' : 'Open'} Timeline
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
