import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountryCode } from 'libphonenumber-js'
import { Provider } from 'react-redux'

import { UserSearchResult } from 'models/search/types'
import { PhoneNumberInputHandle } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import * as PhoneDeviceDialerBody from '../PhoneDeviceDialerBody'
import PhoneDeviceDialerInput from '../PhoneDeviceDialerInput'
import usePhoneDeviceDialerInput from '../usePhoneDeviceDialerInput'

jest.mock(
    'pages/integrations/integration/components/phone/usePhoneDeviceDialerInput',
)

jest.mock('pages/common/forms/input/TextInput', () => {
    const { forwardRef } = jest.requireActual('react')
    return {
        __esModule: true,
        default: forwardRef(
            (
                {
                    onChange,
                    value,
                    suffix,
                    onKeyDown,
                }: {
                    onChange: (value: string) => void
                    value: string
                    suffix?: React.ReactNode
                    onKeyDown?: (e: React.KeyboardEvent) => void
                },
                ref: React.Ref<HTMLInputElement>,
            ) => (
                <>
                    <input
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        data-testid="mock-text-input"
                    />
                    {suffix}
                </>
            ),
        ),
    }
})

jest.mock('pages/common/forms/PhoneNumberInput/PhoneNumberInput', () => {
    const { forwardRef } = jest.requireActual('react')
    return {
        __esModule: true,
        default: forwardRef(
            (
                {
                    onChange,
                    value,
                    error,
                    onLetterEntered,
                    onKeyDown,
                }: {
                    onChange: (value: string) => void
                    value: string
                    error?: string
                    onLetterEntered?: (value: string) => void
                    onCountryChange?: (country: CountryCode) => void
                    onKeyDown?: (e: React.KeyboardEvent) => void
                },
                __ref: React.Ref<PhoneNumberInputHandle>,
            ) => {
                return (
                    <>
                        <input
                            value={value}
                            onChange={(e) => {
                                const val = e.target.value
                                if (/[a-zA-Z]/.test(val) && onLetterEntered) {
                                    onLetterEntered(val)
                                } else {
                                    onChange(val)
                                }
                            }}
                            onKeyDown={onKeyDown}
                            data-testid="mock-phone-input"
                        />
                        <div data-testid="mock-phone-input-error">{error}</div>
                    </>
                )
            },
        ),
    }
})

const PhoneDeviceDialerBodySpy = jest
    .spyOn(PhoneDeviceDialerBody, 'default')
    .mockImplementation(() => <div data-testid="mock-dialer-body" />)

const usePhoneDeviceDialerInputMock = assumeMock(usePhoneDeviceDialerInput)

