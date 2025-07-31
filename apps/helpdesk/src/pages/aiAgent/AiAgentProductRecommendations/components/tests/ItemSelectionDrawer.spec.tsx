import { fireEvent, render } from '@testing-library/react'

import { ItemSelectionDrawer } from '../ItemSelectionDrawer'

const mockChatContainer = document.createElement('div')
mockChatContainer.id = 'gorgias-chat-container'
jest.spyOn(document, 'getElementById').mockImplementation((id) => {
    if (id === 'gorgias-chat-container') {
        return mockChatContainer
    }
    return null
})

const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
const mockOnClose = jest.fn()
const mockSetSearchTerm = jest.fn()
const mockFetchNext = jest.fn()
const mockFetchPrev = jest.fn()

const renderComponent = (
    options: {
        isOpen?: boolean
        isLoading?: boolean
        hasImages?: boolean
        title?: string
        selectedItemIds?: string[]
        itemLabelPlural?: string
        items?: Array<{
            id: string
            title: string
            img?: string
        }>
        hasNextPage?: boolean
        hasPrevPage?: boolean
    } = {},
) => {
    const {
        isOpen = true,
        isLoading = false,
        hasImages = true,
        title = 'Add products',
        selectedItemIds = [],
        itemLabelPlural = 'products',
        items = [
            {
                id: '1',
                title: 'Test product 1',
                img: 'my-image-1-url',
            },
            {
                id: '2',
                title: 'Test product 2',
                img: 'my-image-2-url',
            },
            { id: '3', title: 'Test product 3' },
            { id: '4', title: 'Test product 4' },
            { id: '5', title: 'Test product 5' },
            { id: '6', title: 'Test product 6' },
            { id: '7', title: 'Test product 7' },
            { id: '8', title: 'Test product 8' },
        ],
        hasNextPage = false,
        hasPrevPage = false,
    } = options

    return render(
        <ItemSelectionDrawer
            isOpen={isOpen}
            isLoading={isLoading}
            hasImages={hasImages}
            title={title}
            selectedItemIds={selectedItemIds}
            itemLabelPlural={itemLabelPlural}
            items={items}
            pagination={{
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                onNextClick: mockFetchNext,
                onPrevClick: mockFetchPrev,
            }}
            onClose={mockOnClose}
            onSubmit={mockOnSubmit}
            onSearch={mockSetSearchTerm}
        />,
    )
}

describe('ItemSelectionDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly when visible', () => {
        const screen = renderComponent()

        expect(screen.queryByText('Add products')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Search products'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Test product 1')).toBeInTheDocument()
        expect(screen.queryByText('Test product 2')).toBeInTheDocument()
        expect(screen.queryByText('Test product 3')).toBeInTheDocument()
        expect(screen.queryByText('Test product 4')).toBeInTheDocument()
        expect(screen.queryByText('Test product 5')).toBeInTheDocument()
        expect(screen.queryByText('Test product 6')).toBeInTheDocument()
        expect(screen.queryByText('Test product 7')).toBeInTheDocument()
        expect(screen.queryByText('Test product 8')).toBeInTheDocument()

        expect(screen.queryByText('No products found')).not.toBeInTheDocument()
    })

    it('should show loading spinner when loading', () => {
        const screen = renderComponent({
            isLoading: true,
        })

        expect(screen.queryByText('Add products')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Search products'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Test product 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Loading...')).toBeInTheDocument()
    })

    it('should submit the selected items', () => {
        const screen = renderComponent()

        fireEvent.click(screen.getByText('Test product 3'))
        fireEvent.click(screen.getByText('Test product 6'))
        fireEvent.click(screen.getByText('Test product 8'))
        fireEvent.click(screen.getByText('Done'))

        expect(mockOnSubmit).toHaveBeenCalledWith(['3', '6', '8'])
    })

    it('should correctly update the selected items', () => {
        const screen = renderComponent({
            selectedItemIds: ['2', '5', '6'],
        })

        fireEvent.click(screen.getByText('Test product 1'))
        fireEvent.click(screen.getByText('Test product 2'))
        fireEvent.click(screen.getByText('Test product 5'))
        fireEvent.click(screen.getByText('Test product 8'))
        fireEvent.click(screen.getByText('Done'))

        expect(mockOnSubmit).toHaveBeenCalledWith(['6', '1', '8'])
    })

    it('should close the drawer when the cancel button is clicked', () => {
        const screen = renderComponent()

        fireEvent.click(screen.getByText('Cancel'))

        expect(mockOnClose).toHaveBeenCalled()
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should close the drawer when escape clicked', () => {
        const screen = renderComponent()

        fireEvent.keyDown(screen.baseElement, { key: 'Escape' })

        expect(mockOnClose).toHaveBeenCalled()
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should handle search correctly', () => {
        jest.useFakeTimers()

        const screen = renderComponent()
        fireEvent.change(screen.getByPlaceholderText('Search products'), {
            target: { value: 'Test product 1' },
        })
        expect(mockSetSearchTerm).not.toHaveBeenCalled()

        // Advance timers by 200ms to trigger the debounced effect
        jest.advanceTimersByTime(200)
        expect(mockSetSearchTerm).toHaveBeenCalledWith('Test product 1')
        jest.useRealTimers()
    })

    it('should handle pagination correctly', () => {
        const screen = renderComponent({
            hasNextPage: true,
            hasPrevPage: true,
        })

        fireEvent.click(screen.getByLabelText('Next page'))
        expect(mockFetchNext).toHaveBeenCalled()

        fireEvent.click(screen.getByLabelText('Previous page'))
        expect(mockFetchPrev).toHaveBeenCalled()
    })

    it('should handle no items found correctly', () => {
        const screen = renderComponent({
            items: [],
        })

        expect(screen.queryByText('No products found')).toBeInTheDocument()
    })

    it('should hide chat container when drawer is open', () => {
        renderComponent({ isOpen: true })

        expect(mockChatContainer.style.display).toBe('none')
    })

    it('should show chat container when drawer is closed', () => {
        renderComponent({ isOpen: false })

        expect(mockChatContainer.style.display).toBe('')
    })

    it('should restore chat container visibility when component unmounts', () => {
        const { unmount } = renderComponent({ isOpen: true })

        expect(mockChatContainer.style.display).toBe('none')
        unmount()
        expect(mockChatContainer.style.display).toBe('')
    })
})
