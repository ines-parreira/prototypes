import React from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import {ShopifyAction} from '../../../../constants.js'
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
            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
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
                    notify={true}
                    loading={false}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onAmountChange()', () => {
        it('should call setPayload() with updated payload', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            component.find({id: 'amount'}).simulate('change', '0.20')

            expect(setPayload).toHaveBeenCalledWith(
                payload.setIn(['transactions', 0, 'amount'], '0.20')
            )
        })

        it('should call setPayload() with maximum amount', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
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
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
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
            const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
                any,
                any
            >

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
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

    describe('onNotifyChange()', () => {
        it('should call onNotifyChange() with checkbox event', () => {
            const payload = fromJS(shopifyRefundOrderPayloadFixture())

            const component = shallow(
                <OrderFooter
                    editable
                    hasShippingLine
                    currencyCode="USD"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    reason={null}
                    notify={true}
                    loading={false}
                    payload={payload}
                    refund={fromJS(shopifySuggestedRefundFixture())}
                    setPayload={setPayload}
                    onReasonChange={onReasonChange}
                    onNotifyChange={onNotifyChange}
                    onPayloadChange={onPayloadChange}
                />
            )

            const event = {target: {checked: false}}

            component.find({type: 'checkbox'}).at(1).simulate('change', event)

            expect(onNotifyChange).toHaveBeenCalledWith(event)
        })
    })
})
