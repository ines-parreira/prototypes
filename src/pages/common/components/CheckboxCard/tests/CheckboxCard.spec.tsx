import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CheckboxCard from '../CheckboxCard'

describe('CheckboxCard', () => {
    const defaultProps = {
        icon: 'star',
        title: 'Test Title',
        description: 'Test Description',
        checked: false,
        onChange: jest.fn(),
        onClick: jest.fn(),
        onKeyDown: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render correctly with default props', () => {
        render(<CheckboxCard {...defaultProps} />)

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('star')).toBeInTheDocument()
        expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('should render checked state correctly', () => {
        render(<CheckboxCard {...defaultProps} checked={true} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
        expect(screen.getByText('check_circle')).toBeInTheDocument()
    })

    it('should call onChange when checkbox is clicked', async () => {
        render(<CheckboxCard {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await userEvent.click(checkbox)

        expect(defaultProps.onChange).toHaveBeenCalled()
    })

    it('should call onClick when card is clicked', async () => {
        render(<CheckboxCard {...defaultProps} />)

        const card = screen.getByLabelText('Test Title: Test Description')
        await userEvent.click(card)

        expect(defaultProps.onClick).toHaveBeenCalled()
    })

    it('should call onKeyDown when keyboard event occurs', async () => {
        render(<CheckboxCard {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await userEvent.type(checkbox, '{enter}')

        expect(defaultProps.onKeyDown).toHaveBeenCalled()
    })

    it('should apply custom className when provided', () => {
        const customClass = 'custom-class'
        render(<CheckboxCard {...defaultProps} className={customClass} />)

        expect(screen.getByRole('checkbox').parentElement).toHaveClass(
            customClass,
        )
    })

    it('should handle keyboard navigation correctly', async () => {
        render(<CheckboxCard {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        await userEvent.tab()
        expect(checkbox).toHaveFocus()

        await userEvent.type(checkbox, '{enter}')
        expect(defaultProps.onKeyDown).toHaveBeenCalled()
    })

    it('should maintain accessibility attributes', () => {
        render(<CheckboxCard {...defaultProps} />)

        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toHaveAttribute(
            'aria-label',
            'Test Title: Test Description',
        )
    })

    it('should handle undefined event handlers gracefully', () => {
        const propsWithoutHandlers = {
            icon: 'star',
            title: 'Test Title',
            description: 'Test Description',
        }

        render(<CheckboxCard {...propsWithoutHandlers} />)
        const checkbox = screen.getByRole('checkbox')

        // Should not throw when clicking without handlers
        expect(() => fireEvent.click(checkbox)).not.toThrow()
    })
})
