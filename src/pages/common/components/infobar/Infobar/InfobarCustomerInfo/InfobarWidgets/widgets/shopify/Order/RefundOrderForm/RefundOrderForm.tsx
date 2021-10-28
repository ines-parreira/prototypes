import React, {ChangeEvent} from 'react'
import {List, Map} from 'immutable'

import OrderTable from './OrderTable/OrderTable'
import OrderFooter from './OrderFooter/OrderFooter'

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
    setPayload: (payload: Map<any, any>) => void
    onPayloadChange: (payload: Map<any, any>) => void
    onLineItemChange: (lineItem: Map<string, any>, index: number) => void
    onReasonChange: (event: ChangeEvent<HTMLInputElement>) => void
    onNotifyChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function RefundOrderForm({
    shopName,
    loading,
    reason,
    notify,
    payload,
    refund,
    lineItems,
    order,
    actionName,
    onLineItemChange,
    setPayload,
    onPayloadChange,
    onReasonChange,
    onNotifyChange,
}: Props) {
    const currencyCode = payload.get('currency') as string
    const shopCurrencyCode = order.getIn([
        'total_price_set',
        'shop_money',
        'currency_code',
    ]) as string

    return (
        <React.Fragment>
            <OrderTable
                shopName={shopName}
                currencyCode={currencyCode}
                shopCurrencyCode={shopCurrencyCode}
                lineItems={lineItems}
                refund={refund}
                onLineItemChange={onLineItemChange}
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
            />
        </React.Fragment>
    )
}
