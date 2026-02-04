import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { PlaygroundSegmentControl } from './PlaygroundSegmentControl'

describe('PlaygroundSegmentControl', () => {
    const mockSegments = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ]

    const defaultProps = {
        selectedValue: 'option1',
        onValueChange: jest.fn(),
        segments: mockSegments,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render all segment options', () => {
        render(<PlaygroundSegmentControl {...defaultProps} />)

        expect(
            screen.getByRole('radio', { name: 'Option 1' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Option 2' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Option 3' }),
        ).toBeInTheDocument()
    })

    it('should render with correct radiogroup role', () => {
        render(<PlaygroundSegmentControl {...defaultProps} />)

        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('should mark the selected option as checked', () => {
        render(<PlaygroundSegmentControl {...defaultProps} />)

        const selectedButton = screen.getByRole('radio', { name: 'Option 1' })
        expect(selectedButton).toHaveAttribute('aria-checked', 'true')

        const unselectedButton = screen.getByRole('radio', { name: 'Option 2' })
        expect(unselectedButton).toHaveAttribute('aria-checked', 'false')
    })

    it('should call onValueChange when a different option is clicked', async () => {
        const user = userEvent.setup()
        render(<PlaygroundSegmentControl {...defaultProps} />)

        const option2 = screen.getByRole('radio', { name: 'Option 2' })
        await user.click(option2)

        expect(defaultProps.onValueChange).toHaveBeenCalledWith('option2')
    })

    it('should disable all options when isDisabled is true', () => {
        render(<PlaygroundSegmentControl {...defaultProps} isDisabled />)

        const radiogroup = screen.getByRole('radiogroup')
        expect(radiogroup).toHaveAttribute('aria-disabled', 'true')

        const option1 = screen.getByRole('radio', { name: 'Option 1' })
        const option2 = screen.getByRole('radio', { name: 'Option 2' })
        const option3 = screen.getByRole('radio', { name: 'Option 3' })

        expect(option1).toHaveAttribute('data-disabled', 'true')
        expect(option2).toHaveAttribute('data-disabled', 'true')
        expect(option3).toHaveAttribute('data-disabled', 'true')
    })

    it('should not call onValueChange when disabled option is clicked', async () => {
        const user = userEvent.setup()
        render(<PlaygroundSegmentControl {...defaultProps} isDisabled />)

        const option2 = screen.getByRole('radio', { name: 'Option 2' })
        await user.click(option2)

        expect(defaultProps.onValueChange).not.toHaveBeenCalled()
    })

    it('should render with a single segment', () => {
        const singleSegment = [{ value: 'only', label: 'Only Option' }]
        render(
            <PlaygroundSegmentControl
                {...defaultProps}
                segments={singleSegment}
                selectedValue="only"
            />,
        )

        expect(
            screen.getByRole('radio', { name: 'Only Option' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: 'Only Option' }),
        ).toHaveAttribute('aria-checked', 'true')
    })
})
