import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { SendTestSMSModal } from './SendTestSMSModal'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(() => ({
        journeyData: { id: 'journey-123' },
        currentIntegration: { id: 1, name: 'Test Store' },
    })),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useHandleSendTestSMS: jest.fn(() => ({
        handleTestSms: jest.fn().mockResolvedValue(undefined),
    })),
}))

jest.mock('AIJourney/components/CountryCodeSelect/CountryCodeSelect', () => ({
    CountryCodeSelect: ({
        onCountryChange,
    }: {
        onCountryChange: (code: string) => void
    }) => (
        <button
            onClick={() => onCountryChange('FR')}
            aria-label="Select country"
        >
            +1
        </button>
    ),
}))

jest.mock('pages/settings/helpCenter/utils/phoneCodeSelectOptions', () => ({
    getCountryCallingCodeFixed: jest.fn(() => '1'),
}))

const mockStore = configureMockStore([thunk])()

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm()
    return (
        <Provider store={mockStore}>
            <FormProvider {...methods}>{children}</FormProvider>
        </Provider>
    )
}

const renderComponent = (isOpen = true, onClose = jest.fn()) =>
    render(<SendTestSMSModal isOpen={isOpen} onClose={onClose} />, {
        wrapper: Wrapper,
    })

describe('<SendTestSMSModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('should render the modal when open', () => {
        renderComponent(true)

        expect(screen.getByText('Send test SMS')).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /phone number/i }),
        ).toBeInTheDocument()
    })

    it('should disable the "Send test" button when phone number has no digits', () => {
        renderComponent(true)

        expect(
            screen.getByRole('button', { name: /send test/i }),
        ).toBeDisabled()
    })

    it('should enable the "Send test" button when a phone number is entered', async () => {
        const user = userEvent.setup()
        renderComponent(true)

        await user.type(
            screen.getByRole('textbox', { name: /phone number/i }),
            '6501234567',
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /send test/i }),
            ).not.toBeDisabled()
        })
    })

    it('should call onClose after successfully sending the SMS', async () => {
        const mockOnClose = jest.fn()
        const user = userEvent.setup()
        renderComponent(true, mockOnClose)

        await user.type(
            screen.getByRole('textbox', { name: /phone number/i }),
            '6501234567',
        )

        await user.click(screen.getByRole('button', { name: /send test/i }))

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('should update the calling code when country code changes', async () => {
        const mockGetCountryCallingCodeFixed =
            require('pages/settings/helpCenter/utils/phoneCodeSelectOptions')
                .getCountryCallingCodeFixed as jest.Mock

        const user = userEvent.setup()
        renderComponent(true)

        await user.click(
            screen.getByRole('button', { name: /select country/i }),
        )

        expect(mockGetCountryCallingCodeFixed).toHaveBeenCalledWith('FR')
    })

    it('should keep phone number empty when country changes with no digits entered', async () => {
        const user = userEvent.setup()
        renderComponent(true)

        await user.click(
            screen.getByRole('button', { name: /select country/i }),
        )

        expect(
            screen.getByRole('textbox', { name: /phone number/i }),
        ).toHaveValue('')
    })
})
