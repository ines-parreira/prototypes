import { act, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockTicketCustomer } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarTicketCustomerHeader } from '../InfobarTicketCustomerHeader'

const ticketId = '123'

const mockCustomer = mockTicketCustomer({
    id: 456,
    name: 'John Doe',
    email: 'john.doe@example.com',
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    customer: mockCustomer,
    onEditCustomer: vi.fn(),
    onSyncToShopify: vi.fn(),
    onOpenMergePanel: vi.fn(),
    hasShopifyIntegration: false,
}

const waitUntilLoaded = async () => {
    await waitFor(() => {
        expect(
            screen.getByRole('link', { name: 'John Doe' }),
        ).toBeInTheDocument()
    })
}

describe('InfobarTicketCustomerHeader', () => {
    it('should render null when customer data is missing', async () => {
        const { container } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                customer={undefined}
            />,
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

    it('should show merge or switch customer option in dropdown and call onOpenMergePanel when clicked', async () => {
        const mockOnOpenMergePanel = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                onOpenMergePanel={mockOnOpenMergePanel}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        const menuButton = screen.getByLabelText('Customer menu')
        await act(() => user.click(menuButton))

        const mergeOptions = screen.getAllByText('Merge or switch customer')
        expect(mergeOptions[mergeOptions.length - 1]).toBeInTheDocument()

        await act(() => user.click(mergeOptions[mergeOptions.length - 1]))
        expect(mockOnOpenMergePanel).toHaveBeenCalledTimes(1)
    })

    it('should call onEditCustomer and onSyncToShopify', async () => {
        const mockOnEditCustomer = vi.fn()
        const mockOnSyncToShopify = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerHeader
                {...defaultProps}
                onEditCustomer={mockOnEditCustomer}
                onSyncToShopify={mockOnSyncToShopify}
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

        expect(mockOnEditCustomer).toHaveBeenCalledWith(
            expect.objectContaining({
                id: mockCustomer.id,
                name: mockCustomer.name,
                email: mockCustomer.email,
            }),
        )

        await act(() => user.click(menuButton))

        const syncButtons = screen.getAllByText('Sync profile to Shopify')
        await act(() => user.click(syncButtons[syncButtons.length - 1]))

        expect(mockOnSyncToShopify).toHaveBeenCalledWith(
            expect.objectContaining({
                id: mockCustomer.id,
                name: mockCustomer.name,
                email: mockCustomer.email,
            }),
        )
    })
})
