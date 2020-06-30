// @flow

import {fromJS} from 'immutable'

import {
    shopifyAppliedDiscountFixture,
    shopifyDiscountAllocationFixture,
    shopifyDiscountApplicationFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyPriceSetFixture,
} from '../../../fixtures/shopify'
import {
    getDraftOrderLineItemDiscountedPrice,
    getDraftOrderLineItemTotal,
    getDraftOrderTotalLineItemsPrice,
    getOrderLineItemDiscountedPrice,
    initLineItemAppliedDiscount,
} from '../lineItem'
import {formatPrice} from '../number'

describe('initLineItemAppliedDiscount()', () => {
    it('should return the applied discount with percentage amount', () => {
        const discountAllocation = fromJS(shopifyDiscountAllocationFixture())
        const discountApplication = fromJS(shopifyDiscountApplicationFixture())
        const order = fromJS(shopifyOrderFixture())
            .setIn(['line_items', 0, 'total_discount'], '0.50')
            .setIn(
                ['line_items', 0, 'discount_allocations', 0],
                discountAllocation
            )
            .setIn(['discount_applications', 0], discountApplication)
        const lineItem = order.getIn(['line_items', 0])

        const appliedDiscount = initLineItemAppliedDiscount(lineItem, order)
        expect(appliedDiscount).toMatchSnapshot()
    })

    it('should return the applied discount with fixed amount', () => {
        const discountAllocation = fromJS(
            shopifyDiscountAllocationFixture({amount: '0.20'})
        )
        const discountApplication = fromJS(
            shopifyDiscountApplicationFixture({
                value: '0.20',
                type: 'fixed_amount',
            })
        )
        const order = fromJS(shopifyOrderFixture())
            .setIn(['line_items', 0, 'quantity'], 2)
            .setIn(['line_items', 0, 'total_discount'], '0.20')
            .setIn(
                ['line_items', 0, 'discount_allocations', 0],
                discountAllocation
            )
            .setIn(['discount_applications', 0], discountApplication)
        const lineItem = order.getIn(['line_items', 0])

        const appliedDiscount = initLineItemAppliedDiscount(lineItem, order)
        expect(appliedDiscount).toMatchSnapshot()
    })

    it('should return null because there is no discount allocation', () => {
        const order = fromJS(shopifyOrderFixture())
        const lineItem = order.getIn(['line_items', 0])

        const appliedDiscount = initLineItemAppliedDiscount(lineItem, order)
        expect(appliedDiscount).toBe(null)
    })
})

describe('getDraftOrderLineItemDiscountedPrice()', () => {
    it("should return the line item's price when there is no applied discount", () => {
        const lineItem = fromJS(shopifyLineItemFixture())
        const currencyCode = 'USD'
        const price = getDraftOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode
        )
        expect(price).toMatchSnapshot()
    })

    it("should return the line item's discounted price when there is an applied discount", () => {
        const appliedDiscount = fromJS(
            shopifyAppliedDiscountFixture({value: '50.0', amount: '0.50'})
        )
        const lineItem = fromJS(shopifyLineItemFixture()).set(
            'applied_discount',
            appliedDiscount
        )
        const currencyCode = 'USD'
        const price = getDraftOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode
        )
        expect(price).toMatchSnapshot()
    })
})

