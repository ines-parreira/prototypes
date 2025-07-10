import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EmailItem, HandoverEmailDropdown } from '../HandoverEmailDropdown'

describe('HandoverEmailDropdown', () => {
    const mockEmailItems: EmailItem[] = [
        { id: 1, email: 'support@example.com', isDefault: true },
        { id: 2, email: 'sales@example.com' },
        { id: 3, email: 'hello@example.com' },
        { id: 4, email: 'disabled@example.com', isDisabled: true },
    ]

    const mockOnSelectionChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with placeholder when no email is selected', () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
            />,
        )

        expect(screen.getByText('Select an email address')).toBeInTheDocument()
    })

    it('should render with selected email when selectedId is provided', () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
                selectedId={1}
            />,
        )

        expect(screen.getByText('support@example.com')).toBeInTheDocument()
    })

    it('should open dropdown on click', async () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Wait for the dropdown to open
        await waitFor(() => {
            // Check if all email options are rendered
            expect(screen.getByText('support@example.com')).toBeInTheDocument()
            expect(screen.getByText('sales@example.com')).toBeInTheDocument()
            expect(screen.getByText('hello@example.com')).toBeInTheDocument()
            expect(screen.getByText('disabled@example.com')).toBeInTheDocument()
        })
    })

    it('should call onSelectionChange when an email is selected', async () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Click on an email option
        await waitFor(() => {
            fireEvent.click(screen.getByText('sales@example.com'))
        })

        // Check if onSelectionChange was called with the correct id
        expect(mockOnSelectionChange).toHaveBeenCalledWith(2)
    })

    it('should not allow selecting disabled emails', async () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Try to click on a disabled email option
        await waitFor(() => {
            fireEvent.click(screen.getByText('disabled@example.com'))
        })

        // Check that the dropdown still shows the placeholder, not the disabled email
        expect(screen.getByText('Select an email address')).toBeInTheDocument()
        expect(mockOnSelectionChange).not.toHaveBeenCalled()
    })

    it('should display error when provided', () => {
        const errorMessage = 'Please select an email address'
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
                hasError={true}
                error={errorMessage}
            />,
        )

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should be disabled when isDisabled is true', () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
                isDisabled={true}
            />,
        )

        // Try to open the dropdown by clicking
        fireEvent.click(screen.getByText('Select an email address'))

        // Check that onSelectionChange was not called
        expect(mockOnSelectionChange).not.toHaveBeenCalled()
    })

    it('should filter emails when searching', async () => {
        render(
            <HandoverEmailDropdown
                emailItems={mockEmailItems}
                onSelectionChange={mockOnSelectionChange}
            />,
        )

        // Click to open the dropdown
        fireEvent.click(screen.getByText('arrow_drop_down'))

        // Wait for dropdown to open and search input to be available
        await waitFor(() => {
            const searchInput = screen.getByRole('textbox')
            fireEvent.change(searchInput, { target: { value: 'sales' } })
        })

        // Check if only the matching email is displayed
        await waitFor(() => {
            expect(screen.getByText('sales')).toBeInTheDocument()
            expect(screen.queryByText('support')).not.toBeInTheDocument()
            expect(screen.queryByText('hello')).not.toBeInTheDocument()
        })
    })
})
