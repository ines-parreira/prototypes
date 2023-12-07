import cn from 'classnames'
import moment from 'moment'
import React from 'react'

import {TicketPartial} from '../types'
import css from './Ticket.less'

type Props = {
    stale: boolean
    ticket: TicketPartial
}

export default function Ticket({stale, ticket}: Props) {
    return (
        <div className={css.outer}>
            <div className={cn(css.inner, {[css.stale]: stale})}>
                <code>{ticket.id}</code>
                <code className={css.date}>
                    {moment.parseZone(ticket.updated_datetime).format('hh:mm')}
                </code>
            </div>
        </div>
    )
}
