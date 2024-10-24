import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import WrapperEditForm, {
    CANCEL_TEXT,
    FormData,
    SUBMIT_TEXT,
} from '../WrapperEditForm'

describe('WrapperEditForm', () => {
    const defaultData: FormData = {
        color: '#ff0000',
    }
    const defaultProps: ComponentProps<typeof WrapperEditForm> = {
        initialData: defaultData,
        onCancel: jest.fn(),
        onSubmit: jest.fn(),
    }

    it('should render the initial data', () => {
        const {getByDisplayValue} = render(
            <WrapperEditForm {...defaultProps} />
        )

        expect(getByDisplayValue(defaultData.color)).toBeInTheDocument()
    })

    it(`should call onSubmit callback with the updated data on "${SUBMIT_TEXT}" click`, () => {
        const expectedData: FormData = {
            ...defaultData,
            color: '#aa00ff',
        }
        const {getByDisplayValue, getByText} = render(
            <WrapperEditForm {...defaultProps} />
        )

        fireEvent.change(getByDisplayValue(defaultData.color), {
            target: {value: expectedData.color},
        })
        fireEvent.click(getByText(SUBMIT_TEXT))

        expect(defaultProps.onSubmit).toHaveBeenLastCalledWith(expectedData)
    })

    it(`should call onCancel callback on "${CANCEL_TEXT}" click`, () => {
        const {getByText} = render(<WrapperEditForm {...defaultProps} />)

        fireEvent.click(getByText(CANCEL_TEXT))

        expect(defaultProps.onCancel).toHaveBeenLastCalledWith()
    })
})
