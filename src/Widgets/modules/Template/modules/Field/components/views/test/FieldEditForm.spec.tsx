import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'

import {LeafType} from 'models/widget/types'
import {LEAF_TYPES} from 'models/widget/constants'

import FieldEditForm, {
    CANCEL_BUTTON_TEXT,
    SUBMIT_BUTTON_TEXT,
    TITLE_FIELD_LABEL,
    TYPE_FIELD_LABEL,
    TypeOption,
} from '../FieldEditForm'
import {FieldEditFormData, HiddenFields} from '../../../types'

describe('FieldEditForm', () => {
    const defaultAvailableTypes: TypeOption<LeafType>[] = [
        {
            value: LEAF_TYPES.TEXT,
            label: 'Text',
        },
        {
            value: LEAF_TYPES.DATE,
            label: 'Date',
        },
    ]
    const defaultInitialData: FieldEditFormData<LeafType> = {
        title: 'Some title',
        type: LEAF_TYPES.TEXT,
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

    it('should not display hidden fields', () => {
        const hiddenFields: HiddenFields = ['title', 'type']
        const {queryByLabelText} = render(
            <FieldEditForm {...defaultProps} hiddenFields={hiddenFields} />
        )

        expect(queryByLabelText(TITLE_FIELD_LABEL)).not.toBeInTheDocument()
        expect(queryByLabelText(TYPE_FIELD_LABEL)).not.toBeInTheDocument()
    })

    it('should call onCancel and not call onSubmit on cancel button click', () => {
        const {getByText} = render(<FieldEditForm {...defaultProps} />)

        fireEvent.click(getByText(CANCEL_BUTTON_TEXT))

        expect(defaultProps.onCancel).toHaveBeenCalledWith()
        expect(defaultProps.onSubmit).not.toHaveBeenCalledWith()
    })

    it('should call onSubmit and not call onCancel on submit button click', () => {
        const title = 'foo'
        const type = LEAF_TYPES.DATE
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
