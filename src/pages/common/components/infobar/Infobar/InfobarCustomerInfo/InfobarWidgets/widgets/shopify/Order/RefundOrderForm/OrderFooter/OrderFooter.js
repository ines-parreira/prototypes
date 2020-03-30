// @flow

import React from 'react'
import {Col, Container, FormGroup, FormText, Input, Label, Row} from 'reactstrap'
import {type Record} from 'immutable'

import {
    getRefundAmount,
    getRestockType,
    getTotalAvailableToRefund,
    getTotalQuantities
} from '../../../../../../../../../../../../business/shopify/refund'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import {ShopifyAction} from '../../constants'
import AmountInput from '../../AmountInput'

import OrderTotals from './OrderTotals'
import css from './OrderFooter.less'

type Props = {
    editable: boolean,
    actionName: ?string,
    hasShippingLine: boolean,
    currencyCode: string,
    reason: ?string,
    loading: boolean,
    payload: Record<$Shape<Shopify.RefundOrderPayload>>,
    refund: Record<Shopify.Refund>,
    setPayload: (Record<$Shape<Shopify.RefundOrderPayload>>) => void,
    onPayloadChange: (Record<$Shape<Shopify.RefundOrderPayload>>) => void,
    onReasonChange: (event: SyntheticInputEvent<HTMLInputElement>) => void,
}

export default class OrderFooter extends React.PureComponent<Props> {
    _getNotifyAttribute(): string {
        const {actionName} = this.props
        return actionName === ShopifyAction.CANCEL_ORDER ? 'email' : 'notify'
    }

    _onAmountChange = (value: string) => {
        const {refund, payload, setPayload} = this.props
        const max = getTotalAvailableToRefund(refund)
        const newAmount = parseFloat(value) > max ? max : value
        const newPayload = payload.setIn(['transactions', 0, 'amount'], newAmount)

        setPayload(newPayload)
    }

    _onDiscrepancyReasonChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload.set('discrepancy_reason', value)

        setPayload(newPayload)
    }

    _onRestockItemsChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const restock = event.target.checked
        const newPayload = payload
            .set('restock', restock)
            .update('refund_line_items', (refundLineItems) =>
                refundLineItems.map((refundLineItem) =>
                    refundLineItem.set('restock_type', getRestockType(refundLineItem, restock))
                )
            )

        setPayload(newPayload)
    }

    _onEmailChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {checked} = event.target
        const newPayload = payload.set(this._getNotifyAttribute(), checked)

        setPayload(newPayload)
    }

    _renderReason() {
        const {actionName, reason, onReasonChange} = this.props

        if (actionName === ShopifyAction.CANCEL_ORDER) {
            return (
                <FormGroup>
                    <Label for="reason">Reason for canceling this order</Label>
                    <Input
                        type="select"
                        id="reason"
                        value={reason || 'customer'}
                        onChange={onReasonChange}
                    >
                        <option value="customer">Customer changed/canceled order</option>
                        <option value="fraud">Fraudulent order</option>
                        <option value="inventory">Items unavailable</option>
                        <option value="declined">Payment declined</option>
                        <option value="other">Other</option>
                    </Input>
                </FormGroup>
            )
        }

        return (
            <FormGroup>
                <Label for="reason">Reason for refund</Label>
                <Input
                    id="reason"
                    value={reason || ''}
                    onChange={onReasonChange}
                />
                <FormText color="muted">
                    Only you and other staff can see this reason.
                </FormText>
            </FormGroup>
        )
    }

    render() {
        const {editable, hasShippingLine, loading, payload, refund, currencyCode, onPayloadChange} = this.props
        const amount = payload.getIn(['transactions', 0, 'amount'], '')
        const amountMax = refund.isEmpty() ? null : getTotalAvailableToRefund(refund)
        const totalQuantities = getTotalQuantities(payload)
        const discrepancyLimit = getRefundAmount(refund)
        const hasDiscrepancy = !loading && parseFloat(amount) !== discrepancyLimit

        return (
            <Container
                fluid
                className={css.container}
            >
                <Row>
                    <Col
                        xs={{size: 12, order: 2}}
                        xl={{size: 8, order: 1}}
                    >
                        <Row>
                            <Col
                                xs={12}
                                lg={6}
                            >
                                <FormGroup>
                                    <Label for="amount">Refund with: Manual</Label>
                                    <AmountInput
                                        id="amount"
                                        required
                                        disabled={loading}
                                        value={amount}
                                        max={amountMax}
                                        currencyCode={currencyCode}
                                        className={css.amountInput}
                                        onChange={this._onAmountChange}
                                    />
                                </FormGroup>
                            </Col>
                            <Col
                                xs={12}
                                lg={6}
                            >
                                {this._renderReason()}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                {hasDiscrepancy && (
                                    <FormGroup>
                                        <Label for="discrepancy-reason">Reason for custom refund amount</Label>
                                        <Input
                                            type="select"
                                            id="discrepancy-reason"
                                            value={payload.get('discrepancy_reason', 'other')}
                                            className={css.discrepancyReasonInput}
                                            onChange={this._onDiscrepancyReasonChange}
                                        >
                                            <option value="restock">Restocking fee</option>
                                            <option value="damage">Damaged goods</option>
                                            <option value="customer">Customer satisfaction</option>
                                            <option value="other">Other</option>
                                        </Input>
                                        <FormText color="muted">
                                            The amount being refunded is different from the value of items being{' '}
                                            returned.
                                        </FormText>
                                    </FormGroup>
                                )}
                                <FormGroup
                                    check
                                    className="mb-3"
                                >
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            checked={payload.get('restock', true)}
                                            disabled={totalQuantities === 0}
                                            onChange={this._onRestockItemsChange}
                                        />
                                        <span className="ml-1">Restock items</span>
                                    </Label>
                                    <FormText color="muted">
                                        The claimed quantity for products in this order will be restocked back to {' '}
                                        your store.
                                    </FormText>
                                </FormGroup>
                                <FormGroup
                                    check
                                    className="mb-3"
                                >
                                    <Label check>
                                        <Input
                                            type="checkbox"
                                            checked={payload.get(this._getNotifyAttribute(), true)}
                                            onChange={this._onEmailChange}
                                        />
                                        <span className="ml-1">Send notification to customer</span>
                                    </Label>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                    <Col
                        xs={{size: 12, order: 1}}
                        xl={{size: 4, order: 2}}
                        className="mb-sm-4"
                    >
                        <OrderTotals
                            editable={editable}
                            hasShippingLine={hasShippingLine}
                            currencyCode={currencyCode}
                            loading={loading}
                            payload={payload}
                            refund={refund}
                            onPayloadChange={onPayloadChange}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}
