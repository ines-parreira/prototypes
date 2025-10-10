import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'

import usePaginatedProductCollectionsByIds from '../../hooks/usePaginatedProductCollectionsByIds'
import usePaginatedProductsByIds from '../../hooks/usePaginatedProductsByIds'
import { CollectionRecommendationRuleCard } from '../CollectionRecommendationRuleCard'

jest.mock('models/ecommerce/queries', () => ({
    useGetEcommerceProductCollections: jest.fn(),
}))

jest.mock('../../hooks/usePaginatedProductsByIds')
const mockUsePaginatedProductsByIds = usePaginatedProductsByIds as jest.Mock

jest.mock('../../hooks/usePaginatedProductCollectionsByIds')
const mockUsePaginatedProductCollectionsByIds =
    usePaginatedProductCollectionsByIds as jest.Mock

jest.mock('../ItemDrawer', () => ({
    ItemDrawer: ({
        isOpen,
        onClose,
        onSubmit,
        title,
        pagination: { onNextClick, onPrevClick },
        onSearch,
    }: any) => {
        if (!isOpen) return null
        return (
            <div data-testid="item-selection-drawer">
                <div>{title}</div>
                <input
                    type="text"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search collections"
                />
                <button onClick={() => onSubmit(['1', '4'])}>Submit</button>
                <button onClick={onClose}>Close</button>
                <button onClick={onNextClick}>Next</button>
                <button onClick={onPrevClick}>Prev</button>
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
        onShowProducts,
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
                    <button onClick={() => onShowProducts(item.id)}>
                        Show {item.id} products
                    </button>
                </div>
            ))}
            <button onClick={addButton.onClick}>Select collections</button>
            <button onClick={onSeeAllClick}>See All</button>
        </div>
    ),
}))

const mockUseGetEcommerceProductCollections = jest.requireMock(
    'models/ecommerce/queries',
).useGetEcommerceProductCollections

const mockProducts = [
    {
        id: 123,
        title: 'Product 1',
        image: {
            src: 'https://example.com/image1.jpg',
        },
        status: 'active',
    },
    {
        id: 456,
        title: 'Product 1',
        status: 'active',
    },
    {
        id: 789,
        title: 'Product 3',
        status: 'draft',
    },
]

const mockCollections = [
    {
        external_id: '1',
        data: {
            title: 'Collection 1',
        },
    },
    {
        external_id: '2',
        data: {
            title: 'Collection 2',
        },
    },
    {
        external_id: '3',
        data: {
            title: 'Collection 3',
        },
    },
    {
        external_id: '4',
        data: {
            title: 'Collection 4',
        },
    },
]

