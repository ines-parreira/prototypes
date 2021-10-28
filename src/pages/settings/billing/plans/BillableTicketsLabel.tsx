import React from 'react'
import _uniqueId from 'lodash/uniqueId'

import Tooltip from '../../../common/components/Tooltip'
import {PlanWithCurrencySign} from '../../../../state/billing/types'

import css from './BillableTicketsLabel.less'

type Props = {
    plan: PlanWithCurrencySign
    costMultiplier?: number
}

export default function BillableTicketsLabel({
    plan,
    costMultiplier = 100,
}: Props) {
    const id = _uniqueId('billable-ticket-label-')
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
