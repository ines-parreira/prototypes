// @flow

import {fromJS} from 'immutable'

import {
    shopifyAppliedDiscountFixture,
    shopifyCustomLineItemFixture,
    shopifyDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyShippingLineFixture,
    shopifyTaxLineFixture
} from '../../../fixtures/shopify'
import {
    addCustomLineItem,
    addVariant,
    applyDiscount,
    floorPrice,
    formatPrice,
    getDiscountAmount,
    getLineItemDiscountedPrice,
    getLineItemTotal,
    getSubtotal,
    getTaxLineLabel,
    getTaxLinesTotals,
    getTotal,
    getTotalDiscountAmount,
    getTotalLineItemsPrice,
    getTotalShippingPrice,
    getTotalTaxes,
    initDraftOrderPayload,
    refreshAppliedDiscounts
} from '../order'

describe('initDraftOrderPayload()', () => {
    it('should return draft order payload for the given order', () => {
        const order = fromJS(shopifyOrderFixture())
        const payload = initDraftOrderPayload(order)
        expect(payload).toMatchSnapshot()
    })
})

describe('addVariant()', () => {
    it('should add the given variant to the given payload, because variant is not in the payload yet', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const product = shopifyProductFixture()
        const variant = product.variants[0]
        const newPayload = addVariant(payload, product, variant)
        expect(newPayload).toMatchSnapshot()
    })

    it(
        'should update quantity of the given variant in the given payload, because variant is already in the payload',
        () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())
            const product = shopifyProductFixture()
            const variant = product.variants[0]

            // Add the product a first time
            const payloadWithVariant = addVariant(payload, product, variant)

            // Add it a second time
            const newPayload = addVariant(payloadWithVariant, product, variant)

            expect(newPayload).toMatchSnapshot()
        }
    )
})

describe('addCustomLineItem()', () => {
    it('should add the given line item to the given payload', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const customLineItem = fromJS(shopifyCustomLineItemFixture())
        const newPayload = addCustomLineItem(payload, customLineItem)
        expect(newPayload).toMatchSnapshot()
    })
})

describe('getLineItemDiscountedPrice()', () => {
    it('should return the line item\'s price when there is no applied discount', () => {
        const lineItem = fromJS(shopifyLineItemFixture())
        const price = getLineItemDiscountedPrice(lineItem)
        expect(price).toMatchSnapshot()
    })

    it('should return the line item\'s discounted price when there is an applied discount', () => {
        const appliedDiscount = fromJS(shopifyAppliedDiscountFixture({value: '50.0', amount: '0.50'}))
        const lineItem = fromJS(shopifyLineItemFixture()).set('applied_discount', appliedDiscount)
        const price = getLineItemDiscountedPrice(lineItem)
        expect(price).toMatchSnapshot()
    })
})

describe('getLineItemTotal()', () => {
    it('should return the line item\'s total price', () => {
        const lineItem = fromJS(shopifyLineItemFixture({quantity: 2}))
        const total = getLineItemTotal(lineItem)
        expect(total).toMatchSnapshot()
    })
})

describe('getTotalLineItemsPrice()', () => {
    it('should return all the line items\' total price', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const total = getTotalLineItemsPrice(payload)
        expect(total).toMatchSnapshot()
    })
})

describe('getDiscountAmount()', () => {
    it('should return the discount amount for fixed amount discount', () => {
        const amount = 50
        const discountType = 'fixed_amount'
        const discountAmount = '10.0'
        const result = getDiscountAmount(amount, discountType, discountAmount)
        expect(result).toMatchSnapshot()
    })

    it('should return the discount amount for percentage discount', () => {
        const amount = 50
        const discountType = 'percentage'
        const discountAmount = '10.0'
        const result = getDiscountAmount(amount, discountType, discountAmount)
        expect(result).toMatchSnapshot()
    })
})

describe('floorPrice()', () => {
    it('should floor the given price', () => {
        const price = 10.999
        const result = floorPrice(price)
        expect(result).toMatchSnapshot()
    })
})

describe('applyDiscount()', () => {
    it('should apply the given discount to the given amount for fixed amount discount', () => {
        const amount = '50.0'
        const discountType = 'fixed_amount'
        const discountAmount = '10.0'
        const result = applyDiscount(amount, discountType, discountAmount)
        expect(result).toMatchSnapshot()
    })

    it('should apply the given discount to the given amount for percentage discount', () => {
        const amount = '50.0'
        const discountType = 'percentage'
        const discountAmount = '10.0'
        const result = applyDiscount(amount, discountType, discountAmount)
        expect(result).toMatchSnapshot()
    })
})

describe('getTotalDiscountAmount()', () => {
    it('should return the total discount amount of given payload when there is an applied discount', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const total = getTotalDiscountAmount(payload)
        expect(total).toMatchSnapshot()
    })

    it('should return the total discount amount of given payload when there is no applied discount', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('applied_discount', null)
        const total = getTotalDiscountAmount(payload)
        expect(total).toMatchSnapshot()
    })
})

