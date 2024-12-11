import {fireEvent, render, screen} from '@testing-library/react'
import {noop} from 'lodash'
import React from 'react'

import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'

const getNameInput = () => screen.getByRole('textbox')
const getEmojiInput = (emoji = 'insert_emoticon') => screen.getByText(emoji)

describe('CustomReportNameForm', () => {
    it('should render the component without crashing', () => {
        render(<CustomReportNameInput onChange={noop} />)
    })

    it('should render text input field', () => {
        render(<CustomReportNameInput onChange={noop} />)

        expect(getNameInput()).toBeInTheDocument()
    })

    it('should render emoji selector', () => {
        render(<CustomReportNameInput onChange={noop} />)

        expect(getEmojiInput()).toBeInTheDocument()
    })

    it('should render default values', () => {
        const initialValues = {
            name: 'My Custom Report',
            emoji: '🤘',
        }

        render(
            <CustomReportNameInput
                onChange={noop}
                initialValues={initialValues}
            />
        )

        expect(getNameInput()).toHaveValue(initialValues.name)
        expect(getEmojiInput(initialValues.emoji)).toHaveTextContent(
            initialValues.emoji
        )
    })

    it('should call `onChange` when the form looses focus', () => {
        const onChange = jest.fn()

        render(<CustomReportNameInput onChange={onChange} />)

        const nameInput = getNameInput()

        fireEvent.focus(nameInput)
        fireEvent.blur(nameInput)

        expect(onChange).toHaveBeenCalledTimes(1)
    })

    it("shouldn't call `onChange` when EmojiSelect is focused", () => {
        const onChange = jest.fn()

        render(<CustomReportNameInput onChange={onChange} />)

        const nameInput = getNameInput()
        const emojiSelect = getEmojiInput()

        fireEvent.focus(nameInput)
        fireEvent.click(emojiSelect)

        expect(onChange).toHaveBeenCalledTimes(0)
    })

    it('should call `onChange` with field values', () => {
        const onChange = jest.fn()

        render(<CustomReportNameInput onChange={onChange} />)

        const fieldValues = {
            emoji: '😀',
            name: 'My Custom Report',
        }

        const emojiInput = getEmojiInput()
        const nameInput = getNameInput()

        fireEvent.click(emojiInput)

        const emojis = screen.getAllByText(fieldValues.emoji)
        fireEvent.click(emojis[0])

        fireEvent.focus(nameInput)
        fireEvent.change(nameInput, {target: {value: fieldValues.name}})
        fireEvent.blur(nameInput)

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining(fieldValues)
        )
    })
})
