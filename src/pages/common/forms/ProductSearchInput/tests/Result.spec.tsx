import React from 'react'
import {shallow} from 'enzyme'

import {IntegrationDataItem} from 'models/integration/types'
import {
    integrationDataItemProductFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from 'fixtures/shopify'
import {
    InventoryManagement,
    Product,
    Variant,
} from 'constants/integrations/types/shopify'
import Result from '../Result'
import {shopifyDataMappers} from '../Mappings'

describe('<Result/>', () => {
    describe('render()', () => {
        it('should render with image and subtitle', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle="Subtitle"
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with default image', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={null}
                    subtitle="Subtitle"
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle={null}
                    stock={{quantity: 1, tracked: true, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render without product stock quantity', () => {
            const component = shallow(
                <Result
                    title="Title"
                    image={{src: 'https://foo.bar/image.jpg', alt: 'alt'}}
                    subtitle="Subtitle"
                    stock={{quantity: 0, tracked: false, totalVariants: 1}}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with SKU as subtitle', () => {
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture()
            const mappedItem = shopifyDataMappers.product(item)
            const component = shallow(<Result {...mappedItem} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with number of variants as subtitle', () => {
            const variant1: Variant = shopifyVariantFixture({id: 1})
            const variant2: Variant = shopifyVariantFixture({id: 2})
            const product: Product = shopifyProductFixture({
                variants: [variant1, variant2],
            })
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.product(item)

            const component = shallow(<Result {...mappedItem} />)

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Variant = shopifyVariantFixture({sku: null} as any)
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.product(item)
            const component = shallow(<Result {...mappedItem} />)

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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.product(item)
            const component = shallow(<Result {...mappedItem} />)

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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.product(item)
            const component = shallow(<Result {...mappedItem} />)

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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.product(item)
            const component = shallow(<Result {...mappedItem} />)

            expect(component).toMatchSnapshot()
        })

        it('should render with product title as title, and SKU as subtitle', () => {
            const variant: Variant = shopifyVariantFixture()
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})
            const mappedItem = shopifyDataMappers.variants(item, variant)
            const component = shallow(<Result {...mappedItem} />)
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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})

            const mappedItem = shopifyDataMappers.variants(item, variant2)
            const component = shallow(<Result {...mappedItem} />)

            expect(component).toMatchSnapshot()
        })

        it('should render without subtitle', () => {
            const variant: Variant = shopifyVariantFixture({sku: null} as any)
            const product: Product = shopifyProductFixture({
                variants: [variant],
            })
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})

            const mappedItem = shopifyDataMappers.variants(item, variant)
            const component = shallow(<Result {...mappedItem} />)

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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})

            const mappedItem = shopifyDataMappers.variants(item, variant)
            const component = shallow(<Result {...mappedItem} />)

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
            const item: IntegrationDataItem<Product> =
                integrationDataItemProductFixture({data: product})

            const mappedItem = shopifyDataMappers.variants(item, variant)
            const component = shallow(<Result {...mappedItem} />)

            expect(component).toMatchSnapshot()
        })
    })
})
