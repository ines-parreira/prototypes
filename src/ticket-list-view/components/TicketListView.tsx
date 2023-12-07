import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getViewPlainJS} from 'state/views/selectors'

import useTickets from '../hooks/useTickets'

import Ticket from './Ticket'
import css from './TicketListView.less'

type Props = {
    viewId: number
}

export default function TicketListView({viewId}: Props) {
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const tickets = useTickets(viewId)

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>{view?.name}</div>
            </div>
            <div className={css.list}>
                {tickets.map((ticket) => (
                    <Ticket key={ticket.id} stale ticket={ticket} />
                ))}
            </div>
        </div>
    )
}
