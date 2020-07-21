// @flow

import React from 'react'
import {shallow} from 'enzyme'

import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../fixtures/shopify'
import type {IntegrationDataItem} from '../../../../../models/integration'
import type {
    Variant,
    Product,
} from '../../../../../constants/integrations/types/shopify'
import VariantResult from '../VariantResult'

describe('<VariantResult/>', () => {
    describe('render()', () => {
        it('should render with product title as title, and SKU as subtitle', () => {
            const variant: Variant = shopifyVariantFixture()
            const products: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: products}
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
            const products: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: products}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant2} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Variant = shopifyVariantFixture({sku: null})
            const products: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> = integrationDataItemProductFixture(
                {data: products}
            )

            const component = shallow(
                <VariantResult result={item} subResult={variant} />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
