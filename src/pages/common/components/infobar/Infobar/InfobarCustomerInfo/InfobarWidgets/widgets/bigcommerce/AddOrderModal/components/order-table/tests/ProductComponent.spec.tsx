import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import {
    bigCommerceCustomLineItemFixture,
    bigCommerceCustomProductFixture,
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'

import ProductComponent, { getVariant, Modifiers } from '../ProductComponent'

const defaultProps: ComponentProps<typeof ProductComponent> = {
    product: bigCommerceProductFixture(),
    lineItem: bigCommerceLineItemFixture(),
    storeHash: 'storeHash',
    onOpenModifiers: jest.fn(),
    errorMessage: null,
}

describe('getVariant', () => {
    it('should return the right product variant', () => {
        const product = bigCommerceProductFixture()
        const expectedVariant = bigCommerceVariantFixture()
        product.variants = [expectedVariant]

        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = expectedVariant.id

        const variant = getVariant(lineItem, bigCommerceProductFixture())

        expect(variant).toStrictEqual(expectedVariant)
    })

    it('should return null if is not a bigCommerce cart line', () => {
        const variant = getVariant(
            bigCommerceCustomLineItemFixture,
            bigCommerceProductFixture(),
        )

        expect(variant).toBeNull()
    })

    it('should return null without a product', () => {
        const variant = getVariant(bigCommerceLineItemFixture())

        expect(variant).toBeNull()
    })

    it('should return null if the product is not a bigCommerce product', () => {
        const variant = getVariant(
            bigCommerceLineItemFixture(),
            bigCommerceCustomProductFixture,
        )

        expect(variant).toBeNull()
    })

    it("should return null if the product doesn't have the corresponding variant", () => {
        const variant = getVariant(
            bigCommerceLineItemFixture(),
            bigCommerceProductFixture(),
        )

        expect(variant).toBeNull()
    })
})

describe('<ProductComponent/>', () => {
    it('should render correctly', () => {
        const { container } = render(<ProductComponent {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('should render the sku', () => {
        const lineItem = bigCommerceLineItemFixture()
        lineItem.sku = 'test-sku'

        const props = { ...defaultProps, lineItem }
        render(<ProductComponent {...props} />)

        expect(screen.getByText('SKU: test-sku')).toBeVisible()
    })

    it('should show the variant image', () => {
        const product = bigCommerceProductFixture()
        product.image_url = ''
        const variant = {
            ...bigCommerceVariantFixture(),
            image_url: 'https://variantsImage.com/variant.png',
        }
        product.variants = [variant]

        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = variant.id
        const props = { ...defaultProps, product, lineItem }
        render(<ProductComponent {...props} />)

        expect(screen.getByRole('img').getAttribute('src')).toBe(
            'https://variantsImage.com/variant.png',
        )
    })

    it('should show the default image', () => {
        const product = bigCommerceProductFixture()
        product.image_url = ''
        const props = { ...defaultProps, product }
        render(<ProductComponent {...props} />)

        expect(screen.getByRole('img').getAttribute('src')).toBe(
            'test-file-stub',
        )
    })

    it('should show not available stock if a custom line cart', () => {
        const props = {
            ...defaultProps,
            lineItem: bigCommerceCustomLineItemFixture,
        }
        render(<ProductComponent {...props} />)

        expect(screen.queryByLabelText('product stock quantity')).toBeNull()
    })

    it('should show not available stock if a custom product', () => {
        const props = {
            ...defaultProps,
            product: bigCommerceCustomProductFixture,
        }
        const { container } = render(<ProductComponent {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('should show not available stock if missing product', () => {
        const props = { ...defaultProps, product: undefined }
        const { container } = render(<ProductComponent {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('should show not available stock if is not tracked', () => {
        const product = bigCommerceProductFixture()
        const variant = bigCommerceVariantFixture()
        product.variants = [variant]

        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = variant.id
        const props = { ...defaultProps, product, lineItem }
        render(<ProductComponent {...props} />)

        expect(screen.queryByLabelText('product stock quantity')).toBeNull()
    })

    it('should show product stock', () => {
        const product = bigCommerceProductFixture()
        product.inventory_tracking = 'product'
        const variant = bigCommerceVariantFixture()
        product.variants = [variant]

        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = variant.id
        const props = { ...defaultProps, product, lineItem }
        render(<ProductComponent {...props} />)

        const productStock = screen.getByLabelText('product stock quantity')
        expect(productStock).toBeVisible()
        expect(productStock.textContent).toBe('0 in stock')
    })

    it('should show variant stock', () => {
        const product = bigCommerceProductFixture()
        product.inventory_tracking = 'variant'
        const variant = {
            ...bigCommerceVariantFixture(),
            inventory_level: 1,
        }
        product.variants = [variant]

        const lineItem = bigCommerceLineItemFixture()
        lineItem.variant_id = variant.id
        const props = { ...defaultProps, product, lineItem }
        render(<ProductComponent {...props} />)

        const productStock = screen.getByLabelText('product stock quantity')
        expect(productStock).toBeVisible()
        expect(productStock.textContent).toBe('1 in stock')
    })

    it('should show an error', () => {
        const props = { ...defaultProps, errorMessage: 'error message' }
        render(<ProductComponent {...props} />)

        expect(screen.getByText('error message')).toBeVisible()
    })
})

describe('<Modifiers />', () => {
    it('should render correctly', () => {
        const { container } = render(<Modifiers {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('should render nothing if not a BigcommerceCartLine', () => {
        const lineItem = bigCommerceCustomLineItemFixture

        const props = { ...defaultProps, lineItem }
        const { container } = render(<Modifiers {...props} />)
        expect(container.childElementCount).toEqual(0)
    })

    it.each([undefined, bigCommerceCustomProductFixture])(
        'should render nothing if not a BigCommerceProduct pruduct',
        (product) => {
            const props = { ...defaultProps, product }
            const { container } = render(<Modifiers {...props} />)
            expect(container.childElementCount).toEqual(0)
        },
    )

    it.each([
        [
            {
                nameId: 163,
                value: 'test nameId',
            },
            'test nameId',
        ],
        [
            {
                name_id: 165,
                value: 'test name_id',
            },
            'test name_id',
        ],
        [
            {
                nameId: 164,
                value: 'checkbox',
            },
            'Include Insurance?',
        ],
    ])('should render option %s', (option, title) => {
        const lineItem = {
            ...bigCommerceLineItemFixture(),
            options: [option],
        }

        const props = { ...defaultProps, lineItem }
        const { getByRole } = render(<Modifiers {...props} />)
        const item = getByRole('listitem')
        expect(item.textContent).toEqual(title)
    })

    it('should not render option without modifier', () => {
        const lineItem = {
            ...bigCommerceLineItemFixture(),
            options: [
                {
                    nameId: 0,
                    value: 'not existing modifier',
                },
            ],
        }

        const props = { ...defaultProps, lineItem }
        const { queryAllByRole } = render(<Modifiers {...props} />)
        const item = queryAllByRole('listitem')
        expect(item.length).toEqual(0)
    })
})
