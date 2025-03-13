import React from 'react'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import GorgiasLogo from 'assets/img/gorgias-logo.svg'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'

import TicketCard from './TicketCard'
import { ReduxCustomerHistory } from './types'

import css from './Timeline.less'

type Props = {
    ticketId?: number
    onLoaded?: () => unknown
}

export default function Timeline({ ticketId = 0, onLoaded }: Props) {
    const [hasCalledOnLoaded, setHasCalledOnLoaded] = React.useState(false)
    const customersLoading = useAppSelector(getLoading).toJS() as {
        history: boolean
    }
    const customerHistory = useAppSelector(
        getCustomerHistory,
    ).toJS() as ReduxCustomerHistory

    if (customersLoading.history) {
        return (
            <div className={css.centeringContainer}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (customerHistory.triedLoading && !hasCalledOnLoaded) {
        setHasCalledOnLoaded(true)
        onLoaded?.()
    }

    if (customerHistory.triedLoading && customerHistory.tickets.length === 0) {
        return (
            <div className={`${css.centeringContainer} ${css.noResults}`}>
                <img src={GorgiasLogo} alt="Gorgias Logo" />
                <p>This customer doesn’t have any tickets yet.</p>
            </div>
        )
    }

    const tickets = customerHistory.tickets.sort(
        (a, b) =>
            new Date(b.last_message_datetime || b.created_datetime).getTime() -
            new Date(a.last_message_datetime || a.created_datetime).getTime(),
    )

    return (
        <div className={css.container}>
            <ol className={css.list}>
                {tickets
                    .filter((ticket) => ticket.channel)
                    .map((ticket) => {
                        const isCurrentTicket = ticketId === ticket.id
                        return (
                            <li key={ticket.id}>
                                <TicketCard
                                    ticket={ticket}
                                    onClick={
                                        isCurrentTicket
                                            ? undefined
                                            : () => {
                                                  logEvent(
                                                      SegmentEvent.CustomerTimelineTicketClicked,
                                                  )
                                                  history.push(
                                                      `/app/ticket/${ticket.id}`,
                                                  )
                                              }
                                    }
                                    isHighlighted={isCurrentTicket}
                                />
                            </li>
                        )
                    })}
            </ol>
        </div>
    )
}
