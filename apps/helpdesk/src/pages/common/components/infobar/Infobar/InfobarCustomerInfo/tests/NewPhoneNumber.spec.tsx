import { assumeMock, userEvent } from '@repo/testing'
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { Provider } from 'react-redux'

import {
    LegacyChannelSlug,
    useGetCustomer,
    useUpdateCustomer,
} from '@gorgias/helpdesk-queries'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockStore } from 'utils/testing'

import NewPhoneNumber from '../NewPhoneNumber'

jest.mock('@gorgias/helpdesk-queries')
jest.mock('libphonenumber-js')
jest.mock('state/notifications/actions')

jest.mock(
    'pages/common/forms/PhoneNumberInput/PhoneNumberInput',
    () =>
        ({
            onChange,
            error,
        }: {
            onChange: (value: any) => void
            error?: string
        }) => (
            <>
                <input
                    data-testid="phoneNumberInput"
                    onChange={(evt) => onChange(evt.target.value)}
                />
                <div>{error}</div>
            </>
        ),
)

const useGetCustomerMock = assumeMock(useGetCustomer)
const updateCustomerMock = assumeMock(useUpdateCustomer)
const isValidPhoneNumberMock = assumeMock(isValidPhoneNumber)
const notifyMock = assumeMock(notify)

notifyMock.mockReturnValue({
    type: 'NOTIFY',
    payload: {},
} as any)

describe('NewPhoneNumber', () => {
    const customerId = 1
    const mutateCustomer = jest.fn()

    const renderComponent = () => {
        render(
            <Provider store={mockStore({} as any)}>
                <NewPhoneNumber customerId={1} />
            </Provider>,
        )
    }

    beforeEach(() => {
        useGetCustomerMock.mockReturnValue({
            data: {
                channels: [],
            },
            isLoading: false,
            refetch: jest.fn(),
        } as any)
        updateCustomerMock.mockReturnValue({
            mutate: mutateCustomer,
            isLoading: false,
        } as any)
    })

    afterEach(cleanup)

    it('should open the modal when "Add phone number" link is clicked', () => {
        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))

        expect(screen.getByTestId('phoneNumberInput')).toBeVisible()
    })

    it('should close the modal when the close button is clicked', async () => {
        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        userEvent.click(screen.getByText(/close/i))

        await waitFor(() => {
            expect(screen.queryByTestId('phoneNumberInput')).toBeNull()
        })
    })

    it('should update the phone number state when input value changes', () => {
        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input: HTMLInputElement = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })

        expect(input.value).toBe('1234567890')
    })

    it('should display an error message when an invalid phone number is entered', () => {
        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '123' } })
        fireEvent.click(screen.getByText('Add number'))

        expect(screen.getByText('Enter a valid number')).toBeInTheDocument()

        isValidPhoneNumberMock.mockReturnValueOnce(true)
        fireEvent.change(input, { target: { value: '1234567890' } })
        expect(screen.queryByText('Enter a valid number')).toBeNull()
    })

    it('should call the updateCustomer function with the correct parameters when "Add number" button is clicked', async () => {
        isValidPhoneNumberMock.mockReturnValue(true)

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        await waitFor(() => {
            expect(mutateCustomer).toHaveBeenCalledWith({
                id: customerId,
                data: {
                    channels: [
                        {
                            type: LegacyChannelSlug.Phone,
                            address: '1234567890',
                            preferred: false,
                        },
                    ],
                },
            })
        })
    })

    it('should display success notification when phone number is added successfully', async () => {
        isValidPhoneNumberMock.mockReturnValue(true)

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        updateCustomerMock.mock.calls[0][0]?.mutation?.onSuccess!(
            {} as any,
            {} as any,
            undefined,
        )

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith({
                message: 'Phone number added to customer',
                status: NotificationStatus.Success,
            })
        })
    })

    it('should display error notification when phone number is not added successfully', async () => {
        isValidPhoneNumberMock.mockReturnValue(true)

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        updateCustomerMock.mock.calls[0][0]?.mutation?.onError!(
            {
                response: {
                    data: {
                        error: {
                            data: { channels: [{ _schema: ['error'] }] } as any,
                        } as any,
                    } as any,
                } as any,
            },
            {} as any,
            undefined,
        )

        await waitFor(() => {
            expect(notifyMock).toHaveBeenCalledWith({
                message: 'error',
                status: NotificationStatus.Error,
            })
        })

        updateCustomerMock.mock.calls[0][0]?.mutation?.onError!(
            {
                response: {
                    data: {
                        error: {} as any,
                    } as any,
                } as any,
            },
            {} as any,
            undefined,
        )
        expect(notifyMock).toHaveBeenCalledWith({
            message: 'Failed to update customer',
            status: NotificationStatus.Error,
        })
    })

    it('should not display button while customer details are loading', () => {
        useGetCustomerMock.mockReturnValue({
            isLoading: true,
        } as any)

        renderComponent()

        expect(screen.queryByText('Add phone number')).toBeNull()
    })

    it('should not display button if customer details are not available', () => {
        useGetCustomerMock.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)

        renderComponent()

        expect(screen.queryByText('Add phone number')).toBeNull()
    })
})
