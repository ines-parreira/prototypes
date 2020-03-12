// @flow

import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture
} from '../../../../../../../../../../../../../fixtures/shopify'
import {initCancelOrderLineItems} from '../../../../../../../../../../../../../business/shopify/order'
import {OrderLineItemRow} from '../OrderLineItemRow'

jest.mock('lodash/debounce', () => (fn) => fn)

describe('<LineItemRow/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with discounted price', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('total_discount', '0.50')

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const order = fromJS(shopifyOrderFixture())
            const lineItems = initCancelOrderLineItems(order)
            const lineItem = lineItems.get(0).set('quantity', 0)

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it('should call onChange() with updated line item', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.find({type: 'number'}).simulate('change', {target: {value: '5'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 5))
        })
    })
})
