import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyMultiCurrencyOrderFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import RefundOrderForm from '../RefundOrderForm'
import {ShopifyAction} from '../../../constants.js'

describe('<RefundOrderForm/>', () => {
    const order = fromJS(shopifyOrderFixture())
    const refund = fromJS(shopifySuggestedRefundFixture())
    const payload = fromJS(shopifyRefundOrderPayloadFixture())
    const lineItems = fromJS([shopifyLineItemFixture()])

    let setPayload: jest.MockedFunction<any>
    let onPayloadChange: jest.MockedFunction<any>
    let onLineItemsChange: jest.MockedFunction<any>
    let onReasonChange: jest.MockedFunction<any>

    beforeEach(() => {
        setPayload = jest.fn()
        onPayloadChange = jest.fn()
        onLineItemsChange = jest.fn()
        onReasonChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <RefundOrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    loading={false}
                    reason=""
                    order={order}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemsChange={onLineItemsChange}
                    onReasonChange={onReasonChange}
                    notify={false}
                    onNotifyChange={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render for multi-currency order', () => {
            const multiCurrencyOrder = fromJS(
                shopifyMultiCurrencyOrderFixture()
            )

            const component = shallow(
                <RefundOrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    loading={false}
                    reason=""
                    order={multiCurrencyOrder}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemsChange={onLineItemsChange}
                    onReasonChange={onReasonChange}
                    notify={false}
                    onNotifyChange={jest.fn()}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