describe('refreshAppliedDiscounts()', () => {
    it('should refresh the applied discount amount of the given payload', () => {
        // Payload has a 100% discount applied
        const payload = fromJS(shopifyDraftOrderPayloadFixture())

        // Add a line item, applied discounts are wrong because we did not refresh them yet
        const customLineItem = fromJS(shopifyCustomLineItemFixture())
        const payloadWithCustomLineItem = addCustomLineItem(payload, customLineItem)
        expect(getTotalDiscountAmount(payloadWithCustomLineItem)).toBe(5)

        // Refresh applied discounts
        const newPayload = refreshAppliedDiscounts(payloadWithCustomLineItem)
        expect(getTotalDiscountAmount(newPayload)).toMatchSnapshot()
    })
})

describe('getSubtotal()', () => {
    it('should return the sub total when there is an applied discount', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const subtotal = getSubtotal(payload)
        expect(subtotal).toMatchSnapshot()
    })

    it('should return the sub total when there is no applied discount', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('applied_discount', null)
        const subtotal = getSubtotal(payload)
        expect(subtotal).toMatchSnapshot()
    })
})

describe('getTotalShippingPrice()', () => {
    it('should return the total shipping price when it is not set', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const total = getTotalShippingPrice(payload)
        expect(total).toMatchSnapshot()
    })

    it('should return the total shipping price when it is set', () => {
        const shippingLine = fromJS(shopifyShippingLineFixture())
        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('shipping_line', shippingLine)
        const total = getTotalShippingPrice(payload)
        expect(total).toMatchSnapshot()
    })
})

describe('getTaxLineLabel()', () => {
    it('should return the label of the given tax line', () => {
        const taxLine = fromJS(shopifyTaxLineFixture())
        const label = getTaxLineLabel(taxLine)
        expect(label).toMatchSnapshot()
    })
})

describe('getTotalTaxes()', () => {
    it('should return the total taxes', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture(),
            shopifyTaxLineFixture({price: '1.00'}),
            shopifyTaxLineFixture({price: '2.00'}),
        ])

        const total = getTotalTaxes(taxLines)
        expect(total).toMatchSnapshot()
    })
})

describe('getTaxLinesTotals()', () => {
    it('should return tax lines when array is empty', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('tax_lines', [])
        const results = getTaxLinesTotals(payload)
        expect(results).toEqual([])
    })

    it('should return tax lines when several lines have the same label', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({price: '1.00'}),
            shopifyTaxLineFixture({price: '2.00'}),
        ])

        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('tax_lines', taxLines)
        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([
            {label: 'TVA 20%', total: 3},
        ])
    })

    it('should return tax lines when lines have different labels', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax X', price: '1.00'}),
            shopifyTaxLineFixture({rate: 0.2, title: 'Tax X', price: '2.00'}),
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax Y', price: '3.00'}),
            shopifyTaxLineFixture({rate: 0.3, title: 'Tax Z', price: '4.00'}),
        ])

        const payload = fromJS(shopifyDraftOrderPayloadFixture()).set('tax_lines', taxLines)
        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([
            {label: 'Tax Z 30%', total: 4},
            {label: 'Tax X 20%', total: 2},
            {label: 'Tax X 10%', total: 1},
            {label: 'Tax Y 10%', total: 3},
        ])
    })
})

describe('getTotal()', () => {
    it('should return the total of the given draft order when there is an applied discount', () => {
        const draftOrder = fromJS(shopifyDraftOrderFixture())
        const total = getTotal(draftOrder)
        expect(total).toMatchSnapshot()
    })

    it('should return the total of the given draft order when there is no applied discount', () => {
        const draftOrder = fromJS(shopifyDraftOrderFixture()).set('applied_discount', null)
        const total = getTotal(draftOrder)
        expect(total).toMatchSnapshot()
    })

    it('should return the total of the given draft order when there is a shipping line', () => {
        const shippingLine = fromJS(shopifyShippingLineFixture())
        const draftOrder = fromJS(shopifyDraftOrderFixture())
            .set('applied_discount', null)
            .set('shipping_line', shippingLine)

        const total = getTotal(draftOrder)
        expect(total).toMatchSnapshot()
    })

    it('should return the total of the given draft order when there are taxes', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({price: '1.00'}),
            shopifyTaxLineFixture({price: '2.00'}),
        ])

        const draftOrder = fromJS(shopifyDraftOrderFixture())
            .set('applied_discount', null)
            .set('tax_lines', taxLines)

        const total = getTotal(draftOrder)
        expect(total).toMatchSnapshot()
    })
})

describe('formatPrice()', () => {
    it('should format given price when it is a string', () => {
        const price = '9.99'
        const result = formatPrice(price)
        expect(result).toBe('9.99')
    })

    it('should format given price when it is a number', () => {
        const price = 9.99
        const result = formatPrice(price)
        expect(result).toBe('9.99')
    })

    it('should format given price when it is a too precise number, using ceil', () => {
        const price = 9.999
        const result = formatPrice(price)
        expect(result).toBe('10.00')
    })

    it('should format given price when it is a too precise number, using floor', () => {
        const price = 9.111
        const result = formatPrice(price)
        expect(result).toBe('9.11')
    })
})
