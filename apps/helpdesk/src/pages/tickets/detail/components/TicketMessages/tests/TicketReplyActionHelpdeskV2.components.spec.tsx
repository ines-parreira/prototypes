import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    ActionContentPreview,
    AssigneePreview,
    AttachmentsPreview,
    FallbackPreview,
    ForwardByEmailPreview,
    PriorityPreview,
    ReadonlyTextFieldPreview,
    SnoozePreview,
    StatusPreview,
    SuccessStatePreview,
    TagsPreview,
    TeamAssigneePreview,
} from '../AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/components'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Avatar: ({ name, url }: { name: string; url?: string }) => (
        <span>{`avatar:${name}:${url ?? 'none'}`}</span>
    ),
    Box: ({
        children,
        className,
    }: {
        children?: ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    Dot: ({ color }: { color?: string }) => <span>{`dot:${color}`}</span>,
    Icon: ({ name }: { name: string }) => <span>{name}</span>,
    StatusButton: ({
        children,
        color,
        leadingSlot,
    }: {
        children?: ReactNode
        color?: string
        leadingSlot?: ReactNode
    }) => (
        <button type="button" data-color={color}>
            {leadingSlot}
            {children}
        </button>
    ),
    Tag: ({
        children,
        leadingSlot,
    }: {
        children?: ReactNode
        leadingSlot?: ReactNode
    }) => (
        <span>
            {leadingSlot}
            {children}
        </span>
    ),
    Text: ({
        children,
        className,
        color,
    }: {
        children?: ReactNode
        className?: string
        color?: string
    }) => (
        <span className={className} data-color={color}>
            {children}
        </span>
    ),
}))

