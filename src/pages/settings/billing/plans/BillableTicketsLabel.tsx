import React from 'react'
import _uniqueId from 'lodash/uniqueId'

import Tooltip from '../../../common/components/Tooltip'
import {PlanWithCurrencySign} from '../../../../state/billing/types'

import css from './BillableTicketsLabel.less'

type Props = {
    id?: string
    costMultiplier?: number
    plan: PlanWithCurrencySign
}

export default function BillableTicketsLabel({
    id = _uniqueId('billable-ticket-label-'),
    costMultiplier = 100,
    plan,
}: Props) {
    const costPerTicket = plan.cost_per_ticket * costMultiplier

    return (
        <>
            <span id={id} className={css.billableTickets}>
                {new Intl.NumberFormat('en-US').format(plan.free_tickets)}{' '}
                billable tickets
            </span>{' '}
            included
            <Tooltip
                target={id}
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
