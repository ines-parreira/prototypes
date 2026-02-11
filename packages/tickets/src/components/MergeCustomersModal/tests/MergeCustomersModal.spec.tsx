import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockMergeCustomersHandler,
    mockTicketCustomerChannel,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { MergeCustomersModal } from '../MergeCustomersModal'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('MergeCustomersModal', () => {
    const mockOnOpenChange = vi.fn()
    const mockOnMerge = vi.fn()
    const destinationCustomer = mockCustomer({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        note: 'VIP customer',
    })
    const sourceCustomer = mockCustomer({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        note: 'Regular customer',
    })

    const mockMergeCustomers = mockMergeCustomersHandler(async () =>
        HttpResponse.json({}),
    )

    const mockGetCustomer = mockGetCustomerHandler(async (info) => {
        const url = new URL(info.request.url)
        const customerId = url.pathname.split('/').pop()

        if (customerId === '2') {
            return HttpResponse.json({
                ...sourceCustomer,
            })
        }

        return HttpResponse.json({
            ...destinationCustomer,
        })
    })

    beforeEach(() => {
        vi.clearAllMocks()
        server.use(mockMergeCustomers.handler, mockGetCustomer.handler)
    })

    it('should not render when sourceCustomer is null', () => {
        const { container } = render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={null}
                onMerge={mockOnMerge}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render modal with customer data', async () => {
        render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Merge customers')).toBeInTheDocument()
            expect(screen.getByText('Current customer')).toBeInTheDocument()
            expect(screen.getByText('Merge customer')).toBeInTheDocument()
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        })
    })

    it('should disable merge button while loading source customer', async () => {
        let resolveCustomerFetch: (value: unknown) => void
        const customerFetchPromise = new Promise((resolve) => {
            resolveCustomerFetch = resolve
        })

        const slowMockGetSourceCustomer = mockGetCustomerHandler(async () => {
            await customerFetchPromise
            return HttpResponse.json({
                data: sourceCustomer,
            })
        })

        server.use(slowMockGetSourceCustomer.handler)

        const { user } = render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        const checkbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await act(async () => {
            await user.click(checkbox)
        })

        const mergeButton = screen.getByRole('button', { name: /merge/i })
        expect(mergeButton).toBeDisabled()

        resolveCustomerFetch!(null)

        await waitFor(() => {
            expect(mergeButton).not.toBeDisabled()
        })
    })

    it('should disable merge button when confirmation is not checked', async () => {
        render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        await waitFor(() => {
            const mergeButton = screen.getByRole('button', { name: /merge/i })
            expect(mergeButton).toBeDisabled()
        })
    })

    it('should enable merge button when confirmation is checked', async () => {
        const { user } = render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        const checkbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await act(async () => {
            await user.click(checkbox)
        })

        await waitFor(() => {
            const mergeButton = screen.getByRole('button', { name: /merge/i })
            expect(mergeButton).not.toBeDisabled()
        })
    })

    it('should toggle channel selection when clicked', async () => {
        const alternativeEmail = mockTicketCustomerChannel({
            id: 3,
            type: 'email',
            address: 'alternative@example.com',
            preferred: false,
        })

        const instagramChannel = mockTicketCustomerChannel({
            id: 4,
            type: 'instagram',
            address: '@johndoe',
            preferred: false,
        })

        const destinationWithChannels = mockCustomer({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                mockTicketCustomerChannel({
                    id: 1,
                    type: 'email',
                    address: 'john@example.com',
                    preferred: true,
                }),
                alternativeEmail,
                instagramChannel,
            ],
        })

        const { user } = render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationWithChannels}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        const alternativeEmailRadios = await screen.findAllByRole('radio', {
            name: /alternative email/i,
        })
        const emailChannelRadio = alternativeEmailRadios.find(
            (radio) => !radio.hasAttribute('disabled'),
        )!
        const instagramChannelRadio = await screen.findByRole('radio', {
            name: /instagram/i,
        })

        expect(emailChannelRadio).toBeChecked()
        expect(instagramChannelRadio).toBeChecked()

        await act(async () => {
            await user.click(emailChannelRadio)
        })
        await waitFor(() => {
            expect(emailChannelRadio).not.toBeChecked()
        })

        await act(async () => {
            await user.click(instagramChannelRadio)
        })
        await waitFor(() => {
            expect(instagramChannelRadio).not.toBeChecked()
        })

        await act(async () => {
            await user.click(emailChannelRadio)
        })
        await waitFor(() => {
            expect(emailChannelRadio).toBeChecked()
        })

        await act(async () => {
            await user.click(instagramChannelRadio)
        })
        await waitFor(() => {
            expect(instagramChannelRadio).toBeChecked()
        })
    })

    it('should call merge with correct data and close modal', async () => {
        const alternativeEmail = mockTicketCustomerChannel({
            id: 3,
            type: 'email',
            address: 'alternative@example.com',
            preferred: false,
        })

        const phoneChannel = mockTicketCustomerChannel({
            id: 4,
            type: 'phone',
            address: '+1234567890',
            preferred: false,
        })

        const destinationWithChannels = mockCustomer({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            note: 'VIP customer',
            channels: [
                mockTicketCustomerChannel({
                    id: 1,
                    type: 'email',
                    address: 'john@example.com',
                    preferred: true,
                }),
                alternativeEmail,
                phoneChannel,
            ],
        })

        const { user } = render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationWithChannels}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
            />,
        )

        const nameRadios = screen.getAllByRole('radio', { name: /name/i })
        await act(async () => {
            await user.click(nameRadios[1])
        })

        const checkbox = screen.getByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await act(async () => {
            await user.click(checkbox)
        })

        const mergeButton = screen.getByRole('button', { name: /merge/i })

        const waitForRequest = mockMergeCustomers.waitForRequest(server)

        await act(async () => {
            await user.click(mergeButton)
        })

        await waitForRequest(async (request) => {
            const body = await request.json()

            expect(body.name).toBe('Jane Smith')
            expect(body.email).toBe('john@example.com')
            expect(body.note).toBe('VIP customer')
            expect(body.channels).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        address: 'john@example.com',
                        type: 'email',
                    }),
                    expect.objectContaining({
                        id: 3,
                        address: 'alternative@example.com',
                        type: 'email',
                    }),
                    expect.objectContaining({
                        id: 4,
                        address: '+1234567890',
                        type: 'phone',
                    }),
                ]),
            )
        })

        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
})
