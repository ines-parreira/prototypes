// @flow

import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyProductFixture
} from '../../../../../../../../../../../../../fixtures/shopify'
import DraftOrderTable from '../DraftOrderTable'

describe('<DraftOrderTable/>', () => {
    let onChange

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
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <DraftOrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    products={products}
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without products', () => {
            const component = shallow(
                <DraftOrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    products={new Map()}
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onLineItemChange()', () => {
        it('should call onChange() with updated payload', () => {
            const component = shallow(
                <DraftOrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    products={products}
                    onChange={onChange}
                />
            )

            const updatedLineItem = payload.getIn(['line_items', 0]).set('quantity', 5)
            component.instance()._onLineItemChange(0, updatedLineItem)

            const newLineItems = payload.get('line_items').set(0, updatedLineItem)
            expect(onChange).toHaveBeenCalledWith(newLineItems)
        })
    })

    describe('_onLineItemDelete()', () => {
        it('should call onChange() with updated payload', () => {
            const component = shallow(
                <DraftOrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    products={products}
                    onChange={onChange}
                />
            )

            component.instance()._onLineItemDelete(0)

            const newLineItems = payload.get('line_items').remove(0)
            expect(onChange).toHaveBeenCalledWith(newLineItems)
        })
    })
})
