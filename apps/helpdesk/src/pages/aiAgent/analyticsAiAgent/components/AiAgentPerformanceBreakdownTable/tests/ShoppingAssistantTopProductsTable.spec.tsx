import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

import { ShoppingAssistantTopProductsTable } from '../ShoppingAssistantTopProductsTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics',
)

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>

const mockUseShoppingAssistantTopProductsMetrics =
    useShoppingAssistantTopProductsMetrics as jest.MockedFunction<
        typeof useShoppingAssistantTopProductsMetrics
    >

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('ShoppingAssistantTopProductsTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
        } as any)
    })

    it('should render loading skeletons when data is loading', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: true,
            data: [],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    it('should render product data correctly', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product 1',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
                {
                    product: {
                        id: 2,
                        title: 'Test Product 2',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 50,
                        [ProductTableKeys.CTR]: 15,
                        [ProductTableKeys.BTR]: 5,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Test Product 1')).toBeInTheDocument()
            expect(screen.getByText('Test Product 2')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(screen.getByText('25%')).toBeInTheDocument()
        expect(screen.getByText('15%')).toBeInTheDocument()
        expect(screen.getByText('10%')).toBeInTheDocument()
        expect(screen.getByText('5%')).toBeInTheDocument()
    })

    it('should render table headers correctly', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Product name')).toBeInTheDocument()
        })

        expect(screen.getByText('Times recommended')).toBeInTheDocument()
        expect(screen.getByText('Click-through rate')).toBeInTheDocument()
        expect(screen.getByText('Buy through rate')).toBeInTheDocument()
    })

    it('should render table headers with tooltips', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
            ],
        })

        const { container } = render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const infoIcons = container.querySelectorAll('[aria-label="info"]')
            expect(infoIcons.length).toBeGreaterThan(0)
        })
    })

    it('should display empty state when no products are returned', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should show table toolbar with total count', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product 1',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
                {
                    product: {
                        id: 2,
                        title: 'Test Product 2',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 50,
                        [ProductTableKeys.CTR]: 15,
                        [ProductTableKeys.BTR]: 5,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('2 items')).toBeInTheDocument()
        })
    })

    it('should format numbers with commas for large values', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Popular Product',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 12345,
                        [ProductTableKeys.CTR]: 35,
                        [ProductTableKeys.BTR]: 20,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Popular Product')).toBeInTheDocument()
        })

        expect(screen.getByText('12,345')).toBeInTheDocument()
    })

    it('should render product with link when URL is provided', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product With Link',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                        url: 'https://example.com/product/1',
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const link = screen.getByRole('link', {
                name: 'Test Product With Link',
            })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute(
                'href',
                'https://example.com/product/1',
            )
            expect(link).toHaveAttribute('target', '_blank')
        })
    })

    it('should render product without link when URL is not provided', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product Without Link',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(
                screen.getByText('Test Product Without Link'),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('link', { name: 'Test Product Without Link' }),
        ).not.toBeInTheDocument()
    })

    it('should render product avatar with image when images are provided', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Product With Image',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [
                            {
                                src: 'https://example.com/image.jpg',
                                alt: 'Product image',
                                variant_ids: [],
                            },
                        ],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 25,
                        [ProductTableKeys.BTR]: 10,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Product With Image')).toBeInTheDocument()
        })
    })

    it('should show empty state when all metrics are zero', async () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Product With Zero Metrics',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 0,
                        [ProductTableKeys.CTR]: 0,
                        [ProductTableKeys.BTR]: 0,
                    },
                },
            ],
        })

        render(<ShoppingAssistantTopProductsTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })
})
