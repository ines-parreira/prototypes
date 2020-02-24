// @flow

import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {shopifyDraftOrderPayloadFixture, shopifyProductFixture} from '../../../../../../../../../../../../fixtures/shopify'
import {OrderTableComponent} from '../OrderTable'

describe('<OrderTableComponent/>', () => {
    const context = {integrationId: 1}
    let onPayloadChange

    const payload = fromJS(shopifyDraftOrderPayloadFixture())
        .setIn(['line_items', 0, 'product_id'], 1)
        .setIn(['line_items', 1, 'product_id'], 2)

    const product1 = shopifyProductFixture({id: 1, title: 'Product 1'})
    const product2 = shopifyProductFixture({id: 2, title: 'Product 2'})

    const products = new Map([
        [1, product1],
        [2, product2],
    ])

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <OrderTableComponent
                    editable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    payload={payload}
                    products={products}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without products', () => {
            const component = shallow(
                <OrderTableComponent
                    editable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    payload={payload}
                    products={new Map()}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onLineItemChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const component = shallow(
                <OrderTableComponent
                    editable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    payload={payload}
                    products={products}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            const updatedLineItem = payload.getIn(['line_items', 0]).set('quantity', 5)
            component.instance()._onLineItemChange(0, updatedLineItem)

            const newPayload = payload.setIn(['line_items', 0], updatedLineItem)
            expect(onPayloadChange).toHaveBeenCalledWith(context.integrationId, newPayload)
        })
    })

    describe('_onLineItemDelete()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            const component = shallow(
                <OrderTableComponent
                    editable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    payload={payload}
                    products={products}
                    onPayloadChange={onPayloadChange}
                />,
                {context}
            )

            component.instance()._onLineItemDelete(0)

            const newPayload = payload.removeIn(['line_items', 0])
            expect(onPayloadChange).toHaveBeenCalledWith(context.integrationId, newPayload)
        })
    })
})
