import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTagHandler,
    mockGetTagResponse,
    mockListTeamsHandler,
    mockListTeamsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockTag,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { TicketThreadAuditLogEventItem } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEvents/TicketThreadAuditLogEventItem'
import type {
    TicketThreadAuditLogAttribution,
    TicketThreadAuditLogEvent,
    TicketThreadAuditLogEventByType,
} from '#events/types'
import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { TicketThreadItemTag } from '#thread/itemTags'

function getUsersHandler(users: unknown[]) {
    return mockListUsersHandler(async () =>
        HttpResponse.json(
            mockListUsersResponse({
                data: users as any[],
                meta: { prev_cursor: null, next_cursor: null },
            }),
        ),
    )
}

function getTagHandler(tagsById: Record<number, unknown>) {
    return mockGetTagHandler(async ({ params }) => {
        const tagId = Number(params?.id ?? 0)
        const tag = tagsById[tagId]

        if (!tag) {
            return new HttpResponse(null, { status: 204 })
        }

        return HttpResponse.json(
            mockGetTagResponse({
                ...(tag as any),
                id: tagId,
            }),
        )
    })
}

function getTeamsHandler(teams: unknown[]) {
    return mockListTeamsHandler(async () =>
        HttpResponse.json(
            mockListTeamsResponse({
                data: teams as any[],
                meta: { prev_cursor: null, next_cursor: null },
            }),
        ),
    )
}

type BuildItemOptions = {
    attribution?: TicketThreadAuditLogAttribution
    userId?: number | null
}

function buildItem<TType extends TicketThreadAuditLogEvent['type']>(
    type: TType,
    eventData?: Extract<TicketThreadAuditLogEvent, { type: TType }>['data'],
    options: BuildItemOptions = {},
): TicketThreadAuditLogEventByType<TType> {
    return {
        _tag: TicketThreadItemTag.Events.AuditLogEvent,
        type,
        datetime: '2024-03-21T11:00:00Z',
        meta: { attribution: options.attribution ?? 'via-rule' },
        data: {
            object_type: 'Ticket',
            type,
            user_id: options.userId === undefined ? 42 : options.userId,
            created_datetime: '2024-03-21T11:00:00Z',
            data: eventData ?? {},
        },
    } as unknown as TicketThreadAuditLogEventByType<TType>
}

function renderAuditEvent<TType extends TicketThreadAuditLogEvent['type']>(
    type: TType,
    eventData?: Extract<TicketThreadAuditLogEvent, { type: TType }>['data'],
    options?: {
        attribution?: TicketThreadAuditLogAttribution
        userId?: number | null
    },
) {
    return render(
        <TicketThreadAuditLogEventItem
            item={buildItem(type, eventData, options)}
        />,
    )
}