describe('PhoneDeviceDialerInput', () => {
    const onValueChange = jest.fn()
    const onConfirm = jest.fn()
    const resetError = jest.fn()
    const onCountryChange = jest.fn()
    const phoneNumberInputRef = React.createRef<PhoneNumberInputHandle>()
    const textInputRef = React.createRef<HTMLInputElement>()

    const mockCustomer: UserSearchResult = {
        id: 1,
        customer: {
            id: 1,
            name: 'Guybrush Threepwood',
        },
        address: 'guybrush@example.com',
    } as any as UserSearchResult

    const mockPhoneDeviceDialerInputHookResult = {
        inputValue: '',
        handleChange: jest.fn(),
        isSearchTypeCustomer: false,
        isSearchingCustomers: false,
        customers: [],
        selectedCustomer: null,
        highlightedResultIndex: null,
        phoneNumberInputRef,
        textInputRef,
        handleSelectCustomer: jest.fn(),
        handleInputKeyDown: jest.fn(),
    }

    const renderComponent = (props = {}) =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialerInput
                    onValueChange={onValueChange}
                    onConfirm={onConfirm}
                    resetError={resetError}
                    onCountryChange={onCountryChange}
                    {...props}
                />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        usePhoneDeviceDialerInputMock.mockReturnValue(
            mockPhoneDeviceDialerInputHookResult,
        )
    })

    it('renders phone number input by default', () => {
        renderComponent()

        expect(screen.getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(screen.getByTestId('mock-dialer-body')).toBeInTheDocument()
    })

    it('calls handleChange when phone value changes', async () => {
        const user = userEvent.setup()
        renderComponent()

        const inputElement = screen.getByTestId('mock-phone-input')

        // Use paste to simulate entering the entire value at once
        await user.clear(inputElement)
        await user.paste('1234567890')

        expect(
            mockPhoneDeviceDialerInputHookResult.handleChange,
        ).toHaveBeenCalledWith('1234567890')
    })

    it('calls handleChange when customer name is entered in phone input', async () => {
        const user = userEvent.setup()
        renderComponent()

        const inputElement = screen.getByTestId('mock-phone-input')

        // Use paste to simulate entering the entire value at once
        await user.clear(inputElement)
        await user.paste('Guybrush')

        expect(
            mockPhoneDeviceDialerInputHookResult.handleChange,
        ).toHaveBeenCalledWith('Guybrush')
    })

    it('displays customer search input when isSearchTypeCustomer is true', () => {
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            isSearchTypeCustomer: true,
            inputValue: 'John',
        })

        renderComponent()

        expect(screen.getByTestId('mock-text-input')).toBeInTheDocument()
        expect(screen.queryByTestId('mock-phone-input')).not.toBeInTheDocument()
    })

    it('displays customer search input and name when customer is selected', () => {
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            selectedCustomer: mockCustomer,
        })

        renderComponent()

        expect(screen.getByTestId('mock-text-input')).toBeInTheDocument()
        expect(screen.queryByTestId('mock-phone-input')).not.toBeInTheDocument()
        expect(screen.getByTestId('mock-text-input')).toHaveValue(
            'Guybrush Threepwood',
        )
    })

    it('displays customer address as value when customer has no name', () => {
        const customerWithoutName = {
            ...mockCustomer,
            customer: { id: 1 },
            address: 'fallback',
        } as any

        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            selectedCustomer: customerWithoutName,
        })
        renderComponent()

        expect(screen.getByTestId('mock-text-input')).toHaveValue('fallback')
    })

    it('displays error when phone number is not valid', () => {
        renderComponent({ phoneNumberInputError: 'Enter a valid number' })

        expect(screen.getByText('Enter a valid number')).toBeInTheDocument()
    })

    it('renders PhoneDeviceDialerBody with correct props', () => {
        const customers = [mockCustomer]
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            inputValue: 'test',
            customers,
            highlightedResultIndex: 1,
            isSearchTypeCustomer: true,
            isSearchingCustomers: true,
        })

        renderComponent()

        expect(PhoneDeviceDialerBodySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 'test',
                results: customers,
                isLoading: true,
                isSearchTypeCustomer: true,
                selectedCustomer: null,
                onCustomerSelect:
                    mockPhoneDeviceDialerInputHookResult.handleSelectCustomer,
                highlightedResultIndex: 1,
            }),
            {},
        )
    })

    it('renders PhoneDeviceDialerBody with isLoading false when not searching for customers', () => {
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            isSearchTypeCustomer: false,
            isSearchingCustomers: true,
        })

        renderComponent()

        expect(PhoneDeviceDialerBodySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: false,
            }),
            {},
        )
    })

    it('calls phoneNumberInputRef.onChange when PhoneDeviceDialerBody onChange is triggered', () => {
        const mockOnChange = jest.fn()
        const mockPhoneNumberInputRef = {
            current: {
                onChange: mockOnChange,
                onCountryChange: jest.fn(),
                inputValue: '',
            } as PhoneNumberInputHandle,
        }

        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            phoneNumberInputRef: mockPhoneNumberInputRef,
        })

        renderComponent()

        const bodyOnChange = PhoneDeviceDialerBodySpy.mock.calls[0][0].onChange
        bodyOnChange('newValue')

        expect(mockOnChange).toHaveBeenCalledWith('newValue')
    })

    it('calls phoneNumberInputRef.onCountryChange when country prop changes', () => {
        const mockOnCountryChange = jest.fn()
        const mockPhoneNumberInputRef = {
            current: {
                onChange: jest.fn(),
                onCountryChange: mockOnCountryChange,
                inputValue: '',
            } as PhoneNumberInputHandle,
        }

        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            phoneNumberInputRef: mockPhoneNumberInputRef,
        })

        const { rerender } = renderComponent({ country: 'US' as CountryCode })

        expect(mockOnCountryChange).toHaveBeenCalledWith('US')

        mockOnCountryChange.mockClear()

        rerender(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialerInput
                    onValueChange={onValueChange}
                    onConfirm={onConfirm}
                    resetError={resetError}
                    onCountryChange={onCountryChange}
                    country={'IT' as CountryCode}
                />
            </Provider>,
        )

        expect(mockOnCountryChange).toHaveBeenCalledWith('IT')
    })

    it('calls handleInputKeyDown on keyboard events', async () => {
        const user = userEvent.setup()
        renderComponent()

        const inputElement = screen.getByTestId('mock-phone-input')
        inputElement.focus()
        await user.keyboard('{Enter}')

        expect(
            mockPhoneDeviceDialerInputHookResult.handleInputKeyDown,
        ).toHaveBeenCalled()
    })

    it('calls handleChange with empty string when close button is clicked', async () => {
        const user = userEvent.setup()
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            isSearchTypeCustomer: true,
        })

        renderComponent()

        const closeButton = screen.getByRole('button')
        await user.click(closeButton)

        expect(
            mockPhoneDeviceDialerInputHookResult.handleChange,
        ).toHaveBeenCalledWith('')
    })

    it('shows loading indicator in phone input when searching customers', () => {
        usePhoneDeviceDialerInputMock.mockReturnValue({
            ...mockPhoneDeviceDialerInputHookResult,
            isSearchingCustomers: true,
        })

        renderComponent()

        expect(PhoneDeviceDialerBodySpy).toHaveBeenCalledWith(
            expect.objectContaining({
                value: '',
            }),
            {},
        )
    })
})
