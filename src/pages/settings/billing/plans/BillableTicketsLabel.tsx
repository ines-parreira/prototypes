import React from 'react'
import _uniqueId from 'lodash/uniqueId'

import Tooltip from '../../../common/components/Tooltip'

import css from './BillableTicketsLabel.less'

type Props = {
    freeTickets: number
}

export default function BillableTicketsLabel({freeTickets}: Props) {
    const id = _uniqueId('billable-ticket-label-')

    return (
        <>
            <b>{freeTickets}</b>{' '}
            <span id={id} className={css.billableTickets}>
                billable tickets
            </span>{' '}
            included
            <Tooltip
                target={id}
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
