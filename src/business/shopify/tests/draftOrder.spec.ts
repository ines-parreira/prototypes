import {fromJS, Map} from 'immutable'

import {
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../fixtures/shopify'
import {
    addCustomLineItem,
    addVariant,
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
