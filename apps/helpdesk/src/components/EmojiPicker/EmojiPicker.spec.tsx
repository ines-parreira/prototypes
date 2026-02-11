import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmojiPicker } from './EmojiPicker'

describe('EmojiPicker', () => {
    const mockOnChange = jest.fn()
    const mockOnValidationChange = jest.fn()
    const mockOnError = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        mockOnValidationChange.mockClear()
        mockOnError.mockClear()
    })

    it('should render with placeholder', () => {
        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                placeholder="Type or select an emoji"
            />,
        )

        expect(
            screen.getByPlaceholderText('Type or select an emoji'),
        ).toBeInTheDocument()
    })

    it('should render with label', () => {
        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                label="Allowed emojis"
            />,
        )

        expect(screen.getByText('Allowed emojis')).toBeInTheDocument()
    })

    it('should display the current value', () => {
        render(<EmojiPicker value="😀 😃" onChange={mockOnChange} />)

        expect(screen.getByDisplayValue('😀 😃')).toBeInTheDocument()
    })

    it('should allow typing emojis in the input', async () => {
        const user = userEvent.setup()

        render(<EmojiPicker value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox')
        await user.type(input, '😀')

        expect(mockOnChange).toHaveBeenCalled()
    })

    it('should show validation error when typing non-emoji text', async () => {
        const user = userEvent.setup()

        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                onValidationChange={mockOnValidationChange}
                onError={mockOnError}
            />,
        )

        const input = screen.getByRole('textbox')
        await user.type(input, 'Hello')

        await waitFor(() => {
            expect(
                screen.getByText('Only emojis are allowed'),
            ).toBeInTheDocument()
        })
        expect(mockOnValidationChange).toHaveBeenCalledWith(false)
        expect(mockOnError).toHaveBeenCalledWith(true)
    })

    it('should not show validation error for emoji-only text', async () => {
        const user = userEvent.setup()

        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                onValidationChange={mockOnValidationChange}
                onError={mockOnError}
            />,
        )

        const input = screen.getByRole('textbox')
        // Paste emojis instead of typing to avoid intermediate invalid states
        await user.click(input)
        await user.paste('😀😃😄')

        await waitFor(() => {
            expect(
                screen.queryByText('Only emojis are allowed'),
            ).not.toBeInTheDocument()
        })
        expect(mockOnValidationChange).toHaveBeenCalledWith(true)
        expect(mockOnError).toHaveBeenCalledWith(false)
    })

    it('should open emoji picker when clicking the emoji button', async () => {
        const user = userEvent.setup()

        render(<EmojiPicker value="" onChange={mockOnChange} />)

        const emojiButton = screen.getByRole('button', {
            name: /open emoji picker/i,
        })
        await user.click(emojiButton)

        await waitFor(
            () => {
                const picker = document.querySelector('.emoji-mart')
                expect(picker).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    })

    it('should be disabled when isDisabled is true', () => {
        render(
            <EmojiPicker value="" onChange={mockOnChange} isDisabled={true} />,
        )

        const input = screen.getByRole('textbox')
        const emojiButton = screen.getByRole('button', {
            name: /open emoji picker/i,
        })

        expect(input).toBeDisabled()
        expect(emojiButton).toBeDisabled()
    })

    it('should show required indicator when isRequired is true', () => {
        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                label="Allowed emojis"
                isRequired={true}
            />,
        )

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('required')
    })

    it('should display error message', () => {
        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                label="Allowed emojis"
                error="At least one emoji is required"
            />,
        )

        expect(
            screen.getByText('At least one emoji is required'),
        ).toBeInTheDocument()
    })

    it('should display caption when no error', () => {
        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                caption="Click the emoji icon to open the picker"
            />,
        )

        expect(
            screen.getByText('Click the emoji icon to open the picker'),
        ).toBeInTheDocument()
    })

    it('should update display when value prop changes', () => {
        const { rerender } = render(
            <EmojiPicker value="😀" onChange={mockOnChange} />,
        )

        expect(screen.getByDisplayValue('😀')).toBeInTheDocument()

        rerender(<EmojiPicker value="😀😃" onChange={mockOnChange} />)

        expect(screen.getByDisplayValue('😀😃')).toBeInTheDocument()
    })

    it('should prioritize external error over validation error', async () => {
        const user = userEvent.setup()

        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                error="Custom error message"
                onError={mockOnError}
            />,
        )

        const input = screen.getByRole('textbox')
        await user.type(input, 'Hello')

        // Should show the external error, not the validation error
        expect(screen.getByText('Custom error message')).toBeInTheDocument()
        expect(
            screen.queryByText('Only emojis are allowed'),
        ).not.toBeInTheDocument()
        // onError should still be called for validation state
        expect(mockOnError).toHaveBeenCalledWith(true)
    })

    it('should call onError when error state changes from error to valid', async () => {
        const user = userEvent.setup()

        render(
            <EmojiPicker
                value=""
                onChange={mockOnChange}
                onError={mockOnError}
            />,
        )

        const input = screen.getByRole('textbox')

        // First, create an error
        await user.type(input, 'Hello')

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(true)
        })

        // Clear the error by clearing the input
        await user.clear(input)

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(false)
        })
    })
})
