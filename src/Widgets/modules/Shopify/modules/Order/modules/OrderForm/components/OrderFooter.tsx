import {Label} from '@gorgias/merchant-ui-kit'
import {Map} from 'immutable'
import React, {ChangeEvent} from 'react'
import {Col, Container, FormGroup, FormText, Input, Row} from 'reactstrap'

import {
    getRefundAmount,
    getTotalAvailableToRefund,
    getTotalQuantities,
    getTransactionToRefund,
} from 'business/shopify/refund'
import CheckBox from 'pages/common/forms/CheckBox'

import AmountInput from 'Widgets/modules/Shopify/modules/AmountInput'
import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

import css from './OrderFooter.less'
import OrderTotals from './OrderTotals'

type Props = {
    editable: boolean
    actionName: string | null
    hasShippingLine: boolean
    currencyCode: string
    reason: string | null
    notify: boolean
    loading: boolean
    payload: Map<any, any>
    refund: Map<any, any>
    setPayload: (payload: Map<any, any>) => void
    onPayloadChange: (payload: Map<any, any>) => void
    onReasonChange: (event: ChangeEvent<HTMLInputElement>) => void
    onNotifyChange: (newValue: boolean) => void
    hasMultipleGateways: boolean
}

const OrderFooter = ({
    editable,
    actionName,
    hasShippingLine,
    notify,
    loading,
    payload,
    refund,
    setPayload,
    currencyCode,
    reason,
    onPayloadChange,
    onReasonChange,
    onNotifyChange,
    hasMultipleGateways,
}: Props) => {
    const _onAmountChange = (value: number) => {
        const transactions = getTransactionToRefund(refund, value)
        const newPayload = payload.set('transactions', transactions)

        setPayload(newPayload)
    }

    const _onDiscrepancyReasonChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const {value} = event.target
        const newPayload = payload.set('discrepancy_reason', value)

        setPayload(newPayload)
    }

    const _onRestockItemsChange = (newValue: boolean) => {
        const newPayload = payload.set('restock', newValue)

        setPayload(newPayload)
    }

    const _renderReason = () => {
        if (actionName === ShopifyActionType.CancelOrder) {
            return (
                <FormGroup>
                    <Label htmlFor="reason">
                        Reason for canceling this order
                    </Label>
                    <Input
                        type="select"
                        id="reason"
                        value={reason || 'customer'}
                        onChange={onReasonChange}
                        disabled={hasMultipleGateways}
                    >
                        <option value="customer">
                            Customer changed/canceled order
                        </option>
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
                <Label htmlFor="reason">Reason for refund</Label>
                <Input
                    id="reason"
                    value={reason || ''}
                    onChange={onReasonChange}
                    disabled={hasMultipleGateways}
                />
                <FormText color="muted">
                    Only you and other staff can see this reason.
                </FormText>
            </FormGroup>
        )
    }

    const amount = getRefundAmount(payload)
    const amountMax = refund.isEmpty()
        ? undefined
        : getTotalAvailableToRefund(refund)
    const totalQuantities = getTotalQuantities(payload, refund)
    const discrepancyLimit = getRefundAmount(refund)
    const hasDiscrepancy = !loading && amount !== discrepancyLimit

    return (
        <Container fluid className={css.container}>
            <Row>
                <Col xs={{size: 12, order: 2}} xl={{size: 7, order: 1}}>
                    <Row className="mb-5">
                        <Col xs={12}>
                            <CheckBox
                                className="mb-3"
                                isChecked={payload.get('restock', false)}
                                isDisabled={
                                    totalQuantities === 0 || hasMultipleGateways
                                }
                                onChange={_onRestockItemsChange}
                                caption="The claimed quantity will be restocked back to your store. Note that custom items can’t be restocked."
                            >
                                Restock items
                            </CheckBox>
                            <CheckBox
                                className="mb-3"
                                name="notify-customer"
                                isChecked={notify}
                                onChange={onNotifyChange}
                                isDisabled={hasMultipleGateways}
                            >
                                Send notification to customer
                            </CheckBox>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={6}>
                            <FormGroup>
                                <Label htmlFor="amount">
                                    Refund with: Manual
                                </Label>
                                <AmountInput
                                    id="amount"
                                    required
                                    disabled={loading || hasMultipleGateways}
                                    value={amount}
                                    max={amountMax}
                                    currencyCode={currencyCode}
                                    className={css.amountInput}
                                    onChange={_onAmountChange}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} lg={6}>
                            {_renderReason()}
                        </Col>
                    </Row>
                    {hasDiscrepancy && (
                        <Row>
                            <Col xs={12}>
                                <FormGroup>
                                    <Label htmlFor="discrepancy-reason">
                                        Reason for custom refund amount
                                    </Label>
                                    <Input
                                        type="select"
                                        id="discrepancy-reason"
                                        value={payload.get(
                                            'discrepancy_reason',
                                            'other'
                                        )}
                                        className={css.discrepancyReasonInput}
                                        onChange={_onDiscrepancyReasonChange}
                                        disabled={hasMultipleGateways}
                                    >
                                        <option value="restock">
                                            Restocking fee
                                        </option>
                                        <option value="damage">
                                            Damaged goods
                                        </option>
                                        <option value="customer">
                                            Customer satisfaction
                                        </option>
                                        <option value="other">Other</option>
                                    </Input>
                                    <FormText color="muted">
                                        The amount being refunded is different
                                        from the value of items being returned.
                                    </FormText>
                                </FormGroup>
                            </Col>
                        </Row>
                    )}
                </Col>
                <Col
                    xs={{size: 12, order: 1}}
                    xl={{size: 5, order: 2}}
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
                        hasMultipleGateways={hasMultipleGateways}
                    />
                </Col>
            </Row>
        </Container>
    )
}

export default OrderFooter