describe('CollectionRecommendationRuleCard', () => {
    let queryClient: QueryClient
    const mockOnUpsert = jest.fn()

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()

        mockUseGetEcommerceProductCollections.mockReturnValue({
            data: {
                data: mockCollections,
                metadata: {
                    next_cursor: 'next',
                    prev_cursor: null,
                },
            },
            isLoading: false,
        })

        mockUsePaginatedProductsByIds.mockReturnValue({
            allProducts: mockProducts,
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

        mockUsePaginatedProductCollectionsByIds.mockReturnValue({
            allCollections: [
                { id: '1', title: 'Collection 1', productIds: [] },
                { id: '4', title: 'Collection 4', productIds: [] },
            ],
            collections: [
                { id: '1', title: 'Collection 1', productIds: [] },
                { id: '4', title: 'Collection 4', productIds: [] },
            ],
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

        mockOnUpsert.mockResolvedValue(undefined)
    })

    const renderComponent = (props = {}) => {
        const defaultProps = {
            type: 'promote' as const,
            integrationId: 123,
            rules: {
                promote: {
                    collectionIds: ['1', '4'],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
                exclude: {
                    collectionIds: ['3'],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
            },
            isLoadingRules: false,
            isFetchingRules: false,
            isUpserting: false,
            onUpsert: mockOnUpsert,
            ...props,
        }

        return render(
            <QueryClientProvider client={queryClient}>
                <CollectionRecommendationRuleCard {...defaultProps} />
            </QueryClientProvider>,
        )
    }

    it('should render promote type correctly', () => {
        const { getByText } = renderComponent({ type: 'promote' })

        expect(getByText('Promote collections')).toBeInTheDocument()
        expect(
            getByText('Choose collections to prioritize in recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should render exclude type correctly', () => {
        const { getByText } = renderComponent({
            type: 'exclude',
            rules: {
                exclude: {
                    collectionIds: ['1', '4'],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
                promote: {
                    collectionIds: [],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
            },
        })

        expect(getByText('Exclude collections')).toBeInTheDocument()
        expect(
            getByText('Choose collections to exclude from recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should show loading state when rules are loading', () => {
        const { getByText } = renderComponent({ isLoadingRules: true })

        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should display selected collections correctly', () => {
        const { getByText } = renderComponent()

        expect(getByText('Collection 1')).toBeInTheDocument()
        expect(getByText('Collection 4')).toBeInTheDocument()
    })

    it('should handle collection deletion', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Delete 1'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['4'])
        })
    })

    it('should open selection drawer when add button clicked', () => {
        const { getByText, queryByTestId } = renderComponent()

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()

        fireEvent.click(getByText('Select collections'))

        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()
        expect(getByText('Select collections to promote')).toBeInTheDocument()
    })

    it('should open see all drawer when see all clicked', () => {
        const { getByText, getAllByTestId } = renderComponent()

        fireEvent.click(getByText('See All'))

        const drawers = getAllByTestId('item-selection-drawer')
        expect(drawers).toHaveLength(1)
        expect(getByText('All promoted collections')).toBeInTheDocument()
    })

    it('should open collection products drawer when button is clicked', () => {
        const { getByText, getAllByTestId, queryByTestId } = renderComponent()

        fireEvent.click(getByText('Show 1 products'))

        const drawers = getAllByTestId('item-selection-drawer')
        expect(drawers).toHaveLength(1)
        expect(
            getByText('Products within collection: Collection 1'),
        ).toBeInTheDocument()

        fireEvent.click(getByText('Close'))

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()
    })

    it('should close selection drawer', () => {
        const { getByText, queryByTestId } = renderComponent()

        fireEvent.click(getByText('Select collections'))
        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()

        fireEvent.click(getByText('Close'))

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()
    })

    it('should handle collection selection submission', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select collections'))
        fireEvent.click(getByText('Submit'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['1', '4'])
        })
    })

    it('should only load collections when drawer is opened', () => {
        const { getByText } = renderComponent()

        expect(mockUseGetEcommerceProductCollections).toHaveBeenCalledWith(
            123,
            expect.any(Object),
            { enabled: false },
        )

        fireEvent.click(getByText('Select collections'))

        expect(mockUseGetEcommerceProductCollections).toHaveBeenCalledWith(
            123,
            expect.any(Object),
            { enabled: true },
        )
    })

    it('should handle empty collection list', () => {
        mockUsePaginatedProductCollectionsByIds.mockReturnValue({
            allCollections: [],
            collections: [],
            isLoading: false,
            isFetching: false,
            isError: false,
            currentPage: 1,
            totalPages: 1,
            fetchPage: jest.fn(),
            hasNextPage: false,
            hasPrevPage: false,
            searchTerm: '',
            setSearchTerm: jest.fn(),
        })

        const { getByText } = renderComponent({
            rules: {
                promote: {
                    collectionIds: [],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
                exclude: {
                    collectionIds: [],
                    productIds: [],
                    tags: [],
                    vendors: [],
                },
            },
        })

        expect(getByText('Total: 0')).toBeInTheDocument()
    })

    it('should show correct drawer titles for exclude type', () => {
        const { getByText } = renderComponent({ type: 'exclude' })

        fireEvent.click(getByText('Select collections'))
        expect(getByText('Select collections to exclude')).toBeInTheDocument()

        fireEvent.click(getByText('See All'))
        expect(getByText('All excluded collections')).toBeInTheDocument()
    })

    it('should handle pagination in selection drawer', () => {
        mockUseGetEcommerceProductCollections.mockReturnValue({
            data: {
                data: mockCollections,
                metadata: {
                    next_cursor: 'next_page',
                    prev_cursor: 'prev_page',
                },
            },
            isLoading: false,
        })

        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select collections'))
        expect(mockUseGetEcommerceProductCollections).toHaveBeenLastCalledWith(
            123,
            { limit: 25, cursor: null, value: undefined },
            { enabled: true },
        )

        fireEvent.click(getByText('Next'))
        expect(mockUseGetEcommerceProductCollections).toHaveBeenLastCalledWith(
            123,
            { limit: 25, cursor: 'next_page', value: undefined },
            { enabled: true },
        )

        fireEvent.click(getByText('Prev'))
        expect(mockUseGetEcommerceProductCollections).toHaveBeenLastCalledWith(
            123,
            { limit: 25, cursor: 'prev_page', value: undefined },
            { enabled: true },
        )
    })
})
