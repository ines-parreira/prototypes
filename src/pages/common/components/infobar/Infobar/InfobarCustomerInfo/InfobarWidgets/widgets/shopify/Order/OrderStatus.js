// @flow

import React from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import {
    FinancialStatus,
    FulfillmentStatus,
} from '../../../../../../../../../../constants/integrations/shopify.ts'
import type {
    FulfillmentStatusType,
    FinancialStatusType,
} from '../../../../../../../../../../constants/integrations/types/shopify.js'
import {humanizeString} from '../../../../../../../../../../utils.ts'

import css from './OrderStatus.less'

type FulfillmentBadgeProps = {
    fulfillmentStatus: FulfillmentStatusType,
}

type FinancialBadgeProps = {
    financialStatus: FinancialStatusType,
}

type Props = FulfillmentBadgeProps &
    FinancialBadgeProps & {
        isCancelled: boolean,
    }

type FulfillmentValues = Map<FulfillmentStatusType, [string, string, string]>
type FinancialValues = Map<FinancialStatusType, [string, string]>

const fulfillmentValues: FulfillmentValues = new Map([
    [
        FulfillmentStatus.FULFILLED,
        [css.successBadge, css.fullIcon, 'Fulfilled'],
    ],
    [
        FulfillmentStatus.PARTIAL,
        [css.successBadge, css.partialIcon, 'Partially fulfilled'],
    ],
    [
        FulfillmentStatus.RESTOCKED,
        [css.secondaryBadge, css.emptyIcon, 'Restocked'],
    ],
    [null, [css.secondaryBadge, css.emptyIcon, 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [FinancialStatus.PENDING, [css.secondaryBadge, css.emptyIcon]],
    [FinancialStatus.AUTHORIZED, [css.secondaryBadge, css.emptyIcon]],
    [FinancialStatus.PARTIALLY_PAID, [css.successBadge, css.partialIcon]],
    [FinancialStatus.PAID, [css.successBadge, css.fullIcon]],
    [
        FinancialStatus.PARTIALLY_REFUNDED,
        [css.secondaryBadge, css.partialIconSecondary],
    ],
    [FinancialStatus.REFUNDED, [css.secondaryBadge, css.fullIconSecondary]],
    [FinancialStatus.VOIDED, [css.secondaryBadge, css.fullIconSecondary]],
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
