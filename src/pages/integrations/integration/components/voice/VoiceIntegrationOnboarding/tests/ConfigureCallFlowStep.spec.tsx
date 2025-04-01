import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { PhoneFunction } from '@gorgias/api-queries'

import {
    FormField,
    FormSubmitButton,
    useFormContext,
    useFormState,
} from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { assumeMock } from 'utils/testing'

import ConfigureRoutingBehaviorStep from '../ConfigureRoutingBehaviorStep'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

const watchMock = jest.fn()
const setValueMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    setValue: setValueMock,
} as unknown as ReturnType<typeof useFormContext>

jest.mock('core/forms')
const useFormContextMock = assumeMock(useFormContext)
const useFormStateMock = assumeMock(useFormState)
const FormFieldMock = assumeMock(FormField)
const FormSubmitButtonMock = assumeMock(FormSubmitButton)

jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')

describe('ConfigureRoutingBehaviorStep', () => {
    const mockGoToPreviousStep = jest.fn()
    const mockGoToNextStep = jest.fn()
    const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)

    beforeEach(() => {
        useNavigateWizardStepsMock.mockReturnValue({
            goToPreviousStep: mockGoToPreviousStep,
            goToNextStep: mockGoToNextStep,
        })
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        watchMock.mockReturnValue([
            PhoneFunction.Standard,
            134,
            1,
            false,
        ] as any)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        useFormStateMock.mockReturnValue({ isValid: true } as any)
        useAppSelectorMock.mockReturnValue({})
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        FormSubmitButtonMock.mockImplementation(
            ({ children, isDisabled }: any) => (
                <button aria-disabled={isDisabled}>{children}</button>
            ),
        )
    })

    const renderComponent = () => render(<ConfigureRoutingBehaviorStep />)

    it('should render the component', () => {
        watchMock.mockReturnValue([
            PhoneFunction.Standard,
            undefined,
            undefined,
            false,
        ] as any)

        renderComponent()

        expect(screen.getByText('Routing behavior')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Create voice integration')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should call goToPreviousStep when Back button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Back'))
        expect(mockGoToPreviousStep).toHaveBeenCalled()
    })

    it('should enable submit button when form is valid and conditions are met', () => {
        renderComponent()

        expect(screen.getByText('Create voice integration')).toBeAriaEnabled()
    })

    it('should disable submit button when form is invalid', () => {
        useFormStateMock.mockReturnValue({ isValid: false } as any)

        renderComponent()

        expect(screen.getByText('Create voice integration')).toBeAriaDisabled()
    })

    it('should disable submit button when conditions are not met', () => {
        watchMock.mockReturnValue([
            PhoneFunction.Standard,
            undefined,
            undefined,
            false,
        ] as any)

        renderComponent()

        expect(screen.getByText('Create voice integration')).toBeAriaDisabled()
    })

    it('should display IVR message when phone function is IVR', () => {
        watchMock.mockReturnValue([
            PhoneFunction.Ivr,
            undefined,
            undefined,
            false,
        ] as any)

        renderComponent()

        expect(screen.getByText("You're all set.")).toBeInTheDocument()
        expect(
            screen.getByText(
                'Once your voice integration is complete, navigate to the IVR section within the new integration to configure your IVR settings.',
            ),
        ).toBeInTheDocument()
    })
})
