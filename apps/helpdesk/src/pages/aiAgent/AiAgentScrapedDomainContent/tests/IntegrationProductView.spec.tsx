import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { Variant } from 'constants/integrations/types/shopify'
import { useFlag } from 'core/flags'
import { shopifyProductFixture } from 'fixtures/shopify'

import IntegrationProductView from '../IntegrationProductView'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

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
                inventory_quantity: 10,
            },
            {
                id: 2,
                title: 'Variant 2',
                price: '20.00',
                compare_at_price: null,
                inventory_quantity: 0,
            },
        ] as Variant[],
    }),
    body_html: 'Test Description',
    vendor: 'Test Vendor',
    imgAiDescription:
        'AI generated description for the first product image from Shopify',
}

// Mock Image constructor
beforeAll(() => {
    global.Image = jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        set src(value: string) {
            // Simulate successful image load
            setTimeout(() => {
                if (this.onload) {
                    this.onload()
                }
            }, 0)
        },
    })) as any

    useFlagMock.mockReturnValue(false)
})

describe('IntegrationProductView', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders basic product information', async () => {
        render(<IntegrationProductView product={mockProduct} />)

        expect(screen.getByText('Product ID:')).toBeInTheDocument()
        expect(screen.getByText('123')).toBeInTheDocument()
        expect(screen.getByText('Title:')).toBeInTheDocument()
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()

        expect(
            screen.queryByText('AI-generated image description'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'AI generated description for the first product image from Shopify',
            ),
        ).not.toBeInTheDocument()

        // Wait for images to load
        await waitFor(() => {
            const images = screen.getAllByRole('img')
            expect(images).toHaveLength(1)
        })
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

    it('shows image description when feature flag is enabled', () => {
        useFlagMock.mockImplementation(
            (flag) =>
                flag ===
                FeatureFlagKey.AiAgentShowImageDescriptionInProductCatalog,
        )

        render(<IntegrationProductView product={mockProduct} />)

        expect(
            screen.getByText('AI-generated image description'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI generated description for the first product image from Shopify',
            ),
        ).toBeInTheDocument()
    })

    it('handles product without image description', () => {
        useFlagMock.mockImplementation(
            (flag) =>
                flag ===
                FeatureFlagKey.AiAgentShowImageDescriptionInProductCatalog,
        )

        const productWithoutImageDescription = {
            ...mockProduct,
            imgAiDescription: undefined,
        }
        render(
            <IntegrationProductView product={productWithoutImageDescription} />,
        )

        expect(
            screen.queryByText('AI-generated image description'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'AI generated description for the first product image from Shopify',
            ),
        ).not.toBeInTheDocument()
    })

    it('handles product without variants', () => {
        const productWithoutVariants = shopifyProductFixture({
            ...mockProduct,
            variants: [],
        })
        render(<IntegrationProductView product={productWithoutVariants} />)

        expect(screen.queryByText('Available Variants')).not.toBeInTheDocument()
    })

    it('limits displayed images to MAX_IMAGES', async () => {
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

        // Wait for images to load
        await waitFor(() => {
            const images = screen.getAllByRole('img')
            expect(images).toHaveLength(5) // MAX_IMAGES is 5
        })
    })
})
