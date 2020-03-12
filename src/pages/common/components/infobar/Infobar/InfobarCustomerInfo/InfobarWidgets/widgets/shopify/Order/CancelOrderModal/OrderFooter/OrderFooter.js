// @flow

import React from 'react'
import {Col, Container, FormGroup, FormText, Input, Label, Row} from 'reactstrap'
import {type Record} from 'immutable'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

import {
    getCancelOrderState
} from '../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import {
    getRefundAmount,
    getTotalAvailableToRefund,
    getTotalQuantities
} from '../../../../../../../../../../../../business/shopify/refund'
import {setPayload} from '../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/actions'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import AmountInput from '../../AmountInput'

import OrderTotals from './OrderTotals'
import css from './OrderFooter.less'

type Props = {
    editable: boolean,
    hasShippingLine: boolean,
    currencyCode: string,
    loading: boolean,
    payload: Record<$Shape<Shopify.CancelOrderPayload>>,
    refund: Record<Shopify.Refund>,
    setPayload: (integrationId: number, Record<$Shape<Shopify.CancelOrderPayload>>) => void,
}

export class CancelOrderFooterComponent extends React.PureComponent<Props> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    _onAmountChange = (value: string) => {
        const {refund, payload, setPayload} = this.props
        const max = getTotalAvailableToRefund(refund)
        const newAmount = parseFloat(value) > max ? max : value
        const newPayload = payload.set('amount', newAmount)

        setPayload(newPayload)
    }

    _onReasonChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload
            .set('reason', value)
            .set('email', value !== 'fraud')

        setPayload(newPayload)
    }

    _onDiscrepancyReasonChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const {value} = event.target
        const newPayload = payload.setIn(['refund', 'discrepancy_reason'], value)

        setPayload(newPayload)
    }

    _onRestockItemsChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const restock = event.target.checked
        const newPayload = payload
            .setIn(['refund', 'restock'], restock)
            .updateIn(['refund', 'refund_line_items'], (refundLineItems) =>
                refundLineItems.map((refundLineItem) =>
                    refundLineItem.set('restock_type', restock ? 'cancel' : 'no_restock')
                )
            )

        setPayload(newPayload)
    }

    _onEmailChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {payload, setPayload} = this.props
        const email = event.target.checked
        const newPayload = payload.set('email', email)

        setPayload(newPayload)
    }

    render() {
        const {editable, hasShippingLine, loading, payload, refund, currencyCode} = this.props
        const amountMax = refund.isEmpty() ? null : getTotalAvailableToRefund(refund)
        const totalQuantities = getTotalQuantities(payload.get('refund'))
        const discrepancyLimit = getRefundAmount(refund)
        const hasDiscrepancy = !loading && parseFloat(payload.get('amount')) !== parseFloat(discrepancyLimit)

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
                                        value={payload.get('amount', '')}
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
                                <FormGroup>
                                    <Label for="reason">Reason for canceling this order</Label>
                                    <Input
                                        type="select"
                                        id="reason"
                                        value={payload.get('reason', 'customer')}
                                        onChange={this._onReasonChange}
                                    >
                                        <option value="customer">Customer changed/canceled order</option>
                                        <option value="fraud">Fraudulent order</option>
                                        <option value="inventory">Items unavailable</option>
                                        <option value="declined">Payment declined</option>
                                        <option value="other">Other</option>
                                    </Input>
                                </FormGroup>
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
                                            value={payload.getIn(['refund', 'discrepancy_reason'], 'other')}
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
                                            checked={payload.getIn(['refund', 'restock'], true)}
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
                                            checked={payload.get('email', true)}
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
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => ({
    loading: getCancelOrderState(state).get('loading'),
    payload: getCancelOrderState(state).get('payload'),
    refund: getCancelOrderState(state).get('refund'),
})

const mapDispatchToProps = {
    setPayload,
}

export default connect(mapStateToProps, mapDispatchToProps)(CancelOrderFooterComponent)
