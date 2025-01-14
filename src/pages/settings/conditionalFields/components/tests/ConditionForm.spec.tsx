import {CustomFieldCondition} from '@gorgias/api-queries'
import {
    validateCreateCustomFieldCondition,
    validateUpdateCustomFieldCondition,
} from '@gorgias/api-validators'
import {render, screen, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import '@testing-library/jest-dom/extend-expect'
import {Form} from 'components/Form/Form'
import FormField from 'components/Form/FormField'
import FormSubmitButton from 'components/Form/FormSubmitButton'
import {createFormValidator} from 'components/Form/validation'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import history from 'pages/history'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'
import {assumeMock, getLastMockCall} from 'utils/testing'

import useSaveCondition from '../../hooks/useSaveCondition'
import ConditionForm from '../ConditionForm'
import {DeletionPopover} from '../DeletionPopover'

jest.mock('components/Form/Form', () => ({
    Form: jest.fn(({children}) => <form>{children}</form>),
}))
jest.mock('components/Form/FormField', () => jest.fn(() => <div />))
jest.mock('components/Form/FormSubmitButton', () => jest.fn(() => <button />))
jest.mock('pages/common/forms/ToggleInputField', () =>
    jest.fn(() => <input type="checkbox" />)
)
jest.mock('components/Form/validation', () => ({
    createFormValidator: jest.fn(),
}))
jest.mock('../../hooks/useSaveCondition', () => jest.fn())
jest.mock('../DeletionPopover', () => ({
    DeletionPopover: jest.fn(),
}))
jest.spyOn(history, 'push')

const DeletionPopoverMock = assumeMock(DeletionPopover)
const useSaveConditionMock = assumeMock(useSaveCondition)
const createFormValidatorMock = assumeMock(createFormValidator)
const FormMock = assumeMock(Form)
const FormFieldMock = assumeMock(FormField)

describe('ConditionForm', () => {
    const onDisplayConfirmationMock = jest.fn()
    const onSubmitMock = jest.fn()
    const isSubmitting = false
    const validatorMock = jest.fn()

    beforeEach(() => {
        createFormValidatorMock.mockReturnValue(validatorMock)
        DeletionPopoverMock.mockImplementation(
            ({children}: ComponentProps<typeof DeletionPopover>) => (
                <div>
                    {children({
                        uid: 'uid',
                        onDisplayConfirmation: onDisplayConfirmationMock,
                        elementRef: jest.fn(),
                    })}
                </div>
            )
        )
        useSaveConditionMock.mockReturnValue({
            onSubmit: onSubmitMock,
            isSubmitting,
        })
    })

    const defaultProps = {
        condition: {
            id: 1,
            name: 'Test Condition',
            deactivated_datetime: null,
        } as CustomFieldCondition,
    }

    it("should call createFormValidator with expected param according to condition's id", () => {
        const {rerender} = render(<ConditionForm {...defaultProps} />)
        expect(createFormValidatorMock).toHaveBeenCalledWith(
            validateUpdateCustomFieldCondition
        )

        rerender(<ConditionForm />)
        expect(createFormValidatorMock).toHaveBeenCalledWith(
            validateCreateCustomFieldCondition
        )
    })

    it('should call Form with proper props', () => {
        render(<ConditionForm {...defaultProps} />)
        expect(FormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                children: expect.any(Array),
                defaultValues: expect.objectContaining({
                    name: '',
                    object_type: 'Ticket',
                    deactivated_datetime: null,
                }),
                values: expect.objectContaining({
                    name: 'Test Condition',
                    deactivated_datetime: null,
                }),
                validator: validatorMock,
            }),
            {}
        )
    })

    it('should call FormField with correct props', () => {
        render(<ConditionForm />)
        expect(FormFieldMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                name: 'name',
                label: 'Condition name',
                isRequired: true,
                placeholder:
                    'Provide a name for condition. E.g: Contact Reason Conditions',
            }),
            {}
        )
        expect(FormFieldMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                className: expect.any(String),
                field: ToggleInputField,
                name: 'deactivated_datetime',
                inputTransform: expect.any(Function),
                outputTransform: expect.any(Function),
            }),
            {}
        )

        expect(
            FormFieldMock.mock.calls[1][0].inputTransform?.(null)
        ).toBeTruthy()
        expect(
            FormFieldMock.mock.calls[1][0].inputTransform?.('test')
        ).toBeFalsy()
        expect(
            FormFieldMock.mock.calls[1][0].outputTransform?.(true)
        ).toBeNull()
        expect(
            typeof FormFieldMock.mock.calls[1][0].outputTransform?.(false)
        ).toBe('string')
    })

    it('should call onSubmit of valid submit and pass it form data', () => {
        render(<ConditionForm />)
        const data = {hey: 'there'}
        getLastMockCall(FormMock)[0].onValidSubmit(data)

        expect(onSubmitMock).toHaveBeenCalledWith(data)
    })

    it('should call FormSubmitButton with correct props', () => {
        render(<ConditionForm />)
        expect(FormSubmitButton).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: isSubmitting,
            }),
            {}
        )
    })

    it('should navigate to the conditions route when cancel button is clicked', () => {
        render(<ConditionForm {...defaultProps} />)
        fireEvent.click(screen.getByText('Cancel'))

        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`
        )
    })

    it('should render the DeletionPopover when condition is provided', () => {
        render(<ConditionForm {...defaultProps} />)
        expect(DeletionPopoverMock).toHaveBeenCalledWith(
            expect.objectContaining({
                condition: defaultProps.condition,
                redirect: true,
            }),
            {}
        )
    })

    it('should call onDisplayConfirmation when delete button is clicked', () => {
        render(<ConditionForm {...defaultProps} />)
        fireEvent.click(screen.getByText('Delete Condition'))

        expect(onDisplayConfirmationMock).toHaveBeenCalled()
    })
})
