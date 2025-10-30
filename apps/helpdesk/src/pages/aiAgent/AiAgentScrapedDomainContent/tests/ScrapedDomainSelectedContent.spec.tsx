import React from 'react'

import { render, screen } from '@testing-library/react'

import { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'

import { CONTENT_TYPE } from '../constant'
import ScrapedDomainSelectedContent from '../ScrapedDomainSelectedContent'
import { IngestedProduct } from '../types'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            questionsContent: '/questions',
            products: '/products',
        },
        navigationItems: [],
    })),
}))

jest.mock('core/flags/hooks/useFlag', () => ({
    __esModule: true,
    default: jest.fn(() => true),
}))

jest.mock('../ProductAdditionalInfoView', () => {
    return function MockProductAdditionalInfoView(props: any) {
        return (
            <div data-testid="product-additional-info-view">
                ProductAdditionalInfoView - Integration ID:{' '}
                {props.integrationId} - Product ID: {props.productId}
            </div>
        )
    }
})

jest.mock('../IntegrationProductView', () => {
    return function MockIntegrationProductView() {
        return <div>Integration Product View</div>
    }
})

jest.mock('../IngestionProductView', () => {
    return function MockIngestionProductView() {
        return <div>Ingestion Product View</div>
    }
})

jest.mock('pages/common/components/accordion/Accordion', () => {
    return function MockAccordion({ children }: any) {
        return <div data-testid="accordion">{children}</div>
    }
})

jest.mock('pages/common/components/accordion/AccordionItem', () => {
    return function MockAccordionItem({ children, id }: any) {
        return <div data-testid={`accordion-item-${id}`}>{children}</div>
    }
})

jest.mock('pages/common/components/accordion/AccordionHeader', () => {
    return function MockAccordionHeader({ children }: any) {
        return <div data-testid="accordion-header">{children}</div>
    }
})

jest.mock('pages/common/components/accordion/AccordionBody', () => {
    return function MockAccordionBody({ children }: any) {
        return <div data-testid="accordion-body">{children}</div>
    }
})

describe('ScrapedDomainSelectedContent', () => {
    const mockProduct: ProductWithAiAgentStatus = {
        id: 12345,
        title: 'Test Product',
        vendor: 'Test Vendor',
        body_html: '<p>Test description</p>',
        created_at: '2025-01-01T00:00:00Z',
        image: null,
        images: [],
        options: [],
        variants: [],
        tags: '',
        is_used_by_ai_agent: true,
    }

    const mockDetail: IngestedProduct = {
        account_id: 1,
        store_id: 123,
        store_name: 'Test Store',
        store_type: 'shopify',
        source_knowledge: 'test-source',
        scraping_id: 'this-is-not-a-generic-api-key',
        execution_id: 'execution-123',
        product_id: '12345',
        product_name: 'Test Product',
        description: 'Test description',
        shipping_policy: 'Free shipping',
        return_policy: '30 days return',
        sizing: 'Standard sizing',
        metadata: [],
        web_pages: [],
    }

    const mockAdditionalInfo = {
        data: {
            rich_text: '<p>Additional product information</p>',
        },
        version: new Date().toISOString(),
    }

    const baseProps = {
        shopName: 'test-shop',
        latestSync: '2025-01-01T00:00:00Z',
        isOpened: true,
        isLoading: false,
        onClose: jest.fn(),
        onUpdateStatus: jest.fn(),
    }

    it('renders ProductAdditionalInfoView when feature flag is enabled and integrationId is provided', () => {
        render(
            <ScrapedDomainSelectedContent
                {...baseProps}
                contentType={CONTENT_TYPE.PRODUCT}
                selectedContent={mockProduct}
                detail={mockDetail}
                integrationId={123}
                additionalInfo={mockAdditionalInfo}
            />,
        )

        expect(
            screen.getByTestId('accordion-item-additional-info'),
        ).toBeInTheDocument()
        expect(screen.getByText(/Additional Information/)).toBeInTheDocument()
        expect(
            screen.getByText(
                /Custom context that you can add to enhance AI Agent's knowledge about this product/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('product-additional-info-view'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Integration ID: 123 - Product ID: 12345/),
        ).toBeInTheDocument()
    })

    it('does not render ProductAdditionalInfoView when integrationId is null', () => {
        render(
            <ScrapedDomainSelectedContent
                {...baseProps}
                contentType={CONTENT_TYPE.PRODUCT}
                selectedContent={mockProduct}
                detail={mockDetail}
                integrationId={null}
                additionalInfo={mockAdditionalInfo}
            />,
        )

        expect(
            screen.queryByTestId('accordion-item-additional-info'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('product-additional-info-view'),
        ).not.toBeInTheDocument()
    })

    it('renders ProductAdditionalInfoView with null additionalInfo', () => {
        render(
            <ScrapedDomainSelectedContent
                {...baseProps}
                contentType={CONTENT_TYPE.PRODUCT}
                selectedContent={mockProduct}
                detail={mockDetail}
                integrationId={123}
                additionalInfo={null}
            />,
        )

        expect(
            screen.getByTestId('accordion-item-additional-info'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('product-additional-info-view'),
        ).toBeInTheDocument()
    })

    it('renders accordion with all product sections', () => {
        render(
            <ScrapedDomainSelectedContent
                {...baseProps}
                contentType={CONTENT_TYPE.PRODUCT}
                selectedContent={mockProduct}
                detail={mockDetail}
                integrationId={123}
                additionalInfo={mockAdditionalInfo}
            />,
        )

        expect(screen.getByTestId('accordion')).toBeInTheDocument()
        expect(
            screen.getByTestId('accordion-item-store-integration'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('accordion-item-store-domain'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('accordion-item-additional-info'),
        ).toBeInTheDocument()
    })
})
