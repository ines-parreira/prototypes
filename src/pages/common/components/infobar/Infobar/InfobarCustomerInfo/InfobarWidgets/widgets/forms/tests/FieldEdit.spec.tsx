import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {idTemplate, shopifyWidget} from 'fixtures/widgets'
import {RootState} from 'state/types'

import FieldEdit, {
    CANCEL_BUTTON_TEXT,
    SUBMIT_BUTTON_TEXT,
    TITLE_FIELD_LABEL,
    TYPE_FIELD_LABEL,
} from '../FieldEdit'

const mockStore = configureMockStore()

describe('FieldEdit', () => {
    const defaultState = {
        widgets: fromJS({
            _internal: {
                currentlyEditedWidgetPath: '',
            },
        }),
    } as RootState
    const defaultProps: ComponentProps<typeof FieldEdit> = {
        template: fromJS(idTemplate),
        widget: fromJS(shopifyWidget),
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
    }

    it('should display template title', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <FieldEdit {...defaultProps} />
            </Provider>
        )

        expect(getByLabelText(TITLE_FIELD_LABEL)).toHaveValue(idTemplate.title)
    })

    it('should display template type', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <FieldEdit {...defaultProps} />
            </Provider>
        )

        expect(getByLabelText(TYPE_FIELD_LABEL)).toHaveValue(idTemplate.type)
    })

    it('should call onCancel and not call onSubmit on cancel button click', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FieldEdit {...defaultProps} />
            </Provider>
        )

        fireEvent.click(getByText(CANCEL_BUTTON_TEXT))

        expect(defaultProps.onCancel).toHaveBeenCalledWith()
        expect(defaultProps.onSubmit).not.toHaveBeenCalledWith()
    })

    it('should call onSubmit and not call onCancel on submit button click', () => {
        const title = 'foo'
        const type = 'url'
        const {getByText, getByLabelText} = render(
            <Provider store={mockStore(defaultState)}>
                <FieldEdit {...defaultProps} />
            </Provider>
        )

        fireEvent.change(getByLabelText(TITLE_FIELD_LABEL), {
            target: {value: title},
        })
        fireEvent.change(getByLabelText(TYPE_FIELD_LABEL), {
            target: {value: type},
        })
        fireEvent.click(getByText(SUBMIT_BUTTON_TEXT))

        expect(defaultProps.onCancel).not.toHaveBeenCalledWith()
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({title, type})
    })
})
