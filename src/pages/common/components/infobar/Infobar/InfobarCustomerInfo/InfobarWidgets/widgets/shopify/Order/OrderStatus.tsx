import React from 'react'

import {humanizeString} from 'utils'
import {
    FinancialStatus,
    FulfillmentStatus,
} from 'constants/integrations/types/shopify'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

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

type FulfillmentValues = Map<FulfillmentStatus | null, [ColorType, string]>
type FinancialValues = Map<FinancialStatus, ColorType>

const fulfillmentValues: FulfillmentValues = new Map([
    [FulfillmentStatus.Fulfilled, [ColorType.Success, 'Fulfilled']],
    [FulfillmentStatus.Partial, [ColorType.Grey, 'Partially fulfilled']],
    [FulfillmentStatus.Restocked, [ColorType.Warning, 'Restocked']],
    [null, [ColorType.Grey, 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [FinancialStatus.Pending, ColorType.Grey],
    [FinancialStatus.Authorized, ColorType.Grey],
    [FinancialStatus.PartiallyPaid, ColorType.Classic],
    [FinancialStatus.Paid, ColorType.Success],
    [FinancialStatus.PartiallyRefunded, ColorType.Warning],
    [FinancialStatus.Refunded, ColorType.Warning],
    [FinancialStatus.Voided, ColorType.Error],
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
    const [type, label] = fulfillmentValues.get(fulfillmentStatus) || []
    if (!type) {
        return null
    }
    return (
        <Badge className={css.badge} type={type}>
            {label}
        </Badge>
    )
}

function FinancialBadge({financialStatus}: FinancialBadgeProps) {
    const type = financialValues.get(financialStatus)
    if (!type) {
        return null
    }
    const financialLabel = humanizeString(financialStatus).replace(/_/g, ' ')

    return (
        <Badge className={css.badge} type={type}>
            {financialLabel}
        </Badge>
    )
}

function CancelledBadge() {
    return (
        <Badge className={css.badge} type={ColorType.Error}>
            Cancelled
        </Badge>
    )
}
