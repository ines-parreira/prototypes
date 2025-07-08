import { fireEvent, render, screen } from '@testing-library/react'

import { AddMissingKnowledgeCheckbox } from '../AddMissingKnowledgeCheckbox'

const renderComponent = ({
    isChecked = false,
    onChange = jest.fn(),
}: {
    isChecked?: boolean
    onChange?: (checked: boolean) => void
} = {}) => {
    return render(
        <AddMissingKnowledgeCheckbox
            isChecked={isChecked}
            onChange={onChange}
        />,
    )
}

describe('AddMissingKnowledgeCheckbox', () => {
    const mockOnChange = jest.fn()
    const checkboxLabel = 'Use in similar requests'

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    describe('when initially rendered', () => {
        it('displays the checkbox with correct label', () => {
            renderComponent()

            expect(screen.getByText(checkboxLabel)).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeInTheDocument()
        })
    })

    describe('when isChecked is false', () => {
        it('renders the checkbox as unchecked', () => {
            renderComponent({ isChecked: false })

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()
        })
    })

    describe('when isChecked is true', () => {
        it('renders the checkbox as checked', () => {
            renderComponent({ isChecked: true })

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeChecked()
        })
    })

    describe('when checkbox is clicked', () => {
        it('calls onChange with true when unchecked checkbox is clicked', () => {
            renderComponent({ isChecked: false, onChange: mockOnChange })

            const checkbox = screen.getByRole('checkbox')
            fireEvent.click(checkbox)

            expect(mockOnChange).toHaveBeenCalledTimes(1)
            expect(mockOnChange).toHaveBeenCalledWith(true)
        })

        it('calls onChange with false when checked checkbox is clicked', () => {
            renderComponent({ isChecked: true, onChange: mockOnChange })

            const checkbox = screen.getByRole('checkbox')
            fireEvent.click(checkbox)

            expect(mockOnChange).toHaveBeenCalledTimes(1)
            expect(mockOnChange).toHaveBeenCalledWith(false)
        })
    })
})
