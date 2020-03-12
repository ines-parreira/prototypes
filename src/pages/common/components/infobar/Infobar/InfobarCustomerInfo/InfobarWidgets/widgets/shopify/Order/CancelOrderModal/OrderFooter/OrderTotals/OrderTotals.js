// @flow

import React from 'react'
import {Label} from 'reactstrap'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {type Record} from 'immutable'

import {
    getCancelOrderState
} from '../../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import {onPayloadChange} from '../../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/actions'
import * as Shopify from '../../../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../../../business/shopify/number'
import {
    getSubtotal,
    getTotalAvailableToRefund,
    getTotalCartDiscountAmount,
    getTotalTax
} from '../../../../../../../../../../../../../business/shopify/refund'
import ShopifyMoneyAmount from '../../../MoneyAmount'
import AmountInput from '../../../AmountInput'

import css from './OrderTotals.less'

type Props = {
    editable: boolean,
    hasShippingLine: boolean,
    currencyCode: string,
    loading: boolean,
    payload: Record<$Shape<Shopify.CancelOrderPayload>>,
    refund: Record<Shopify.Refund>,
    onPayloadChange: (integrationId: number, Record<$Shape<Shopify.CancelOrderPayload>>) => void,
}

type State = {
    shipping: string,
}

export class OrderTotalsComponent extends React.PureComponent<Props, State> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    state = {
        shipping: this.props.payload.getIn(['refund', 'shipping', 'amount']),
    }

    _onShippingChange = (value: string) => {
        const {refund, currencyCode} = this.props
        const max = parseFloat(refund.getIn(['shipping', 'maximum_refundable']))
        const shipping = parseFloat(value) > max ? max : value

        this.setState({shipping: shipping.toString() || formatPrice(0, currencyCode)})
        this._updatePayload()
    }

    _updatePayload = _debounce(() => {
        const {onPayloadChange, currencyCode, payload} = this.props
        const {integrationId} = this.context
        const {shipping} = this.state

        const newPayload = payload.setIn(['refund', 'shipping', 'amount'], formatPrice(shipping, currencyCode))

        onPayloadChange(integrationId, newPayload)
    }, 250)

    render() {
        const {editable, hasShippingLine, loading, refund, currencyCode} = this.props
        const {shipping} = this.state
        const shippingMaximumRefundable = refund.getIn(['shipping', 'maximum_refundable'])

        return (
            <dl className="row text-right mb-0">
                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Subtotal
                </dt>
                <dd className={classnames('col-5 mb-2', {'text-muted': loading})}>
                    <ShopifyMoneyAmount
                        renderIfZero
                        amount={formatPrice(getSubtotal(refund), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                {hasShippingLine && (
                    <dt
                        className={classnames(
                            'col-7',
                            css.grey,
                            !!parseFloat(shippingMaximumRefundable) ? 'mt-2' : 'mb-2'
                        )}
                    >
                        <Label
                            for="shipping"
                            className="d-inline"
                        >
                            Shipping{' '}
                            {!!shippingMaximumRefundable && (
                                <span>
                                    (
                                    <ShopifyMoneyAmount
                                        renderIfZero
                                        amount={shippingMaximumRefundable}
                                        currencyCode={currencyCode}
                                    />
                                    {' '}remaining)
                                </span>
                            )}
                        </Label>
                    </dt>
                )}
                {hasShippingLine && (
                    <dd className={classnames('col-5 mb-2', {'text-muted': loading})}>
                        {!shippingMaximumRefundable || parseFloat(shippingMaximumRefundable) === 0
                            ? '—'
                            : (
                                <AmountInput
                                    id="shipping"
                                    required
                                    disabled={!editable}
                                    max={parseFloat(shippingMaximumRefundable)}
                                    value={shipping}
                                    currencyCode={currencyCode}
                                    className="text-right"
                                    onChange={this._onShippingChange}
                                />
                            )
                        }
                    </dd>
                )}

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Discounts
                </dt>
                <dd className={classnames('col-5 mb-2', {'text-muted': loading})}>
                    <ShopifyMoneyAmount
                        amount={formatPrice(getTotalCartDiscountAmount(refund), currencyCode)}
                        currencyCode={currencyCode}
                        negative
                    />
                </dd>

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Tax
                </dt>
                <dd className={classnames('col-5 mb-2', {'text-muted': loading})}>
                    <ShopifyMoneyAmount
                        amount={formatPrice(getTotalTax(refund), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Total available to refund
                </dt>
                <dd className="col-5 mb-2">
                    <ShopifyMoneyAmount
                        amount={formatPrice(getTotalAvailableToRefund(refund), currencyCode)}
                        currencyCode={currencyCode}
                        renderIfZero
                    />
                </dd>
            </dl>
        )
    }
}

const mapStateToProps = (state) => ({
    loading: getCancelOrderState(state).get('loading'),
    payload: getCancelOrderState(state).get('payload'),
    refund: getCancelOrderState(state).get('refund'),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderTotalsComponent)