describe('getDraftOrderLineItemTotal()', () => {
    it("should return the line item's total price", () => {
        const lineItem = fromJS(shopifyLineItemFixture({quantity: 2}))
        const total = getDraftOrderLineItemTotal(lineItem)
        const currencyCode = 'USD'
        expect(formatPrice(total, currencyCode)).toMatchSnapshot()
    })

    it.each([
        [1, '9.99', '10.00'],
        [2, '19.99', '19.99'],
        [3, '29.98', '29.99'],
        [4, '39.98', '39.98'],
        [5, '49.97', '49.98'],
        [6, '59.97', '59.97'],
        [7, '69.96', '69.97'],
        [8, '79.96', '79.96'],
        [9, '89.95', '89.96'],
        [10, '99.95', '99.95'],
        [11, '109.94', '109.95'],
        [12, '119.94', '119.94'],
        [13, '129.93', '129.94'],
        [14, '139.93', '139.93'],
        [15, '149.92', '149.93'],
    ])(
        "should return expected line item's total price with applied discount",
        (quantity, discountAmount, expectedTotal) => {
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({
                    value: '50.00',
                    amount: discountAmount,
                })
            )
            const lineItem = fromJS(
                shopifyLineItemFixture({
                    price: '19.99',
                    quantity,
                    appliedDiscount,
                })
            )
            const total = getDraftOrderLineItemTotal(lineItem)
            const currencyCode = 'USD'
            expect(formatPrice(total, currencyCode)).toEqual(expectedTotal)
        }
    )

    it.each([
        [1, '4747', '90205'],
        [2, '9495', '180409'],
        [3, '14242', '270614'],
        [4, '18990', '360818'],
        [5, '23738', '451022'],
        [6, '28485', '541227'],
        [7, '33233', '631431'],
        [8, '37980', '721636'],
        [9, '42728', '811840'],
        [10, '47476', '902044'],
        [11, '52223', '992249'],
        [12, '56971', '1082453'],
        [13, '61718', '1172658'],
        [14, '66466', '1262862'],
        [15, '71214', '1353066'],
    ])(
        "should return expected line item's total price with applied discount and non-fractional currency",
        (quantity, discountAmount, expectedTotal) => {
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({
                    value: '5.00',
                    amount: discountAmount,
                })
            )
            const lineItem = fromJS(
                shopifyLineItemFixture({
                    price: '94952',
                    quantity,
                    appliedDiscount,
                })
            )
            const total = getDraftOrderLineItemTotal(lineItem)
            const currencyCode = 'JPY'
            expect(formatPrice(total, currencyCode)).toEqual(expectedTotal)
        }
    )
})

describe('getDraftOrderTotalLineItemsPrice()', () => {
    it("should return all the line items' total price", () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const total = getDraftOrderTotalLineItemsPrice(payload)
        expect(total).toMatchSnapshot()
    })

    it('should return the correct value without rounding errors', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set(
            'line_items',
            fromJS([
                shopifyLineItemFixture({price: '27.99'}),
                shopifyLineItemFixture({price: '5.00'}),
            ])
        )

        const currencyCode = 'USD'
        const total = formatPrice(
            getDraftOrderTotalLineItemsPrice(payload),
            currencyCode
        )
        expect(total).toMatchSnapshot()
    })
})

describe('getOrderLineItemDiscountedPrice()', () => {
    it("should return the line item's price when there is no quantity", () => {
        const quantity = 0
        const currencyCode = 'USD'
        const lineItem = fromJS(
            shopifyLineItemFixture({quantity, currencyCode: 'USD'})
        )
        const price = getOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode,
            quantity
        )

        expect(price).toMatchSnapshot()
    })

    it("should return the line item's price when there is no discount", () => {
        const quantity = 1
        const currencyCode = 'USD'
        const totalDiscountSet = fromJS(
            shopifyPriceSetFixture({amount: '0.00'})
        )
        const lineItem = fromJS(
            shopifyLineItemFixture({quantity, currencyCode: 'USD'})
        ).set('total_discount_set', totalDiscountSet)
        const price = getOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode,
            quantity
        )

        expect(price).toMatchSnapshot()
    })

    it("should return the line item's price when there is a discount", () => {
        const quantity = 1
        const currencyCode = 'USD'
        const totalDiscountSet = fromJS(
            shopifyPriceSetFixture({amount: '0.50'})
        )
        const lineItem = fromJS(
            shopifyLineItemFixture({quantity, currencyCode: 'USD'})
        ).set('total_discount_set', totalDiscountSet)
        const price = getOrderLineItemDiscountedPrice(
            lineItem,
            currencyCode,
            quantity
        )

        expect(price).toMatchSnapshot()
    })
})
