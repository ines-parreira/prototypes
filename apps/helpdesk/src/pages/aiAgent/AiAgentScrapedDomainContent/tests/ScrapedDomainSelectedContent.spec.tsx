import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import type { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'

import { CONTENT_TYPE } from '../constant'
import ScrapedDomainSelectedContent from '../ScrapedDomainSelectedContent'
import type { IngestedProduct, IngestedResourceWithArticleId } from '../types'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            questionsContent: '/questions',
            products: '/products',
            knowledgeSources: '/knowledge/sources',
            knowledgeSourcesByDomain: (domain: string) =>
                `/knowledge/sources?filter=domain&folder=${encodeURIComponent(domain)}`,
        },
        navigationItems: [],
    })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => true),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
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

jest.mock('../ScrapedDomainQuestion', () => {
    return function MockScrapedDomainQuestion() {
        return <div>Scraped Domain Question</div>
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

jest.mock('pages/common/components/ItemWithTooltip/ItemWithTooltip', () => {
    return function MockItemWithTooltip({ item }: any) {
        return <div>{item}</div>
    }
})

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacyTooltip: ({ children, target, disabled }: any) => {
        if (disabled) return null
        return (
            <div data-testid="tooltip" data-target={target?.id || 'element'}>
                {children}
            </div>
        )
    },
}))

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

    const mockQuestion: IngestedResourceWithArticleId = {
        id: 1,
        title: 'Test Question',
        status: 'enabled',
        web_pages: [],
        article_ingestion_log_id: 1,
        article_id: 1,
        scraping_id: 'this-is-not-a-generic-api-key',
        snippet_id: 'this-is-not-a-generic-api-key',
        execution_id: 'this-is-not-a-generic-api-key',
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
        expect(
            screen.getByText(/Custom product information/),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /Add custom details AI Agent can reference about this product\./,
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

    describe('Title tooltip', () => {
        beforeEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
                configurable: true,
                value: 100,
            })
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                value: 100,
            })
        })

        it('shows tooltip when product title is truncated', async () => {
            const longTitleProduct = {
                ...mockProduct,
                title: 'This is a very long product title that will be truncated',
            }

            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
                configurable: true,
                get: function () {
                    return this.textContent?.includes('very long') ? 500 : 100
                },
            })
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                value: 350,
            })

            render(
                <ScrapedDomainSelectedContent
                    {...baseProps}
                    contentType={CONTENT_TYPE.PRODUCT}
                    selectedContent={longTitleProduct}
                    detail={mockDetail}
                    integrationId={123}
                />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('tooltip')).toBeInTheDocument()
            })

            expect(screen.getByTestId('tooltip')).toHaveTextContent(
                'Products details for the This is a very long product title that will be truncated',
            )
        })

        it('does not show tooltip when product title is not truncated', async () => {
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
                configurable: true,
                value: 100,
            })
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                value: 350,
            })

            render(
                <ScrapedDomainSelectedContent
                    {...baseProps}
                    contentType={CONTENT_TYPE.PRODUCT}
                    selectedContent={mockProduct}
                    detail={mockDetail}
                    integrationId={123}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Test Product')).toBeInTheDocument()
            })

            expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
        })

        it('shows tooltip with question title when content type is QUESTION', async () => {
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
                configurable: true,
                get: function () {
                    return this.textContent?.includes('Question details')
                        ? 500
                        : 100
                },
            })
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                value: 350,
            })

            render(
                <ScrapedDomainSelectedContent
                    {...baseProps}
                    contentType={CONTENT_TYPE.QUESTION}
                    selectedContent={mockQuestion}
                    detail={null}
                />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('tooltip')).toBeInTheDocument()
            })

            expect(screen.getByTestId('tooltip')).toHaveTextContent(
                'Question details',
            )
        })

        it('updates tooltip when product changes', async () => {
            const firstProduct = {
                ...mockProduct,
                title: 'First Product Title That Is Very Long',
            }
            const secondProduct = {
                ...mockProduct,
                title: 'Second Product Title That Is Also Very Long',
            }

            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
                configurable: true,
                get: function () {
                    return this.textContent ? 500 : 100
                },
            })
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                configurable: true,
                value: 350,
            })

            const { rerender } = render(
                <ScrapedDomainSelectedContent
                    {...baseProps}
                    contentType={CONTENT_TYPE.PRODUCT}
                    selectedContent={firstProduct}
                    detail={mockDetail}
                    integrationId={123}
                />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('tooltip')).toBeInTheDocument()
            })

            expect(screen.getByTestId('tooltip')).toHaveTextContent(
                'Products details for the First Product Title That Is Very Long',
            )

            rerender(
                <ScrapedDomainSelectedContent
                    {...baseProps}
                    contentType={CONTENT_TYPE.PRODUCT}
                    selectedContent={secondProduct}
                    detail={mockDetail}
                    integrationId={123}
                />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('tooltip')).toHaveTextContent(
                    'Products details for the Second Product Title That Is Also Very Long',
                )
            })
        })
    })
})
