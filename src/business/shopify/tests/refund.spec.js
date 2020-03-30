import {fromJS} from 'immutable'

import {shopifyLineItemFixture, shopifySuggestedRefundFixture} from '../../../fixtures/shopify'
import {
    getRefundAmount,
    getRestockType,
    getSubtotal,
    getTotalAvailableToRefund,
    getTotalCartDiscountAmount,
    getTotalQuantities,
    getTotalTax
} from '../refund'

describe('getSubtotal()', () => {
    it('should return subtotal', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const subtotal = getSubtotal(refund)

        expect(subtotal).toMatchSnapshot()
    })
})

describe('getTotalCartDiscountAmount()', () => {
    it('should return total discount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const total = getTotalCartDiscountAmount(refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getTotalTax()', () => {
    it('should return total tax', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const total = getTotalTax(refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getRefundAmount()', () => {
    it('should return refund amount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const amount = getRefundAmount(refund)

        expect(amount).toMatchSnapshot()
    })
})

describe('getTotalAvailableToRefund()', () => {
    it('should return maximum refund amount', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const amount = getTotalAvailableToRefund(refund)

        expect(amount).toMatchSnapshot()
    })
})

describe('getTotalQuantities()', () => {
    it('should return total quantities', () => {
        const refund = fromJS(shopifySuggestedRefundFixture())
        const total = getTotalQuantities(refund)

        expect(total).toMatchSnapshot()
    })
})

describe('getRestockType()', () => {
    it('should return `"no_restock"` because `restock` is `false`', () => {
        const lineItem = fromJS(shopifyLineItemFixture())
        const restock = false
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('no_restock')
    })

    it('should return `"return"` because the line item has been fulfilled', () => {
        const lineItem = fromJS(shopifyLineItemFixture()).set('fulfillment_status', 'fulfilled')
        const restock = true
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('return')
    })

    it('should return `"cancel"` because the line item has not been fulfilled', () => {
        const lineItem = fromJS(shopifyLineItemFixture()).set('fulfillment_status', null)
        const restock = true
        const restockType = getRestockType(lineItem, restock)

        expect(restockType).toBe('cancel')
    })
})
