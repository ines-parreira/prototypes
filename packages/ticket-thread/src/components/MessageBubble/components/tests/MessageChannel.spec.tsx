import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { MessageChannel } from '../MessageHeader/MessageChannel'

vi.mock('@repo/tickets', () => ({
    ticketMessageSourceToIconName: () => 'email',
}))

vi.mock('@repo/utils', () => ({
    formatDatetime: () => '2024-03-20 17:00',
}))

vi.mock('../MessageHeader/MessageChannel.less', () => ({
    default: {
        tooltipContent: 'tooltipContent',
    },
}))

vi.mock('@gorgias/axiom', () => ({
    Box: ({
        children,
        className,
    }: {
        children: ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    Icon: ({ color, name }: { color?: string; name?: string }) => (
        <div data-color={color} data-name={name}>
            Icon
        </div>
    ),
    Text: ({
        children,
        className,
        color,
        variant,
    }: {
        children: ReactNode
        className?: string
        color?: string
        variant?: string
    }) => (
        <span className={className} data-color={color} data-variant={variant}>
            {children}
        </span>
    ),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: ReactNode | (() => ReactNode)
        children: ReactNode
    }) => (
        <>
            {typeof trigger === 'function' ? trigger() : trigger}
            {children}
        </>
    ),
    TooltipContent: ({
        children,
        maxWidth,
    }: {
        children: ReactNode
        maxWidth?: number
    }) => <div data-max-width={maxWidth}>{children}</div>,
}))

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
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

        expect(screen.getByText('Icon')).toHaveAttribute('data-name', 'phone')
        expect(screen.queryByText('Channel:')).not.toBeInTheDocument()
    })

    it('uses provided channel metadata and the internal note color', () => {
        render(
            <MessageChannel
                channelIcon="note"
                channelName="Internal note"
                variant="internal-note"
            />,
        )

        expect(screen.getByText('Icon')).toHaveAttribute('data-name', 'note')
        expect(screen.getByText('Icon')).toHaveAttribute(
            'data-color',
            'content-additional-yellow',
        )
        expect(screen.getByText('Internal note')).toBeInTheDocument()
    })

    it('renders from, to, cc, and bcc labels in the tooltip content', () => {
        render(
            <MessageChannel
                channel="email"
                createdDatetime="2024-03-21T00:00:00Z"
                from="Support Team (support@example.com)"
                to="Alice (alice@example.com)"
                cc="Manager (manager@example.com)"
                bcc="Audit (audit@example.com)"
            />,
        )

        expect(screen.getByText('From:')).toBeInTheDocument()
        expect(
            screen.getByText('Support Team (support@example.com)'),
        ).toBeInTheDocument()
        expect(screen.getByText('To:')).toBeInTheDocument()
        expect(
            screen.getByText('Alice (alice@example.com)'),
        ).toBeInTheDocument()
        expect(screen.getByText('Cc:')).toBeInTheDocument()
        expect(
            screen.getByText('Manager (manager@example.com)'),
        ).toBeInTheDocument()
        expect(screen.getByText('Bcc:')).toBeInTheDocument()
        expect(
            screen.getByText('Audit (audit@example.com)'),
        ).toBeInTheDocument()
    })

    it('renders the current page URL in the tooltip content', () => {
        const currentPageUrl =
            'https://example.com/products/sneakers?customerFormRef=really-long-unbroken-contact-form-url-token'

        render(
            <MessageChannel channel="chat" currentPageUrl={currentPageUrl} />,
        )

        const link = screen.getByRole('link', {
            name: currentPageUrl,
        })

        expect(screen.getByText('Url:')).toBeInTheDocument()
        expect(link).toHaveAttribute('href', currentPageUrl)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByText(currentPageUrl)).toHaveAttribute(
            'data-color',
            'content-inverted-default',
        )
        expect(
            screen.getByText(currentPageUrl).closest('[data-max-width]'),
        ).toHaveAttribute('data-max-width', '360')
        expect(
            screen.getByText(currentPageUrl).closest('[data-max-width]')
                ?.firstChild,
        ).toHaveClass('tooltipContent')
    })
})
