import React from 'react'

import Tooltip from '../../../common/components/Tooltip'

import css from './BillableTicketsLabel.less'

type Props = {
    id: string
    freeTickets: number
}

export default function BillableTicketsLabel({id, freeTickets}: Props) {
    return (
        <>
            <b>{freeTickets}</b>{' '}
            <span
                id={`${id}-billable-ticket-label`}
                className={css.billableTickets}
            >
                billable tickets
            </span>{' '}
            included
            <Tooltip
                target={`${id}-billable-ticket-label`}
                placement="top-start"
                innerClassName={css.tooltip}
            >
                A billable ticket is a ticket that received a response either
                from an agent or a rule. Only the ticket itself is billable,
                additional messages in this ticket are not billable.
            </Tooltip>
        </>
    )
}
