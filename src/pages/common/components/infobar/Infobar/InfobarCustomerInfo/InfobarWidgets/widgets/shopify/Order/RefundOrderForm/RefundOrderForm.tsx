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
    onLineItemsChange: (lineItems: List<any>) => void
    onReasonChange: (event: ChangeEvent<HTMLInputElement>) => void
    onNotifyChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default class RefundOrderForm extends React.PureComponent<Props> {
    render() {
        const {
            shopName,
            loading,
            reason,
            notify,
            payload,
            refund,
            lineItems,
            order,
            actionName,
            onLineItemsChange,
            setPayload,
            onPayloadChange,
            onReasonChange,
            onNotifyChange,
        } = this.props

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
                    onChange={onLineItemsChange}
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
}
