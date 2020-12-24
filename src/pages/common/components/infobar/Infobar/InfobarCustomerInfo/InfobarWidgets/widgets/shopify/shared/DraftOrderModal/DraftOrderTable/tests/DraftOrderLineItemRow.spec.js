// @flow

import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {
    shopifyAppliedDiscountFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../../../../../../../../../fixtures/shopify.ts'
import {
    EVENTS,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import {DraftOrderLineItemRow} from '../DraftOrderLineItemRow'
import {ShopifyAction} from '../../../../constants'
import {InventoryManagement} from '../../../../../../../../../../../../../constants/integrations/types/shopify.ts'

jest.mock('lodash/debounce', () => (fn) => fn)

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker',
    () => {
        return {
            ...jest.requireActual(
                '../../../../../../../../../../../../../store/middlewares/segmentTracker'
            ),
            logEvent: jest.fn(),
        }
    }
)

describe('<DraftOrderLineItemRow/>', () => {
    let onChange, onDelete, props

    beforeEach(() => {
        onChange = jest.fn()
        onDelete = jest.fn()

        props = {
            id: 'line-item',
            actionName: ShopifyAction.DUPLICATE_ORDER,
            shopName: 'storegorgias3',
            currencyCode: 'USD',
            removable: true,
            onChange,
            onDelete,
        }
    })

    describe('render()', () => {
        it('should render without product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={null}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0])

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with applied discount', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({value: '50.0', amount: '0.50'})
            )
            const lineItem = payload
                .getIn(['line_items', 0])
                .set('applied_discount', appliedDiscount)

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('quantity', 0)

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    removable={false}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with product stock quantity', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('quantity', 0)
            const variantId = payload.getIn(['line_items', 0, 'variant_id'])
            const variant = fromJS(
                shopifyVariantFixture({
                    id: variantId,
                    inventoryManagement: InventoryManagement.Shopify,
                    inventoryQuantity: 99,
                })
            )
            const product = fromJS(shopifyProductFixture({variants: [variant]}))

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                    removable={false}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without product stock quantity because the inventory is not tracked', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const lineItem = payload.getIn(['line_items', 0]).set('quantity', 0)
            const variantId = payload.getIn(['line_items', 0, 'variant_id'])
            const variant = fromJS(
                shopifyVariantFixture({
                    id: variantId,
                    inventoryManagement: null, // inventory is not tracked
                    inventoryQuantity: 0,
                })
            )
            const product = fromJS(shopifyProductFixture({variants: [variant]}))

            const component = shallow(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                    removable={false}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onQuantityChange()', () => {
        it.each([
            [
                ShopifyAction.CREATE_ORDER,
                EVENTS.SHOPIFY_CREATE_ORDER_LINE_ITEM_QUANTITY_CHANGED,
            ],
            [
                ShopifyAction.DUPLICATE_ORDER,
                EVENTS.SHOPIFY_DUPLICATE_ORDER_LINE_ITEM_QUANTITY_CHANGED,
            ],
        ])(
            'should call onChange() with updated line item',
            (actionName, event) => {
                const payload = fromJS(shopifyDraftOrderPayloadFixture())
                const lineItem = payload.getIn(['line_items', 0])

                const component = shallow(
                    <DraftOrderLineItemRow
                        {...props}
                        actionName={actionName}
                        lineItem={lineItem}
                        product={fromJS(shopifyProductFixture())}
                    />
                )

                component
                    .find({type: 'number'})
                    .simulate('change', {target: {value: '5'}})

                expect(onChange).toHaveBeenCalledWith(
                    lineItem.set('quantity', 5)
                )
                expect(logEvent).toHaveBeenCalledWith(event)
            }
        )
    })
})