describe('TicketThread audit-log rendering', () => {
    beforeEach(() => {
        server.use(
            getCurrentUserHandler().handler,
            getTagHandler({
                1: mockTag({
                    id: 1,
                    name: 'VIP',
                }),
                2: mockTag({
                    id: 2,
                    name: 'Refund',
                }),
            }).handler,
            getUsersHandler([
                mockUser({
                    id: 101,
                    name: 'Nicolas Agent',
                }),
            ]).handler,
            getTeamsHandler([
                mockTeam({
                    id: 201,
                    name: 'Support Team',
                }),
            ]).handler,
        )
    })

    it('renders tags-added tags and plural wording', async () => {
        renderAuditEvent('ticket-tags-added', {
            tags_added: [1, 2],
        })

        expect(await screen.findByText('VIP')).toBeInTheDocument()
        expect(screen.getByText('Refund')).toBeInTheDocument()
        expect(screen.getByText('were added')).toBeInTheDocument()
        expect(screen.getByText('via rule')).toBeInTheDocument()
    })

    it('renders tags-removed tag and singular wording', async () => {
        renderAuditEvent('ticket-tags-removed', {
            tags_removed: [1],
        })

        expect(await screen.findByText('VIP')).toBeInTheDocument()
        expect(screen.getByText('was removed')).toBeInTheDocument()
    })

    it('renders event wording when tags cannot be resolved', async () => {
        const mockGetTag = getTagHandler({})
        const waitForTagRequest = mockGetTag.waitForRequest(server)

        server.use(mockGetTag.handler)

        renderAuditEvent('ticket-tags-added', {
            tags_added: [999],
        })

        await waitForTagRequest(() => undefined)

        expect(screen.queryByText('VIP')).not.toBeInTheDocument()
        expect(screen.getByText('was added')).toBeInTheDocument()
    })

    it('renders ticket-assigned with resolved agent target', async () => {
        renderAuditEvent('ticket-assigned', {
            assignee_user_id: 101,
        })

        expect(
            await screen.findByText('Ticket assigned to Nicolas Agent'),
        ).toBeInTheDocument()
        expect(screen.getByText('via rule')).toBeInTheDocument()
    })

    it('keeps ticket-assigned visible when assignee cannot be resolved', async () => {
        const mockListUsers = getUsersHandler([])
        const waitForUsersRequest = mockListUsers.waitForRequest(server)

        server.use(mockListUsers.handler)

        renderAuditEvent('ticket-assigned', {
            assignee_user_id: 999,
        })

        await waitForUsersRequest(() => undefined)
        expect(screen.getByText('Ticket assigned')).toBeInTheDocument()
        expect(screen.getByText('via rule')).toBeInTheDocument()
    })

    it('renders ticket-assigned author when attribution is author', async () => {
        renderAuditEvent(
            'ticket-assigned',
            {
                assignee_user_id: 101,
            },
            {
                attribution: 'author',
                userId: 101,
            },
        )

        expect(
            await screen.findByText('Ticket assigned to Nicolas Agent'),
        ).toBeInTheDocument()
        expect(screen.getByText('by')).toBeInTheDocument()
        expect(screen.getByText('Nicolas Agent')).toBeInTheDocument()
    })

    it('renders ticket-assigned team auto-assignment attribution', async () => {
        renderAuditEvent(
            'ticket-assigned',
            {
                assignee_user_id: 101,
            },
            {
                attribution: 'via-team-auto-assignment',
                userId: null,
            },
        )

        expect(
            await screen.findByText('Ticket assigned to Nicolas Agent'),
        ).toBeInTheDocument()
        expect(screen.getByText('via Team auto-assignment')).toBeInTheDocument()
    })

    it('renders ticket-unassigned author when attribution is author', async () => {
        renderAuditEvent('ticket-unassigned', undefined, {
            attribution: 'author',
            userId: 101,
        })

        expect(screen.getByText('Ticket was unassigned')).toBeInTheDocument()
        expect(await screen.findByText('Nicolas Agent')).toBeInTheDocument()
        expect(screen.getByText('by')).toBeInTheDocument()
    })

    it('renders team assignment target when assignee_team_id exists', async () => {
        renderAuditEvent('ticket-team-assigned', {
            assignee_team_id: 201,
        })

        expect(await screen.findByText('Support Team')).toBeInTheDocument()
        expect(screen.getByText('Ticket was assigned')).toBeInTheDocument()
    })

    it('renders subject transition when old and new subjects are present', () => {
        renderAuditEvent('ticket-subject-updated', {
            old_subject: 'Legacy subject',
            new_subject: 'Updated subject',
        })

        expect(screen.getByText('Subject updated')).toBeInTheDocument()
        expect(screen.getByText('Legacy subject')).toBeInTheDocument()
        expect(screen.getByText('Updated subject')).toBeInTheDocument()
    })

    it('renders customer transition with id fallback when customer names are empty', () => {
        renderAuditEvent('ticket-customer-updated', {
            old_customer: {
                id: 963116088,
                name: null,
            },
            new_customer: {
                id: 337053890,
                name: 'Stephanie Enright',
            },
        })

        expect(screen.getByText(/Customer changed from/)).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Customer #963116088' }),
        ).toHaveAttribute('href', '/app/customer/963116088')
        expect(
            screen.getByRole('link', { name: 'Stephanie Enright' }),
        ).toHaveAttribute('href', '/app/customer/337053890')
    })

    it('renders customer transition with id fallback when the new customer name is empty', () => {
        renderAuditEvent('ticket-customer-updated', {
            old_customer: {
                id: 963116088,
                name: 'Legacy Customer',
            },
            new_customer: {
                id: 337053890,
                name: null,
            },
        })

        expect(
            screen.getByRole('link', { name: 'Legacy Customer' }),
        ).toHaveAttribute('href', '/app/customer/963116088')
        expect(
            screen.getByRole('link', { name: 'Customer #337053890' }),
        ).toHaveAttribute('href', '/app/customer/337053890')
    })

    it('renders ticket summary generated event when first_unseen_id is absent', () => {
        render(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-message-summary-created', {})}
            />,
        )

        expect(
            screen.getByText('Ticket summary was generated'),
        ).toBeInTheDocument()
    })

    it('renders chat summarized event when first_unseen_id is present', () => {
        render(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-message-summary-created', {
                    first_unseen_id: 123,
                })}
            />,
        )

        expect(
            screen.getByText(
                'Chat summarized - Unseen chat messages were sent by email',
            ),
        ).toBeInTheDocument()
    })

    it('filters system-generated message summary events', () => {
        render(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-message-summary-created', {
                    type: 'system',
                })}
            />,
        )

        expect(
            screen.queryByText('Ticket summary was generated'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'Chat summarized - Unseen chat messages were sent by email',
            ),
        ).not.toBeInTheDocument()
    })

    it('renders CSAT skipped summary and details when reasons exist', () => {
        renderAuditEvent('ticket-satisfaction-survey-skipped', {
            reasons: ['No customer email', 'Ticket too old'],
        })

        expect(
            screen.getByText('Ticket not eligible for CSAT'),
        ).toBeInTheDocument()
        expect(screen.getByText('Missing requirements:')).toBeInTheDocument()
        expect(screen.getByText('- No customer email')).toBeInTheDocument()
        expect(screen.getByText('- Ticket too old')).toBeInTheDocument()
    })

    it('routes rule-executed with a slug to the suggestion component', () => {
        renderAuditEvent('rule-executed', { slug: 'refund' })

        expect(screen.getByText('refund')).toBeInTheDocument()
        expect(
            screen.getByText(/applied to ticket manually/),
        ).toBeInTheDocument()
    })

    it('routes rule-executed without a slug to the rule executed component', () => {
        renderAuditEvent('rule-executed', { id: 1, name: 'My Rule' })

        expect(screen.getByText('My Rule')).toBeInTheDocument()
        expect(screen.getByText(/executed/)).toBeInTheDocument()
        expect(
            screen.queryByText(/applied to ticket manually/),
        ).not.toBeInTheDocument()
    })

    it.each([
        ['ticket-created', 'Ticket was created'],
        ['ticket-closed', 'Status was changed to Closed'],
        ['ticket-reopened', 'Status was changed to Open'],
        ['ticket-team-unassigned', 'Unassigned from team'],
        ['ticket-marked-spam', 'Marked as spam'],
        ['ticket-unmarked-spam', 'Unmarked as spam'],
        ['ticket-snoozed', 'Status was changed to Snoozed'],
        ['ticket-untrashed', 'Restored from trash'],
        ['ticket-excluded-from-auto-merge', 'Excluded from Auto-Merge'],
        ['ticket-trashed', 'Moved to trash'],
        ['satisfaction-survey-sent', 'CSAT survey sent'],
        ['ticket-unassigned', 'Ticket was unassigned'],
        ['ticket-excluded-from-csat', 'Ticket excluded from CSAT'],
        ['ticket-customer-updated', 'Customer updated'],
        ['ticket-merged', 'Merged'],
        ['ticket-self-unsnoozed', 'Snooze delay ended'],
    ] as const)('renders %s static wording', (type, text) => {
        renderAuditEvent(type)

        expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('renders auto-merge service attribution for system merge events', () => {
        render(
            <TicketThreadAuditLogEventItem
                item={buildItem(
                    'ticket-merged',
                    {},
                    {
                        attribution: 'none',
                        userId: null,
                    },
                )}
            />,
        )

        expect(screen.getByText('Merged')).toBeInTheDocument()
        expect(screen.getByText('by auto-merge service')).toBeInTheDocument()
    })

    it('keeps rule attribution for rule-driven merge events', () => {
        render(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-merged', {}, { userId: null })}
            />,
        )

        expect(screen.getByText('via rule')).toBeInTheDocument()
        expect(
            screen.queryByText('by auto-merge service'),
        ).not.toBeInTheDocument()
    })

    it('renders split event link to the target ticket', () => {
        renderAuditEvent('ticket-split', {
            split_into_ticket: { id: 999 },
        })

        expect(screen.getByText('Created from')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'ticket' })).toHaveAttribute(
            'href',
            '/app/ticket/999',
        )
    })

    it('renders SLA policy assigned event with a link to the policy settings', () => {
        renderAuditEvent('ticket-sla-policy-assigned', {
            sla_policy_uuid: 'abc-123',
            sla_policy_name: 'Standard SLA',
        })

        expect(
            screen.getByRole('link', { name: 'Standard SLA' }),
        ).toHaveAttribute('href', '/app/settings/sla/abc-123')
        expect(screen.getByText(/" assigned/)).toBeInTheDocument()
    })

    it('renders SLA policy assigned event name as plain text when uuid is missing', () => {
        renderAuditEvent('ticket-sla-policy-assigned', {
            sla_policy_name: 'Standard SLA',
        })

        expect(screen.getByText(/Standard SLA/)).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: 'Standard SLA' }),
        ).not.toBeInTheDocument()
    })
})
