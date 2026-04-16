import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import { MessageChannel } from '../MessageHeader/MessageChannel'

vi.mock('@repo/tickets', () => ({
    ticketMessageSourceToIconName: () => 'email',
}))

vi.mock('@repo/utils', () => ({
    formatDatetime: () => '2024-03-20 17:00',
}))

vi.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Icon: () => <div>Icon</div>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
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
    TooltipContent: ({ children }: { children: ReactNode }) => <>{children}</>,
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
})
