// @flow

import React from 'react'
import type {List, Record} from 'immutable'

import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'

import OrderTable from './OrderTable'
import OrderFooter from './OrderFooter'

type Props = {
    shopName: string,
    actionName: ?string,
    loading: boolean,
    reason: string,
    order: Record<Shopify.Order>,
    refund: Record<Shopify.Refund>,
    payload: Record<$Shape<Shopify.RefundOrderPayload>>,
    lineItems: List<$Shape<Shopify.LineItem>>,
    setPayload: (Record<$Shape<Shopify.RefundOrderPayload>>) => void,
    onPayloadChange: (Record<$Shape<Shopify.RefundOrderPayload>>) => void,
    onLineItemsChange: (lineItems: List<$Shape<Shopify.LineItem>>) => void,
    onReasonChange: (event: SyntheticInputEvent<HTMLInputElement>) => void,
}

export default class RefundOrderForm extends React.PureComponent<Props> {
    render() {
        const {
            shopName, loading, reason, payload, refund, lineItems, order, actionName, onLineItemsChange, setPayload,
            onPayloadChange, onReasonChange,
        } = this.props

        return (
            <React.Fragment>
                <OrderTable
                    shopName={shopName}
                    currencyCode={payload.get('currency')}
                    lineItems={lineItems}
                    onChange={onLineItemsChange}
                />
                <OrderFooter
                    editable
                    reason={reason}
                    actionName={actionName}
                    hasShippingLine={!!order.getIn(['shipping_lines', 0])}
                    currencyCode={payload.get('currency')}
                    payload={payload}
                    refund={refund}
                    loading={loading}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onReasonChange={onReasonChange}
                />
            </React.Fragment>
        )
    }
}
