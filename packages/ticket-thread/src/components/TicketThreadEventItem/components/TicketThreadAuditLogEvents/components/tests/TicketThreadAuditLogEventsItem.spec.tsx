import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListTagsHandler,
    mockListTagsResponse,
    mockListTeamsHandler,
    mockListTeamsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockTag,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import type {
    TicketThreadAuditLogEvent,
    TicketThreadAuditLogEventByType,
} from '../../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../../hooks/types'
import { render } from '../../../../../../tests/render.utils'
import { server } from '../../../../../../tests/server'
import { TicketThreadAuditLogEventItem } from '../../TicketThreadAuditLogEventItem'

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

function getTagsHandler(tags: unknown[]) {
    return mockListTagsHandler(async () =>
        HttpResponse.json(
            mockListTagsResponse({
                data: tags as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: tags.length,
                },
            }),
        ),
    )
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

function buildItem<TType extends TicketThreadAuditLogEvent['type']>(
    type: TType,
    eventData?: Extract<TicketThreadAuditLogEvent, { type: TType }>['data'],
): TicketThreadAuditLogEventByType<TType> {
    return {
        _tag: TicketThreadItemTag.Events.AuditLogEvent,
        type,
        datetime: '2024-03-21T11:00:00Z',
        meta: { attribution: 'via-rule' },
        data: {
            object_type: 'Ticket',
            type,
            user_id: 42,
            created_datetime: '2024-03-21T11:00:00Z',
            data: eventData ?? {},
        },
    } as unknown as TicketThreadAuditLogEventByType<TType>
}

function renderAuditEvent<TType extends TicketThreadAuditLogEvent['type']>(
    type: TType,
    eventData?: Extract<TicketThreadAuditLogEvent, { type: TType }>['data'],
) {
    return render(
        <TicketThreadAuditLogEventItem item={buildItem(type, eventData)} />,
    )
}

describe('TicketThread audit-log rendering', () => {
    beforeEach(() => {
        server.use(
            getTagsHandler([
                mockTag({
                    id: 1,
                    name: 'VIP',
                }),
                mockTag({
                    id: 2,
                    name: 'Refund',
                }),
            ]).handler,
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

    it('renders no tag wording when tags cannot be resolved', async () => {
        const mockListTags = getTagsHandler([])
        const waitForTagsRequest = mockListTags.waitForRequest(server)

        server.use(mockListTags.handler)

        renderAuditEvent('ticket-tags-added', {
            tags_added: [999],
        })

        await waitForTagsRequest(() => undefined)
        await waitFor(() => {
            expect(screen.queryByText(/added/)).not.toBeInTheDocument()
        })
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

    it('renders nothing for ticket-assigned when assignee cannot be resolved', async () => {
        const mockListUsers = getUsersHandler([])
        const waitForUsersRequest = mockListUsers.waitForRequest(server)

        server.use(mockListUsers.handler)

        const { container } = renderAuditEvent('ticket-assigned', {
            assignee_user_id: 999,
        })

        await waitForUsersRequest(() => undefined)
        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
        })
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

    it('renders message summary event and filters system-generated summaries', () => {
        const { rerender } = render(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-message-summary-created', {})}
            />,
        )

        expect(
            screen.getByText(
                'Chat summarized - Unseen chat messages were sent by email',
            ),
        ).toBeInTheDocument()

        rerender(
            <TicketThreadAuditLogEventItem
                item={buildItem('ticket-message-summary-created', {
                    type: 'system',
                })}
            />,
        )

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
})
