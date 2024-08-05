import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import FieldEditForm, {
    CANCEL_BUTTON_TEXT,
    SUBMIT_BUTTON_TEXT,
    TITLE_FIELD_LABEL,
    TYPE_FIELD_LABEL,
    FormData,
    TypeOption,
} from '../FieldEditForm'

describe('FieldEditForm', () => {
    type DefaultTypes = 'foo' | 'bar'
    const defaultAvailableTypes: TypeOption<DefaultTypes>[] = [
        {
            value: 'foo',
            label: 'Foo',
        },
        {
            value: 'bar',
            label: 'Bar',
        },
    ]
    const defaultInitialData: FormData<DefaultTypes> = {
        title: 'Some title',
        type: 'foo',
    }
    const defaultProps: ComponentProps<typeof FieldEditForm> = {
        initialData: defaultInitialData,
        availableTypes: defaultAvailableTypes,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
    }

    it('should display initial data title', () => {
        const {getByLabelText} = render(<FieldEditForm {...defaultProps} />)

        expect(getByLabelText(TITLE_FIELD_LABEL)).toHaveValue(
            defaultInitialData.title
        )
    })

    it('should display initial data type', () => {
        const {getByLabelText} = render(<FieldEditForm {...defaultProps} />)

        expect(getByLabelText(TYPE_FIELD_LABEL)).toHaveValue(
            defaultInitialData.type
        )
    })

    it('should display available types', () => {
        const {queryByText} = render(<FieldEditForm {...defaultProps} />)

        for (const {label, value} of defaultAvailableTypes) {
            const option = queryByText(label)
            expect(option).toBeInTheDocument()
            expect(option).toHaveAttribute('value', value)
        }
    })

    it('should call onCancel and not call onSubmit on cancel button click', () => {
        const {getByText} = render(<FieldEditForm {...defaultProps} />)

        fireEvent.click(getByText(CANCEL_BUTTON_TEXT))

        expect(defaultProps.onCancel).toHaveBeenCalledWith()
        expect(defaultProps.onSubmit).not.toHaveBeenCalledWith()
    })

    it('should call onSubmit and not call onCancel on submit button click', () => {
        const title = 'foo'
        const type: DefaultTypes = 'bar'
        const {getByText, getByLabelText} = render(
            <FieldEditForm {...defaultProps} />
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

    it.each(['title', 'type'])(
        'should not call onSubmit on submit button click if %s field is empty',
        (field) => {
            const {getByText} = render(
                <FieldEditForm
                    {...defaultProps}
                    initialData={{...defaultInitialData, [field]: undefined}}
                />
            )

            fireEvent.click(getByText(SUBMIT_BUTTON_TEXT))

            expect(defaultProps.onSubmit).not.toHaveBeenCalled()
        }
    )
})
