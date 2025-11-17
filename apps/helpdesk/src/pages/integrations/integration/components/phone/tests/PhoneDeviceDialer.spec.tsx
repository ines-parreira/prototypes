import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CountryCode } from 'libphonenumber-js'
import { Provider } from 'react-redux'

import type { PhoneIntegration } from 'models/integration/types'
import type { UserSearchResult } from 'models/search/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import PhoneDeviceDialer from '../PhoneDeviceDialer'
import PhoneDeviceDialerInput from '../PhoneDeviceDialerInput'
import PhoneDeviceDialerIntegrationSelect from '../PhoneDeviceDialerIntegrationSelect'
import usePhoneDeviceDialer from '../usePhoneDeviceDialer'

jest.mock('../usePhoneDeviceDialer')
jest.mock('../PhoneDeviceDialerInput')
jest.mock('../PhoneDeviceDialerIntegrationSelect')

const usePhoneDeviceDialerMock = assumeMock(usePhoneDeviceDialer)
const PhoneDeviceDialerInputMock = assumeMock(PhoneDeviceDialerInput)
const PhoneDeviceDialerIntegrationSelectMock = assumeMock(
    PhoneDeviceDialerIntegrationSelect,
)

describe('PhoneDeviceDialer', () => {
    const mockOnCallInitiated = jest.fn()
    const mockSetSelectedNumberAndCustomer = jest.fn()
    const mockSetCountry = jest.fn()
    const mockSetSelectedIntegration = jest.fn()
    const mockHandleCall = jest.fn()

    const mockPhoneIntegrations: PhoneIntegration[] = [
        {
            id: 1,
            name: 'Primary Phone',
            meta: {
                phone_number_id: 1,
            },
        } as PhoneIntegration,
        {
            id: 2,
            name: 'Secondary Phone',
            meta: {
                phone_number_id: 2,
            },
        } as PhoneIntegration,
    ]

    const mockSelectedIntegration = mockPhoneIntegrations[0]

    const mockSetIsPhoneNumberValid = jest.fn()

    const mockHookResult = {
        isPhoneNumberValid: false,
        setIsPhoneNumberValid: mockSetIsPhoneNumberValid,
        setSelectedNumberAndCustomer: mockSetSelectedNumberAndCustomer,
        phoneNumberInputError: undefined as string | undefined,
        resetError: () => {},
        country: undefined as CountryCode | undefined,
        setCountry: mockSetCountry,
        phoneIntegrations: mockPhoneIntegrations,
        selectedIntegration: mockSelectedIntegration,
        setSelectedIntegration: mockSetSelectedIntegration,
        handleCall: mockHandleCall,
    }

    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialer onCallInitiated={mockOnCallInitiated} />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()

        mockSetIsPhoneNumberValid.mockImplementation((value) => {
            mockHookResult.isPhoneNumberValid = value
        })

        usePhoneDeviceDialerMock.mockReturnValue(mockHookResult)

        PhoneDeviceDialerInputMock.mockImplementation(
            ({ onValueChange, onConfirm, onValidationChange }) => (
                <div>
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        aria-label="Phone number input"
                        onChange={(e) => {
                            const value = e.target.value
                            if (value) {
                                onValueChange?.(value, undefined)
                                onValidationChange?.(true)
                            } else {
                                onValueChange?.('', undefined)
                                onValidationChange?.(false)
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            onValueChange?.('+15551234567', {
                                customer: {
                                    id: 123,
                                    name: 'Guybrush Threepwood',
                                },
                            } as UserSearchResult)
                            onValidationChange?.(true)
                        }}
                        aria-label="Select customer"
                    >
                        Select Customer
                    </button>
                    <button onClick={onConfirm} aria-label="Confirm transfer">
                        Confirm Transfer
                    </button>
                </div>
            ),
        )

        PhoneDeviceDialerIntegrationSelectMock.mockImplementation(() => (
            <>PhoneDeviceDialerIntegrationSelect</>
        ))
    })

    describe('rendering', () => {
        it('should render all components correctly', () => {
            renderComponent()

            expect(
                screen.getByLabelText(/phone number input/i),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Call' }),
            ).toBeInTheDocument()
        })

        it('should pass correct props to PhoneDeviceDialerInput', () => {
            renderComponent()

            expect(PhoneDeviceDialerInputMock).toHaveBeenCalledWith(
                {
                    onValueChange: mockSetSelectedNumberAndCustomer,
                    onValidationChange: expect.any(Function),
                    onConfirm: mockHandleCall,
                    country: undefined,
                    onCountryChange: mockSetCountry,
                },
                {},
            )
        })

        it('should pass correct props to PhoneDeviceDialerIntegrationSelect', () => {
            renderComponent()

            expect(PhoneDeviceDialerIntegrationSelectMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: mockSelectedIntegration,
                    options: mockPhoneIntegrations,
                    onChange: mockSetSelectedIntegration,
                }),
                {},
            )
        })

        it('should pass correct values to usePhoneDeviceDialer hook', () => {
            renderComponent()

            expect(usePhoneDeviceDialerMock).toHaveBeenCalledWith({
                onCallInitiated: mockOnCallInitiated,
            })
        })
    })

    describe('call button', () => {
        it('should be disabled when phone number is invalid', () => {
            renderComponent()

            const callButton = screen.getByRole('button', { name: 'Call' })
            expect(callButton).toBeAriaDisabled()
        })

        it('should call handleCall when clicked and phone is valid', async () => {
            const user = userEvent.setup()
            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                isPhoneNumberValid: true,
            })
            renderComponent()

            const phoneInput = screen.getByLabelText(/phone number input/i)
            await act(async () => {
                await user.type(phoneInput, '+15551234567')
            })

            expect(mockSetIsPhoneNumberValid).toHaveBeenCalledWith(true)

            const callButton = screen.getByRole('button', { name: 'Call' })
            expect(callButton).toBeAriaEnabled()
            await act(async () => {
                await user.click(callButton)
            })

            expect(mockHandleCall).toHaveBeenCalledTimes(1)
        })
    })

    describe('input interactions', () => {
        it('should call setSelectedNumberAndCustomer when input value changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.type(
                    screen.getByLabelText(/phone number input/i),
                    '+15551234567',
                )
            })

            expect(mockSetSelectedNumberAndCustomer).toHaveBeenLastCalledWith(
                '+15551234567',
                undefined,
            )
        })
    })
})
