// @flow

import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {
    shopifyAppliedDiscountFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture
} from '../../../../../../../../../../../../fixtures/shopify'
import {EVENTS, logEvent} from '../../../../../../../../../../../../store/middlewares/segmentTracker'
import {initRefundOrderLineItems} from '../../../../../../../../../../../../business/shopify/order'
import {DraftOrderLineItemRow} from '../DraftOrderLineItemRow'
import {ShopifyAction} from '../../../constants'

jest.mock('lodash/debounce', () => (fn) => fn)

jest.mock('../../../../../../../../../../../../store/middlewares/segmentTracker', () => {
    return {
        ...jest.requireActual('../../../../../../../../../../../../store/middlewares/segmentTracker'),
        logEvent: jest.fn(),
    }
})

describe('<DraftOrderLineItemRow/>', () => {
    let onChange, onDelete

    beforeEach(() => {
        onChange = jest.fn()
        onDelete = jest.fn()
    })

    describe('render()', () => {
        it('should render without product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <DraftOrderLineItemRow
                    id="line-item"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    lineItem={lineItem}
                    product={null}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <DraftOrderLineItemRow
                    id="line-item"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with applied discount', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const appliedDiscount = fromJS(shopifyAppliedDiscountFixture({value: '50.0', amount: '0.50'}))
            const lineItem = payload.getIn(['line_items', 0]).set('applied_discount', appliedDiscount)

            const component = shallow(
                <DraftOrderLineItemRow
                    id="line-item"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const order = fromJS(shopifyOrderFixture())
            const lineItems = initRefundOrderLineItems(order)
            const lineItem = lineItems.get(0).set('quantity', 0)

            const component = shallow(
                <DraftOrderLineItemRow
                    id="line-item"
                    actionName={ShopifyAction.DUPLICATE_ORDER}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    removable={false}
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it.each([
            [ShopifyAction.CREATE_ORDER, EVENTS.SHOPIFY_CREATE_ORDER_LINE_ITEM_QUANTITY_CHANGED],
            [ShopifyAction.DUPLICATE_ORDER, EVENTS.SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED],
        ])('should call onChange() with updated line item', (actionName, event) => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <DraftOrderLineItemRow
                    id="line-item"
                    actionName={actionName}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    shopName="storegorgias3"
                    currencyCode="USD"
                    removable
                    onChange={onChange}
                    onDelete={onDelete}
                />
            )

            component.find({type: 'number'}).simulate('change', {target: {value: '5'}})

            expect(onChange).toHaveBeenCalledWith(lineItem.set('quantity', 5))
            expect(logEvent).toHaveBeenCalledWith(event)
        })
    })
})
