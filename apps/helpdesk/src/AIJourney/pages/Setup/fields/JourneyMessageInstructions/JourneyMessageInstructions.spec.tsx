import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { JourneyMessageInstructionsField } from './JourneyMessageInstructions'

describe('<JourneyMessageInstructionsField />', () => {
    it('should render field information', () => {
        render(<JourneyMessageInstructionsField />)

        expect(screen.getByText('Message guidance')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Write guidelines for how the AI should text your shoppers',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Guide the AI agent's communication style/),
        ).toBeInTheDocument()

        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )
        expect(textarea).toHaveValue('')
        expect(
            screen.getByText('2000 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should render with custom name and desciprtion when provided', () => {
        render(
            <JourneyMessageInstructionsField
                name="name"
                description="description"
            />,
        )

        expect(screen.getByText('name')).toBeInTheDocument()
        expect(screen.getByText('description')).toBeInTheDocument()
    })

    it('should accept and display initial value', () => {
        const initialValue = 'Be friendly and professional'
        render(<JourneyMessageInstructionsField value={initialValue} />)

        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )
        expect(textarea).toHaveValue(initialValue)

        const remainingChars = 2000 - initialValue.length
        expect(
            screen.getByText(`${remainingChars} characters remaining`),
        ).toBeInTheDocument()
    })

    it('should call onChange when user types', async () => {
        const onChange = jest.fn()
        render(<JourneyMessageInstructionsField onChange={onChange} />)

        const user = userEvent.setup()
        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        await act(async () => {
            await user.type(textarea, 'Test')
        })

        // TextArea component calls onChange for each individual character
        expect(onChange).toHaveBeenCalled()
        expect(onChange).toHaveBeenCalledWith('T')
        expect(onChange).toHaveBeenCalledWith('e')
        expect(onChange).toHaveBeenCalledWith('s')
        expect(onChange).toHaveBeenLastCalledWith('t')
        expect(onChange).toHaveBeenCalledTimes(4)
    })

    it('should update character count when value prop changes', () => {
        const { rerender } = render(
            <JourneyMessageInstructionsField value="" />,
        )

        expect(
            screen.getByText('2000 characters remaining'),
        ).toBeInTheDocument()

        // Update the value prop to simulate controlled component behavior
        rerender(<JourneyMessageInstructionsField value="Hello" />)

        expect(
            screen.getByText('1995 characters remaining'),
        ).toBeInTheDocument()
    })

    it('should call onChange when user types (controlled)', async () => {
        const onChange = jest.fn()
        render(<JourneyMessageInstructionsField onChange={onChange} value="" />)

        const user = userEvent.setup()
        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        await act(async () => {
            await user.type(textarea, 'Test')
        })

        // Since this is a controlled component with value="",
        // the character count won't change unless value prop changes
        // This test verifies onChange is called with individual characters
        expect(onChange).toHaveBeenCalledWith('T')
        expect(onChange).toHaveBeenCalledWith('e')
        expect(onChange).toHaveBeenCalledWith('s')
        expect(onChange).toHaveBeenLastCalledWith('t')
        expect(onChange).toHaveBeenCalledTimes(4)
    })

    it('should show warning style when less than 100 characters remaining', () => {
        const longText = 'a'.repeat(1901) // 1901 characters, leaving 99 remaining
        render(<JourneyMessageInstructionsField value={longText} />)

        const characterCount = screen.getByText('99 characters remaining')
        expect(characterCount).toHaveClass('characterCountWarning')
    })

    it('should not show warning style when 100 or more characters remaining', () => {
        const text = 'a'.repeat(1900) // 1900 characters, leaving 100 remaining
        render(<JourneyMessageInstructionsField value={text} />)

        const characterCount = screen.getByText('100 characters remaining')
        expect(characterCount).not.toHaveClass('characterCountWarning')
    })

    it('should enforce maxLength limit', async () => {
        const onChange = jest.fn()
        const maxLength = 50
        render(
            <JourneyMessageInstructionsField
                onChange={onChange}
                maxLength={maxLength}
            />,
        )

        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        // TextArea component should have maxLength attribute
        expect(textarea).toHaveAttribute('maxLength', '50')

        expect(screen.getByText('50 characters remaining')).toBeInTheDocument()
    })

    it('should handle paste events correctly', async () => {
        const onChange = jest.fn()
        render(<JourneyMessageInstructionsField onChange={onChange} />)

        const user = userEvent.setup()
        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        const pasteText = 'This is pasted text'
        await act(async () => {
            await user.click(textarea)
            await user.paste(pasteText)
        })

        expect(onChange).toHaveBeenCalledWith(pasteText)
    })

    it('should handle clear/delete operations', async () => {
        const onChange = jest.fn()
        render(
            <JourneyMessageInstructionsField
                value="Initial text"
                onChange={onChange}
            />,
        )

        const user = userEvent.setup()
        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        await act(async () => {
            await user.clear(textarea)
        })

        expect(onChange).toHaveBeenCalledWith('')
    })

    it('should have proper styling and layout', () => {
        render(<JourneyMessageInstructionsField />)

        const container = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        ).parentElement?.parentElement?.parentElement

        expect(container).toHaveClass('journeyMessageInstructionsField')
    })

    it('should handle undefined onChange gracefully', async () => {
        // Should not throw error when onChange is not provided
        render(<JourneyMessageInstructionsField />)

        const user = userEvent.setup()
        const textarea = screen.getByPlaceholderText(
            '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
        )

        // This should not throw an error
        await act(async () => {
            await user.type(textarea, 'Test')
        })

        // Since there's no onChange prop, the character count stays the same
        // because the component can't update its internal state
        expect(
            screen.getByText('2000 characters remaining'),
        ).toBeInTheDocument()
    })
})
