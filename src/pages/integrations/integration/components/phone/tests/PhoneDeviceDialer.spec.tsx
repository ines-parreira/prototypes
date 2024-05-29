import {screen, fireEvent, waitFor} from '@testing-library/react'
import React from 'react'
import {SearchBodyType, useSearch} from '@gorgias/api-queries'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import PhoneDeviceDialer from '../PhoneDeviceDialer'

jest.mock('@gorgias/api-queries')

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

jest.mock(
    'pages/common/forms/PhoneNumberInput/PhoneNumberInput',
    () =>
        ({
            onChange,
            value,
        }: {
            onChange: (value: string) => void
            value: string
        }) =>
            (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    data-testid="mock-phone-input"
                />
            )
)

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialerBody',
    () =>
        ({
            onCustomerSelect,
        }: {
            value: string
            onChange: (value: string) => void
            results: any[]
            isLoading: boolean
            isSearchTypeCustomer: boolean
            selectedCustomer: any
            onCustomerSelect: (customer: any) => void
        }) =>
            (
                <div data-testid="mock-dialer-body">
                    <button
                        data-testid="select-customer"
                        onClick={() => onCustomerSelect({id: '1'})}
                    />
                </div>
            )
)

const useSearchMock = assumeMock(useSearch)

const renderComponent = () =>
    renderWithQueryClientProvider(<PhoneDeviceDialer />)

describe('PhoneDeviceDialer', () => {
    beforeEach(() => {
        useSearchMock.mockReturnValue({
            mutate: jest.fn(),
            isLoading: false,
            data: undefined,
        } as any)
    })

    it('renders initial state correctly: phone number input, body, integration selector and cta', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(screen.getByTestId('mock-dialer-body')).toBeInTheDocument()
        expect(screen.getByText('Select integration')).toBeInTheDocument()
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

        fireEvent.click(screen.getByTestId('select-customer'))
        expect(screen.getByTestId('mock-text-input')).toBeInTheDocument()
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
        } as any)
        renderComponent()

        const inputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(inputElement, {target: {value: '12'}})

        jest.advanceTimersByTime(1000)
        expect(searchCustomersMock).not.toHaveBeenCalled()
    })

    it('calls searchCustomers with empty query when customer search input is cleared', async () => {
        const searchCustomersMock = jest.fn()
        useSearchMock.mockReturnValue({
            mutate: searchCustomersMock,
            isLoading: false,
            data: {data: {data: []}},
        } as any)
        renderComponent()

        const phoneInputElement: HTMLInputElement =
            screen.getByTestId('mock-phone-input')

        fireEvent.change(phoneInputElement, {target: {value: 'test'}})

        fireEvent.click(screen.getByRole('button', {name: 'close'}))

        await waitFor(() => {
            expect(searchCustomersMock).toHaveBeenCalledWith({
                data: {
                    type: SearchBodyType.CustomerChannelPhone,
                    query: '',
                },
            })
        })
    })
})
