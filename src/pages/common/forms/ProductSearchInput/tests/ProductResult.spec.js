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
import ProductResult from '../ProductResult'

describe('<ProductResult/>', () => {
    describe('render()', () => {
        it('should render with SKU as subtitle', () => {
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture()
            const component = shallow(<ProductResult result={item}/>)

            expect(component).toMatchSnapshot()
        })

        it('should render with number of variants as subtitle', () => {
            const variant1: Shopify.Variant = shopifyVariantFixture({id: 1})
            const variant2: Shopify.Variant = shopifyVariantFixture({id: 2})
            const products: Shopify.Product = shopifyProductFixture({variants: [variant1, variant2]})
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture({data: products})
            const component = shallow(<ProductResult result={item}/>)

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Shopify.Variant = shopifyVariantFixture({sku: null})
            const products: Shopify.Product = shopifyProductFixture({variants: [variant]})
            const item: IntegrationDataItem<Shopify.Product> = integrationDataItemProductFixture({data: products})
            const component = shallow(<ProductResult result={item}/>)

            expect(component).toMatchSnapshot()
        })
    })
})
