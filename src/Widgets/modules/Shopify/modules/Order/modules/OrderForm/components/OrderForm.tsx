import React, { ChangeEvent } from 'react'

import { List, Map } from 'immutable'

import { aggregateMaximumRefundableByGateway } from 'business/shopify/refund'

import OrderFooter from './OrderFooter'
import OrderTable from './OrderTable'

type Props = {
    shopName: string
    actionName: string | null
    loading: boolean
    reason: string
    notify: boolean
    order: Map<any, any>
    refund: Map<any, any>
    payload: Map<any, any>
    lineItems: List<any>
    keepLineItemQuantityAsDefault?: boolean
    setPayload: (payload: Map<any, any>) => void
    onPayloadChange: (payload: Map<any, any>) => void
    onLineItemChange: (lineItem: Map<string, any>, index: number) => void
    onReasonChange: (event: ChangeEvent<HTMLInputElement>) => void
    onNotifyChange: (newValue: boolean) => void
}

export default function OrderForm({
    shopName,
    loading,
    reason,
    notify,
    payload,
    refund,
    lineItems,
    keepLineItemQuantityAsDefault = true,
    order,
    actionName,
    onLineItemChange,
    setPayload,
    onPayloadChange,
    onReasonChange,
    onNotifyChange,
}: Props) {
    const currencyCode = payload.get('currency') as string
    const hasMultipleGateways =
        aggregateMaximumRefundableByGateway(refund).keySeq().count() > 1

    return (
        <React.Fragment>
            <OrderTable
                shopName={shopName}
                currencyCode={currencyCode}
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
                fulfillmentStatus={order.get('fulfillment_status')}
                keepLineItemQuantityAsDefault={keepLineItemQuantityAsDefault}
                hasMultipleGateways={hasMultipleGateways}
            />
            <OrderFooter
                editable
                reason={reason}
                notify={notify}
                actionName={actionName}
                hasShippingLine={!!order.getIn(['shipping_lines', 0])}
                currencyCode={currencyCode}
                payload={payload}
                refund={refund}
                loading={loading}
                setPayload={setPayload}
                onPayloadChange={onPayloadChange}
                onReasonChange={onReasonChange}
                onNotifyChange={onNotifyChange}
                hasMultipleGateways={hasMultipleGateways}
            />
        </React.Fragment>
    )
}
