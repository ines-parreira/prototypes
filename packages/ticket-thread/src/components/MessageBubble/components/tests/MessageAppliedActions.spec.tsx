import { screen, within } from '@testing-library/react'

import { mockListTicketTagsHandler } from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { MessageAppliedActions } from '../MessageAppliedActions'

vi.mock(
    '../../../TicketThreadEventItem/components/TicketThreadEventDateTime',
    () => ({
        TicketThreadEventDateTime: ({ datetime }: { datetime: string }) => (
            <span>{datetime}</span>
        ),
    }),
)

beforeEach(() => {
    server.use(mockListTicketTagsHandler().handler)
})

const DATETIME = '2024-03-21T09:58:00Z'

function makeAction(
    overrides: Record<string, unknown> = {},
): Record<string, unknown> {
    return {
        name: 'setStatus',
        title: 'Set status',
        status: 'success',
        arguments: { status: 'open' },
        ...overrides,
    }
}

function makeMessage(actions: Record<string, unknown>[]): {
    actions: Record<string, unknown>[]
    created_datetime: string
    macros: Array<{ id: number }>
    ticket_id: number
} {
    return {
        actions,
        created_datetime: DATETIME,
        macros: [{ id: 1 }],
        ticket_id: 123,
    }
}

function expectInlineColor(element: HTMLElement, color: string) {
    expect(element.getAttribute('style')).toContain(`color: ${color}`)
}

