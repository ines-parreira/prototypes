import {screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'
import {SearchBodyType, useSearch} from '@gorgias/api-queries'
import {isValidPhoneNumber} from 'libphonenumber-js'
import {Provider} from 'react-redux'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock, mockStore} from 'utils/testing'
import * as selectors from 'state/integrations/selectors'
import PhoneDeviceDialer from '../PhoneDeviceDialer'
import PhoneDeviceDialerIntegrationSelect from '../PhoneDeviceDialerIntegrationSelect'
import useDialerOutboundCall from '../useDialerOutboundCall'
import * as PhoneDeviceDialerBody from '../PhoneDeviceDialerBody'

jest.mock('@gorgias/api-queries')
jest.mock('libphonenumber-js')
jest.mock(
    'pages/integrations/integration/components/phone/useDialerOutboundCall'
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
        }) =>
            (
                <>
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        data-testid="mock-text-input"
                    />
                    {suffix}
                </>
            )
)

jest.mock('pages/common/forms/PhoneNumberInput/PhoneNumberInput', () => {
    const {forwardRef} = jest.requireActual('react')
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
            )
        ),
    }
})

const PhoneDeviceDialerBodySpy = jest
    .spyOn(PhoneDeviceDialerBody, 'default')
    .mockImplementation(() => <div data-testid="mock-dialer-body" />)

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialerIntegrationSelect'
)

const PhoneDeviceDialerIntegrationSelectMock = assumeMock(
    PhoneDeviceDialerIntegrationSelect
)
PhoneDeviceDialerIntegrationSelectMock.mockImplementation(() => (
    <>PhoneDeviceDialerIntegrationSelect</>
))

const getPhoneIntegrationsSpy = jest.spyOn(selectors, 'getPhoneIntegrations')
const useSearchMock = assumeMock(useSearch)
const isValidPhoneNumberMock = assumeMock(isValidPhoneNumber)
const useDialerOutboundCallMock = assumeMock(useDialerOutboundCall)

