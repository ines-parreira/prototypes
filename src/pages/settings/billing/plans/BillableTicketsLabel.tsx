import React from 'react'

import useId from 'hooks/useId'
import Tooltip from 'pages/common/components/Tooltip'

import css from './BillableTicketsLabel.less'

type Props = {
    id?: string
    costMultiplier?: number
    extraTicketCost: number
    currency: string
    freeTickets: number
}

export default function BillableTicketsLabel({
    costMultiplier = 100,
    extraTicketCost,
    currency,
    freeTickets,
}: Props) {
    const id = useId()
    const tooltipId = 'billable-ticket-label-' + id
    const multipliedExtraTicketCost = extraTicketCost * costMultiplier

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
                innerProps={{
                    innerClassName: css.tooltip,
                }}
            >
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(multipliedExtraTicketCost)}{' '}
                per {costMultiplier} extra tickets
            </Tooltip>
        </>
    )
}
