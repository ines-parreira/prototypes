// @flow

import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
    shopifySuggestedRefundFixture
} from '../../../../../../../../../../../../../fixtures/shopify'
import {initRefundOrderLineItems} from '../../../../../../../../../../../../../business/shopify/order'
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
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
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
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const order = fromJS(shopifyOrderFixture())
            const lineItems = initRefundOrderLineItems(order)
            const lineItem = lineItems.get(0).set('quantity', 0)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with "not restockable" message', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.setState({restockable: false})

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it('should call onChange() with updated line item', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.find({type: 'text'}).simulate('change', {target: {value: '0'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })

        it('should use minimum value if the input is empty', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.find({type: 'text'}).simulate('change', {target: {value: ''}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })

        it('should use maximum value if the value is too big', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.find({type: 'text'}).simulate('change', {target: {value: '2'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 1))
        })
    })

    describe('_onQuantityUp()', () => {
        it('should call onChange() with incremented quantity', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('quantity', 0)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.instance()._onQuantityUp()

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 1))
        })

        it('should call onChange() with decremented quantity', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('quantity', 1)
            const refund = fromJS(shopifySuggestedRefundFixture())

            const component = shallow(
                <OrderLineItemRow
                    lineItem={lineItem}
                    refund={refund}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    onChange={onChange}
                />
            )

            component.instance()._onQuantityDown()

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 0))
        })
    })
})
