import type { ComponentProps } from 'react'

import { screen, waitFor } from '@testing-library/react'

import {
    mockCustomer,
    mockTicketCustomerChannel,
} from '@gorgias/helpdesk-mocks'

import { createTestQueryClient, render } from '../../../tests/render.utils'
import * as useMergeCustomersModule from '../hooks/useMergeCustomers'
import * as useSourceCustomerModule from '../hooks/useSourceCustomer'
import { MergeCustomersModal } from '../MergeCustomersModal'

vi.mock('../hooks/useMergeCustomers')
vi.mock('../hooks/useSourceCustomer')

const mockedUseMergeCustomers = vi.mocked(
    useMergeCustomersModule.useMergeCustomers,
)
const mockedUseSourceCustomer = vi.mocked(
    useSourceCustomerModule.useSourceCustomer,
)

const destinationCustomer = mockCustomer({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    note: 'VIP customer',
    channels: [],
})

const sourceCustomer = mockCustomer({
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    note: 'Regular customer',
    channels: [],
})

const mockMergeCustomers = vi.fn()

describe('MergeCustomersModal', () => {
    const mockOnOpenChange = vi.fn<(open: boolean) => void>()
    const mockOnMerge = vi.fn<() => void>()

    function renderModal(
        props: Partial<ComponentProps<typeof MergeCustomersModal>> = {},
    ) {
        return render(
            <MergeCustomersModal
                isOpen={true}
                onOpenChange={mockOnOpenChange}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                onMerge={mockOnMerge}
                {...props}
            />,
            {
                queryClient: createTestQueryClient(),
            },
        )
    }

    beforeEach(() => {
        mockOnOpenChange.mockReset()
        mockOnMerge.mockReset()
        mockMergeCustomers.mockReset()
        mockMergeCustomers.mockResolvedValue(undefined)

        mockedUseMergeCustomers.mockReturnValue({
            mergeCustomers: mockMergeCustomers,
            isLoading: false,
        })

        mockedUseSourceCustomer.mockImplementation((customer) => ({
            sourceCustomer: customer,
            isLoading: false,
        }))
    })

    it('should not render when sourceCustomer is null', () => {
        mockedUseSourceCustomer.mockReturnValue({
            sourceCustomer: null,
            isLoading: false,
        })

        const { container } = renderModal({ sourceCustomer: null })

        expect(container.firstChild).toBeNull()
    })

    it('should render modal with customer data', async () => {
        renderModal()

        expect(await screen.findByText('Merge customers')).toBeInTheDocument()
        expect(screen.getByText('Current customer')).toBeInTheDocument()
        expect(screen.getByText('Merge customer')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should disable merge button while loading source customer', async () => {
        mockedUseSourceCustomer.mockReturnValue({
            sourceCustomer,
            isLoading: true,
        })

        const { user } = renderModal()

        const checkbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await user.click(checkbox)

        expect(screen.getByRole('button', { name: /merge/i })).toBeDisabled()
    })

    it('should disable merge button when confirmation is not checked', async () => {
        renderModal()

        expect(
            await screen.findByRole('button', { name: /merge/i }),
        ).toBeDisabled()
    })

    it('should enable merge button when confirmation is checked', async () => {
        const { user } = renderModal()

        const checkbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await user.click(checkbox)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /merge/i }),
            ).not.toBeDisabled()
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

        const { user } = renderModal({
            destinationCustomer: destinationWithChannels,
        })

        await user.click(screen.getByText('alternative@example.com'))
        await user.click(screen.getByText('@johndoe'))

        const confirmationCheckbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await user.click(confirmationCheckbox)
        await user.click(screen.getByRole('button', { name: /merge/i }))

        await waitFor(() => {
            expect(mockMergeCustomers).toHaveBeenCalled()
        })

        const [payload] = mockMergeCustomers.mock.calls[0]
        expect(payload.channels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    address: 'john@example.com',
                    type: 'email',
                }),
            ]),
        )
        expect(payload.channels).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    address: 'alternative@example.com',
                }),
                expect.objectContaining({
                    address: '@johndoe',
                }),
            ]),
        )
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

        const { user } = renderModal({
            destinationCustomer: destinationWithChannels,
        })

        const nameRadios = await screen.findAllByRole('radio', {
            name: /name/i,
        })
        await user.click(nameRadios[1])

        const checkbox = await screen.findByRole('checkbox', {
            name: /I understand that this action is irreversible/i,
        })
        await user.click(checkbox)

        await user.click(await screen.findByRole('button', { name: /merge/i }))

        await waitFor(() => {
            expect(mockMergeCustomers).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Smith',
                    email: 'john@example.com',
                    note: 'VIP customer',
                    channels: expect.arrayContaining([
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
                }),
                {
                    source_id: 2,
                    target_id: 1,
                },
            )
        })

        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
            expect(mockOnMerge).toHaveBeenCalled()
        })
    })
})
