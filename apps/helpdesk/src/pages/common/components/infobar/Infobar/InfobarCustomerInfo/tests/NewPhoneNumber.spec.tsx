import { useGetCustomer } from '@repo/customer/hooks'
import { assumeMock, render, userEvent } from '@repo/testing'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import { mockUpdateCustomerHandler } from '@gorgias/helpdesk-mocks'
import { LegacyChannelSlug } from '@gorgias/helpdesk-types'

import { NewPhoneNumber } from '../NewPhoneNumber'

jest.mock('@repo/customer/hooks')
jest.mock('libphonenumber-js')

jest.mock('pages/common/forms/PhoneNumberInput/PhoneNumberInput', () => ({
    DefaultExportPhoneNumberInput: ({
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
}))

const useGetCustomerMock = assumeMock(useGetCustomer)
const isValidPhoneNumberMock = assumeMock(isValidPhoneNumber)
const server = setupServer(mockUpdateCustomerHandler().handler)

describe('NewPhoneNumber', () => {
    const customerId = 1

    const renderComponent = () => {
        render(<NewPhoneNumber customerId={1} />)
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        useGetCustomerMock.mockReturnValue({
            data: {
                data: {
                    channels: [],
                },
            },
            isLoading: false,
            refetch: jest.fn(),
        } as any)
    })

    afterEach(() => {
        server.resetHandlers()
        toast.dismiss()
        cleanup()
    })

    afterAll(() => {
        server.close()
    })

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
        const updateCustomerMock = mockUpdateCustomerHandler()
        const waitForUpdateCustomerRequest =
            updateCustomerMock.waitForRequest(server)
        server.use(updateCustomerMock.handler)

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        await waitForUpdateCustomerRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe(
                `/api/customers/${customerId}`,
            )
            await expect(request.json()).resolves.toEqual({
                channels: [
                    {
                        type: LegacyChannelSlug.Phone,
                        address: '1234567890',
                        preferred: false,
                    },
                ],
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

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Phone number added to customer',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should display error notification when phone number is not added successfully', async () => {
        isValidPhoneNumberMock.mockReturnValue(true)
        server.use(
            mockUpdateCustomerHandler(async () =>
                HttpResponse.json(
                    {
                        error: {
                            data: {
                                channels: [{ _schema: ['error'] }],
                            },
                        },
                    } as never,
                    { status: 400 },
                ),
            ).handler,
        )

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'error' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        toast.dismiss()
        cleanup()
        server.resetHandlers()
        server.use(
            mockUpdateCustomerHandler(async () =>
                HttpResponse.json({ error: {} } as never, { status: 400 }),
            ).handler,
        )

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const fallbackInput = screen.getByTestId('phoneNumberInput')
        fireEvent.change(fallbackInput, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should include existing customer channels when adding a phone number', async () => {
        isValidPhoneNumberMock.mockReturnValue(true)
        useGetCustomerMock.mockReturnValue({
            data: {
                data: {
                    channels: [
                        {
                            type: LegacyChannelSlug.Email,
                            address: 'customer@example.com',
                            preferred: true,
                        },
                    ],
                },
            },
            isLoading: false,
            refetch: jest.fn(),
        } as any)
        const updateCustomerMock = mockUpdateCustomerHandler()
        const waitForUpdateCustomerRequest =
            updateCustomerMock.waitForRequest(server)
        server.use(updateCustomerMock.handler)

        renderComponent()

        userEvent.click(screen.getByText('Add phone number'))
        const input = screen.getByTestId('phoneNumberInput')
        fireEvent.change(input, { target: { value: '1234567890' } })
        fireEvent.click(screen.getByText('Add number'))

        await waitForUpdateCustomerRequest(async (request) => {
            await expect(request.json()).resolves.toEqual({
                channels: [
                    {
                        type: LegacyChannelSlug.Email,
                        address: 'customer@example.com',
                        preferred: true,
                    },
                    {
                        type: LegacyChannelSlug.Phone,
                        address: '1234567890',
                        preferred: false,
                    },
                ],
            })
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
