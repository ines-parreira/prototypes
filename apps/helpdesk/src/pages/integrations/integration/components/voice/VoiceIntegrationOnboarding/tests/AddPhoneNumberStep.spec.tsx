import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import { PhoneFunction } from '@gorgias/helpdesk-queries'

import { FormField } from 'core/forms'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import AddPhoneNumberStep from '../AddPhoneNumberStep'

jest.mock('hooks/useSearch')
jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
jest.mock('../VoiceIntegrationOnboardingCancelButton', () => () => (
    <button>Cancel</button>
))
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('core/forms')
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

jest.mock('react-hook-form')
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
        expect(screen.getByText('Function')).toBeInTheDocument()
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
            expect.objectContaining({ name: 'meta.function' }),
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

    it('should call goToNextStep when Next button is clicked', () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent()

        fireEvent.click(screen.getByText('Next'))
        expect(mockGoToNextStep).toHaveBeenCalled()
    })

    it.each([
        { phoneFunction: PhoneFunction.Standard, label: 'Standard' },
        {
            phoneFunction: PhoneFunction.Ivr,
            label: 'IVR (Interactive Voice Response)',
        },
    ])('should correctly map phone functions', ({ phoneFunction, label }) => {
        FormFieldMock.mockImplementation(({ optionMapper, name }: any) => {
            if (!!optionMapper) {
                return (
                    <div>
                        <span>{optionMapper(phoneFunction).value}</span>
                    </div>
                )
            }
            return <>{name}</>
        })

        renderComponent()

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('should call onCreateNewNumber when a new phone number is created', () => {
        FormFieldMock.mockImplementation(({ onCreate, name }: any) => {
            if (!!onCreate) {
                return (
                    <button onClick={() => onCreate({ id: '123' })}>
                        CREATE_BUTTON
                    </button>
                )
            }
            return <>{name}</>
        })

        renderComponent()

        fireEvent.click(screen.getByText('CREATE_BUTTON'))
        expect(onCreateNewNumberMock).toHaveBeenCalledWith({ id: '123' })
    })
})
