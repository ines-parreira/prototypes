import React from 'react'

import useId from 'hooks/useId'
import Tooltip from 'pages/common/components/Tooltip'
import {PlanWithCurrencySign} from 'state/billing/types'

import css from './BillableTicketsLabel.less'

type Props = {
    id?: string
    costMultiplier?: number
    plan: PlanWithCurrencySign
}

export default function BillableTicketsLabel({
    costMultiplier = 100,
    plan,
}: Props) {
    const id = useId()
    const tooltipId = 'billable-ticket-label-' + id
    const costPerTicket = plan.cost_per_ticket * costMultiplier

    return (
        <>
            <span id={tooltipId} className={css.billableTickets}>
                {new Intl.NumberFormat('en-US').format(plan.free_tickets)}{' '}
                billable tickets
            </span>{' '}
            included
            <Tooltip
                target={tooltipId}
                placement="top-start"
                innerClassName={css.tooltip}
            >
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: plan.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(costPerTicket)}{' '}
                per {costMultiplier} extra tickets
            </Tooltip>
        </>
    )
}
