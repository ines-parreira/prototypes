import React from 'react'
import {Label} from 'reactstrap'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {Map} from 'immutable'

import {formatPrice} from 'business/shopify/number'
import {
    getSubtotal,
    getTotalAvailableToRefund,
    getTotalCartDiscountAmount,
    getTotalTax,
} from 'business/shopify/refund'
import MoneyAmount from '../../../../../MoneyAmount'
import AmountInput from '../../../../shared/AmountInput/AmountInput'

import css from './OrderTotals.less'

type Props = {
    editable: boolean
    hasShippingLine: boolean
    currencyCode: string
    loading: boolean
    payload: Map<any, any>
    refund: Map<any, any>
    onPayloadChange: (payload: Map<any, any>) => void
}

type State = {
    shipping: string
}

export default class OrderTotals extends React.PureComponent<Props, State> {
    state = {
        shipping: this.props.payload.getIn(['shipping', 'amount']),
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (
            parseFloat(prevState.shipping) !== parseFloat(this.state.shipping)
        ) {
            this._updatePayload()
        }
    }

    _onShippingChange = (value: string) => {
        const {refund, currencyCode} = this.props
        const max = parseFloat(refund.getIn(['shipping', 'maximum_refundable']))
        const newValue = parseFloat(value) > max ? max : value
        const newShipping = newValue.toString() || formatPrice(0, currencyCode)

        this.setState({shipping: newShipping})
    }

    _updatePayload = _debounce(() => {
        const {onPayloadChange, currencyCode, payload} = this.props
        const {shipping} = this.state

        const newPayload = payload.setIn(
            ['shipping', 'amount'],
            formatPrice(shipping, currencyCode)
        )
        onPayloadChange(newPayload)
    }, 250)

    render() {
        const {editable, hasShippingLine, loading, refund, currencyCode} =
            this.props
        const {shipping} = this.state
        const shippingMaximumRefundable = refund.getIn([
            'shipping',
            'maximum_refundable',
        ])

        return (
            <dl className="row text-right mb-0">
                <dt className={classnames('col-7 mb-2', css.grey)}>Subtotal</dt>
                <dd
                    className={classnames('col-5 mb-2', css.value, {
                        'text-muted': loading,
                    })}
                >
                    <MoneyAmount
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
                            !!parseFloat(shippingMaximumRefundable)
                                ? 'mt-2'
                                : 'mb-2'
                        )}
                    >
                        <Label for="shipping" className="d-inline">
                            Shipping{' '}
                            {!!shippingMaximumRefundable && (
                                <span>
                                    (
                                    <MoneyAmount
                                        renderIfZero
                                        amount={shippingMaximumRefundable}
                                        currencyCode={currencyCode}
                                    />{' '}
                                    remaining)
                                </span>
                            )}
                        </Label>
                    </dt>
                )}
                {hasShippingLine && (
                    <dd
                        className={classnames('col-5 mb-2', css.value, {
                            'text-muted': loading,
                        })}
                    >
                        {!shippingMaximumRefundable ||
                        parseFloat(shippingMaximumRefundable) === 0 ? (
                            '—'
                        ) : (
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
                        )}
                    </dd>
                )}

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Discounts
                </dt>
                <dd
                    className={classnames('col-5 mb-2', css.value, {
                        'text-muted': loading,
                    })}
                >
                    <MoneyAmount
                        amount={formatPrice(
                            getTotalCartDiscountAmount(refund),
                            currencyCode
                        )}
                        currencyCode={currencyCode}
                        negative
                    />
                </dd>

                <dt className={classnames('col-7 mb-2', css.grey)}>Tax</dt>
                <dd
                    className={classnames('col-5 mb-2', css.value, {
                        'text-muted': loading,
                    })}
                >
                    <MoneyAmount
                        amount={formatPrice(getTotalTax(refund), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    Total available to refund
                </dt>
                <dd className={classnames('col-5 mb-2', css.value)}>
                    <MoneyAmount
                        amount={formatPrice(
                            getTotalAvailableToRefund(refund),
                            currencyCode
                        )}
                        currencyCode={currencyCode}
                        renderIfZero
                    />
                </dd>
            </dl>
        )
    }
}
