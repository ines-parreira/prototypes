import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'

import {
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from 'fixtures/shopify'
import {ShopifyActionType} from '../../../../types'
import OrderFooter from '../OrderFooter'

jest.mock('lodash/debounce', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(v: T) => T = jest.requireActual('lodash/identity')
    return _identity
})

describe('<OrderFooter/>', () => {
    let onPayloadChange: jest.MockedFunction<any>
    let onReasonChange: jest.MockedFunction<any>
    let onNotifyChange: jest.MockedFunction<any>
    let setPayload: jest.MockedFunction<any>

    beforeEach(() => {
        onPayloadChange = jest.fn()
        onReasonChange = jest.fn()
        onNotifyChange = jest.fn()
        setPayload = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render for refund order action', () => {
            const {container} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.RefundOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should disable all the inputs when hasMultipleGateways', () => {
            render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.RefundOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={true}
                />
            )

            screen.getAllByRole('textbox').forEach((textbox) => {
                expect(textbox).toBeDisabled()
            })
            screen.getAllByRole('checkbox').forEach((checkbox) => {
                expect(checkbox).toBeDisabled()
            })
            screen.getAllByRole('button').forEach((button) => {
                expect(button).toHaveAttribute('aria-disabled', 'true')
            })
        })
    })

    describe('_onAmountChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >
            const refund = fromJS(shopifySuggestedRefundFixture()) as Map<
                any,
                any
            >

            const {getByLabelText} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={refund}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            fireEvent.change(getByLabelText(/Refund with: Manual/i), {
                target: {value: 0.2},
            })

            const transaction: Map<any, any> = refund.getIn(['transactions', 0])
            const newTransaction = transaction.set('amount', '0.20')
            expect(setPayload).toHaveBeenCalledWith(
                payload.setIn(['transactions', 0], newTransaction)
            )
        })

        it('should call setPayload() with maximum amount', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >
            const refund = fromJS(shopifySuggestedRefundFixture()) as Map<
                any,
                any
            >

            const {getByLabelText} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={refund}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            fireEvent.change(getByLabelText(/Refund with: Manual/i), {
                target: {value: 99.99},
            })
            const transaction: Map<any, any> = refund.getIn(['transactions', 0])
            const newTransaction = transaction.set('amount', '1.20')
            expect(setPayload).toHaveBeenCalledWith(
                payload.setIn(['transactions', 0], newTransaction)
            )
        })
    })

    describe('_onDiscrepancyReasonChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const {getByLabelText} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            // Use custom amount to display discrepancy field
            fireEvent.change(getByLabelText(/Refund with: Manual/i), {
                target: {value: 0.2},
            })
            fireEvent.change(
                getByLabelText(/Reason for custom refund amount/i),
                {
                    target: {value: 'damage'},
                }
            )

            expect(setPayload).toHaveBeenCalledWith(
                payload.set('discrepancy_reason', 'damage')
            )
        })
    })

    describe('_onRestockItemsChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const {getByText} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            userEvent.click(getByText(/Restock items/i))

            expect(setPayload).toHaveBeenCalledWith(
                payload.set('restock', false)
            )
        })
    })

    describe('onNotifyChange()', () => {
        it('should call onNotifyChange() with checkbox event', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const {getByText} = render(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyActionType.CancelOrder}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                    hasMultipleGateways={false}
                />
            )

            userEvent.click(getByText(/Send notification to customer/i))

            expect(onNotifyChange).toHaveBeenCalledWith(false)
        })
    })
})
