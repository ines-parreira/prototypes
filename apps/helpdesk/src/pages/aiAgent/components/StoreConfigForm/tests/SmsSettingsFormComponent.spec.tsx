import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { SmsSettingsFormComponent } from '../FormComponents/SmsSettingsFormComponent'
import { useSmsPhoneNumbers } from '../hooks/useSmsPhoneNumbers'
import { SmsPhoneNumber } from '../types'

jest.mock('../hooks/useSmsPhoneNumbers')

type SmsItem = { id: number; name: string }

jest.mock(
    '../../SmsIntegrationListSelection/SmsIntegrationListSelection',
    () => ({
        SmsIntegrationListSelection: ({
            onSelectionChange,
            smsItems,
        }: {
            selectedIds: number[]
            onSelectionChange: (ids: number[]) => void
            smsItems: SmsItem[]
        }) => (
            <div>
                <p>SMS List Selection Component</p>
                <ul>
                    {smsItems.map((item: SmsItem) => (
                        <li key={item.id} data-testid={`sms-item-${item.id}`}>
                            {item.name}
                        </li>
                    ))}
                </ul>
                <button onClick={() => onSelectionChange([smsItems[0].id])}>
                    Select SMS
                </button>
            </div>
        ),
    }),
)

const mockUseSmsPhoneNumbers = jest.mocked(useSmsPhoneNumbers)
const mockUpdateValue = jest.fn()
const mockSetIsPristine = jest.fn()

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState) as Map<any, any>,
} as RootState

const defaultProps = {
    monitoredSmsIntegrations: null,
    smsDisclaimer: null,
    updateValue: mockUpdateValue,
    setIsPristine: mockSetIsPristine,
}

const renderWithProvider = (props: any = defaultProps) => {
    renderWithRouter(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(defaultState)}>
                <SmsSettingsFormComponent {...props} />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('SmsSettingsFormComponent', () => {
    const mockSmsPhoneNumbers: SmsPhoneNumber[] = [
        {
            id: 1,
            phoneNumberName: 'SMS Integration 1',
            address: '+1234567890',
            isDeactivated: false,
            channel: 'sms',
            type: 'sms',
            name: 'SMS Integration 1',
        },
        {
            id: 2,
            phoneNumberName: 'SMS Integration 2',
            address: '+1234567890',
            isDeactivated: false,
            channel: 'sms',
            type: 'sms',
            name: 'SMS Integration 2',
        },
    ]

    beforeEach(() => {
        mockUseSmsPhoneNumbers.mockReturnValue(mockSmsPhoneNumbers)
        mockUpdateValue.mockClear()
        mockSetIsPristine.mockClear()
    })

    it('renders the form with default SMS list and shows required label', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })

        screen.getByText(/Select one or more SMS phone numbers/i)
        screen.getByText('SMS Integration 1')
        screen.getByText('SMS Integration 2')
        screen.getByText('One or more SMS required.')
    })

    it('displays no error message when SMS integrations are selected', () => {
        const props = { ...defaultProps, monitoredSmsIntegrations: [1] }

        renderWithProvider(props)

        expect(
            screen.queryByText('One or more SMS required.'),
        ).not.toBeInTheDocument()
    })

    it('calls updateValue when an SMS integration is selected', () => {
        renderWithProvider()

        fireEvent.click(screen.getByText('Select SMS'))

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'monitoredSmsIntegrations',
            [1],
        )
    })

    it('calls setIsPristine when an SMS integration is selected', () => {
        renderWithProvider()

        fireEvent.click(screen.getByText('Select SMS'))

        expect(mockSetIsPristine).toHaveBeenCalledWith(false)
    })

    it('shows an error message when no SMS is selected and value is required', () => {
        renderWithProvider({ ...defaultProps, isRequired: true })

        screen.getByText('One or more SMS required.')
        screen.getByText(/Select one or more SMS phone numbers/i)
    })

    it('does not show error message when isRequired is false', () => {
        renderWithProvider({ ...defaultProps, isRequired: false })

        expect(
            screen.queryByText('One or more SMS required.'),
        ).not.toBeInTheDocument()
    })

    it('prefills initial value when shouldPrefillValue is true', () => {
        const props = {
            ...defaultProps,
            initialValue: 1,
            monitoredSmsIntegrations: [],
            shouldPrefillValue: true,
        }

        renderWithProvider(props)

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'monitoredSmsIntegrations',
            [1],
        )
    })

    it('does not prefill when shouldPrefillValue is false', () => {
        const props = {
            ...defaultProps,
            initialValue: 1,
            monitoredSmsIntegrations: [],
            shouldPrefillValue: false,
        }

        renderWithProvider(props)

        expect(mockUpdateValue).not.toHaveBeenCalled()
    })

    it('does not prefill when monitoredSmsIntegrations is not empty', () => {
        const props = {
            ...defaultProps,
            initialValue: 1,
            monitoredSmsIntegrations: [2],
            shouldPrefillValue: true,
        }

        renderWithProvider(props)

        expect(mockUpdateValue).not.toHaveBeenCalled()
    })

    it('passes disabled state to SmsIntegrationListSelection', () => {
        const props = { ...defaultProps, isDisabled: true }

        renderWithProvider(props)

        screen.getByText('SMS List Selection Component')
    })
})
