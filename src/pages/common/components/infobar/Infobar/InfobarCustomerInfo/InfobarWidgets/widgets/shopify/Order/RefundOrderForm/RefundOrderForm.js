// @flow

import React from 'react'
import type {List, Record} from 'immutable'

import type {
    Order,
    Refund,
    RefundOrderPayload,
    LineItem,
} from '../../../../../../../../../../../constants/integrations/types/shopify'

import OrderTable from './OrderTable'
import OrderFooter from './OrderFooter'

type Props = {
    shopName: string,
    actionName: ?string,
    loading: boolean,
    reason: string,
    notify: boolean,
    order: Record<Order>,
    refund: Record<Refund>,
    payload: Record<$Shape<RefundOrderPayload>>,
    lineItems: List<$Shape<LineItem>>,
    setPayload: (payload: Record<$Shape<RefundOrderPayload>>) => void,
    onPayloadChange: (payload: Record<$Shape<RefundOrderPayload>>) => void,
    onLineItemsChange: (lineItems: List<$Shape<LineItem>>) => void,
    onReasonChange: (event: SyntheticInputEvent<HTMLInputElement>) => void,
    onNotifyChange: (event: SyntheticInputEvent<HTMLInputElement>) => void,
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

        const currencyCode = payload.get('currency')
        const shopCurrencyCode = order.getIn([
            'total_price_set',
            'shop_money',
            'currency_code',
        ])

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
