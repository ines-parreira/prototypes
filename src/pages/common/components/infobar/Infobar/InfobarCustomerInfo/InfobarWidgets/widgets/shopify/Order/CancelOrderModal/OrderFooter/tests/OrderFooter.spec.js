// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyCancelOrderPayloadFixture,
    shopifySuggestedRefundFixture
} from '../../../../../../../../../../../../../fixtures/shopify'
import {CancelOrderFooterComponent} from '../OrderFooter'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<CancelOrderFooterComponent/>', () => {
    const context = {integrationId: 1}
    let setPayload

    beforeEach(() => {
        setPayload = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onAmountChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({id: 'amount'}).simulate('change', '0.20')

            expect(setPayload).toHaveBeenCalledWith(payload.set('amount', '0.20'))
        })

        it('should call setPayload() with maximum amount', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({id: 'amount'}).simulate('change', '99.99')

            expect(setPayload).toHaveBeenCalledWith(payload.set('amount', 1.2))
        })
    })

    describe('_onReasonChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({id: 'reason'}).simulate('change', {target: {value: 'inventory'}})

            expect(setPayload).toHaveBeenCalledWith(payload.set('reason', 'inventory'))
        })

        it('should call setPayload() with updated email value', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({id: 'reason'}).simulate('change', {target: {value: 'fraud'}})

            expect(setPayload).toHaveBeenCalledWith(
                payload
                    .set('reason', 'fraud')
                    .set('email', false)
            )
        })
    })

    describe('_onDiscrepancyReasonChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            // Use custom amount to display discrepancy field
            component.find({id: 'amount'}).simulate('change', '0.20')

            component.find({id: 'discrepancy-reason'}).simulate('change', {target: {value: 'damage'}})

            expect(setPayload).toHaveBeenCalledWith(payload.setIn(['refund', 'discrepancy_reason'], 'damage'))
        })
    })

    describe('_onRestockItemsChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({type: 'checkbox'}).at(0).simulate('change', {target: {checked: false}})

            expect(setPayload).toHaveBeenCalledWith(
                payload
                    .setIn(['refund', 'restock'], false)
                    .updateIn(['refund', 'refund_line_items'], (refundLineItems) =>
                        refundLineItems.map((refundLineItem) => refundLineItem.set('restock_type', 'no_restock'))
                    )
            )
        })
    })

    describe('_onEmailChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyCancelOrderPayloadFixture())

            const component = shallow(
                <CancelOrderFooterComponent
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                />,
                {context}
            )

            component.find({type: 'checkbox'}).at(1).simulate('change', {target: {checked: false}})

            expect(setPayload).toHaveBeenCalledWith(payload.set('email', false))
        })
    })
})
