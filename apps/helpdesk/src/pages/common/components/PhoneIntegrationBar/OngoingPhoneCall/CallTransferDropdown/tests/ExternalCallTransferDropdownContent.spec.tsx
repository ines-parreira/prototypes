import { createRef } from 'react'

import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import ExternalCallTransferDropdownContent from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/CallTransferDropdown/ExternalCallTransferDropdownContent'

jest.mock(
    'pages/integrations/integration/components/phone/PhoneDeviceDialerInput',
    () => ({
        __esModule: true,
        default: ({
            onValueChange,
            onConfirm,
        }: {
            onValueChange: (phoneNumber: string, customer?: any) => void
            onConfirm: () => void
        }) => (
            <div>
                <input
                    type="text"
                    placeholder="Enter phone number"
                    aria-label="Phone number input"
                    onChange={(e) => {
                        const value = e.target.value
                        if (value) {
                            onValueChange(value, undefined)
                        } else {
                            onValueChange('', undefined)
                        }
                    }}
                />
                <button
                    onClick={() =>
                        onValueChange('+15551234567', {
                            customer: { id: 123, name: 'Guybrush Threepwood' },
                        })
                    }
                    aria-label="Select customer"
                >
                    Select Customer
                </button>
                <button onClick={onConfirm} aria-label="Confirm transfer">
                    Confirm Transfer
                </button>
            </div>
        ),
    }),
)

describe('ExternalCallTransferDropdownContent', () => {
    const setSelectedExternalPhoneNumber = jest.fn()
    const handleTransferCall = jest.fn()

    const renderComponent = (props = {}) =>
        render(
            <Dropdown
                isOpen={true}
                onToggle={() => {}}
                target={createRef<HTMLElement>()}
            >
                <ExternalCallTransferDropdownContent
                    setSelectedExternalPhoneNumber={
                        setSelectedExternalPhoneNumber
                    }
                    handleTransferCall={handleTransferCall}
                    {...props}
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
    })

    it('calls handleTransferCall when confirm button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const confirmButton = screen.getByLabelText(/confirm transfer/i)
        await act(() => user.click(confirmButton))

        expect(handleTransferCall).toHaveBeenCalledTimes(1)
    })
})
