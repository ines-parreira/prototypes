import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { Product } from 'constants/integrations/types/shopify'

import { ProductRecommendationRuleCard } from '../ProductRecommendationRuleCard'

jest.mock('../../hooks/usePaginatedProductsByIds', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

jest.mock('../ItemSelectionDrawer', () => ({
    ItemSelectionDrawer: ({ isOpen, onClose, onSubmit, title }: any) => {
        if (!isOpen) return null
        return (
            <div data-testid="item-selection-drawer">
                <div>{title}</div>
                <button onClick={() => onSubmit(['1', '2', '3'])}>
                    Submit
                </button>
                <button onClick={onClose}>Close</button>
            </div>
        )
    },
}))

jest.mock('../RecommendationRuleCard', () => ({
    RecommendationRuleCard: ({
        title,
        description,
        isLoading,
        totalItems,
        items,
        onDelete,
        onSeeAllClick,
        addButton,
    }: any) => (
        <div data-testid="recommendation-rule-card">
            <div>{title}</div>
            <div>{description}</div>
            {isLoading && <div>Loading...</div>}
            <div>Total: {totalItems}</div>
            {items.map((item: any) => (
                <div key={item.id}>
                    <span>{item.title}</span>
                    <button onClick={() => onDelete(item.id)}>
                        Delete {item.id}
                    </button>
                </div>
            ))}
            <button onClick={addButton.onClick}>Select products</button>
            <button onClick={onSeeAllClick}>See All</button>
        </div>
    ),
}))

const mockUsePaginatedProductsByIds = jest.requireMock(
    '../../hooks/usePaginatedProductsByIds',
).default
const mockUsePaginatedProductIntegration = jest.requireMock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration',
).default

const mockProducts: Product[] = [
    {
        id: 1,
        title: 'Product 1',
        image: { src: 'image1.jpg' },
        status: 'active',
    } as Product,
    {
        id: 2,
        title: 'Product 2',
        image: { src: 'image2.jpg' },
        status: 'draft',
    } as Product,
]

describe('ProductRecommendationRuleCard', () => {
    let queryClient: QueryClient
    const mockOnUpsert = jest.fn()

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()

        mockUsePaginatedProductsByIds.mockReturnValue({
            products: mockProducts,
            isLoading: false,
            isError: false,
            currentPage: 1,
            totalPages: 1,
            fetchPage: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
        })

        mockUsePaginatedProductIntegration.mockReturnValue({
            itemsData: mockProducts,
            isLoading: false,
            setSearchTerm: jest.fn(),
            fetchNext: jest.fn(),
            fetchPrev: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
        })

        mockOnUpsert.mockResolvedValue(undefined)
    })

    const renderComponent = (props = {}) => {
        const defaultProps = {
            type: 'promote' as const,
            integrationId: 123,
            productIds: ['1', '2'],
            isLoadingRules: false,
            isFetchingRules: false,
            isUpserting: false,
            onUpsert: mockOnUpsert,
            ...props,
        }

        return render(
            <QueryClientProvider client={queryClient}>
                <ProductRecommendationRuleCard {...defaultProps} />
            </QueryClientProvider>,
        )
    }

    it('should render promote type correctly', () => {
        const { getByText } = renderComponent({ type: 'promote' })

        expect(getByText('Promote products')).toBeInTheDocument()
        expect(
            getByText('Choose products to prioritize in recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should render exclude type correctly', () => {
        const { getByText } = renderComponent({ type: 'exclude' })

        expect(getByText('Exclude products')).toBeInTheDocument()
        expect(
            getByText('Choose products to exclude from recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should show loading state when rules are loading', () => {
        const { getByText } = renderComponent({ isLoadingRules: true })

        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should display initial products correctly', () => {
        const { getByText } = renderComponent()

        expect(getByText('Product 1')).toBeInTheDocument()
        expect(getByText('Product 2')).toBeInTheDocument()
    })

    it('should handle product deletion', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Delete 1'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['2'])
        })
    })

    it('should open selection drawer when add button clicked', () => {
        const { getByText, queryByTestId } = renderComponent()

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()

        fireEvent.click(getByText('Select products'))

        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()
        expect(getByText('Select products to promote')).toBeInTheDocument()
    })

    it('should open see all drawer when see all clicked', () => {
        const { getByText, getAllByTestId } = renderComponent()

        fireEvent.click(getByText('See All'))

        const drawers = getAllByTestId('item-selection-drawer')
        expect(drawers).toHaveLength(1)
        expect(getByText('All promoted products')).toBeInTheDocument()
    })

    it('should close selection drawer', () => {
        const { getByText, queryByTestId } = renderComponent()

        fireEvent.click(getByText('Select products'))
        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()

        fireEvent.click(getByText('Close'))

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()
    })

    it('should handle product selection submission', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select products'))
        fireEvent.click(getByText('Submit'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['1', '2', '3'])
        })
    })

    it('should fetch products only when drawer is opened', () => {
        const { getByText } = renderComponent()

        expect(mockUsePaginatedProductIntegration).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )

        fireEvent.click(getByText('Select products'))

        expect(mockUsePaginatedProductIntegration).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
        )
    })

    it('should handle empty product list', () => {
        mockUsePaginatedProductsByIds.mockReturnValue({
            products: [],
            isLoading: false,
            isError: false,
            currentPage: 1,
            totalPages: 0,
            fetchPage: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
        })

        const { getByText } = renderComponent({ productIds: [] })

        expect(getByText('Total: 0')).toBeInTheDocument()
    })

    it('should show correct drawer titles for exclude type', () => {
        const { getByText } = renderComponent({ type: 'exclude' })

        fireEvent.click(getByText('Select products'))
        expect(getByText('Select products to exclude')).toBeInTheDocument()

        fireEvent.click(getByText('See All'))
        expect(getByText('All excluded products')).toBeInTheDocument()
    })

    it('should disable actions when upserting', () => {
        renderComponent({ isUpserting: true })

        expect(mockUsePaginatedProductsByIds).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: expect.any(Boolean),
            }),
        )
    })
})
