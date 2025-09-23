import { configureStore } from '@reduxjs/toolkit'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import * as productRecommendationErrors from '../../types/productRecommendationErrors'
import * as formatConflictMessageModule from '../../utils/formatConflictMessage'
import { RecommendationRuleCard } from '../RecommendationRuleCard'

const mockOnAddButtonClick = jest.fn()
const mockOnDelete = jest.fn()
const mockOnSeeAllClick = jest.fn()
const mockDispatch: jest.Mock = jest.fn((action: any) => {
    if (typeof action === 'function') {
        const mockGetState = () => ({ notifications: [] })
        return action(mockDispatch, mockGetState)
    }
    return action
})

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))

const createMockStore = () => {
    return configureStore({
        reducer: {
            notifications: (state = {}) => state,
        },
    })
}

const renderComponent = (
    options: {
        title?: string
        description?: string
        isLoading?: boolean
        disableActions?: boolean
        hasImages?: boolean
        itemLabelSingular?: string
        itemLabelPlural?: string
        items?: Array<{
            id: string
            title: string
            img?: string
            status?: string
        }>
    } = {},
) => {
    const {
        title = 'Exclude products',
        description = 'Choose products to exclude from recommendations.',
        isLoading = false,
        disableActions = false,
        hasImages = true,
        itemLabelSingular = 'product',
        itemLabelPlural = 'products',
        items = [
            { id: '1', title: 'Test product 1', img: 'my-image-1-url' },
            { id: '2', title: 'Test product 2', img: 'my-image-2-url' },
            { id: '3', title: 'Test product 3' },
            { id: '4', title: 'Test product 4' },
            { id: '5', title: 'Test product 5' },
            { id: '6', title: 'Test product 6' },
            { id: '7', title: 'Test product 7' },
            { id: '8', title: 'Test product 8' },
        ],
    } = options

    const store = createMockStore()

    return render(
        <Provider store={store}>
            <RecommendationRuleCard
                title={title}
                description={description}
                isLoading={isLoading}
                disableActions={disableActions}
                hasImages={hasImages}
                badge={{ label: 'Excluded', type: 'light-error' }}
                type="exclude"
                addButton={{
                    label: 'Select products',
                    onClick: mockOnAddButtonClick,
                }}
                itemLabelSingular={itemLabelSingular}
                itemLabelPlural={itemLabelPlural}
                totalItems={items.length}
                items={items}
                onDelete={mockOnDelete}
                onSeeAllClick={mockOnSeeAllClick}
                ruleType="product"
            />
        </Provider>,
    )
}

