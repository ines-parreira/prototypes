import { createRef } from 'react'

import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserSearchResult } from 'models/search/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import ExternalCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/ExternalCallTransferDropdownContent'

jest.mock(
    'pages/integrations/integration/components/phone/usePhoneNumbers',
    () => ({
        __esModule: true,
        default: () => ({
            getCountryFromPhoneNumberId: (id: number) => {
                const phoneNumbers: Record<number, string> = {
                    1: 'US',
                    2: 'IT',
                }
                return phoneNumbers[id]
            },
        }),
    }),
)

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialerInput',
    () => ({
        __esModule: true,
        default: ({
            value,
            onValueChange,
            onConfirm,
            onValidationChange,
            country,
        }: {
            value?: { phoneNumber: string; customer?: any }
            onValueChange: (phoneNumber: string, customer?: any) => void
            onConfirm: () => void
            onValidationChange?: (isValid: boolean) => void
            country?: string
        }) => (
            <div>
                <input
                    type="text"
                    placeholder="Enter phone number"
                    aria-label="Phone number input"
                    defaultValue={value?.phoneNumber || ''}
                    onChange={(e) => {
                        const value = e.target.value
                        if (value) {
                            onValueChange(value, undefined)
                            onValidationChange?.(true)
                        } else {
                            onValueChange('', undefined)
                            onValidationChange?.(false)
                        }
                    }}
                />
                <button
                    onClick={() => {
                        onValueChange('+15551234567', {
                            customer: { id: 123, name: 'Guybrush Threepwood' },
                        })
                        onValidationChange?.(true)
                    }}
                    aria-label="Select customer"
                >
                    Select Customer
                </button>
                <button onClick={onConfirm} aria-label="Confirm transfer">
                    Confirm Transfer
                </button>
                {country && <div data-testid="initial-country">{country}</div>}
                {value?.customer && (
                    <div data-testid="displayed-customer">
                        {value.customer.customer?.name}
                    </div>
                )}
            </div>
        ),
    }),
)

describe('ExternalCallTransferDropdownContent', () => {
    const setSelectedExternalPhoneNumber = jest.fn()
    const handleTransferCall = jest.fn()
    const onPhoneNumberValidationChange = jest.fn()

    const renderComponent = (
        {
            phoneNumber,
            customer,
            integrationPhoneNumberId,
        }: {
            phoneNumber: string
            customer?: UserSearchResult
            integrationPhoneNumberId?: number
        } = {
            phoneNumber: '',
        },
    ) =>
        render(
            <Dropdown
                isOpen={true}
                onToggle={() => {}}
                target={createRef<HTMLElement>()}
            >
                <ExternalCallTransferDropdownContent
                    phoneNumber={phoneNumber}
                    customer={customer}
                    setSelectedExternalPhoneNumber={
                        setSelectedExternalPhoneNumber
                    }
                    handleTransferCall={handleTransferCall}
                    onPhoneNumberValidationChange={
                        onPhoneNumberValidationChange
                    }
                    integrationPhoneNumberId={integrationPhoneNumberId}
                />
            </Dropdown>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it('shows phone number input when active', () => {
        renderComponent()

        expect(screen.getByLabelText(/phone number input/i)).toBeInTheDocument()
    })

    it('calls setSelectedExternalPhoneNumber when phone number is entered', async () => {
        const user = userEvent.setup()
        renderComponent()

        const phoneInput = screen.getByLabelText(/phone number input/i)
        await act(() => user.type(phoneInput, '+15551234567'))

        expect(setSelectedExternalPhoneNumber).toHaveBeenLastCalledWith(
            '+15551234567',
            undefined,
        )
        expect(onPhoneNumberValidationChange).toHaveBeenLastCalledWith(true)
    })

    it('calls setSelectedExternalPhoneNumber with customer info when customer is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        const selectCustomerButton = screen.getByLabelText(/select customer/i)
        await act(() => user.click(selectCustomerButton))

        expect(setSelectedExternalPhoneNumber).toHaveBeenCalledWith(
            '+15551234567',
            {
                customer: { id: 123, name: 'Guybrush Threepwood' },
            },
        )
        expect(onPhoneNumberValidationChange).toHaveBeenLastCalledWith(true)
    })

    it('calls setSelectedExternalPhoneNumber with empty string when the input is cleared', async () => {
        const user = userEvent.setup()
        renderComponent()

        const phoneInput = screen.getByLabelText(/phone number input/i)
        await act(() => user.type(phoneInput, '+15551234567'))
        await act(() => user.clear(phoneInput))

        expect(setSelectedExternalPhoneNumber).toHaveBeenLastCalledWith(
            '',
            undefined,
        )
        expect(onPhoneNumberValidationChange).toHaveBeenLastCalledWith(false)
    })

    it('calls handleTransferCall when confirm button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const confirmButton = screen.getByLabelText(/confirm transfer/i)
        await act(() => user.click(confirmButton))

        expect(handleTransferCall).toHaveBeenCalledTimes(1)
    })

    it('passes phoneNumber prop to PhoneDeviceDialerInput', () => {
        renderComponent({ phoneNumber: '+15559876543' })

        const phoneInput = screen.getByLabelText(/phone number input/i)
        expect(phoneInput).toHaveValue('+15559876543')
    })

    it('passes both phoneNumber and customer props', () => {
        renderComponent({
            phoneNumber: '+15559876543',
            customer: {
                customer: { id: 789, name: 'LeChuck' },
            } as UserSearchResult,
        })

        const phoneInput = screen.getByLabelText(/phone number input/i)
        expect(phoneInput).toHaveValue('+15559876543')
        expect(screen.getByTestId('displayed-customer')).toHaveTextContent(
            'LeChuck',
        )
    })

    describe('set country from integration phone number', () => {
        it('does not set initial country when integrationPhoneNumberId is not provided', () => {
            renderComponent()

            expect(
                screen.queryByTestId('initial-country'),
            ).not.toBeInTheDocument()
        })

        it.each([
            { integrationPhoneNumberId: 1, expectedCountry: 'US' },
            { integrationPhoneNumberId: 2, expectedCountry: 'IT' },
        ])(
            'sets initial country to $expectedCountry using integration phone number country',
            ({ integrationPhoneNumberId, expectedCountry }) => {
                renderComponent({ phoneNumber: '', integrationPhoneNumberId })

                expect(screen.getByTestId('initial-country')).toHaveTextContent(
                    expectedCountry,
                )
            },
        )
    })
})