describe('PhoneDeviceDialer', () => {
    const useSearchMockValue = {
        mutate: jest.fn(),
        isLoading: false,
        data: undefined,
        reset: jest.fn(),
    }
    const mockPhoneIntegrations = [
        {id: 1, name: 'testIntegration'},
        {id: 2, name: 'otherTestIntegration2'},
    ]

    const onCallInitiated = jest.fn()

    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialer onCallInitiated={onCallInitiated} />
            </Provider>
        )

    beforeEach(() => {
        useSearchMock.mockReturnValue(useSearchMockValue as any)
        getPhoneIntegrationsSpy.mockReturnValue(mockPhoneIntegrations as any)
    })

    it('renders initial state correctly: phone number input, body, integration selector and cta', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(screen.getByTestId('mock-dialer-body')).toBeInTheDocument()
        expect(
            screen.getByText('PhoneDeviceDialerIntegrationSelect')
        ).toBeInTheDocument()
        expect(PhoneDeviceDialerIntegrationSelectMock).toHaveBeenCalledWith(
            {
                value: mockPhoneIntegrations[0],
                onChange: expect.any(Function),
                options: mockPhoneIntegrations,
            },
            {}
        )
        expect(screen.getByRole('button', {name: 'Call'})).toBeInTheDocument()
    })

    it('updates the input value when handleChange is called', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})
        expect(inputElement.value).toBe('1234567890')
    })

    it('displays customer search input when value contains letters', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})
        expect(screen.queryByTestId('mock-text-input')).not.toBeInTheDocument()

        fireEvent.change(inputElement, {target: {value: '1234567890a'}})
        expect(screen.getByTestId('mock-text-input')).toBeInTheDocument()
    })

    it('displays customer search input when customer is selected', () => {
        renderComponent()

        PhoneDeviceDialerBodySpy.mock.calls[0][0].onCustomerSelect({
            id: '1',
            customer: {
                name: 'testCustomerName',
            },
            address: 'testAddress',
        } as any)
        expect(screen.getByTestId('mock-text-input')).toHaveValue(
            'testCustomerName'
        )
    })

    it('displays customer search input with customer address as value when customer is selected and has no name', () => {
        renderComponent()

        PhoneDeviceDialerBodySpy.mock.calls[0][0].onCustomerSelect({
            id: '1',
            customer: {},
            address: 'testAddress',
        } as any)
        expect(screen.getByTestId('mock-text-input')).toHaveValue('testAddress')
    })

    it('calls searchCustomers when input value is changed and value is longer than 3 characters', async () => {
        jest.useFakeTimers()
        const searchCustomersMock = jest.fn()
        useSearchMock.mockReturnValue({
            mutate: searchCustomersMock,
            isLoading: false,
            data: {data: {data: []}},
        } as any)
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})

        jest.advanceTimersByTime(1000)
        await waitFor(() => {
            expect(searchCustomersMock).toHaveBeenCalledWith({
                data: {
                    type: SearchBodyType.CustomerChannelPhone,
                    query: '1234567890',
                },
            })
        })
    })

    it('does not call searchCustomers when input value is changed and value is shorter than 3 characters', () => {
        jest.useFakeTimers()
        const searchCustomersMock = jest.fn()
        useSearchMock.mockReturnValue({
            mutate: searchCustomersMock,
            isLoading: false,
            data: {data: {data: []}},
            reset: jest.fn(),
        } as any)
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '12'}})

        jest.advanceTimersByTime(1000)
        expect(searchCustomersMock).not.toHaveBeenCalled()
    })

    it('calls searchCustomers with empty query when customer search input is cleared', async () => {
        const useSearchMockValue = {
            mutate: jest.fn(),
            isLoading: false,
            data: undefined,
            reset: jest.fn(),
        }
        useSearchMock.mockReturnValue(useSearchMockValue as any)
        renderComponent()

        const phoneInputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(phoneInputElement, {target: {value: 'test'}})
        fireEvent.click(screen.getByRole('button', {name: 'close'}))

        await waitFor(() => {
            expect(useSearchMockValue.reset).toHaveBeenCalled()
        })
    })

    it('displays Call button as enabled by default', () => {
        renderComponent()

        expect(screen.getByRole('button', {name: 'Call'})).not.toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('displays Call button as disabled when customer search is active and no customer is selected', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890a'}})

        expect(screen.getByRole('button', {name: 'Call'})).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('displays Call button as enabled when customer search is active and customer is selected', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890a'}})

        PhoneDeviceDialerBodySpy.mock.calls[0][0].onCustomerSelect({
            id: '1',
            customer: {
                name: 'testCustomerName',
            },
            address: 'testAddress',
        } as any)

        expect(screen.getByRole('button', {name: 'Call'})).not.toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('displays error when phone number is not valid and button was pressed', () => {
        isValidPhoneNumberMock.mockReturnValue(false)
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '123'}})
        fireEvent.click(screen.getByRole('button', {name: 'Call'}))

        expect(screen.getByText('Enter a valid number')).toBeInTheDocument()
    })

    it('makes outbound call when phone number is valid and button was pressed', () => {
        const makeOutboundCallMock = jest.fn()
        isValidPhoneNumberMock.mockReturnValue(true)
        useDialerOutboundCallMock.mockReturnValue(makeOutboundCallMock)

        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})
        fireEvent.click(screen.getByRole('button', {name: 'Call'}))

        expect(makeOutboundCallMock).toHaveBeenCalled()
        expect(
            screen.queryByText('Enter a valid number')
        ).not.toBeInTheDocument()
    })

    it('resets search mutation when input value is shorter than 5 characters for phone number search', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234'}})

        expect(useSearchMockValue.reset).toHaveBeenCalled()
    })

    it('resets search mutation when input value is shorter than 3 characters for customer search', () => {
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: 'ab'}})

        expect(useSearchMockValue.reset).toHaveBeenCalled()
    })

    it('renders PhoneDeviceDialerBody with isLoading true only if isSearchTypeCustomer is true', () => {
        useSearchMock.mockReturnValue({
            isLoading: true,
            data: {data: {data: []}},
        } as any)

        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '1234567890'}})

        expect(PhoneDeviceDialerBodySpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: false,
            }),
            {}
        )

        fireEvent.change(inputElement, {target: {value: '1234567890a'}})
        expect(PhoneDeviceDialerBodySpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {}
        )
    })
})
