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
    const costPerTicket = (plan.cost_per_ticket * costMultiplier).toFixed(2)

    return (
        <>
            <span id={id} className={css.billableTickets}>
                {plan.free_tickets} billable tickets
            </span>{' '}
            included
            <Tooltip
                target={id}
                placement="top-start"
                innerClassName={css.tooltip}
            >
                {plan.currencySign}
                {costPerTicket} per {costMultiplier} extra tickets
            </Tooltip>
        </>
    )
}
