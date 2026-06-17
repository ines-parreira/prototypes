import { screen, within } from '@testing-library/react'

import type * as Tickets from '@repo/tickets'
import type * as Utils from '@repo/utils'

import { render } from '#tests/render.utils'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'

vi.mock('@repo/tickets', async (importOriginal) => ({
    ...(await importOriginal<typeof Tickets>()),
    ticketMessageSourceToIconName: () => 'email',
}))

vi.mock('@repo/utils', async (importOriginal) => ({
    ...(await importOriginal<typeof Utils>()),
    formatDatetime: () => '2024-03-20 17:00',
}))

vi.mock('#shared/hooks/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(() => ({
        format: {
            compact: 'YYYY-MM-DD HH:mm',
        },
        timezone: 'America/Los_Angeles',
    })),
}))

describe('MessageChannel', () => {
    it('renders nothing when no channel icon can be resolved', () => {
        const { container } = render(<MessageChannel />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders only the icon when the channel name is unavailable', () => {
        render(<MessageChannel channelIcon="phone" />)

        expect(screen.getByRole('img', { name: 'phone' })).toBeInTheDocument()
        expect(screen.queryByText('Channel:')).not.toBeInTheDocument()
    })

    it('uses provided channel metadata and the internal note color', async () => {
        const { user } = render(
            <MessageChannel
                channelIcon="note"
                channelName="Internal note"
                variant="internal-note"
            />,
        )

        expect(screen.getByRole('img', { name: 'note' })).toBeInTheDocument()

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Channel:')).toBeInTheDocument()
        expect(within(tooltip).getByText('Internal note')).toBeInTheDocument()
    })

    it('renders from, to, cc, and bcc labels in the tooltip content', async () => {
        const { user } = render(
            <MessageChannel
                channel="email"
                createdDatetime="2024-03-21T00:00:00Z"
                from="Support Team (support@example.com)"
                to="Alice (alice@example.com)"
                cc="Manager (manager@example.com)"
                bcc="Audit (audit@example.com)"
            />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('From:')).toBeInTheDocument()
        expect(
            within(tooltip).getByText('Support Team (support@example.com)'),
        ).toBeInTheDocument()
        expect(within(tooltip).getByText('To:')).toBeInTheDocument()
        expect(
            within(tooltip).getByText('Alice (alice@example.com)'),
        ).toBeInTheDocument()
        expect(within(tooltip).getByText('Cc:')).toBeInTheDocument()
        expect(
            within(tooltip).getByText('Manager (manager@example.com)'),
        ).toBeInTheDocument()
        expect(within(tooltip).getByText('Bcc:')).toBeInTheDocument()
        expect(
            within(tooltip).getByText('Audit (audit@example.com)'),
        ).toBeInTheDocument()
    })

    it('renders the via label in the tooltip when provided', async () => {
        const { user } = render(
            <MessageChannel channel="chat" via="offline capture" />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Via:')).toBeInTheDocument()
        expect(within(tooltip).getByText('offline capture')).toBeInTheDocument()
    })

    it('does not render the via label when not provided', async () => {
        const { user } = render(<MessageChannel channel="chat" />)

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).queryByText('Via:')).not.toBeInTheDocument()
    })

    it('renders the current page URL in the tooltip content', async () => {
        const currentPageUrl =
            'https://example.com/products/sneakers?customerFormRef=really-long-unbroken-contact-form-url-token'

        const { user } = render(
            <MessageChannel channel="chat" currentPageUrl={currentPageUrl} />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        const link = within(tooltip).getByRole('link', {
            name: currentPageUrl,
        })

        expect(within(tooltip).getByText('Url:')).toBeInTheDocument()
        expect(link).toHaveAttribute('href', currentPageUrl)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(within(tooltip).getByText(currentPageUrl)).toBeInTheDocument()
    })
})
