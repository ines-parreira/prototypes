// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import {ShopifyAction} from '../../../../constants'
import OrderFooter from '../OrderFooter'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<OrderFooter/>', () => {
    let onPayloadChange
    let onReasonChange
    let setPayload

    beforeEach(() => {
        onPayloadChange = jest.fn()
        onReasonChange = jest.fn()
        setPayload = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render for refund order action', () => {
            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.REFUND_ORDER}
                    reason={null}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onAmountChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            component.find({id: 'amount'}).simulate('change', '0.20')

            expect(setPayload).toHaveBeenCalledWith(
                payload.setIn(['transactions', 0, 'amount'], '0.20')
            )
        })

        it('should call setPayload() with maximum amount', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            component.find({id: 'amount'}).simulate('change', '99.99')

            expect(setPayload).toHaveBeenCalledWith(
                payload.setIn(['transactions', 0, 'amount'], 1.2)
            )
        })
    })

    describe('_onDiscrepancyReasonChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            // Use custom amount to display discrepancy field
            component.find({id: 'amount'}).simulate('change', '0.20')

            component
                .find({id: 'discrepancy-reason'})
                .simulate('change', {target: {value: 'damage'}})

            expect(setPayload).toHaveBeenCalledWith(
                payload.set('discrepancy_reason', 'damage')
            )
        })
    })

    describe('_onRestockItemsChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            component
                .find({type: 'checkbox'})
                .at(0)
                .simulate('change', {target: {checked: false}})

            expect(setPayload).toHaveBeenCalledWith(
                payload.set('restock', false)
            )
        })
    })

    describe('_onEmailChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            component
                .find({type: 'checkbox'})
                .at(1)
                .simulate('change', {target: {checked: false}})

            expect(setPayload).toHaveBeenCalledWith(payload.set('email', false))
        })
    })
})
