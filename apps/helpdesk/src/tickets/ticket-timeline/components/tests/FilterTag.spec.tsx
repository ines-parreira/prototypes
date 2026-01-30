import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { FilterTag } from '../FilterTag'

const mockOnRemove = jest.fn()
const mockOnSelect = jest.fn()
const mockOnOpenChange = jest.fn()

type TestItem = { id: string; label: string }

const defaultItems: TestItem[] = [
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' },
]

const defaultSections = [
    {
        id: 'section1',
        name: 'Section 1',
        items: [
            { id: 'item1', label: 'Item 1' },
            { id: 'item2', label: 'Item 2' },
        ],
    },
]

const renderComponent = (props = {}) => {
    return renderWithStoreAndQueryClientProvider(
        <FilterTag label="Test Filter" onRemove={mockOnRemove} {...props} />,
    )
}

describe('FilterTag', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Simple tag without dropdown', () => {
        it('should render a simple tag when no items or sections are provided', () => {
            renderComponent()
            expect(screen.getByText('Test Filter')).toBeInTheDocument()
        })

        it('should call onRemove when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const closeButton = screen.getByRole('button', { name: /close/i })
            await user.click(closeButton)

            expect(mockOnRemove).toHaveBeenCalledTimes(1)
        })
    })

    describe('Tag with dropdown', () => {
        it('should show "Select an option" when no items are selected', () => {
            renderComponent({
                items: defaultItems,
                selectedItems: [],
                onSelect: mockOnSelect,
            })

            expect(screen.getByText('Select an option')).toBeInTheDocument()
        })

        it('should render with flat items and handle dropdown state', async () => {
            const user = userEvent.setup()
            renderComponent({
                items: defaultItems,
                selectedItems: [defaultItems[0]],
                onSelect: mockOnSelect,
                isOpen: false,
                onOpenChange: mockOnOpenChange,
            })

            const tag = screen.getByText('Test Filter')
            await user.click(tag)

            expect(mockOnOpenChange).toHaveBeenCalledWith(true)
        })

        it('should render with sections', () => {
            renderComponent({
                sections: defaultSections,
                selectedItems: [defaultSections[0].items[0]],
                onSelect: mockOnSelect,
            })

            expect(screen.getByText('Test Filter')).toBeInTheDocument()
        })
    })
})