describe('RecommendationRuleCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockOnDelete.mockResolvedValue(undefined)
        jest.spyOn(
            productRecommendationErrors,
            'isProductRecommendationConflictError',
        ).mockReturnValue(false)
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(screen.queryByText('Exclude products')).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Choose products to exclude from recommendations.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('8 products')).toBeInTheDocument()

        const badges = screen.getAllByText('Excluded')
        expect(badges).toHaveLength(4)

        const button = screen.getByRole('button', { name: 'Select products' })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('aria-disabled', 'false')

        const skeletons = screen.container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )

        expect(skeletons.length).toBe(0)
    })

    it('should display items count with singular label when one item', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Test product 1', img: 'my-image-1-url' },
            ],
        })

        expect(screen.queryByText('1 product')).toBeInTheDocument()
    })

    it('should render the loading state correctly', () => {
        const screen = renderComponent({ isLoading: true })

        expect(screen.queryByText('Exclude products')).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Choose products to exclude from recommendations.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('8 products')).not.toBeInTheDocument()

        const button = screen.getByRole('button', { name: 'Select products' })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('aria-disabled', 'true')

        const skeletons = screen.container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )

        expect(skeletons.length).toBe(2)
    })

    it('should render all items correctly', () => {
        const screen = renderComponent()

        expect(screen.queryByText('Test product 1')).toBeInTheDocument()
        expect(screen.queryByText('Test product 2')).toBeInTheDocument()
        expect(screen.queryByText('Test product 3')).toBeInTheDocument()
        expect(screen.queryByText('Test product 4')).toBeInTheDocument()
        expect(screen.queryByText('Test product 5')).not.toBeInTheDocument()
        expect(screen.queryByText('Test product 6')).not.toBeInTheDocument()
        expect(screen.queryByText('Test product 7')).not.toBeInTheDocument()
        expect(screen.queryByText('Test product 8')).not.toBeInTheDocument()

        expect(
            screen.container.querySelectorAll('[data-testid="item-image"]')
                .length,
        ).toBe(2)
        expect(
            screen.container.querySelectorAll(
                '[data-testid="item-image-placeholder"]',
            ).length,
        ).toBe(2)
    })

    it('should not render images when hasImages is false', () => {
        const screen = renderComponent({ hasImages: false })

        expect(
            screen.container.querySelectorAll('[data-testid="item-image"]')
                .length,
        ).toBe(0)
        expect(
            screen.container.querySelectorAll(
                '[data-testid="item-image-placeholder"]',
            ).length,
        ).toBe(0)
    })

    it('should handle clicks on add button correctly', () => {
        const screen = renderComponent()

        const button = screen.getByRole('button', { name: 'Select products' })
        fireEvent.click(button)

        expect(mockOnAddButtonClick).toHaveBeenCalledTimes(1)
    })

    it('should handle clicks on remove button correctly', () => {
        const screen = renderComponent()

        expect(
            screen.getAllByRole('button', { name: 'Remove product' }),
        ).toHaveLength(4)
        expect(screen.queryAllByText('Loading...')).toHaveLength(0)

        const button1 = screen.getAllByRole('button', {
            name: 'Remove product',
        })[2]
        fireEvent.click(button1)

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
        expect(mockOnDelete).toHaveBeenCalledWith('3')

        const button2 = screen.getAllByRole('button', {
            name: 'Remove product',
        })[2]
        fireEvent.click(button2)

        expect(mockOnDelete).toHaveBeenCalledTimes(2)
        expect(mockOnDelete).toHaveBeenCalledWith('4')

        expect(
            screen.getAllByRole('button', { name: 'Remove product' }),
        ).toHaveLength(3)
        expect(screen.queryAllByText('Loading...')).toHaveLength(1)
    })

    it('should render draft badges for products with draft status', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Active product', status: 'active' },
                { id: '2', title: 'Draft product', status: 'draft' },
                { id: '3', title: 'Another draft product', status: 'draft' },
                { id: '4', title: 'Published product', status: 'published' },
            ],
        })

        const draftBadges = screen.getAllByText('Draft')
        expect(draftBadges).toHaveLength(2)

        const excludedBadges = screen.getAllByText('Excluded')
        expect(excludedBadges).toHaveLength(2)

        expect(screen.getByText('Active product')).toBeInTheDocument()
        expect(screen.getByText('Draft product')).toBeInTheDocument()
        expect(screen.getByText('Another draft product')).toBeInTheDocument()
        expect(screen.getByText('Published product')).toBeInTheDocument()
    })

    it('should show draft badge for exclude type', () => {
        const screen = renderComponent({
            items: [{ id: '1', title: 'Draft product', status: 'draft' }],
        })

        const draftBadge = screen.getByText('Draft')
        expect(draftBadge).toBeInTheDocument()
    })

    it('should show draft badge for promote type', () => {
        const screen = renderComponent({
            items: [{ id: '1', title: 'Draft product', status: 'draft' }],
        })

        const draftBadge = screen.getByText('Draft')
        expect(draftBadge).toBeInTheDocument()
    })

    it('should not render draft badges for products without draft status', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Active product', status: 'active' },
                { id: '2', title: 'Published product', status: 'published' },
                { id: '3', title: 'No status product' },
            ],
        })

        const draftBadges = screen.queryAllByText('Draft')
        expect(draftBadges).toHaveLength(0)

        const excludedBadges = screen.getAllByText('Excluded')
        expect(excludedBadges).toHaveLength(3)
    })

    it('should handle mixed status products correctly', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Draft product 1', status: 'draft' },
                { id: '2', title: 'Active product', status: 'active' },
                { id: '3', title: 'Draft product 2', status: 'draft' },
                { id: '4', title: 'No status product' },
            ],
        })

        const draftBadges = screen.getAllByText('Draft')
        expect(draftBadges).toHaveLength(2)

        const excludedBadges = screen.getAllByText('Excluded')
        expect(excludedBadges).toHaveLength(2)

        expect(screen.getByText('Draft product 1')).toBeInTheDocument()
        expect(screen.getByText('Active product')).toBeInTheDocument()
        expect(screen.getByText('Draft product 2')).toBeInTheDocument()
        expect(screen.getByText('No status product')).toBeInTheDocument()
    })

    it('should handle deletion errors with generic message', async () => {
        const error = new Error('Network error')
        mockOnDelete.mockRejectedValue(error)

        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
            ],
        })

        const removeButton = screen.getAllByRole('button', {
            name: 'Remove product',
        })[0]

        await act(async () => {
            fireEvent.click(removeButton)
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith('1')
            expect(mockDispatch).toHaveBeenCalled()
        })

        const thunkCalls = mockDispatch.mock.calls.filter(
            (call: any[]) => typeof call[0] === 'function',
        )
        expect(thunkCalls.length).toBeGreaterThan(0)
    })

    it('should handle conflict errors with formatted message', async () => {
        const conflictError = {
            response: {
                data: {
                    error: {
                        code: 'CONFLICT',
                        details: { conflicts: ['Product A', 'Product B'] },
                    },
                },
            },
        }

        jest.spyOn(
            productRecommendationErrors,
            'isProductRecommendationConflictError',
        ).mockReturnValue(true)
        jest.spyOn(
            formatConflictMessageModule,
            'formatConflictMessage',
        ).mockReturnValue('Products A and B are already in another rule')

        mockOnDelete.mockRejectedValue(conflictError)

        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
            ],
        })

        const removeButton = screen.getAllByRole('button', {
            name: 'Remove product',
        })[0]

        await act(async () => {
            fireEvent.click(removeButton)
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith('1')
            expect(mockDispatch).toHaveBeenCalled()
        })

        expect(
            formatConflictMessageModule.formatConflictMessage,
        ).toHaveBeenCalledWith(conflictError.response.data, 'product')

        const thunkCalls = mockDispatch.mock.calls.filter(
            (call: any[]) => typeof call[0] === 'function',
        )
        expect(thunkCalls.length).toBeGreaterThan(0)
    })

    it('should reset deletingItemId after successful deletion', async () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
            ],
        })

        const removeButtons = screen.getAllByRole('button', {
            name: 'Remove product',
        })

        await act(async () => {
            fireEvent.click(removeButtons[0])
        })

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith('1')
        })

        await waitFor(() => {
            expect(
                screen.getAllByRole('button', { name: 'Remove product' }),
            ).toHaveLength(2)
        })
    })

    it('should reset deletingItemId after failed deletion', async () => {
        mockOnDelete.mockRejectedValue(new Error('Delete failed'))

        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
            ],
        })

        const removeButtons = screen.getAllByRole('button', {
            name: 'Remove product',
        })

        await act(async () => {
            fireEvent.click(removeButtons[0])
        })

        await waitFor(() => {
            expect(mockOnDelete).toHaveBeenCalledWith('1')
        })

        await waitFor(() => {
            expect(
                screen.getAllByRole('button', { name: 'Remove product' }),
            ).toHaveLength(2)
        })
    })

    it('should render See All button with correct text and aria-label when more than 4 items', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
                { id: '3', title: 'Product 3' },
                { id: '4', title: 'Product 4' },
                { id: '5', title: 'Product 5' },
            ],
            itemLabelSingular: 'product',
            itemLabelPlural: 'products',
        })

        const seeAllButton = screen.getByRole('button', {
            name: 'See All Excluded Products',
        })
        expect(seeAllButton).toBeInTheDocument()
        expect(seeAllButton).toHaveTextContent('See All Excluded Products')
    })

    it('should not render See All button when 4 or fewer items', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
                { id: '3', title: 'Product 3' },
                { id: '4', title: 'Product 4' },
            ],
        })

        const seeAllButton = screen.queryByRole('button', {
            name: 'See All Excluded Products',
        })
        expect(seeAllButton).not.toBeInTheDocument()
    })

    it('should handle click on See All button', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Product 1' },
                { id: '2', title: 'Product 2' },
                { id: '3', title: 'Product 3' },
                { id: '4', title: 'Product 4' },
                { id: '5', title: 'Product 5' },
            ],
        })

        const seeAllButton = screen.getByRole('button', {
            name: 'See All Excluded Products',
        })
        fireEvent.click(seeAllButton)

        expect(mockOnSeeAllClick).toHaveBeenCalledTimes(1)
    })

    it('should render See All button with custom item label', () => {
        const screen = renderComponent({
            items: [
                { id: '1', title: 'Tag 1' },
                { id: '2', title: 'Tag 2' },
                { id: '3', title: 'Tag 3' },
                { id: '4', title: 'Tag 4' },
                { id: '5', title: 'Tag 5' },
            ],
            itemLabelSingular: 'tag',
            itemLabelPlural: 'tags',
        })

        const seeAllButton = screen.getByRole('button', {
            name: 'See All Excluded Tags',
        })
        expect(seeAllButton).toBeInTheDocument()
        expect(seeAllButton).toHaveTextContent('See All Excluded Tags')
    })

    it('should render See All button with Promoted text for promote type', () => {
        const store = createMockStore()
        const { getByRole } = render(
            <Provider store={store}>
                <RecommendationRuleCard
                    totalItems={5}
                    title="Promote products"
                    description="Choose products to prioritize in recommendations."
                    isLoading={false}
                    disableActions={false}
                    hasImages={true}
                    badge={{ label: '★ Promoted', type: 'light-success' }}
                    type="promote"
                    addButton={{
                        label: 'Select products',
                        onClick: mockOnAddButtonClick,
                    }}
                    itemLabelSingular="product"
                    itemLabelPlural="products"
                    items={[
                        { id: '1', title: 'Product 1' },
                        { id: '2', title: 'Product 2' },
                        { id: '3', title: 'Product 3' },
                        { id: '4', title: 'Product 4' },
                        { id: '5', title: 'Product 5' },
                    ]}
                    onDelete={mockOnDelete}
                    onSeeAllClick={mockOnSeeAllClick}
                    ruleType="product"
                />
            </Provider>,
        )

        const seeAllButton = getByRole('button', {
            name: 'See All Promoted Products',
        })
        expect(seeAllButton).toBeInTheDocument()
        expect(seeAllButton).toHaveTextContent('See All Promoted Products')
    })
})