describe('MessageAppliedActions', () => {
    it('renders nothing when actions is null or empty', () => {
        const { container, rerender } = render(
            <MessageAppliedActions
                message={{
                    actions: null,
                    created_datetime: DATETIME,
                    macros: [{ id: 1 }],
                    ticket_id: 123,
                }}
            />,
        )
        expect(container).toBeEmptyDOMElement()

        rerender(
            <MessageAppliedActions
                message={{
                    actions: [],
                    created_datetime: DATETIME,
                    macros: [{ id: 1 }],
                    ticket_id: 123,
                }}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders actions without macro attribution when no macros were applied', () => {
        const messageWithoutMacros = {
            actions: [
                makeAction({
                    name: 'setStatus',
                    title: 'Set status',
                    arguments: { status: 'closed' },
                }),
            ],
            created_datetime: DATETIME,
            ticket_id: 123,
        }

        const { container, rerender } = render(
            <MessageAppliedActions
                message={{
                    ...messageWithoutMacros,
                    macros: [],
                }}
            />,
        )

        expect(container).not.toBeEmptyDOMElement()
        expect(screen.getByText('Set status: closed')).toBeInTheDocument()
        expect(screen.queryByText('macro')).not.toBeInTheDocument()

        rerender(
            <MessageAppliedActions
                message={{
                    ...messageWithoutMacros,
                    macros: null,
                }}
            />,
        )
        expect(screen.getByText('Set status: closed')).toBeInTheDocument()
        expect(screen.queryByText('macro')).not.toBeInTheDocument()

        rerender(<MessageAppliedActions message={messageWithoutMacros} />)
        expect(screen.getByText('Set status: closed')).toBeInTheDocument()
        expect(screen.queryByText('macro')).not.toBeInTheDocument()
    })

    it('renders legacy-formatted action text with macro attribution', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'setStatus',
                        title: 'Set status',
                        arguments: { status: 'closed' },
                    }),
                ])}
            />,
        )

        expect(screen.getByText(/Set status: closed/)).toBeInTheDocument()
        expect(screen.getByText('macro')).toBeInTheDocument()
    })

    it.each([{ name: 'setResponseText' }, { name: 'addAttachments' }])(
        'renders nothing when all actions are front-execution actions ($name)',
        ({ name }) => {
            const { container } = render(
                <MessageAppliedActions
                    message={makeMessage([makeAction({ name })])}
                />,
            )
            expect(container).toBeEmptyDOMElement()
        },
    )

    it('filters out front-execution actions and renders the rest', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'setResponseText',
                        title: 'Set response',
                    }),
                    makeAction({ name: 'http', title: 'HTTP hook' }),
                ])}
            />,
        )

        expect(screen.queryByText('Set response')).not.toBeInTheDocument()
        expect(screen.getByText(/HTTP hook/)).toBeInTheDocument()
    })

    it('renders forwardByEmail as a backend action without arguments', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'forwardByEmail',
                        title: 'Forward email',
                        arguments: { body_text: 'Forwarded text' },
                    }),
                ])}
            />,
        )

        expect(screen.getByText(/Forward email/)).toBeInTheDocument()
        expect(screen.queryByText(/Forwarded text/)).not.toBeInTheDocument()
    })

    it('formats legacy action arguments', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'setAssignee',
                        title: 'Assign an agent',
                        arguments: { assignee_user: { name: 'Agent Smith' } },
                    }),
                    makeAction({
                        name: 'setAssignee',
                        title: 'Assign an agent',
                        arguments: { assignee_user: { id: 123 } },
                    }),
                    makeAction({
                        name: 'setPriority',
                        title: 'Set priority',
                        arguments: { priority: '' },
                    }),
                ])}
            />,
        )

        expect(
            screen.getByText(/Assign an agent: Agent Smith/),
        ).toBeInTheDocument()
        expect(screen.getByText(/Assign an agent: None/)).toBeInTheDocument()
        expect(screen.getByText(/Set priority: None/)).toBeInTheDocument()
    })

    it('renders legacy title-only actions without arguments', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'http',
                        title: 'HTTP hook',
                        arguments: { url: 'https://example.test' },
                    }),
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        arguments: { restock: true },
                    }),
                    makeAction({
                        name: 'excludeFromAutoMerge',
                        title: 'Exclude ticket from Auto-Merge',
                    }),
                    makeAction({
                        name: 'excludeFromCSAT',
                        title: 'Exclude ticket from CSAT',
                    }),
                ])}
            />,
        )

        expect(screen.getByText(/HTTP hook/)).toBeInTheDocument()
        expect(screen.getByText(/Refund last order/)).toBeInTheDocument()
        expect(
            screen.getByText(/Exclude ticket from Auto-Merge/),
        ).toBeInTheDocument()
        expect(screen.getByText(/Exclude ticket from CSAT/)).toBeInTheDocument()
        expect(screen.queryByText(/example.test/)).not.toBeInTheDocument()
        expect(screen.queryByText(/restock/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Auto-Merge: None/)).not.toBeInTheDocument()
        expect(screen.queryByText(/CSAT: None/)).not.toBeInTheDocument()
    })

    it('renders addTags action as inline tag chips with "were added via macro"', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'addTags',
                        title: 'Add tags',
                        arguments: { tags: 'urgent,vip' },
                    }),
                ])}
            />,
        )

        expect(screen.getByRole('img', { name: 'tag' })).toBeInTheDocument()
        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(screen.getByText(/were added via/)).toBeInTheDocument()
        expect(screen.getByText('macro')).toBeInTheDocument()
    })

    it('renders addTags without macro attribution when no macros were applied', () => {
        render(
            <MessageAppliedActions
                message={{
                    ...makeMessage([
                        makeAction({
                            name: 'addTags',
                            title: 'Add tags',
                            arguments: { tags: 'urgent,vip' },
                        }),
                    ]),
                    macros: [],
                }}
            />,
        )

        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(screen.getByText(/were added/)).toBeInTheDocument()
        expect(screen.queryByText(/were added via/)).not.toBeInTheDocument()
        expect(screen.queryByText('macro')).not.toBeInTheDocument()
    })

    it('uses "was added" for a single tag', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'addTags',
                        arguments: { tags: 'urgent' },
                    }),
                ])}
            />,
        )

        expect(screen.getByText(/was added via/)).toBeInTheDocument()
    })

    it('shows a spinner and dimmed tags when isPending for addTags action', () => {
        render(
            <MessageAppliedActions
                isPending
                message={makeMessage([
                    makeAction({
                        name: 'addTags',
                        arguments: { tags: 'urgent,vip' },
                    }),
                ])}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'tag' }),
        ).not.toBeInTheDocument()
        expectInlineColor(
            screen.getByText(/were added via/),
            'var(--content-neutral-tertiary)',
        )
    })

    it('shows circle-check icon for generic non-shopify, non-http actions', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({ name: 'setStatus', title: 'Set status' }),
                ])}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'check-circle' }),
        ).toBeInTheDocument()
    })

    it('shows a spinner and dimmed text when isPending or status is pending', () => {
        const { rerender } = render(
            <MessageAppliedActions
                isPending
                message={makeMessage([
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        status: 'success',
                    }),
                ])}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'app-shopify' }),
        ).not.toBeInTheDocument()
        expectInlineColor(
            screen.getByText(/Refund last order/),
            'var(--content-neutral-tertiary)',
        )

        rerender(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        status: 'pending',
                    }),
                ])}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'app-shopify' }),
        ).not.toBeInTheDocument()
        expectInlineColor(
            screen.getByText(/Refund last order/),
            'var(--content-neutral-tertiary)',
        )
    })

    it('renders non-tag actions as "title via macro" with source icon', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        status: 'success',
                    }),
                ])}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'app-shopify' }),
        ).toBeInTheDocument()
        expect(screen.getByText(/Refund last order/)).toBeInTheDocument()
        expect(screen.getByText('macro')).toBeInTheDocument()
    })

    it('shows source icon and triangle-warning for error and cancelled actions', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        status: 'error',
                    }),
                    makeAction({
                        name: 'http',
                        title: 'HTTP hook',
                        status: 'cancelled',
                    }),
                ])}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'app-shopify' }),
        ).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'webhook' })).toBeInTheDocument()
        expect(
            screen.getAllByRole('img', { name: 'warning-triangle' }),
        ).toHaveLength(2)
        expect(
            screen.queryByRole('img', { name: 'info' }),
        ).not.toBeInTheDocument()
    })

    it.each([{ status: 'error' }, { status: 'cancelled' }])(
        'applies error color to text when action status is $status',
        ({ status }) => {
            render(
                <MessageAppliedActions
                    message={makeMessage([
                        makeAction({
                            name: 'shopifyFullRefundLastOrder',
                            title: 'Refund last order',
                            status,
                        }),
                    ])}
                />,
            )

            expectInlineColor(
                screen.getByText(/Refund last order/),
                'var(--content-error-default)',
            )
        },
    )

    it('shows "Action failed." tooltip on the triangle-warning icon', async () => {
        const { user } = render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'shopifyFullRefundLastOrder',
                        title: 'Refund last order',
                        status: 'error',
                    }),
                ])}
            />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Action failed.')).toBeInTheDocument()
    })

    it('does not show an info icon for successful actions', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'http',
                        title: 'HTTP hook',
                        status: 'success',
                    }),
                ])}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'info' }),
        ).not.toBeInTheDocument()
    })

    it('shows "WhatsApp template applied" for applyExternalTemplate', () => {
        render(
            <MessageAppliedActions
                message={makeMessage([
                    makeAction({
                        name: 'applyExternalTemplate',
                        title: 'My template',
                    }),
                ])}
            />,
        )

        expect(
            screen.getByText(/WhatsApp template applied/),
        ).toBeInTheDocument()
        expect(screen.queryByText('My template')).not.toBeInTheDocument()
    })
})
