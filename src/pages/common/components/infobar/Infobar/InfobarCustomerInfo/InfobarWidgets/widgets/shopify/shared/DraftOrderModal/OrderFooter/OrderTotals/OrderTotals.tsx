import React, {Component, ContextType} from 'react'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import hash from 'object-hash'

import {getDraftOrderTotalLineItemsPrice} from 'business/shopify/lineItem'
import {formatPrice} from 'business/shopify/number'
import {onPayloadChange} from 'state/infobarActions/shopify/createOrder/actions'
import {getCreateOrderState} from 'state/infobarActions/shopify/createOrder/selectors'
import {RootState} from 'state/types'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import MoneyAmount from '../../../../../MoneyAmount'
import {ShopifyActionType} from '../../../../types'
import DiscountPopover from '../../DiscountPopover/DiscountPopover'
import ShippingPopover from '../../ShippingPopover/ShippingPopover'
import TaxesPopover from '../../TaxesPopover/TaxesPopover'

import css from './OrderTotals.less'

type Props = {
    editable: boolean
    actionName: ShopifyActionType
    currencyCode: string
    loading: boolean
    payload: Map<any, any>
    calculatedDraftOrder: Map<any, any>
    onPayloadChange: (integrationId: number, record: Map<any, any>) => void
}

export class OrderTotalsComponent extends Component<Props> {
    static contextType = IntegrationContext
    context!: ContextType<typeof IntegrationContext>
    _onAppliedDiscountChange = (appliedDiscount: Map<any, any> | null) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('applied_discount', appliedDiscount)
        onPayloadChange(integrationId!, newPayload)
    }

    _onShippingLineChange = (shippingLine: Map<any, any> | null) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('shipping_line', shippingLine)
        onPayloadChange(integrationId!, newPayload)
    }

    _onTaxExemptChange = (taxExempt: boolean) => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const newPayload = payload.set('tax_exempt', taxExempt)
        onPayloadChange(integrationId!, newPayload)
    }

    render() {
        const {
            editable,
            loading,
            payload,
            calculatedDraftOrder,
            currencyCode,
            actionName,
        } = this.props
        const taxLines = calculatedDraftOrder.get('taxLines', []) as List<any>

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
                    {!!payload.getIn(['applied_discount', 'title']) && <br />}
                    <MoneyAmount
                        amount={formatPrice(
                            calculatedDraftOrder.getIn([
                                'appliedDiscount',
                                'amountV2',
                                'amount',
                            ]),
                            currencyCode
                        )}
                        currencyCode={currencyCode}
                        negative
                    />
                </dd>

                <dt className={classnames('col-9 mb-2', css.grey)}>Subtotal</dt>
                <dd className="col-3 mb-2">
                    <MoneyAmount
                        renderIfZero
                        amount={formatPrice(
                            calculatedDraftOrder.get('subtotalPrice'),
                            currencyCode
                        )}
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
                        availableShippingRates={calculatedDraftOrder.get(
                            'availableShippingRates',
                            []
                        )}
                        onChange={this._onShippingLineChange}
                    >
                        {!!payload.get('shipping_line')
                            ? 'Shipping'
                            : 'Add shipping'}
                    </ShippingPopover>
                </dt>
                <dd className="col-3 mb-2">
                    {!!payload.get('shipping_line') && <br />}
                    <MoneyAmount
                        renderIfZero={!!payload.get('shipping_line')}
                        amount={formatPrice(
                            calculatedDraftOrder.get('totalShippingPrice'),
                            currencyCode
                        )}
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
                    {taxLines.map((taxLine: Map<any, any>) => (
                        <span
                            key={hash(taxLine.toJS())}
                            className={classnames('d-block', css.grey)}
                        >
                            {taxLine.get('title')}{' '}
                            {taxLine.get('ratePercentage')}%
                        </span>
                    ))}
                </dt>
                <dd className="col-3 mb-2">
                    {payload.get('tax_exempt') || !taxLines.size ? '—' : <br />}
                    {taxLines.map((taxLine: Map<any, any>) => (
                        <span
                            key={hash(taxLine.toJS())}
                            className={classnames('d-block', {
                                'text-muted': loading,
                            })}
                        >
                            <MoneyAmount
                                renderIfZero
                                amount={formatPrice(
                                    taxLine.getIn([
                                        'priceSet',
                                        'presentmentMoney',
                                        'amount',
                                    ]),
                                    currencyCode
                                )}
                                currencyCode={currencyCode}
                            />
                        </span>
                    ))}
                </dd>

                <dt className="col-9 mb-2">Total</dt>
                <dd className="col-3 mb-2">
                    <strong className={classnames({'text-muted': loading})}>
                        <MoneyAmount
                            renderIfZero
                            amount={calculatedDraftOrder.get('totalPrice')}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </dd>
            </dl>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    loading: getCreateOrderState(state).get('loading'),
    payload: getCreateOrderState(state).get('payload'),
    calculatedDraftOrder:
        getCreateOrderState(state).get('calculatedDraftOrder') || fromJS({}),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderTotalsComponent)
