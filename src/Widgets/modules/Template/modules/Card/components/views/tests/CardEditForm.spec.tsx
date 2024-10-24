import {act, render, fireEvent, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import FileField from 'pages/common/forms/FileField'
import {assumeMock, getLastMockCall} from 'utils/testing'

import CardEditForm, * as CardEditExports from '../CardEditForm'

jest.mock('pages/common/forms/FileField', () => jest.fn(() => <div />))

const mockedFileField = assumeMock(FileField)

describe('<CardEditForm/>', () => {
    const props: ComponentProps<typeof CardEditForm> = {
        initialData: {
            title: 'Some Title',
            link: '',
            pictureUrl: '',
            color: '',
            displayCard: true,
            limit: 3,
            orderBy: '',
        },
        hiddenFields: [],
        orderByOptions: [
            {label: 'Value DESC', value: '-value'},
            {label: 'Value ASC', value: '+value'},
        ],
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
    }

    it('should call `onCancel` and not `onSubmit` when clicking cancel button', () => {
        render(<CardEditForm {...props} />)

        act(() => {
            fireEvent.click(
                screen.getByText(CardEditExports.CANCEL_BUTTON_TEXT)
            )
        })

        expect(props.onCancel).toHaveBeenCalledTimes(1)
        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should not call `onCancel` and call `onSubmit` with correct data when submitting the form', async () => {
        const title = 'New Title'
        const link = 'https://link.com'
        const pictureUrl = 'let’s stay professional'
        const color = '#EB144C'
        const limit = 9

        render(<CardEditForm {...props} />)

        fireEvent.change(
            screen.getByLabelText(CardEditExports.TITLE_FIELD_LABEL),
            {
                target: {value: 'New Title'},
            }
        )

        fireEvent.change(
            screen.getByLabelText(CardEditExports.LINK_FIELD_LABEL),
            {
                target: {value: 'https://link.com'},
            }
        )

        act(() => {
            ;(
                getLastMockCall(mockedFileField)[0].onChange as (
                    value: string
                ) => void
            )(pictureUrl)
        })

        fireEvent.click(screen.getByText('Pick a color'))
        await screen.findByPlaceholderText('ex: #eeeeee')
        fireEvent.click(screen.getByRole('button', {name: `color ${color}`}))

        fireEvent.click(
            screen.getByLabelText(CardEditExports.DISPLAY_CARD_FIELD_LABEL)
        )

        fireEvent.change(
            screen.getByLabelText(CardEditExports.LIMIT_FIELD_LABEL),
            {
                target: {value: limit},
            }
        )

        fireEvent.click(
            screen.getByLabelText(CardEditExports.ORDER_FIELD_LABEL)
        )
        screen.getAllByRole('menuitem')[0].click()

        fireEvent.click(screen.getByText(CardEditExports.SUBMIT_BUTTON_TEXT))

        expect(props.onCancel).not.toHaveBeenCalled()
        expect(props.onSubmit).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                title,
                link,
                color,
                pictureUrl,
                displayCard: false,
                limit,
                orderBy: props.orderByOptions[0].value,
            })
        )
    })

    it('should not display the hidden fields', () => {
        render(
            <CardEditForm
                {...props}
                hiddenFields={[
                    'title',
                    'link',
                    'pictureUrl',
                    'color',
                    'displayCard',
                    'limit',
                    'orderBy',
                ]}
            />
        )

        expect(
            screen.queryByLabelText(CardEditExports.TITLE_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.LINK_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.DISPLAY_CARD_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.ICON_FIELD_LABEL)
        ).toBeNull()
        expect(screen.queryByText('Pick a color')).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.LIMIT_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.ORDER_FIELD_LABEL)
        ).toBeNull()
    })
})
