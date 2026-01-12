import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InUseByAIFilter } from '../InUseByAIFilter'

describe('InUseByAIFilter', () => {
    const mockOnChange = jest.fn()
    const mockOnClear = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        mockOnClear.mockClear()
    })

    it('renders FilterButton with "True" when value is true', () => {
        render(
            <InUseByAIFilter
                value={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
        expect(screen.getByText('True')).toBeInTheDocument()
    })

    it('renders FilterButton with "False" when value is false', () => {
        render(
            <InUseByAIFilter
                value={false}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
        expect(screen.getByText('False')).toBeInTheDocument()
    })

    it('auto-opens dropdown when value is null', () => {
        render(
            <InUseByAIFilter
                value={null}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        const dropdownItems = screen.getAllByText(/^(True|False)$/)
        expect(dropdownItems).toHaveLength(2)
    })

    it('opens dropdown when FilterButton is clicked with existing value', async () => {
        render(
            <InUseByAIFilter
                value={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        const filterButton = screen.getByText('In use by AI Agent')
        await act(() => userEvent.click(filterButton))

        const dropdownItems = screen.getAllByRole('option')
        expect(dropdownItems).toHaveLength(2)
    })

    it('calls onChange with true when "True" option is clicked', async () => {
        render(
            <InUseByAIFilter
                value={null}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        const dropdownItems = screen.getAllByText(/^True$/)
        const trueOption = dropdownItems[dropdownItems.length - 1]
        await act(() => userEvent.click(trueOption))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with false when "False" option is clicked', async () => {
        render(
            <InUseByAIFilter
                value={null}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        const falseOption = screen.getByText(/^False$/)
        await act(() => userEvent.click(falseOption))

        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(false)
    })

    it('calls onClear when clear button is clicked', async () => {
        render(
            <InUseByAIFilter
                value={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        const clearButton = screen.getByLabelText(/close/i)
        await act(() => userEvent.click(clearButton))

        expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('shows clear button when value is true', () => {
        render(
            <InUseByAIFilter
                value={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
    })

    it('shows clear button when value is false', () => {
        render(
            <InUseByAIFilter
                value={false}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
    })
})
