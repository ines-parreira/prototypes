import {
    InventoryManagement as ShipifyInventoryManagement,
    InventoryPolicy as ShipifyInventoryPolicy,
} from 'constants/integrations/types/shopify'
import { shopifyProductFixture, shopifyVariantFixture } from 'fixtures/shopify'

import { isProductAvailable } from '../checkProductAvailability'

describe('isProductAvailable', () => {
    describe('InventoryPolicy is continue', () => {
        it('product is tracked and available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: 100,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Continue,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            expect(isProductAvailable(product)).toBeTruthy()
        })

        it('product is tracked and is not available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Continue,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            expect(isProductAvailable(product)).toBeTruthy()
        })
    })

    describe('InventoryPolicy is Deny', () => {
        it('product is tracked and available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: 100,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Deny,
            })
            const product = shopifyProductFixture({ variants: [variant] })
            expect(isProductAvailable(product)).toBeTruthy()
        })

        it('product is tracked and is not available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Deny,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            expect(isProductAvailable(product)).toBeFalsy()
        })
    })
    describe('InventoryPolicy is not definied', () => {
        it('product is tracked and available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: 10,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            expect(isProductAvailable(product)).toBeTruthy()
        })

        it('product is tracked and not available', () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            expect(isProductAvailable(product)).toBeFalsy()
        })
    })
})
