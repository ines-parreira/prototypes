import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { Variant } from 'constants/integrations/types/shopify'
import { shopifyProductFixture } from 'fixtures/shopify'

import IntegrationProductView from '../IntegrationProductView'

const mockProduct = {
    ...shopifyProductFixture({
        id: 123,
        title: 'Test Product',
        variants: [
            {
                id: 1,
                title: 'Variant 1',
                price: '10.00',
                compare_at_price: '15.00',
            },
            {
                id: 2,
                title: 'Variant 2',
                price: '20.00',
                compare_at_price: null,
            },
        ] as Variant[],
    }),
    body_html: 'Test Description',
    vendor: 'Test Vendor',
}

describe('IntegrationProductView', () => {
    it('renders basic product information', () => {
        render(<IntegrationProductView product={mockProduct} />)

        expect(screen.getByText('Product ID:')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByText('Title:')).toBeInTheDocument()
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('Vendor:')).toBeInTheDocument()
        expect(screen.getByText('Test Vendor')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(1)
    })

    it('renders product variants with prices', () => {
        render(<IntegrationProductView product={mockProduct} />)

        const variantsButton = screen.getByText('Available Variants')
        expect(variantsButton).toBeInTheDocument()

        fireEvent.click(variantsButton)

        expect(screen.getByText('Variant 1')).toBeInTheDocument()
        expect(screen.getByText('Variant 2')).toBeInTheDocument()
    })

    it('handles product without description', () => {
        const productWithoutDescription = {
            ...mockProduct,
            body_html: '',
        }
        render(<IntegrationProductView product={productWithoutDescription} />)

        expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('handles product without variants', () => {
        const productWithoutVariants = shopifyProductFixture({
            ...mockProduct,
            variants: [],
        })
        render(<IntegrationProductView product={productWithoutVariants} />)

        expect(screen.queryByText('Available Variants')).not.toBeInTheDocument()
    })

    it('limits displayed images to MAX_IMAGES', () => {
        const productWithManyImages = {
            ...mockProduct,
            images: Array(10)
                .fill(null)
                .map((_, index) => ({
                    id: index + 1,
                    src: `https://example.com/image${index + 1}.jpg`,
                    alt: `Test Image ${index + 1}`,
                    variant_ids: [],
                })),
        }

        render(<IntegrationProductView product={productWithManyImages} />)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(5) // MAX_IMAGES is 5
    })
})
