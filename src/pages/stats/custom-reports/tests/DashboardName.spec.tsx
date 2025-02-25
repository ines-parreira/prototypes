import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { noop } from 'lodash'

import { DashboardName } from 'pages/stats/custom-reports/DashboardName'

const getNameInput = () => screen.getByRole('textbox')
const getEmojiInput = (emoji = 'insert_emoticon') => screen.getByText(emoji)

const selectEmoji = (emoji: string) => {
    const emojiInput = getEmojiInput()

    fireEvent.click(emojiInput)

    const emojis = screen.getAllByText(emoji)
    fireEvent.click(emojis[0])
}

const enterName = (name: string) => {
    const nameInput = getNameInput()

    fireEvent.change(nameInput, { target: { value: name } })
}

describe('<DashboardName />', () => {
    const mockHandleChange = jest.fn()

    it('should render text input field', () => {
        render(
            <DashboardName
                value={{ name: 'My Dashboard', emoji: '🤘' }}
                onChange={noop}
            />,
        )

        expect(getNameInput()).toBeInTheDocument()
    })

    it('should render emoji selector', () => {
        render(
            <DashboardName
                value={{ name: 'My Dashboard', emoji: '' }}
                onChange={noop}
            />,
        )

        expect(getEmojiInput()).toBeInTheDocument()
    })

    it('should accept `value`', () => {
        const value = {
            name: 'My Custom Report',
            emoji: '🤘',
        }

        render(<DashboardName value={value} onChange={noop} />)

        expect(getNameInput()).toHaveValue(value.name)
        expect(getEmojiInput(value.emoji)).toHaveTextContent(value.emoji)
    })

    it('should call `onChange` when `name` is changed', () => {
        render(
            <DashboardName
                value={{ name: '', emoji: '' }}
                onChange={mockHandleChange}
            />,
        )

        const name = 'My Custom Report'

        enterName(name)

        expect(mockHandleChange).toHaveBeenCalledWith(
            expect.objectContaining({ name }),
        )
    })

    it('should call `onChange` when `emoji` is changed', () => {
        render(
            <DashboardName
                value={{ name: '', emoji: '' }}
                onChange={mockHandleChange}
            />,
        )

        const emoji = '🤘'

        selectEmoji(emoji)

        expect(mockHandleChange).toHaveBeenCalledWith(
            expect.objectContaining({ emoji }),
        )
    })

    it('should call `onBlur` when field is blurred', () => {
        const mockHandleBlur = jest.fn()
        render(
            <DashboardName
                value={{ name: '', emoji: '' }}
                onChange={noop}
                onBlur={mockHandleBlur}
            />,
        )

        getNameInput().focus()
        getNameInput().blur()

        expect(mockHandleBlur).toHaveBeenCalledTimes(1)
    })
})
