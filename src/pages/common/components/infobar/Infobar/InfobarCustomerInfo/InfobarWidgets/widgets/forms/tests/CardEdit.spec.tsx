import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'

import * as utils from 'common/utils'

import CardEdit, * as CardEditExports from '../CardEdit'

const mockStore = configureMockStore()
const store = mockStore({})

const pictureUrl = 'file1'

jest.mock('common/utils', () => {
    const mockedUtils = jest.requireActual('common/utils')

    const result: typeof utils = {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{url: pictureUrl}])),
    }
    return result
})

describe('<CardEdit/>', () => {
    const props: ComponentProps<typeof CardEdit> = {
        template: fromJS({
            title: 'Some Title',
        }),
        parent: fromJS({}),
        editionHiddenFields: [],
        isParentList: false,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
    }

    it('should render the fields', () => {
        render(
            <Provider store={store}>
                <CardEdit {...props} />
            </Provider>
        )

        expect(screen.getByLabelText(CardEditExports.DISPLAY_CARD_FIELD_LABEL))
        expect(screen.getByLabelText(CardEditExports.LINK_FIELD_LABEL))
        expect(screen.getByLabelText(CardEditExports.ICON_FIELD_LABEL))
        expect(screen.getByLabelText(CardEditExports.TITLE_FIELD_LABEL))
    })

    it('should not display the hidden fields', () => {
        render(
            <Provider store={store}>
                <CardEdit
                    {...props}
                    editionHiddenFields={[
                        'title',
                        'icon',
                        'displayCard',
                        'link',
                    ]}
                />
            </Provider>
        )
        expect(
            screen.queryByLabelText(CardEditExports.DISPLAY_CARD_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.LINK_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.ICON_FIELD_LABEL)
        ).toBeNull()
        expect(
            screen.queryByLabelText(CardEditExports.TITLE_FIELD_LABEL)
        ).toBeNull()
    })

    it('should call the correct callback when cancelling', () => {
        render(
            <Provider store={store}>
                <CardEdit {...props} />
            </Provider>
        )

        fireEvent.click(screen.getByText(CardEditExports.CANCEL_BUTTON_TEXT))

        expect(props.onCancel).toHaveBeenCalledTimes(1)
        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should call the correct callback with correct data when submitting the form', async () => {
        const title = 'New Title'
        const link = 'https://link.com'
        const color = '#EB144C'
        render(
            <Provider store={store}>
                <CardEdit {...props} />
            </Provider>
        )

        fireEvent.change(screen.getByLabelText('Title'), {
            target: {value: 'New Title'},
        })

        fireEvent.change(screen.getByLabelText('Link'), {
            target: {value: 'https://link.com'},
        })

        userEvent.upload(
            screen.getByLabelText('Icon'),
            new File(['hello'], 'hello.png', {type: 'image/png'})
        )

        fireEvent.click(screen.getByText('Pick a color'))
        await screen.findByPlaceholderText('ex: #eeeeee')
        fireEvent.click(screen.getByRole('button', {name: `color ${color}`}))

        fireEvent.click(screen.getByText(CardEditExports.SUBMIT_BUTTON_TEXT))

        expect(props.onCancel).not.toHaveBeenCalled()
        expect(props.onSubmit).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                title,
                link,
                color,
                pictureUrl,
            })
        )
    })

    it('should handle the list case', () => {
        const limit = 9
        const orderBy = '-value'

        render(
            <Provider store={store}>
                <CardEdit
                    {...props}
                    isParentList={true}
                    parent={fromJS({
                        title: 'List title',
                        meta: {
                            limit: 10,
                        },
                    })}
                    template={fromJS({
                        widgets: [
                            {
                                type: 'widget',
                                title: 'My value',
                                path: 'value',
                            },
                        ],
                    })}
                />
            </Provider>
        )

        fireEvent.change(
            screen.getByLabelText(CardEditExports.LIMIT_FIELD_LABEL),
            {
                target: {value: limit},
            }
        )

        fireEvent.change(
            screen.getByLabelText(CardEditExports.ORDER_FIELD_LABEL),
            {
                target: {value: orderBy},
            }
        )

        fireEvent.click(screen.getByText(CardEditExports.SUBMIT_BUTTON_TEXT))
        expect(props.onSubmit).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                limit,
                orderBy,
            })
        )
    })
})
