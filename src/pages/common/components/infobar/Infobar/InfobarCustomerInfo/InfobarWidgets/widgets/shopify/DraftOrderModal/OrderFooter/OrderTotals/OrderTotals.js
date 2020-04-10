// @flow

import React from 'react'
import {type Record} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import hash from 'object-hash'

import {
    getCreateOrderState
} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {
    onPayloadChange
} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import {
    getSubtotal,
    getTaxLinesTotals,
    getTotal,
    getTotalShippingPrice
} from '../../../../../../../../../../../../business/shopify/draftOrder'
import {getDraftOrderTotalLineItemsPrice} from '../../../../../../../../../../../../business/shopify/lineItem'
import {getTotalDiscountAmount} from '../../../../../../../../../../../../business/shopify/discount'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import DiscountPopover from '../../DiscountPopover'
import ShippingPopover from '../../ShippingPopover'
import ShopifyMoneyAmount from '../../../Order/MoneyAmount'
import TaxesPopover from '../../TaxesPopover'

import css from './OrderTotals.less'

type Props = {
    editable: boolean,
    actionName: string,
    currencyCode: string,
    loading: boolean,
    payload: Record<$Shape<Shopify.DraftOrder>>,
    draftOrder: Record<Shopify.DraftOrder>,
    defaultShippingLine: Record<Shopify.ShippingLine>,
    onPayloadChange: (integrationId: number, Record<$Shape<Shopify.DraftOrder>>) => void,
}

export class OrderTotalsComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    _onAppliedDiscountChange = (appliedDiscount: Record<$Shape<Shopify.AppliedDiscount>> | null) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('applied_discount', appliedDiscount)

        onPayloadChange(integrationId, newPayload)
    }

    _onShippingLinesChange = (shippingLine: $Shape<Shopify.ShippingLine>) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('shipping_line', shippingLine)

        onPayloadChange(integrationId, newPayload)
    }

    _onTaxExemptChange = (taxExempt: boolean) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('tax_exempt', taxExempt)

        onPayloadChange(integrationId, newPayload)
    }

    render() {
        const {editable, loading, payload, draftOrder, currencyCode, actionName, defaultShippingLine} = this.props
        const uniqueTaxLines = getTaxLinesTotals(draftOrder)

        return (
            <dl className="row text-right mb-0">
                <dt className="col-9 mb-2">
                    <DiscountPopover
                        id="applied-discount"
                        label="order"
                        editable={editable}
                        actionName={actionName}
                        currencyCode={currencyCode}
                        value={payload.get('applied_discount')}
                        max={getDraftOrderTotalLineItemsPrice(payload)}
                        onChange={this._onAppliedDiscountChange}
                    >
                        Add discount
                    </DiscountPopover>
                </dt>
                <dd className="col-3 mb-2">
                    {!!payload.getIn(['applied_discount', 'title']) && <br/>}
                    <ShopifyMoneyAmount
                        amount={formatPrice(getTotalDiscountAmount(payload), currencyCode)}
                        currencyCode={currencyCode}
                        negative
                    />
                </dd>

                <dt className={classnames('col-9 mb-2', css.grey)}>Subtotal</dt>
                <dd className="col-3 mb-2">
                    <ShopifyMoneyAmount
                        renderIfZero
                        amount={formatPrice(getSubtotal(payload), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <dt className="col-9 mb-2">
                    <ShippingPopover
                        id="shipping-lines"
                        editable={editable}
                        actionName={actionName}
                        currencyCode={currencyCode}
                        value={payload.get('shipping_line')}
                        defaultValue={defaultShippingLine}
                        onChange={this._onShippingLinesChange}
                    >
                        {!!payload.get('shipping_line') ? 'Shipping' : 'Add shipping'}
                    </ShippingPopover>
                </dt>
                <dd className="col-3 mb-2">
                    {!!payload.get('shipping_line') && <br/>}
                    <ShopifyMoneyAmount
                        renderIfZero={!!payload.get('shipping_line')}
                        amount={formatPrice(getTotalShippingPrice(payload), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <dt className="col-9 mb-2">
                    <span className="d-block">
                        <TaxesPopover
                            id="taxes"
                            editable={editable}
                            actionName={actionName}
                            value={payload.get('tax_exempt')}
                            onChange={this._onTaxExemptChange}
                        >
                            Taxes
                        </TaxesPopover>
                    </span>
                    {uniqueTaxLines.map((uniqueTaxLine) => (
                        <span
                            key={hash(uniqueTaxLine)}
                            className={classnames('d-block', css.grey)}
                        >
                            {uniqueTaxLine.label}
                        </span>
                    ))}
                </dt>
                <dd className="col-3 mb-2">
                    {payload.get('tax_exempt') || !uniqueTaxLines.length ? '—' : <br/>}
                    {uniqueTaxLines.map((uniqueTaxLine) => (
                        <span
                            key={hash(uniqueTaxLine)}
                            className={classnames('d-block', {'text-muted': loading})}
                        >
                            <ShopifyMoneyAmount
                                renderIfZero
                                amount={formatPrice(uniqueTaxLine.total, currencyCode)}
                                currencyCode={currencyCode}
                            />
                        </span>
                    ))}
                </dd>

                <dt className="col-9 mb-2">Total</dt>
                <dd className="col-3 mb-2">
                    <strong className={classnames({'text-muted': loading})}>
                        <ShopifyMoneyAmount
                            renderIfZero
                            amount={formatPrice(getTotal(draftOrder), currencyCode)}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </dd>
            </dl>
        )
    }
}

const mapStateToProps = (state) => ({
    loading: getCreateOrderState(state).get('loading'),
    payload: getCreateOrderState(state).get('payload'),
    draftOrder: getCreateOrderState(state).get('draftOrder'),
    defaultShippingLine: getCreateOrderState(state).get('defaultShippingLine'),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderTotalsComponent)
