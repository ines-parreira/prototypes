import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { EmojiInput } from 'domains/reporting/pages/dashboards/EmojiInput'

const getEmojiInput = (emoji = 'insert_emoticon') => screen.getByText(emoji)

const selectEmoji = (emoji: string) => {
    const emojiInput = getEmojiInput()

    fireEvent.click(emojiInput)

    const emojis = screen.getAllByText(emoji)
    fireEvent.click(emojis[0])
}

const clearEmoji = (emoji?: string) => {
    const emojiInput = getEmojiInput(emoji)

    fireEvent.click(emojiInput)

    const clearButton = screen.getByText(/clear icon/i)

    fireEvent.click(clearButton)
}

describe('EmojiInput', () => {
    it('should use the `value` prop as the emoji value when provided', () => {
        const emoji = '🖖'

        render(<EmojiInput value={emoji} />)

        expect(getEmojiInput(emoji)).toBeInTheDocument()
    })

    it('should call `onChange` when the emoji is selected', () => {
        const onChange = jest.fn()

        const emoji = '🖖'

        render(<EmojiInput onChange={onChange} />)

        selectEmoji(emoji)

        expect(onChange).toHaveBeenCalledWith(emoji)
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should call `onChange` when the emoji is cleared', () => {
        const onChange = jest.fn()

        const emoji = '🖖'

        render(<EmojiInput value={emoji} onChange={onChange} />)

        clearEmoji(emoji)

        expect(onChange).toHaveBeenCalledWith('')
        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('should initialize with `defaultValue` as the emoji value', () => {
        const emoji = '🖖'

        render(<EmojiInput defaultValue={emoji} />)

        expect(getEmojiInput(emoji)).toBeInTheDocument()
    })

    it('should render a hidden input with the `name` prop as the name attribute', () => {
        const name = 'emoji'

        const { container } = render(<EmojiInput name={name} />)

        const hiddenInput = container.querySelector(`input[name="${name}"]`)

        expect(hiddenInput).toBeInTheDocument()
    })

    it("should update the hidden input's value when the emoji value changes.", () => {
        const name = 'emoji'

        const emoji = '🖖'

        const { container } = render(<EmojiInput name={name} />)

        selectEmoji(emoji)

        const hiddenInput = container.querySelector(
            `input[name="${name}"]`,
        ) as HTMLInputElement

        expect(hiddenInput.value).toBe(emoji)
    })
})
