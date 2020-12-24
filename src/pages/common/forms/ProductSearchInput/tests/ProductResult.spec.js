// @flow

import React from 'react'
import {shallow} from 'enzyme'

import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../fixtures/shopify.ts'
import type {IntegrationDataItem} from '../../../../../models/integration'
import type {
    Product,
    Variant,
} from '../../../../../constants/integrations/types/shopify'
import ProductResult from '../ProductResult'
import {InventoryManagement} from '../../../../../constants/integrations/types/shopify.ts'

describe('<ProductResult/>', () => {
    describe('render()', () => {
        it('should render with SKU as subtitle', () => {
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture()
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with number of variants as subtitle', () => {
            const variant1: Variant = shopifyVariantFixture({id: 1})
            const variant2: Variant = shopifyVariantFixture({id: 2})
            const product: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Variant = shopifyVariantFixture({sku: null})
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with product stock quantity', () => {
            const variant: Variant = shopifyVariantFixture({
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: 99,
            })
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with product total stock quantity of all variants', () => {
            const variant1: Variant = shopifyVariantFixture({
                id: 1,
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: 10,
            })
            const variant2: Variant = shopifyVariantFixture({
                id: 2,
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: 20,
            })
            const product: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with product negative stock quantity', () => {
            const variant1: Variant = shopifyVariantFixture({
                id: 1,
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: 10,
            })
            const variant2: Variant = shopifyVariantFixture({
                id: 2,
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: -9000,
            })
            const product: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )
            const component = shallow(<ProductResult result={item} />)

            expect(component).toMatchSnapshot()
        })
    })
})
