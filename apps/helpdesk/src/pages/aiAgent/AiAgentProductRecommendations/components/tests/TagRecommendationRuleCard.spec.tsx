import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TagRecommendationRuleCard } from '../TagRecommendationRuleCard'

jest.mock('models/ecommerce/queries', () => ({
    useGetEcommerceLookupValues: jest.fn(),
}))

jest.mock('../../hooks/usePaginatedItems', () => ({
    usePaginatedItems: jest.fn(),
}))

jest.mock('../ItemSelectionDrawer', () => ({
    ItemSelectionDrawer: ({ isOpen, onClose, onSubmit, title }: any) => {
        if (!isOpen) return null
        return (
            <div data-testid="item-selection-drawer">
                <div>{title}</div>
                <button onClick={() => onSubmit(['tag1', 'tag2', 'tag3'])}>
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
            <button onClick={addButton.onClick}>Select tags</button>
            <button onClick={onSeeAllClick}>See All</button>
        </div>
    ),
}))

const mockUseGetEcommerceLookupValues = jest.requireMock(
    'models/ecommerce/queries',
).useGetEcommerceLookupValues
const mockUsePaginatedItems = jest.requireMock(
    '../../hooks/usePaginatedItems',
).usePaginatedItems

describe('TagRecommendationRuleCard', () => {
    let queryClient: QueryClient
    const mockOnUpsert = jest.fn()

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()

        mockUseGetEcommerceLookupValues.mockReturnValue({
            data: {
                data: [
                    { value: 'summer' },
                    { value: 'winter' },
                    { value: 'sale' },
                ],
                metadata: {
                    next_cursor: 'next',
                    prev_cursor: null,
                },
            },
            isLoading: false,
        })

        mockUsePaginatedItems.mockReturnValue({
            paginatedItems: [
                { id: 'summer', title: 'summer' },
                { id: 'winter', title: 'winter' },
            ],
            pagination: {
                hasNextPage: false,
                hasPrevPage: false,
                onNextClick: jest.fn(),
                onPrevClick: jest.fn(),
            },
            setSearch: jest.fn(),
            resetPagination: jest.fn(),
        })

        mockOnUpsert.mockResolvedValue(undefined)
    })

    const renderComponent = (props = {}) => {
        const defaultProps = {
            type: 'promote' as const,
            integrationId: 123,
            tags: ['summer', 'winter'],
            isLoadingRules: false,
            isFetchingRules: false,
            isUpserting: false,
            onUpsert: mockOnUpsert,
            ...props,
        }

        return render(
            <QueryClientProvider client={queryClient}>
                <TagRecommendationRuleCard {...defaultProps} />
            </QueryClientProvider>,
        )
    }

    it('should render promote type correctly', () => {
        const { getByText } = renderComponent({ type: 'promote' })

        expect(getByText('Promote tags')).toBeInTheDocument()
        expect(
            getByText('Choose tags to prioritize in recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should render exclude type correctly', () => {
        const { getByText } = renderComponent({ type: 'exclude' })

        expect(getByText('Exclude tags')).toBeInTheDocument()
        expect(
            getByText('Choose tags to exclude from recommendations.'),
        ).toBeInTheDocument()
        expect(getByText('Total: 2')).toBeInTheDocument()
    })

    it('should show loading state when rules are loading', () => {
        const { getByText } = renderComponent({ isLoadingRules: true })

        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should display selected tags correctly', () => {
        const { getByText } = renderComponent()

        expect(getByText('summer')).toBeInTheDocument()
        expect(getByText('winter')).toBeInTheDocument()
    })

    it('should handle tag deletion', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Delete summer'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['winter'])
        })
    })

    it('should open selection drawer when add button clicked', () => {
        const { getByText, queryByTestId } = renderComponent()

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()

        fireEvent.click(getByText('Select tags'))

        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()
        expect(getByText('Select tags to promote')).toBeInTheDocument()
    })

    it('should open see all drawer when see all clicked', () => {
        const { getByText, getAllByTestId } = renderComponent()

        fireEvent.click(getByText('See All'))

        const drawers = getAllByTestId('item-selection-drawer')
        expect(drawers).toHaveLength(1)
        expect(getByText('All promoted tags')).toBeInTheDocument()
    })

    it('should close selection drawer', () => {
        const { getByText, queryByTestId } = renderComponent()

        fireEvent.click(getByText('Select tags'))
        expect(queryByTestId('item-selection-drawer')).toBeInTheDocument()

        fireEvent.click(getByText('Close'))

        expect(queryByTestId('item-selection-drawer')).not.toBeInTheDocument()
    })

    it('should handle tag selection submission', async () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select tags'))
        fireEvent.click(getByText('Submit'))

        await waitFor(() => {
            expect(mockOnUpsert).toHaveBeenCalledWith(['tag1', 'tag2', 'tag3'])
        })
    })

    it('should only load tags when drawer is opened', () => {
        const { getByText } = renderComponent()

        expect(mockUseGetEcommerceLookupValues).toHaveBeenCalledWith(
            'product_tag',
            123,
            expect.any(Object),
            { enabled: false },
        )

        fireEvent.click(getByText('Select tags'))

        expect(mockUseGetEcommerceLookupValues).toHaveBeenCalledWith(
            'product_tag',
            123,
            expect.any(Object),
            { enabled: true },
        )
    })

    it('should handle empty tag list', () => {
        mockUsePaginatedItems.mockReturnValue({
            paginatedItems: [],
            pagination: {
                hasNextPage: false,
                hasPrevPage: false,
                onNextClick: jest.fn(),
                onPrevClick: jest.fn(),
            },
            setSearch: jest.fn(),
            resetPagination: jest.fn(),
        })

        const { getByText } = renderComponent({ tags: [] })

        expect(getByText('Total: 0')).toBeInTheDocument()
    })

    it('should show correct drawer titles for exclude type', () => {
        const { getByText } = renderComponent({ type: 'exclude' })

        fireEvent.click(getByText('Select tags'))
        expect(getByText('Select tags to exclude')).toBeInTheDocument()

        fireEvent.click(getByText('See All'))
        expect(getByText('All excluded tags')).toBeInTheDocument()
    })

    it('should handle pagination in selection drawer', () => {
        mockUseGetEcommerceLookupValues.mockReturnValue({
            data: {
                data: [{ value: 'summer' }, { value: 'winter' }],
                metadata: {
                    next_cursor: 'next_page',
                    prev_cursor: 'prev_page',
                },
            },
            isLoading: false,
        })

        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select tags'))

        expect(mockUseGetEcommerceLookupValues).toHaveBeenCalled()
    })

    it('should handle search in selection drawer', () => {
        const { getByText } = renderComponent()

        fireEvent.click(getByText('Select tags'))

        expect(mockUseGetEcommerceLookupValues).toHaveBeenCalledWith(
            'product_tag',
            123,
            expect.any(Object),
            expect.any(Object),
        )
    })

    it('should reset pagination when see all drawer closes', () => {
        const mockResetPagination = jest.fn()
        mockUsePaginatedItems.mockReturnValue({
            paginatedItems: [{ id: 'summer', title: 'summer' }],
            pagination: {
                hasNextPage: false,
                hasPrevPage: false,
                onNextClick: jest.fn(),
                onPrevClick: jest.fn(),
            },
            setSearch: jest.fn(),
            resetPagination: mockResetPagination,
        })

        const { getByText } = renderComponent()

        fireEvent.click(getByText('See All'))
        fireEvent.click(getByText('Close'))

        expect(mockResetPagination).toHaveBeenCalled()
    })
})