describe('TicketReplyActionHelpdeskV2 preview components', () => {
    it('renders HTML, plain text, and empty fallbacks for action content', () => {
        const { rerender } = render(
            <ActionContentPreview bodyHtml="<p>HTML preview</p>" />,
        )

        expect(screen.getByText('HTML preview')).toBeInTheDocument()

        rerender(<ActionContentPreview bodyText="Plain preview" />)

        expect(screen.getByText('Plain preview')).toBeInTheDocument()

        rerender(<ActionContentPreview />)

        expect(screen.getByText('No preview available')).toBeInTheDocument()
    })

    it('renders assignee and team previews with sensible fallbacks', () => {
        const { rerender } = render(
            <AssigneePreview
                name="Jamie Rivera"
                profilePictureUrl="https://example.com/avatar.png"
            />,
        )

        expect(
            screen.getByRole('button', { name: /jamie rivera/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'avatar:Jamie Rivera:https://example.com/avatar.png',
            ),
        ).toBeInTheDocument()

        rerender(<AssigneePreview />)

        expect(
            screen.getByRole('button', { name: /unassigned/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('user')).toBeInTheDocument()

        rerender(<TeamAssigneePreview name="Shipping Ops" />)

        expect(
            screen.getByRole('button', { name: /shipping ops/i }),
        ).toBeInTheDocument()

        rerender(<TeamAssigneePreview />)

        expect(
            screen.getByRole('button', { name: /no team/i }),
        ).toBeInTheDocument()
    })

    it('renders attachment labels from names, URLs, and the generic fallback', () => {
        render(
            <AttachmentsPreview
                attachments={[
                    {
                        name: 'invoice.pdf',
                        url: 'https://example.com/invoice.pdf',
                    },
                    {
                        url: 'https://example.com/uploads/shipping-label.png',
                    },
                    {
                        url: '',
                    },
                ]}
            />,
        )

        expect(screen.getByText('invoice.pdf')).toBeInTheDocument()
        expect(screen.getByText('shipping-label.png')).toBeInTheDocument()
        expect(screen.getByText('Attachment')).toBeInTheDocument()
    })

    it('renders readonly values and empty fallbacks for different input shapes', () => {
        const { rerender } = render(
            <ReadonlyTextFieldPreview value="Delayed order follow-up" />,
        )

        expect(screen.getByText('Delayed order follow-up')).toBeInTheDocument()

        rerender(<ReadonlyTextFieldPreview value="" />)
        expect(screen.getByText('No value')).toBeInTheDocument()

        rerender(
            <ReadonlyTextFieldPreview
                value={[]}
                emptyFallback="Nothing configured"
            />,
        )
        expect(screen.getByText('Nothing configured')).toBeInTheDocument()

        rerender(<ReadonlyTextFieldPreview value={['vip', 'refund']} />)
        expect(screen.getByText('vip,refund')).toBeInTheDocument()

        rerender(<ReadonlyTextFieldPreview value={{ id: 1 }} />)
        expect(screen.getByText('[object Object]')).toBeInTheDocument()

        rerender(<ReadonlyTextFieldPreview value={false} />)
        expect(screen.getByText('false')).toBeInTheDocument()
    })

    it('renders known and fallback priority previews', () => {
        const { rerender } = render(<PriorityPreview priority="high" />)

        expect(
            screen.getByRole('button', { name: /high/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('arrow-chevron-up')).toBeInTheDocument()

        rerender(<PriorityPreview priority={'needs_review' as never} />)

        expect(
            screen.getByRole('button', { name: /needs review/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('equals')).toBeInTheDocument()
    })

    it('renders closed, snoozed, and default statuses', () => {
        const { rerender } = render(<StatusPreview status="closed" />)

        expect(screen.getByRole('button', { name: /closed/i })).toHaveAttribute(
            'data-color',
            'grey',
        )
        expect(
            screen.getByRole('button', { name: /closed/i }),
        ).toHaveTextContent('check-circle')

        rerender(<StatusPreview status="snoozed" />)

        expect(
            screen.getByRole('button', { name: /snoozed/i }),
        ).toHaveAttribute('data-color', 'blue')
        expect(
            screen.getByRole('button', { name: /snoozed/i }),
        ).toHaveTextContent('timer-snooze')

        rerender(<StatusPreview status=" pending customer " />)

        expect(
            screen.getByRole('button', { name: /pending customer/i }),
        ).toHaveAttribute('data-color', 'purple')
        expect(
            screen.getByRole('button', { name: /pending customer/i }),
        ).toHaveTextContent('inbox')
    })

    it('renders recipient chips and empty-state fallbacks for forwarded emails', () => {
        const { rerender } = render(
            <ForwardByEmailPreview
                to="team@example.com"
                cc="manager@example.com"
                bodyText="Forward preview body"
            />,
        )

        expect(screen.getByText('To: team@example.com')).toBeInTheDocument()
        expect(screen.getByText('Cc: manager@example.com')).toBeInTheDocument()
        expect(screen.getByText('Forward preview body')).toBeInTheDocument()

        rerender(
            <ForwardByEmailPreview
                to="   "
                cc=""
                bcc={undefined}
                from={null as never}
            />,
        )

        expect(screen.getByText('No preview available')).toBeInTheDocument()
        expect(screen.queryByText(/To:/)).not.toBeInTheDocument()
    })

    it('renders tag, snooze, success, and fallback previews', () => {
        render(
            <>
                <TagsPreview tags=" vip, refund-watch , ,priority " />
                <SnoozePreview />
                <SuccessStatePreview />
                <FallbackPreview summaries={[]} />
                <FallbackPreview summaries={['Method: POST']} />
            </>,
        )

        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(screen.getByText('refund-watch')).toBeInTheDocument()
        expect(screen.getByText('priority')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /snoozed/i }),
        ).toBeInTheDocument()
        expect(screen.getAllByText('Enabled')).toHaveLength(1)
        expect(screen.getByText('Configured')).toBeInTheDocument()
        expect(screen.getByText('Method: POST')).toBeInTheDocument()
    })
})
