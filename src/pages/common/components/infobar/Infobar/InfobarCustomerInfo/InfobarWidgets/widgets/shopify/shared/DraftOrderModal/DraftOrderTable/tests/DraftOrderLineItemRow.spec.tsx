import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import {
    shopifyAppliedDiscountFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../../../../../../../store/middlewares/segmentTracker'
import DraftOrderLineItemRow from '../DraftOrderLineItemRow'
import {ShopifyActionType} from '../../../../types'
import {InventoryManagement} from '../../../../../../../../../../../../../constants/integrations/types/shopify'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

jest.mock(
    '../../../../../../../../../../../../../store/middlewares/segmentTracker'
)
const logEventMock = logEvent as jest.Mock

describe('<DraftOrderLineItemRow/>', () => {
    let onChange: jest.MockedFunction<any>,
        onDelete: jest.MockedFunction<any>,
        props: ComponentProps<typeof DraftOrderLineItemRow>

    beforeEach(() => {
        jest.useFakeTimers()
        onChange = jest.fn()
        onDelete = jest.fn()

        props = {
            id: 'line-item',
            actionName: ShopifyActionType.DuplicateOrder,
            shopName: 'storegorgias3',
            currencyCode: 'USD',
            removable: true,
            onChange,
            onDelete,
            index: 0,
        } as unknown as ComponentProps<typeof DraftOrderLineItemRow>
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    describe('render()', () => {
        it('should render without product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = payload.getIn(['line_items', 0])

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={null}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with product image', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = payload.getIn(['line_items', 0])

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with applied discount', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({value: '50.0', amount: '0.50'})
            )
            const lineItem = (
                payload.getIn(['line_items', 0]) as Map<any, any>
            ).set('applied_discount', appliedDiscount)

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render without quantity and without price', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = (
                payload.getIn(['line_items', 0]) as Map<any, any>
            ).set('quantity', 0)

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                    removable={false}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with product stock quantity', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = (
                payload.getIn(['line_items', 0]) as Map<any, any>
            ).set('quantity', 0)
            const variantId = payload.getIn(['line_items', 0, 'variant_id'])
            const variant = fromJS(
                shopifyVariantFixture({
                    id: variantId,
                    inventoryManagement: InventoryManagement.Shopify as any,
                    inventoryQuantity: 99,
                })
            )
            const product = fromJS(shopifyProductFixture({variants: [variant]}))

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                    removable={false}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render without product stock quantity because the inventory is not tracked', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = (
                payload.getIn(['line_items', 0]) as Map<any, any>
            ).set('quantity', 0)
            const variantId = payload.getIn(['line_items', 0, 'variant_id'])
            const variant = fromJS(
                shopifyVariantFixture({
                    id: variantId,
                    inventoryManagement: null, // inventory is not tracked
                    inventoryQuantity: 0,
                })
            )
            const product = fromJS(shopifyProductFixture({variants: [variant]}))

            const {container} = render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={product}
                    removable={false}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('on quantity changed', () => {
        it.each([
            [
                ShopifyActionType.CreateOrder,
                SegmentEvent.ShopifyCreateOrderLineItemQuantityChanged,
            ],
            [
                ShopifyActionType.DuplicateOrder,
                SegmentEvent.ShopifyDuplicateOrderLineItemQuantityChanged,
            ],
        ])(
            'should call onChange() with updated line item',
            (actionName, event) => {
                const payload = fromJS(
                    shopifyDraftOrderPayloadFixture()
                ) as Map<any, any>
                const lineItem = payload.getIn(['line_items', 0]) as Map<
                    any,
                    any
                >
                render(
                    <DraftOrderLineItemRow
                        {...props}
                        actionName={actionName}
                        lineItem={lineItem}
                        product={fromJS(shopifyProductFixture())}
                    />
                )

                fireEvent.change(screen.getByRole('spinbutton'), {
                    target: {value: 5},
                })

                jest.advanceTimersByTime(1000)
                expect(onChange).toHaveBeenCalledWith(
                    lineItem.set('quantity', 5),
                    0
                )
                expect(logEventMock).toHaveBeenCalledWith(event)
            }
        )
    })
    describe('on delete line', () => {
        it('should call onDelete() with correct index', () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<
                any,
                any
            >
            const lineItem = payload.getIn(['line_items', 0]) as Map<any, any>

            render(
                <DraftOrderLineItemRow
                    {...props}
                    lineItem={lineItem}
                    product={fromJS(shopifyProductFixture())}
                />
            )
            fireEvent.click(screen.getByText('close'))

            expect(onDelete).toHaveBeenCalledWith(0)
        })
    })
})
