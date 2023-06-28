import React from 'react'
import {Label} from 'reactstrap'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {List, Map} from 'immutable'

import {formatPrice} from 'business/shopify/number'
import {
    getSubtotal,
    getTotalAvailableToRefund,
    getTotalCartDiscountAmount,
    getTotalTax,
} from 'business/shopify/refund'
import Tooltip from 'pages/common/components/Tooltip'
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
    hasMultipleGateways: boolean
}

type State = {
    shipping: number
}

export default class OrderTotals extends React.PureComponent<Props, State> {
    state = {
        shipping: Number(this.props.payload.getIn(['shipping', 'amount'])),
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.shipping !== this.state.shipping) {
            this._updatePayload()
        }
    }

    _onShippingChange = (value: number) => {
        const {refund} = this.props
        const max = Number(refund.getIn(['shipping', 'maximum_refundable']))
        const newValue = value > max ? max : value
        const newShipping = newValue

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
        const {
            editable,
            hasShippingLine,
            loading,
            refund,
            currencyCode,
            hasMultipleGateways,
        } = this.props
        const {shipping} = this.state
        const shippingMaximumRefundable = refund.getIn([
            'shipping',
            'maximum_refundable',
        ])

        const hasGiftCard = (
            refund.get('transactions', List()) as List<Map<any, any>>
        ).find((value) =>
            value ? value.get('gateway') === 'gift_card' : false
        )

        return (
            <dl className="row text-left mb-0">
                <dt className={classnames('col-7 mb-2', css.grey)}>Subtotal</dt>
                <dd
                    className={classnames('col-5 mb-2 text-right', css.value, {
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
                        className={classnames(
                            'col-5 mb-2 text-right',
                            css.value,
                            {
                                'text-muted': loading,
                            }
                        )}
                    >
                        {!shippingMaximumRefundable ||
                        parseFloat(shippingMaximumRefundable) === 0 ? (
                            '—'
                        ) : (
                            <AmountInput
                                id="shipping"
                                required
                                disabled={!editable || hasMultipleGateways}
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
                    className={classnames('col-5 mb-2 text-right', css.value, {
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
                    className={classnames('col-5 mb-2 text-right', css.value, {
                        'text-muted': loading,
                    })}
                >
                    <MoneyAmount
                        amount={formatPrice(getTotalTax(refund), currencyCode)}
                        currencyCode={currencyCode}
                    />
                </dd>

                <dt className={classnames('col-7 mb-2', css.grey)}>
                    <span>Total available to refund</span>
                    {(hasMultipleGateways || hasGiftCard) && (
                        <>
                            <span
                                className={classnames(
                                    'material-icons red ml-2',
                                    css.tooltip
                                )}
                                id="gateways-warning-icon"
                                aria-label="Order with multiple gateways warning"
                            >
                                info_outlined
                            </span>
                            <Tooltip
                                placement="top"
                                target="gateways-warning-icon"
                            >
                                This order has multiple transactions with
                                different payment providers. To issue a full
                                refund, please go to Shopify.
                            </Tooltip>
                        </>
                    )}
                </dt>

                <dd className={classnames('col-5 mb-2 text-right', css.value)}>
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
