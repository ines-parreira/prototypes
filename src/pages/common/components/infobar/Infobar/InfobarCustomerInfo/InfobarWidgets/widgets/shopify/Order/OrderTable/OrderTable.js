// @flow

import React from 'react'
import {Table} from 'reactstrap'
import {fromJS, type Record} from 'immutable'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import hash from 'object-hash'

import {
    getDuplicateOrderState
} from '../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/selectors'
import {onPayloadChange} from '../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/actions'
import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'

import {LineItemRow} from './LineItemRow'
import css from './OrderTable.less'

type Props = {
    editable: boolean,
    shopName: string,
    currencyCode: string,
    payload: Record<$Shape<Shopify.DraftOrder>>,
    products: Map<number, Record<Shopify.Product>>,
    onPayloadChange: (integrationId: number, Record<$Shape<Shopify.DraftOrder>>) => void,
}

export class OrderTableComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    _onLineItemChange = (index: number, updatedLineItem: Record<Shopify.LineItem>) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.setIn(['line_items', index], updatedLineItem)

        onPayloadChange(integrationId, newPayload)
    }

    _onLineItemDelete = (index: number) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.removeIn(['line_items', index])

        onPayloadChange(integrationId, newPayload)
    }

    render() {
        const {editable, payload, products, shopName, currencyCode} = this.props
        const lineItems = payload.get('line_items', fromJS([]))

        return (
            <Table
                hover
                className={css.table}
            >
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Item price</th>
                        <th>Qty</th>
                        <th>Item total</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((lineItem, index) => (
                        <LineItemRow
                            key={hash(lineItem.remove('quantity'))}
                            lineItem={lineItem}
                            product={products.get(lineItem.get('product_id'))}
                            shopName={shopName}
                            currencyCode={currencyCode}
                            editable={editable}
                            removable={lineItems.size > 1}
                            onChange={(updatedLineItem) => this._onLineItemChange(index, updatedLineItem)}
                            onDelete={() => this._onLineItemDelete(index)}
                        />
                    ))}
                </tbody>
            </Table>
        )
    }
}

const mapStateToProps = (state) => ({
    payload: getDuplicateOrderState(state).get('payload'),
    products: getDuplicateOrderState(state).get('products'),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderTableComponent)
