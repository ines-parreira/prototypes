import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { PhoneIntegration } from 'models/integration/types'
import { PhoneNumberInputHandle } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore } from 'utils/testing'

import PhoneDeviceDialer from '../PhoneDeviceDialer'
import * as PhoneDeviceDialerBody from '../PhoneDeviceDialerBody'
import PhoneDeviceDialerIntegrationSelect from '../PhoneDeviceDialerIntegrationSelect'
import usePhoneDeviceDialer from '../usePhoneDeviceDialer'

jest.mock(
    'pages/integrations/integration/components/phone/usePhoneDeviceDialer',
)

jest.mock(
    'pages/common/forms/input/TextInput',
    () =>
        ({
            onChange,
            value,
            suffix,
        }: {
            onChange: (value: string) => void
            value: string
            suffix?: React.ReactNode
        }) => (
            <>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    data-testid="mock-text-input"
                />
                {suffix}
            </>
        ),
)

jest.mock('pages/common/forms/PhoneNumberInput/PhoneNumberInput', () => {
    const { forwardRef } = jest.requireActual('react')
    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        default: forwardRef(
            ({
                onChange,
                value,
                error,
            }: {
                onChange: (value: string) => void
                value: string
                error?: string
            }) => (
                <>
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        data-testid="mock-phone-input"
                    />
                    <div data-testid="mock-phone-input-error">{error}</div>
                </>
            ),
        ),
    }
})

const PhoneDeviceDialerBodySpy = jest
    .spyOn(PhoneDeviceDialerBody, 'default')
    .mockImplementation(() => <div data-testid="mock-dialer-body" />)

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialerIntegrationSelect',
)

const PhoneDeviceDialerIntegrationSelectMock = assumeMock(
    PhoneDeviceDialerIntegrationSelect,
)
PhoneDeviceDialerIntegrationSelectMock.mockImplementation(() => (
    <>PhoneDeviceDialerIntegrationSelect</>
))

const usePhoneDeviceDialerMock = assumeMock(usePhoneDeviceDialer)

describe('PhoneDeviceDialer', () => {
    const onCallInitiated = jest.fn()
    const phoneNumberInputRef = React.createRef<PhoneNumberInputHandle>()
    const textInputRef = React.createRef<HTMLInputElement>()
    const mockPhoneDeviceDialerHookResult = {
        inputValue: '',
        handleChange: jest.fn(),
        isSearchTypeCustomer: false,
        isSearchingCustomers: false,
        customers: [],
        selectedCustomer: null,
        highlightedResultIndex: null,
        selectedIntegration: {
            id: 1,
            name: 'testIntegration',
        } as PhoneIntegration,
        setSelectedIntegration: jest.fn(),
        isCallButtonDisabled: false,
        handleCallClick: jest.fn(),
        phoneNumberInputError: '',
        phoneNumberInputRef,
        textInputRef,
        phoneIntegrations: [
            {
                id: 1,
                name: 'testIntegration',
            },
            {
                id: 2,
                name: 'otherTestIntegration2',
            },
        ] as PhoneIntegration[],
        handleSelectCustomer: jest.fn(),
        handleInputKeyDown: jest.fn(),
    }

    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialer onCallInitiated={onCallInitiated} />
            </Provider>,
        )

    beforeEach(() => {
        usePhoneDeviceDialerMock.mockReturnValue(
            mockPhoneDeviceDialerHookResult,
        )
    })

    it('renders initial state correctly: phone number input, body, integration selector and cta', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(screen.getByTestId('mock-dialer-body')).toBeInTheDocument()
        expect(
            screen.getByText('PhoneDeviceDialerIntegrationSelect'),
        ).toBeInTheDocument()
        expect(PhoneDeviceDialerIntegrationSelectMock).toHaveBeenCalledWith(
            {
                value: mockPhoneDeviceDialerHookResult.selectedIntegration,
                onChange: expect.any(Function),
                options: mockPhoneDeviceDialerHookResult.phoneIntegrations,
            },
            {},
        )
        expect(screen.getByRole('button', { name: 'Call' })).toBeInTheDocument()
    })

    it('calls handleChange when value changes', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, { target: { value: '1234567890' } })
        expect(
            mockPhoneDeviceDialerHookResult.handleChange,
        ).toHaveBeenCalledWith('1234567890')
    })

    it('displays customer search input when customer is selected', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            selectedCustomer: {
                customer: {
                    id: 1,
                    name: 'testCustomerName',
                },
                address: 'testAddress',
            } as any,
        })

        renderComponent()

        expect(screen.getByTestId('mock-text-input')).toBeInTheDocument()
    })

    it('displays customer search input with customer address as value when customer is selected and has no name', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            selectedCustomer: {
                id: 1,
                customer: {},
                address: 'testAddress',
            } as any,
        })
        renderComponent()

        PhoneDeviceDialerBodySpy.mock.calls[0][0].onCustomerSelect({
            id: '1',
            customer: {},
            address: 'testAddress',
        } as any)
        expect(screen.getByTestId('mock-text-input')).toHaveValue('testAddress')
    })

    it('displays Call button as enabled when isCallButtonDisabled is false', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            isCallButtonDisabled: false,
        })
        renderComponent()

        expect(screen.getByRole('button', { name: 'Call' })).toBeAriaEnabled()
    })

    it('displays Call button as disabled when isCallButtonDisabled is true', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            isCallButtonDisabled: true,
        })
        renderComponent()

        expect(screen.getByRole('button', { name: 'Call' })).toBeAriaDisabled()
    })

    it('displays error when phone number is not valid', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            phoneNumberInputError: 'Enter a valid number',
        })

        renderComponent()

        expect(screen.getByText('Enter a valid number')).toBeInTheDocument()
    })

    it('triggers handleCallClick when Call button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByRole('button', { name: 'Call' }))

        expect(
            mockPhoneDeviceDialerHookResult.handleCallClick,
        ).toHaveBeenCalled()
    })

    it('renders PhoneDeviceDialerBody with isLoading true only if isSearchTypeCustomer is true', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            isSearchTypeCustomer: true,
            isSearchingCustomers: true,
        })

        renderComponent()

        expect(PhoneDeviceDialerBodySpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('renders PhoneDeviceDialerBody with correct props', () => {
        usePhoneDeviceDialerMock.mockReturnValue({
            ...mockPhoneDeviceDialerHookResult,
            highlightedResultIndex: 1,
        })

        renderComponent()

        expect(PhoneDeviceDialerBodySpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                highlightedResultIndex: 1,
            }),
            {},
        )
    })
})
