import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {CustomReportNameForm} from 'pages/stats/custom-reports/CustomReportNameForm'

const getNameInput = () => screen.getByRole('textbox')
const getEmojiInput = (emoji = 'insert_emoticon') => screen.getByText(emoji)
const getSubmitButton = () => screen.getByText('Submit')

const selectEmoji = (emoji: string) => {
    const emojiInput = getEmojiInput()

    fireEvent.click(emojiInput)

    const emojis = screen.getAllByText(emoji)
    fireEvent.click(emojis[0])
}

const enterName = (name: string) => {
    const nameInput = getNameInput()

    fireEvent.change(nameInput, {target: {value: name}})
}

const submitForm = () => {
    const button = getSubmitButton()

    fireEvent.click(button)
}

describe('CustomReportNameForm', () => {
    const onSubmit = jest.fn()

    it('should render text input field', () => {
        render(<CustomReportNameForm onSubmit={onSubmit} />)

        expect(getNameInput()).toBeInTheDocument()
    })

    it('should render emoji selector', () => {
        render(<CustomReportNameForm onSubmit={onSubmit} />)

        expect(getEmojiInput()).toBeInTheDocument()
    })

    it('should render default values', () => {
        const initialValues = {
            name: 'My Custom Report',
            emoji: '🤘',
        }

        render(
            <CustomReportNameForm
                onSubmit={onSubmit}
                initialValues={initialValues}
            />
        )

        expect(getNameInput()).toHaveValue(initialValues.name)
        expect(getEmojiInput(initialValues.emoji)).toHaveTextContent(
            initialValues.emoji
        )
    })

    it('should not call `onSubmit` if name is missing', async () => {
        const formId = 'form'

        render(
            <>
                <CustomReportNameForm id={formId} onSubmit={onSubmit} />
                <button type="submit" form={formId}>
                    Submit
                </button>
            </>
        )

        submitForm()

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled()
        })
    })

    it('should not call `onSubmit` if name is less than 3 characters', async () => {
        const formId = 'form'

        render(
            <>
                <CustomReportNameForm id={formId} onSubmit={onSubmit} />
                <button type="submit" form={formId}>
                    Submit
                </button>
            </>
        )

        enterName('my')

        submitForm()

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled()
        })
    })

    it('should not call `onSubmit` if name is more than 255 characters', async () => {
        const formId = 'form'

        render(
            <>
                <CustomReportNameForm id={formId} onSubmit={onSubmit} />
                <button type="submit" form={formId}>
                    Submit
                </button>
            </>
        )

        const name = 'x'.repeat(256)

        enterName(name)

        submitForm()

        await waitFor(() => {
            expect(onSubmit).not.toHaveBeenCalled()
        })
    })

    it('should call `onSubmit` with field values', async () => {
        const formId = 'form'

        onSubmit.mockResolvedValueOnce(Promise.resolve())

        render(
            <>
                <CustomReportNameForm id={formId} onSubmit={onSubmit} />
                <button type="submit" form={formId}>
                    Submit
                </button>
            </>
        )

        const fieldValues = {
            emoji: '😀',
            name: 'My Custom Report',
        }

        enterName(fieldValues.name)

        selectEmoji(fieldValues.emoji)

        submitForm()

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining(fieldValues)
            )
        })
    })
})
