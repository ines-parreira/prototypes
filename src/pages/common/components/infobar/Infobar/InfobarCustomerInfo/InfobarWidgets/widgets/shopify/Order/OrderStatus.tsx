import React from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import {
    FinancialStatus,
    FulfillmentStatus,
} from '../../../../../../../../../../constants/integrations/types/shopify'
import {humanizeString} from '../../../../../../../../../../utils'

import css from './OrderStatus.less'

type FulfillmentBadgeProps = {
    fulfillmentStatus: FulfillmentStatus
}

type FinancialBadgeProps = {
    financialStatus: FinancialStatus
}

type Props = FulfillmentBadgeProps &
    FinancialBadgeProps & {
        isCancelled: boolean
    }

type FulfillmentValues = Map<FulfillmentStatus | null, [string, string, string]>
type FinancialValues = Map<FinancialStatus, [string, string]>

const fulfillmentValues: FulfillmentValues = new Map([
    [
        FulfillmentStatus.Fulfilled,
        [css.successBadge, css.fullIcon, 'Fulfilled'],
    ],
    [
        FulfillmentStatus.Partial,
        [css.successBadge, css.partialIcon, 'Partially fulfilled'],
    ],
    [
        FulfillmentStatus.Restocked,
        [css.secondaryBadge, css.emptyIcon, 'Restocked'],
    ],
    [null, [css.secondaryBadge, css.emptyIcon, 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [FinancialStatus.Pending, [css.secondaryBadge, css.emptyIcon]],
    [FinancialStatus.Authorized, [css.secondaryBadge, css.emptyIcon]],
    [FinancialStatus.PartiallyPaid, [css.successBadge, css.partialIcon]],
    [FinancialStatus.Paid, [css.successBadge, css.fullIcon]],
    [
        FinancialStatus.PartiallyRefunded,
        [css.secondaryBadge, css.partialIconSecondary],
    ],
    [FinancialStatus.Refunded, [css.secondaryBadge, css.fullIconSecondary]],
    [FinancialStatus.Voided, [css.secondaryBadge, css.fullIconSecondary]],
])

export default function OrderStatus({
    fulfillmentStatus,
    financialStatus,
    isCancelled,
}: Props) {
    return (
        <>
            {isCancelled && <CancelledBadge />}
            <FinancialBadge financialStatus={financialStatus} />
            <FulfillmentBadge fulfillmentStatus={fulfillmentStatus} />
        </>
    )
}

function FulfillmentBadge({fulfillmentStatus}: FulfillmentBadgeProps) {
    const values = fulfillmentValues.get(fulfillmentStatus)
    if (!values) {
        return null
    }

    const [fulfillmentBadge, fulfillmentIcon, fulfillmentLabel] = values

    return (
        <Badge
            className={classnames(css.badge, fulfillmentBadge, 'ml-1')}
            color="secondary"
            pill
        >
            <span className={classnames(css.icon, fulfillmentIcon)} />
            {fulfillmentLabel}
        </Badge>
    )
}

function FinancialBadge({financialStatus}: FinancialBadgeProps) {
    const values = financialValues.get(financialStatus)
    if (!values) {
        return null
    }

    const [financialBadge, financialIcon] = values
    const financialLabel = humanizeString(financialStatus).replace(/_/g, ' ')

    return (
        <Badge
            className={classnames(css.badge, financialBadge)}
            color="secondary"
            pill
        >
            <span className={classnames(css.icon, financialIcon)} />
            {financialLabel}
        </Badge>
    )
}

function CancelledBadge() {
    return (
        <Badge pill className={classnames(css.badge, css.cancelled)}>
            Cancelled
        </Badge>
    )
}
