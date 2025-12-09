import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetTicketHandler, mockTicket } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader'

const ticketId = '123'

const mockCustomer = {
    id: 456,
    name: 'John Doe',
    email: 'john.doe@example.com',
}

const mockGetTicket = mockGetTicketHandler(async () => {
    return HttpResponse.json(
        mockTicket({
            id: Number(ticketId),
            customer: mockCustomer as any,
        }),
    )
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetTicket.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    onEditCustomer: vi.fn(),
    onSyncToShopify: vi.fn(),
    hasShopifyIntegration: false,
    showMergeButton: false,
    onMergeClick: vi.fn(),
}

const waitUntilLoaded = async () => {
    await waitFor(() => {
        expect(
            screen.getByRole('link', { name: 'John Doe' }),
        ).toBeInTheDocument()
    })
}

describe('InfobarTicketCustomerHeader', () => {
    it('should render null when ticketId is missing', () => {
        const { container } = render(
            <InfobarTicketCustomerHeader {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: ['/ticket/'],
            },
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render null when customer data is missing', async () => {
        server.use(
            mockGetTicketHandler(async () => {
                return HttpResponse.json(
                    mockTicket({
                        id: Number(ticketId),
                        customer: undefined,
                    }),
                )
            }).handler,
        )

        const { container } = render(
            <InfobarTicketCustomerHeader {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('should render customer name with link to customer profile', async () => {
        render(<InfobarTicketCustomerHeader {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitFor(() => {
            const customerLink = screen.getByRole('link', { name: 'John Doe' })
            expect(customerLink).toBeInTheDocument()
            expect(customerLink).toHaveAttribute('href', '/app/customer/456')
        })
    })

    it('should show edit customer option in dropdown', async () => {
        const { user } = render(
            <InfobarTicketCustomerHeader {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const menuButton = screen.getByLabelText('Customer menu')
        await act(() => user.click(menuButton))

        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
    })

    it('should not show Shopify sync option when hasShopifyIntegration is false', async () => {
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                hasShopifyIntegration={false}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const menuButton = screen.getByLabelText('Customer menu')
        await act(() => user.click(menuButton))

        expect(
            screen.queryByText('Sync profile to Shopify'),
        ).not.toBeInTheDocument()
    })

    it('should show Shopify sync option when hasShopifyIntegration is true', async () => {
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                hasShopifyIntegration={true}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const menuButton = screen.getByLabelText('Customer menu')
        await act(() => user.click(menuButton))

        expect(screen.getByText('Sync profile to Shopify')).toBeInTheDocument()
    })

    it('should call onEditCustomer and onSyncToShopify', async () => {
        const onEditCustomer = vi.fn()
        const onSyncToShopify = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                onEditCustomer={onEditCustomer}
                onSyncToShopify={onSyncToShopify}
                hasShopifyIntegration={true}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const menuButton = screen.getByLabelText('Customer menu')
        await act(() => user.click(menuButton))

        const editOptions = screen.getAllByText('Edit Customer')
        await act(() => user.click(editOptions[editOptions.length - 1]))

        expect(onEditCustomer).toHaveBeenCalledWith(
            expect.objectContaining({
                id: mockCustomer.id,
                name: mockCustomer.name,
                email: mockCustomer.email,
            }),
        )

        await act(() => user.click(menuButton))

        const syncButtons = screen.getAllByText('Sync profile to Shopify')
        await act(() => user.click(syncButtons[syncButtons.length - 1]))

        expect(onSyncToShopify).toHaveBeenCalledWith(
            expect.objectContaining({
                id: mockCustomer.id,
                name: mockCustomer.name,
                email: mockCustomer.email,
            }),
        )
    })

    it('should show merge button when showMergeButton is true', async () => {
        render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                showMergeButton={true}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const mergeButton = screen.getByRole('button', {
            name: 'Merge customer profiles',
        })
        expect(mergeButton).toBeInTheDocument()
    })

    it('should not show merge button when showMergeButton is false', async () => {
        render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                showMergeButton={false}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const mergeButton = screen.queryByRole('button', {
            name: 'Merge customer profiles',
        })
        expect(mergeButton).not.toBeInTheDocument()
    })

    it('should call onMergeClick when merge button is clicked', async () => {
        const onMergeClick = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                showMergeButton={true}
                onMergeClick={onMergeClick}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const mergeButton = screen.getByRole('button', {
            name: 'Merge customer profiles',
        })
        await act(() => user.click(mergeButton))

        expect(onMergeClick).toHaveBeenCalledTimes(1)
    })
})
