// @flow

import React from 'react'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import * as Shopify from '../../../../../../../../../../constants/integrations/shopify'
import {humanizeString} from '../../../../../../../../../../utils'

import css from './OrderStatus.less'

type FulfillmentBadgeProps = {
    fulfillmentStatus: Shopify.FulfillmentStatusType,
}

type FinancialBadgeProps = {
    financialStatus: Shopify.FinancialStatusType,
}

type Props = FulfillmentBadgeProps & FinancialBadgeProps & {
    isCancelled: boolean,
}

type FulfillmentValues = Map<Shopify.FulfillmentStatusType, [string, string, string]>
type FinancialValues = Map<Shopify.FinancialStatusType, [string, string]>

const fulfillmentValues: FulfillmentValues = new Map([
    [Shopify.FulfillmentStatus.FULFILLED, [css.successBadge, css.fullIcon, 'Fulfilled']],
    [Shopify.FulfillmentStatus.PARTIAL, [css.successBadge, css.partialIcon, 'Partially fulfilled']],
    [Shopify.FulfillmentStatus.RESTOCKED, [css.secondaryBadge, css.emptyIcon, 'Restocked']],
    [null, [css.secondaryBadge, css.emptyIcon, 'Unfulfilled']],
])

const financialValues: FinancialValues = new Map([
    [Shopify.FinancialStatus.PENDING, [css.secondaryBadge, css.emptyIcon]],
    [Shopify.FinancialStatus.AUTHORIZED, [css.secondaryBadge, css.emptyIcon]],
    [Shopify.FinancialStatus.PARTIALLY_PAID, [css.successBadge, css.partialIcon]],
    [Shopify.FinancialStatus.PAID, [css.successBadge, css.fullIcon]],
    [Shopify.FinancialStatus.PARTIALLY_REFUNDED, [css.secondaryBadge, css.partialIconSecondary]],
    [Shopify.FinancialStatus.REFUNDED, [css.secondaryBadge, css.fullIconSecondary]],
    [Shopify.FinancialStatus.VOIDED, [css.secondaryBadge, css.fullIconSecondary]],
])

export default function OrderStatus({fulfillmentStatus, financialStatus, isCancelled}: Props) {

    return (
        <>
            {isCancelled && <CancelledBadge/>}
            <FinancialBadge financialStatus={financialStatus}/>
            <FulfillmentBadge fulfillmentStatus={fulfillmentStatus}/>
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
            <span className={classnames(css.icon, fulfillmentIcon)}/>
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
            <span className={classnames(css.icon, financialIcon)}/>
            {financialLabel}
        </Badge>
    )
}

function CancelledBadge() {
    return (
        <Badge
            pill
            className={classnames(css.badge, css.cancelled)}
        >
            Cancelled
        </Badge>
    )
}
