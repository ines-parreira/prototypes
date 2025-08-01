import React, { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { CustomFieldCondition } from '@gorgias/helpdesk-queries'

import '@testing-library/jest-dom/extend-expect'

import { assumeMock, getLastMockCall } from '@repo/testing'

import { Form, FormField, FormSubmitButton } from 'core/forms'
import ToggleInputField from 'pages/common/forms/ToggleInputField'
import history from 'pages/history'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { DEFAULT_EXPRESSION_RULE } from '../../constants'
import useSaveCondition from '../../hooks/useSaveCondition'
import ConditionForm from '../ConditionForm'
import { DeletionPopover } from '../DeletionPopover'
import { ExpressionField } from '../ExpressionField'
import ThenField from '../ThenField'

jest.mock('core/forms', () => ({
    Form: jest.fn(({ children }) => <form>{children}</form>),
    FormField: jest.fn(() => <div />),
    FormSubmitButton: jest.fn(() => <button />),
    createFormValidator: jest.fn(),
}))
jest.mock('pages/common/forms/ToggleInputField', () =>
    jest.fn(() => <input type="checkbox" />),
)
jest.mock('../../hooks/useSaveCondition', () => jest.fn())
jest.mock('../DeletionPopover', () => ({
    DeletionPopover: jest.fn(),
}))
jest.mock('../ExpressionField', () => ({
    ExpressionField: jest.fn(() => <div />),
}))
jest.spyOn(history, 'push')

const DeletionPopoverMock = assumeMock(DeletionPopover)
const useSaveConditionMock = assumeMock(useSaveCondition)
const FormMock = assumeMock(Form)
const FormFieldMock = assumeMock(FormField)

describe('ConditionForm', () => {
    const onDisplayConfirmationMock = jest.fn()
    const onSubmitMock = jest.fn()
    const isSubmitting = false

    beforeEach(() => {
        DeletionPopoverMock.mockImplementation(
            ({ children }: ComponentProps<typeof DeletionPopover>) => (
                <div>
                    {children({
                        uid: 'uid',
                        onDisplayConfirmation: onDisplayConfirmationMock,
                        elementRef: jest.fn(),
                    })}
                </div>
            ),
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
            description: null,
            deactivated_datetime: null,
        } as CustomFieldCondition,
    }

    it('should call Form with proper props', () => {
        const { rerender } = render(<ConditionForm {...defaultProps} />)
        expect(FormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                children: expect.any(Array),
                defaultValues: expect.objectContaining({
                    name: '',
                    description: '',
                    object_type: 'Ticket',
                    deactivated_datetime: null,
                    requirements: [],
                    expression: [DEFAULT_EXPRESSION_RULE],
                }),
                values: expect.objectContaining({
                    name: 'Test Condition',
                    description: '',
                    deactivated_datetime: null,
                }),
            }),
            {},
        )

        rerender(<ConditionForm />)
        expect(FormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                values: undefined,
            }),
            {},
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
            {},
        )
        expect(FormFieldMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                name: 'description',
                placeholder:
                    'Describe how the condition works. E.g: Display when contact reason includes quality and shipping',
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                field: ThenField,
                name: 'requirements',
                isRequired: true,
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                field: ToggleInputField,
                name: 'deactivated_datetime',
                inputTransform: expect.any(Function),
                outputTransform: expect.any(Function),
            }),
            {},
        )

        expect(
            FormFieldMock.mock.calls[3][0].inputTransform?.(null),
        ).toBeTruthy()
        expect(
            FormFieldMock.mock.calls[3][0].inputTransform?.('test'),
        ).toBeFalsy()
        expect(
            FormFieldMock.mock.calls[3][0].outputTransform?.(true),
        ).toBeNull()
        expect(
            typeof FormFieldMock.mock.calls[3][0].outputTransform?.(false),
        ).toBe('string')
    })

    it('should call ExpressionField', () => {
        render(<ConditionForm />)
        expect(ExpressionField).toHaveBeenCalled()
    })

    it('should call onSubmit of valid submit and pass it form data', () => {
        render(<ConditionForm />)
        const data = { hey: 'there' }
        getLastMockCall(FormMock)[0].onValidSubmit(data)

        expect(onSubmitMock).toHaveBeenCalledWith(data)
    })

    it('should call FormSubmitButton with correct props', () => {
        render(<ConditionForm />)
        expect(FormSubmitButton).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: isSubmitting,
            }),
            {},
        )
    })

    it('should navigate to the conditions route when cancel button is clicked', () => {
        render(<ConditionForm {...defaultProps} />)
        fireEvent.click(screen.getByText('Cancel'))

        expect(history.push).toHaveBeenCalledWith(
            `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
        )
    })

    it('should render the DeletionPopover when condition is provided', () => {
        render(<ConditionForm {...defaultProps} />)
        expect(DeletionPopoverMock).toHaveBeenCalledWith(
            expect.objectContaining({
                condition: defaultProps.condition,
                redirect: true,
            }),
            {},
        )
    })

    it('should call onDisplayConfirmation when delete button is clicked', () => {
        render(<ConditionForm {...defaultProps} />)
        fireEvent.click(screen.getByText('Delete Condition'))

        expect(onDisplayConfirmationMock).toHaveBeenCalled()
    })
})
