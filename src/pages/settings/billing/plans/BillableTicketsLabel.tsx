import React from 'react'

import useId from 'hooks/useId'
import Tooltip from 'pages/common/components/Tooltip'

import css from './BillableTicketsLabel.less'

type Props = {
    id?: string
    costMultiplier?: number
    costPerTicket: number
    currency: string
    freeTickets: number
}

export default function BillableTicketsLabel({
    costMultiplier = 100,
    costPerTicket,
    currency,
    freeTickets,
}: Props) {
    const id = useId()
    const tooltipId = 'billable-ticket-label-' + id
    const formattedCostPerTicket = costPerTicket * costMultiplier

    return (
        <>
            <span id={tooltipId} className={css.billableTickets}>
                {new Intl.NumberFormat('en-US').format(freeTickets)} billable
                tickets
            </span>{' '}
            included
            <Tooltip
                target={tooltipId}
                placement="top-start"
                innerClassName={css.tooltip}
            >
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(formattedCostPerTicket)}{' '}
                per {costMultiplier} extra tickets
            </Tooltip>
        </>
    )
}
