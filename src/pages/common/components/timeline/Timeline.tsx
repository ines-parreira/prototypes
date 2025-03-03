import React from 'react'

import { fromJS } from 'immutable'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import GorgiasLogo from 'assets/img/gorgias-logo.svg'
import useAppSelector from 'hooks/useAppSelector'
import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { displayHistoryOnNextPage } from 'state/ticket/actions'

import TimelineTicket from './TimelineTicket'
import { ReduxCustomerHistory } from './types'

import css from './Timeline.less'

type Props = {
    ticketId?: number
    onTicketClick?: (ticketId: number) => void
}

export default function Timeline({ ticketId = 0, onTicketClick }: Props) {
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

    if (customerHistory.triedLoading && !customerHistory.hasHistory) {
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
            {tickets
                .filter((ticket) => ticket.channel)
                .map((ticket) => (
                    <TimelineTicket
                        displayHistoryOnNextPage={
                            onTicketClick as unknown as typeof displayHistoryOnNextPage
                        }
                        isCurrent={ticketId === ticket.id}
                        key={ticket.id}
                        ticket={fromJS(ticket)}
                    />
                ))}
        </div>
    )
}
