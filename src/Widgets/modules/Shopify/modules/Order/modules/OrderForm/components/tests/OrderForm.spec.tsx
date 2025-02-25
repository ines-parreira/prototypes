import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyMultiCurrencyOrderFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from 'fixtures/shopify'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import OrderForm from '../OrderForm'

describe('<OrderForm/>', () => {
    const order = fromJS(shopifyOrderFixture())
    const refund = fromJS(shopifySuggestedRefundFixture())
    const payload = fromJS(shopifyRefundOrderPayloadFixture())
    const lineItems = fromJS([shopifyLineItemFixture({ currencyCode: 'USD' })])

    let setPayload: jest.MockedFunction<any>
    let onPayloadChange: jest.MockedFunction<any>
    let onLineItemChange: jest.MockedFunction<any>
    let onReasonChange: jest.MockedFunction<any>

    beforeEach(() => {
        setPayload = jest.fn()
        onPayloadChange = jest.fn()
        onLineItemChange = jest.fn()
        onReasonChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <OrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyActionType.CancelOrder}
                    loading={false}
                    reason=""
                    order={order}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemChange={onLineItemChange}
                    onReasonChange={onReasonChange}
                    notify={false}
                    onNotifyChange={jest.fn()}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with zero quantity', () => {
            const { container } = render(
                <OrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyActionType.CancelOrder}
                    loading={false}
                    reason=""
                    order={order}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemChange={onLineItemChange}
                    onReasonChange={onReasonChange}
                    notify={false}
                    onNotifyChange={jest.fn()}
                    keepLineItemQuantityAsDefault={false}
                />,
            )

            expect(container).toMatchSnapshot()
        })

        it('should render for multi-currency order', () => {
            const multiCurrencyOrder = fromJS(
                shopifyMultiCurrencyOrderFixture(),
            )

            const { container } = render(
                <OrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyActionType.CancelOrder}
                    loading={false}
                    reason=""
                    order={multiCurrencyOrder}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemChange={onLineItemChange}
                    onReasonChange={onReasonChange}
                    notify={false}
                    onNotifyChange={jest.fn()}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
