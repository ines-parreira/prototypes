// @flow

import React from 'react'
import {shallow} from 'enzyme'

import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
    shopifyVariantFixture
} from '../../../../../fixtures/shopify'
import type {IntegrationDataItem} from '../../../../../models/integration'
import * as Shopify from '../../../../../constants/integrations/shopify'
import VariantResult from '../VariantResult'

describe('<VariantResult/>', () => {
    describe('render()', () => {
        it('should render with product title as title, and SKU as subtitle', () => {
            const variant: Shopify.Variant = shopifyVariantFixture()
            const products: Shopify.Product = shopifyProductFixture({variants: [variant]})
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture({data: products})

            const component = shallow(
                <VariantResult
                    result={item}
                    subResult={variant}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with variant title in title', () => {
            const variant1: Shopify.Variant = shopifyVariantFixture({id: 1, sku: '11111', title: 'Variant 1'})
            const variant2: Shopify.Variant = shopifyVariantFixture({id: 2, sku: '22222', title: 'Variant 2'})
            const products: Shopify.Product = shopifyProductFixture({variants: [variant1, variant2]})
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture({data: products})

            const component = shallow(
                <VariantResult
                    result={item}
                    subResult={variant2}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Shopify.Variant = shopifyVariantFixture({sku: null})
            const products: Shopify.Product = shopifyProductFixture({variants: [variant]})
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture({data: products})

            const component = shallow(
                <VariantResult
                    result={item}
                    subResult={variant}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
