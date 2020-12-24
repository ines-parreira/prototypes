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
    Variant,
    Product,
} from '../../../../../constants/integrations/types/shopify'
import VariantResult from '../VariantResult'
import {InventoryManagement} from '../../../../../constants/integrations/types/shopify.ts'

describe('<VariantResult/>', () => {
    describe('render()', () => {
        it('should render with product title as title, and SKU as subtitle', () => {
            const variant: Variant = shopifyVariantFixture()
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with variant title in title', () => {
            const variant1: Variant = shopifyVariantFixture({
                id: 1,
                sku: '11111',
                title: 'Variant 1',
            })
            const variant2: Variant = shopifyVariantFixture({
                id: 2,
                sku: '22222',
                title: 'Variant 2',
            })
            const product: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant2} />
            )

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

            const component = shallow(
                <VariantResult result={item} subResult={variant} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with product stock quantity', () => {
            const variant: Variant = shopifyVariantFixture({
                inventoryManagement: InventoryManagement.Shopify,
                inventoryQuantity: 1,
            })
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without product stock quantity because the inventory is not tracked', () => {
            const variant: Variant = shopifyVariantFixture({
                inventoryManagement: null, // inventory is not tracked
                inventoryQuantity: 0,
            })
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: product}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant} />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
