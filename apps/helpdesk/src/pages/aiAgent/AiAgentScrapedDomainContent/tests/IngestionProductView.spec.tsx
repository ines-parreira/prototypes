import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import IngestionProductView from '../IngestionProductView'
import type { IngestedProduct } from '../types'

const mockUseShouldDisplayExecutionId = jest.fn()
jest.mock('pages/aiAgent/hooks/useShouldDisplayExecutionId', () => ({
    useShouldDisplayExecutionId: () => mockUseShouldDisplayExecutionId(),
}))

const mockProduct: IngestedProduct = {
    account_id: 1,
    store_id: 1,
    store_name: 'Test Store',
    store_type: 'shopify',
    source_knowledge: 'web',
    scraping_id: '123',
    execution_id: '456',
    product_id: '789',
    product_name: 'Test Product',
    description: '<p>Test Description</p>',
    shipping_policy: '<p>Test Shipping Policy</p>',
    return_policy: '<p>Test Return Policy</p>',
    sizing: '<p>Test Sizing Info</p>',
    metadata: [
        {
            question: 'Detail 1',
            response: 'Information 1',
        },
        {
            question: 'Detail 2',
            response: 'Information 2',
        },
    ],
    web_pages: [
        {
            url: 'https://example.com/product1',
            title: 'Product 1',
            page_type: 'product',
        },
        {
            url: 'https://example.com/product2',
            title: 'Product 2',
            page_type: 'product',
        },
    ],
}

describe('IngestionProductView', () => {
    beforeEach(() => {
        mockUseShouldDisplayExecutionId.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders execution ID when impersonated', () => {
        mockUseShouldDisplayExecutionId.mockReturnValue(true)
        render(<IngestionProductView product={mockProduct} />)

        expect(screen.getByText('Execution ID: 456')).toBeInTheDocument()
    })

    it('does not render execution ID when not impersonated', () => {
        render(<IngestionProductView product={mockProduct} />)

        expect(screen.queryByText('Execution ID: 456')).not.toBeInTheDocument()
    })

    it('renders basic product information', () => {
        render(<IngestionProductView product={mockProduct} />)

        expect(screen.getByText('Title:')).toBeInTheDocument()
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        expect(screen.getByText('Product ID:')).toBeInTheDocument()
        expect(screen.getByText('789')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders optional product information when available', () => {
        render(<IngestionProductView product={mockProduct} />)

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Shipping info')).toBeInTheDocument()
        expect(screen.getByText('Test Shipping Policy')).toBeInTheDocument()
        expect(screen.getByText('Return policy')).toBeInTheDocument()
        expect(screen.getByText('Test Return Policy')).toBeInTheDocument()
        expect(screen.getByText('Sizing info')).toBeInTheDocument()
        expect(screen.getByText('Test Sizing Info')).toBeInTheDocument()
    })

    it('handles product without optional information', () => {
        const productWithoutOptionalInfo = {
            ...mockProduct,
            metadata: [],
            shipping_policy: '',
            return_policy: '',
            sizing: '',
        }
        render(<IngestionProductView product={productWithoutOptionalInfo} />)

        expect(screen.queryByText('Details')).not.toBeInTheDocument()
        expect(screen.queryByText('Shipping info')).not.toBeInTheDocument()
        expect(screen.queryByText('Return policy')).not.toBeInTheDocument()
        expect(screen.queryByText('Sizing info')).not.toBeInTheDocument()
    })

    it('renders and expands web pages section', () => {
        render(<IngestionProductView product={mockProduct} />)

        const webPagesButton = screen.getByText('View Source URLs')
        expect(webPagesButton).toBeInTheDocument()

        fireEvent.click(webPagesButton)

        expect(
            screen.getByText('https://example.com/product1'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('https://example.com/product2'),
        ).toBeInTheDocument()
    })

    it('handles product without web pages', () => {
        const productWithoutWebPages = {
            ...mockProduct,
            web_pages: [],
        }
        render(<IngestionProductView product={productWithoutWebPages} />)

        expect(screen.queryByText('View Source URLs')).not.toBeInTheDocument()
    })

    it('returns null when product is not provided', () => {
        const { container } = render(
            <IngestionProductView product={null as any} />,
        )
        expect(container.firstChild).toBeNull()
    })
})
