import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountryCode } from 'libphonenumber-js'
import { Provider } from 'react-redux'

import { PhoneIntegration } from 'models/integration/types'
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
    const mockResetError = jest.fn()
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

    const mockHookResult = {
        setSelectedNumberAndCustomer: mockSetSelectedNumberAndCustomer,
        phoneNumberInputError: undefined as string | undefined,
        resetError: mockResetError,
        country: undefined as CountryCode | undefined,
        setCountry: mockSetCountry,
        phoneIntegrations: mockPhoneIntegrations,
        selectedIntegration: mockSelectedIntegration,
        setSelectedIntegration: mockSetSelectedIntegration,
        handleCall: mockHandleCall,
        isSelectedNumberValid: false,
    }

    const renderComponent = () =>
        renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <PhoneDeviceDialer onCallInitiated={mockOnCallInitiated} />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()

        usePhoneDeviceDialerMock.mockReturnValue(mockHookResult)

        PhoneDeviceDialerInputMock.mockImplementation(
            ({
                onValueChange,
                onConfirm,
                phoneNumberInputError,
                resetError,
                country,
                onCountryChange,
            }) => (
                <div data-testid="phone-device-dialer-input">
                    <input
                        data-testid="mock-input"
                        onChange={(e) => onValueChange?.(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onConfirm?.()
                        }}
                    />
                    {phoneNumberInputError && (
                        <div data-testid="input-error">
                            {phoneNumberInputError}
                        </div>
                    )}
                    <button
                        data-testid="reset-error-button"
                        onClick={resetError}
                    />
                    <button
                        data-testid="change-country-button"
                        onClick={() => onCountryChange?.('IT' as CountryCode)}
                    />
                    {country && (
                        <div data-testid="current-country">{country}</div>
                    )}
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
                screen.getByTestId('phone-device-dialer-input'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /call/i }),
            ).toBeInTheDocument()
        })

        it('should pass correct props to PhoneDeviceDialerInput', () => {
            renderComponent()

            expect(PhoneDeviceDialerInputMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onValueChange: mockSetSelectedNumberAndCustomer,
                    onConfirm: mockHandleCall,
                    phoneNumberInputError: undefined,
                    resetError: mockResetError,
                    country: undefined,
                    onCountryChange: mockSetCountry,
                }),
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
    })

    describe('call button', () => {
        it('should be disabled when isSelectedNumberValid is false', () => {
            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                isSelectedNumberValid: false,
            })

            renderComponent()

            const callButton = screen.getByRole('button', { name: /call/i })
            expect(callButton).toBeAriaDisabled()
        })

        it('should be enabled when isSelectedNumberValid is true', () => {
            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                isSelectedNumberValid: true,
            })

            renderComponent()

            const callButton = screen.getByRole('button', { name: /call/i })
            expect(callButton).toBeAriaEnabled()
        })

        it('should call handleCall when clicked', async () => {
            const user = userEvent.setup()

            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                isSelectedNumberValid: true,
            })

            renderComponent()

            const callButton = screen.getByRole('button', { name: /call/i })
            await user.click(callButton)

            expect(mockHandleCall).toHaveBeenCalledTimes(1)
        })
    })

    describe('input interactions', () => {
        it('should call setSelectedNumberAndCustomer when input value changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.type(screen.getByTestId('mock-input'), '+15551234567')

            expect(mockSetSelectedNumberAndCustomer).toHaveBeenLastCalledWith(
                '+15551234567',
            )
        })

        it('should display error message when phoneNumberInputError is set', () => {
            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                phoneNumberInputError: 'Enter a valid number',
            })

            renderComponent()

            expect(screen.getByTestId('input-error')).toHaveTextContent(
                'Enter a valid number',
            )
        })

        it('should call resetError when reset error button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const resetButton = screen.getByTestId('reset-error-button')
            await user.click(resetButton)

            expect(mockResetError).toHaveBeenCalledTimes(1)
        })
    })

    describe('country selection', () => {
        it('should display current country when set', () => {
            usePhoneDeviceDialerMock.mockReturnValue({
                ...mockHookResult,
                country: 'US' as CountryCode,
            })

            renderComponent()

            expect(screen.getByTestId('current-country')).toHaveTextContent(
                'US',
            )
        })

        it('should call setCountry when country is changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            const changeCountryButton = screen.getByTestId(
                'change-country-button',
            )
            await user.click(changeCountryButton)

            expect(mockSetCountry).toHaveBeenCalledWith('IT')
        })
    })
})
