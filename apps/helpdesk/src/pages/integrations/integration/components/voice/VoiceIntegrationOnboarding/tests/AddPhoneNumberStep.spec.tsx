import { assumeMock } from '@repo/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useFormContext } from 'react-hook-form'

import { PhoneFunction } from '@gorgias/helpdesk-queries'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import AddPhoneNumberStep from '../AddPhoneNumberStep'

jest.mock('hooks/useSearch')
jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
jest.mock('../VoiceIntegrationOnboardingCancelButton', () => () => (
    <button>Cancel</button>
))
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('core/forms')
jest.mock('react-hook-form')

const useAppSelectorMock = useAppSelector as jest.Mock
const FormFieldMock = assumeMock(FormField)

const watchMock = jest.fn()
const setValueMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    setValue: setValueMock,
    formState: {
        isValid: true,
    },
} as unknown as ReturnType<typeof useFormContext>

const useFormContextMock = assumeMock(useFormContext)

describe('AddPhoneNumberStep', () => {
    const mockGoToNextStep = jest.fn()
    const mockGoToPreviousStep = jest.fn()
    const onCreateNewNumberMock = jest.fn()
    const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)
    const useSearchMock = assumeMock(useSearch)

    beforeEach(() => {
        useNavigateWizardStepsMock.mockReturnValue({
            goToNextStep: mockGoToNextStep,
            goToPreviousStep: mockGoToPreviousStep,
        })
        FormFieldMock.mockImplementation(({ label }: any) => <div>{label}</div>)
        watchMock.mockReturnValue([null, PhoneFunction.Standard] as any)
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        useSearchMock.mockReturnValue({ phoneNumberId: undefined })
    })

    const renderComponent = () =>
        render(<AddPhoneNumberStep onCreateNewNumber={onCreateNewNumberMock} />)

    it('should render', () => {
        watchMock.mockReturnValue(['☎️', PhoneFunction.Standard] as any)

        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()

        expect(FormFieldMock).toHaveBeenCalledTimes(3)
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'name', isRequired: true }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'meta.phone_number_id',
                isRequired: true,
            }),
            {},
        )
        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'business_hours_id' }),
            {},
        )
    })

    it('should select the phone number', () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })
        useAppSelectorMock.mockReturnValue({ 123: { id: 'returnedId' } })

        FormFieldMock.mockImplementation(
            ({ inputTransform, outputTransform, name }: any) => {
                if (!!inputTransform && !!outputTransform) {
                    return (
                        <div>
                            <span>{outputTransform(inputTransform(123))}</span>
                        </div>
                    )
                }
                return <>{name}</>
            },
        )

        renderComponent()

        expect(screen.getByText('returnedId')).toBeInTheDocument()

        expect(mockUseFormContextReturnValue.setValue).toHaveBeenCalledWith(
            'meta.phone_number_id',
            123,
        )
    })

    it('should work without selected phone number', () => {
        useAppSelectorMock.mockReturnValue({ 123: { id: 'returnedId' } })

        FormFieldMock.mockImplementation(
            ({ inputTransform, outputTransform, name }: any) => {
                if (!!inputTransform && !!outputTransform) {
                    return (
                        <div>
                            <span>{outputTransform(inputTransform(null))}</span>
                        </div>
                    )
                }
                return <>{name}</>
            },
        )

        renderComponent()

        expect(screen.queryByText('returnedId')).toBeNull()
        expect(mockUseFormContextReturnValue.setValue).not.toHaveBeenCalled()
    })

    it('should call goToNextStep when Next button is clicked', async () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent()

        const nextButton = screen.getByRole('button', { name: /Next/i })
        await act(() => userEvent.click(nextButton))

        await waitFor(() => expect(mockGoToNextStep).toHaveBeenCalled())
    })

    it('should call onCreateNewNumber when a new phone number is created', async () => {
        FormFieldMock.mockImplementation(({ onCreate, name }: any) => {
            if (!!onCreate) {
                return (
                    <button onClick={() => onCreate({ id: '123' })}>
                        Create Number
                    </button>
                )
            }
            return <>{name}</>
        })

        renderComponent()

        const createButton = screen.getByRole('button', {
            name: /Create Number/i,
        })
        await act(() => userEvent.click(createButton))
        await waitFor(() =>
            expect(onCreateNewNumberMock).toHaveBeenCalledWith({ id: '123' }),
        )
    })

    it('should render business hours field', () => {
        renderComponent()

        expect(FormFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'business_hours_id' }),
            {},
        )
    })

    it('should have aria-disabled when form is invalid', () => {
        useFormContextMock.mockReturnValue({
            ...mockUseFormContextReturnValue,
            formState: { isValid: false },
        } as any)

        renderComponent()

        const nextButton = screen.getByRole('button', { name: /Next/i })
        expect(nextButton).toHaveAttribute('aria-disabled', 'true')
    })
})
