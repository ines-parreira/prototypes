import { Form } from '@repo/forms'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSearch } from 'hooks/useSearch'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import AddPhoneNumberStep from '../AddPhoneNumberStep'

jest.mock('hooks/useSearch')
jest.mock('pages/common/components/wizard/hooks/useNavigateWizardSteps')
jest.mock('../VoiceIntegrationOnboardingCancelButton', () => () => (
    <button>Cancel</button>
))

jest.mock('pages/phoneNumbers/PhoneNumberSelectField', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        onCreate,
    }: {
        value: { id: number | string } | null
        onChange: (value: { id: number } | null) => void
        onCreate?: (phoneNumber: { id: string }) => void
    }) => (
        <div>
            <div>Phone number select{value ? `: ${value.id}` : ''}</div>
            <button type="button" onClick={() => onChange({ id: 2 })}>
                Change phone number
            </button>
            {onCreate && (
                <button onClick={() => onCreate({ id: '123' })}>
                    Create Number
                </button>
            )}
        </div>
    ),
}))

jest.mock('pages/settings/businessHours/BusinessHoursSelectField', () => ({
    __esModule: true,
    default: () => <div>Business hours select</div>,
}))

const useSearchMock = assumeMock(useSearch)
const useNavigateWizardStepsMock = assumeMock(useNavigateWizardSteps)

describe('AddPhoneNumberStep', () => {
    const mockGoToNextStep = jest.fn()
    const mockGoToPreviousStep = jest.fn()
    const onCreateNewNumberMock = jest.fn()

    beforeEach(() => {
        useNavigateWizardStepsMock.mockReturnValue({
            goToNextStep: mockGoToNextStep,
            goToPreviousStep: mockGoToPreviousStep,
        })
        useSearchMock.mockReturnValue({ phoneNumberId: undefined })
    })

    const renderComponent = ({
        defaultValues = {},
        newPhoneNumbers = {},
        mode,
    }: {
        defaultValues?: Record<string, unknown>
        newPhoneNumbers?: Record<string, { id: number }>
        mode?: 'onChange' | 'onSubmit'
    } = {}) =>
        render(
            <Form
                mode={mode}
                defaultValues={{
                    name: 'Acme Phone',
                    business_hours_id: null,
                    meta: { emoji: '☎️', phone_number_id: null },
                    ...defaultValues,
                }}
                onValidSubmit={jest.fn()}
            >
                <AddPhoneNumberStep onCreateNewNumber={onCreateNewNumberMock} />
            </Form>,
            {
                storeState: {
                    entities: { newPhoneNumbers },
                },
            },
        )

    it('should render the step with its fields and actions', () => {
        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(screen.getByText('Integration name')).toBeInTheDocument()
        expect(screen.getByText('Phone number')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()

        expect(
            screen.getByPlaceholderText('Ex: Company Support Line'),
        ).toHaveValue('Acme Phone')
        expect(screen.getByText('Phone number select')).toBeInTheDocument()
        expect(screen.getByText('Business hours select')).toBeInTheDocument()
    })

    it('should select the phone number from the search param', async () => {
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent({ newPhoneNumbers: { 123: { id: 123 } } })

        await waitFor(() =>
            expect(
                screen.getByText('Phone number select: 123'),
            ).toBeInTheDocument(),
        )
    })

    it('should work without a selected phone number', () => {
        renderComponent({ newPhoneNumbers: { 123: { id: 123 } } })

        expect(screen.getByText('Phone number select')).toBeInTheDocument()
        expect(
            screen.queryByText('Phone number select: 123'),
        ).not.toBeInTheDocument()
    })

    it('should resolve the selected phone number on change', async () => {
        const user = userEvent.setup()

        renderComponent({ newPhoneNumbers: { 2: { id: 2 } } })

        await user.click(
            screen.getByRole('button', { name: /change phone number/i }),
        )

        await waitFor(() =>
            expect(
                screen.getByText('Phone number select: 2'),
            ).toBeInTheDocument(),
        )
    })

    it('should call goToNextStep when Next button is clicked', async () => {
        const user = userEvent.setup()
        useSearchMock.mockReturnValue({ phoneNumberId: '123' })

        renderComponent({
            mode: 'onChange',
            defaultValues: {
                name: 'Acme Phone',
                business_hours_id: 1,
                meta: { emoji: '☎️', phone_number_id: 123 },
            },
            newPhoneNumbers: { 123: { id: 123 } },
        })

        const nextButton = screen.getByRole('button', { name: /Next/i })
        await waitFor(() =>
            expect(nextButton).not.toHaveAttribute('aria-disabled', 'true'),
        )

        await user.click(nextButton)

        await waitFor(() => expect(mockGoToNextStep).toHaveBeenCalled())
    })

    it('should call onCreateNewNumber when a new phone number is created', async () => {
        const user = userEvent.setup()

        renderComponent()

        await user.click(screen.getByRole('button', { name: /Create Number/i }))

        await waitFor(() =>
            expect(onCreateNewNumberMock).toHaveBeenCalledWith({ id: '123' }),
        )
    })

    it('should render the business hours field', () => {
        renderComponent()

        expect(screen.getByText('Business hours select')).toBeInTheDocument()
    })

    it('should have aria-disabled when form is invalid', async () => {
        const user = userEvent.setup()
        renderComponent({
            defaultValues: {
                name: '',
                business_hours_id: null,
                meta: { emoji: '☎️', phone_number_id: null },
            },
            mode: 'onChange',
        })

        const nameInput = screen.getByPlaceholderText(
            'Ex: Company Support Line',
        )
        await user.click(nameInput)
        await user.tab()

        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: /Next/i }),
            ).toHaveAttribute('aria-disabled', 'true'),
        )
    })
})
