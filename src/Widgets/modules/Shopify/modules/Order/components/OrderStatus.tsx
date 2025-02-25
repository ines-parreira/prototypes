import React from 'react'

import { Badge, ColorType } from '@gorgias/merchant-ui-kit'

import {
    FinancialStatus,
    FulfillmentStatus,
} from 'constants/integrations/types/shopify'
import { humanizeString } from 'utils'

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
    [FulfillmentStatus.Fulfilled, ['success', 'Fulfilled']],
    [FulfillmentStatus.Partial, ['grey', 'Partially fulfilled']],
    [FulfillmentStatus.Restocked, ['warning', 'Restocked']],
    [null, ['grey', 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [FinancialStatus.Pending, 'grey'],
    [FinancialStatus.Authorized, 'grey'],
    [FinancialStatus.PartiallyPaid, 'classic'],
    [FinancialStatus.Paid, 'success'],
    [FinancialStatus.PartiallyRefunded, 'warning'],
    [FinancialStatus.Refunded, 'warning'],
    [FinancialStatus.Voided, 'error'],
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

function FulfillmentBadge({ fulfillmentStatus }: FulfillmentBadgeProps) {
    const [type, label] = fulfillmentValues.get(fulfillmentStatus) || []
    if (!type) {
        return null
    }
    return <Badge type={type}>{label}</Badge>
}

function FinancialBadge({ financialStatus }: FinancialBadgeProps) {
    const type = financialValues.get(financialStatus)
    if (!type) {
        return null
    }
    const financialLabel = humanizeString(financialStatus).replace(/_/g, ' ')

    return <Badge type={type}>{financialLabel}</Badge>
}

function CancelledBadge() {
    return <Badge type={'error'}>Cancelled</Badge>
}
