import {fromJS, Map} from 'immutable'

import {
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyShippingLineFixture,
    shopifyTaxLineFixture,
    shopifyVariantFixture,
} from '../../../fixtures/shopify'
import {
    addCustomLineItem,
    addVariant,
    getSubtotal,
    getTaxLineLabel,
    getTaxLinesTotals,
    getTotalShippingPrice,
    getTotalTaxes,
    initDraftOrderPayload,
} from '../draftOrder'

describe('initDraftOrderPayload()', () => {
    it('should return draft order payload for the given order', () => {
        const product = fromJS(
            shopifyProductFixture({
                id: 8345093387,
                title: 'Acidulous candy',
                variants: [
                    shopifyVariantFixture({
                        id: 31128766316567,
                        sku: '0987654321-1',
                        title: 'Red / A',
                        price: '1.00',
                    }),
                    shopifyVariantFixture({
                        id: 31128766349335,
                        sku: '0987654321-2',
                        title: 'Red / B',
                        price: '1.00',
                    }),
                ],
            })
        ) as Map<any, any>

        const products = new window.Map([[product.get('id'), product]])
        const order = fromJS(shopifyOrderFixture())
        const customer = fromJS(shopifyCustomerFixture())
        const payload = initDraftOrderPayload(customer, order, products)
        expect(payload).toMatchSnapshot()
    })

    it('should return draft order payload for the given order when products are missing', () => {
        const order = fromJS(shopifyOrderFixture())
        const customer = fromJS(shopifyCustomerFixture())
        const products = new window.Map()
        const payload = initDraftOrderPayload(customer, order, products)
        expect(payload).toMatchSnapshot()
    })

    it('should return draft order payload for order creation from scratch', () => {
        const customer = fromJS(shopifyCustomerFixture())
        const payload = initDraftOrderPayload(customer)
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

    it('should update quantity of the given variant in the given payload, because variant is already in the payload', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const product = shopifyProductFixture()
        const variant = product.variants[0]

        // Add the product a first time
        const payloadWithVariant = addVariant(payload, product, variant)

        // Add it a second time
        const newPayload = addVariant(payloadWithVariant, product, variant)

        expect(newPayload).toMatchSnapshot()
    })
})

describe('addCustomLineItem()', () => {
    it('should add the given line item to the given payload', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const customLineItem = fromJS(shopifyCustomLineItemFixture())
        const newPayload = addCustomLineItem(payload, customLineItem)
        expect(newPayload).toMatchSnapshot()
    })
})

describe('getSubtotal()', () => {
    it('should return the sub total when there is an applied discount', () => {
        const payload = fromJS(shopifyDraftOrderPayloadFixture())
        const subtotal = getSubtotal(payload)
        expect(subtotal).toMatchSnapshot()
    })

    it('should return the sub total when there is no applied discount', () => {
        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >).set('applied_discount', null)
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
        const shippingLine = fromJS(shopifyShippingLineFixture()) as Map<
            any,
            any
        >
        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >).set('shipping_line', shippingLine)
        const total = getTotalShippingPrice(payload)
        expect(total).toMatchSnapshot()
    })
})

describe('getTaxLineLabel()', () => {
    it('should return the label of the given tax line', () => {
        const taxLine = fromJS(shopifyTaxLineFixture())
        const label = getTaxLineLabel(taxLine, false)
        expect(label).toMatchSnapshot()
    })

    it('should return the label of the given tax line when taxes are included', () => {
        const taxLine = fromJS(shopifyTaxLineFixture())
        const label = getTaxLineLabel(taxLine, true)
        expect(label).toMatchSnapshot()
    })

    it('should return the correct label without rounding errors', () => {
        const taxLine = fromJS(shopifyTaxLineFixture({rate: 0.0725}))
        const label = getTaxLineLabel(taxLine, false)
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
        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >).set('tax_lines', [])
        const results = getTaxLinesTotals(payload)
        expect(results).toEqual([])
    })

    it('should return tax lines when several lines have the same label', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({price: '1.00'}),
            shopifyTaxLineFixture({price: '2.00'}),
        ])

        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >).set('tax_lines', taxLines)
        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([{label: 'TVA 20.00%', total: 3}])
    })

    it('should return tax lines when several lines have the same label and taxes are included', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({price: '1.00'}),
            shopifyTaxLineFixture({price: '2.00'}),
        ])

        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >)
            .set('tax_lines', taxLines)
            .set('taxes_included', true)

        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([{label: 'TVA 20.00% (included)', total: 3}])
    })

    it('should return tax lines when lines have different labels', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax X', price: '1.00'}),
            shopifyTaxLineFixture({rate: 0.2, title: 'Tax X', price: '2.00'}),
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax Y', price: '3.00'}),
            shopifyTaxLineFixture({rate: 0.3, title: 'Tax Z', price: '4.00'}),
        ])

        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >).set('tax_lines', taxLines)
        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([
            {label: 'Tax Z 30.00%', total: 4},
            {label: 'Tax X 20.00%', total: 2},
            {label: 'Tax X 10.00%', total: 1},
            {label: 'Tax Y 10.00%', total: 3},
        ])
    })

    it('should return tax lines when lines have different labels and taxes are included', () => {
        const taxLines = fromJS([
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax X', price: '1.00'}),
            shopifyTaxLineFixture({rate: 0.2, title: 'Tax X', price: '2.00'}),
            shopifyTaxLineFixture({rate: 0.1, title: 'Tax Y', price: '3.00'}),
            shopifyTaxLineFixture({rate: 0.3, title: 'Tax Z', price: '4.00'}),
        ])

        const payload = (fromJS(shopifyDraftOrderPayloadFixture()) as Map<
            any,
            any
        >)
            .set('tax_lines', taxLines)
            .set('taxes_included', true)

        const results = getTaxLinesTotals(payload)

        expect(results).toEqual([
            {label: 'Tax Z 30.00% (included)', total: 4},
            {label: 'Tax X 20.00% (included)', total: 2},
            {label: 'Tax X 10.00% (included)', total: 1},
            {label: 'Tax Y 10.00% (included)', total: 3},
        ])
    })
})
