import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import { UserRole } from 'config/types/user'
import { HttpMethod } from 'models/api/types'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionType } from 'models/macroAction/types'
import type { Team } from 'models/team/types'

import { TicketReplyActionHelpdeskV2 } from '../AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/TicketReplyActionHelpdeskV2'

function renderAction(action: MacroAction) {
    return render(<TicketReplyActionHelpdeskV2 action={action} />)
}

const asActionName = (name: string) => name as MacroAction['name']
const ACTION_NAMES = {
    AddAttachments: asActionName('addAttachments'),
    AddInternalNote: asActionName('addInternalNote'),
    AddTags: asActionName('addTags'),
    ExcludeFromCSAT: asActionName('excludeFromCSAT'),
    ExcludeFromAutoMerge: asActionName('excludeFromAutoMerge'),
    ForwardByEmail: asActionName('forwardByEmail'),
    Http: asActionName('http'),
    RemoveTags: asActionName('removeTags'),
    SetAssignee: asActionName('setAssignee'),
    SetCustomFieldValue: asActionName('setCustomFieldValue'),
    SetCustomerCustomFieldValue: asActionName('setCustomerCustomFieldValue'),
    SetPriority: asActionName('setPriority'),
    SetStatus: asActionName('setStatus'),
    SetSubject: asActionName('setSubject'),
    SetTeamAssignee: asActionName('setTeamAssignee'),
    SnoozeTicket: asActionName('snoozeTicket'),
} as const

const mockAssigneeUser = {
    id: 1,
    name: 'Jamie Rivera',
    email: 'jamie@example.com',
    role: { name: UserRole.Agent },
    active: true,
    bio: null,
    country: 'US',
    language: 'en',
    created_datetime: '2024-01-01T00:00:00Z',
    deactivated_datetime: null,
    external_id: 'user-1',
    firstname: 'Jamie',
    lastname: 'Rivera',
    meta: null,
    updated_datetime: '2024-01-01T00:00:00Z',
    settings: [],
    timezone: 'UTC',
    has_2fa_enabled: false,
    client_id: null,
}

const mockAssigneeTeam: Team = {
    id: 2,
    name: 'Shipping Ops',
    created_datetime: '2024-01-01T00:00:00Z',
    uri: '/teams/2',
    members: [],
}

describe('TicketReplyActionHelpdeskV2', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders common ticket update previews with Axiom content', () => {
        render(
            <>
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.AddTags,
                        title: 'Add tags',
                        type: MacroActionType.User,
                        arguments: {
                            tags: 'vip,refund-watch',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetStatus,
                        title: 'Set status',
                        type: MacroActionType.User,
                        arguments: {
                            status: 'pending',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetPriority,
                        title: 'Set priority',
                        type: MacroActionType.User,
                        arguments: {
                            priority: 'high',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SnoozeTicket,
                        title: 'Snooze for',
                        type: MacroActionType.User,
                        arguments: {
                            snooze_timedelta: '2d',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetAssignee,
                        title: 'Assign an agent',
                        type: MacroActionType.User,
                        arguments: {
                            assignee_user: mockAssigneeUser,
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetTeamAssignee,
                        title: 'Assign a team',
                        type: MacroActionType.User,
                        arguments: {
                            assignee_team: mockAssigneeTeam,
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetSubject,
                        title: 'Set subject',
                        type: MacroActionType.User,
                        arguments: {
                            subject: 'Delayed order follow-up',
                        },
                    }}
                />
            </>,
        )

        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(screen.getByText('refund-watch')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /pending/i }),
        ).toBeInTheDocument()
        const priorityButton = screen.getByRole('button', { name: /high/i })
        expect(priorityButton).toBeInTheDocument()
        expect(
            within(priorityButton).getByRole('img', {
                name: 'arrow-chevron-up',
            }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /2d/i })).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /jamie rivera/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /shipping ops/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Delayed order follow-up')).toBeInTheDocument()
    })

    it('renders attachments, exclusions, and custom field values', () => {
        render(
            <>
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.AddAttachments,
                        title: 'Add attachments',
                        type: MacroActionType.User,
                        arguments: {
                            attachments: [
                                {
                                    name: 'invoice.pdf',
                                    url: 'https://example.com/invoice.pdf',
                                },
                            ],
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.ExcludeFromAutoMerge,
                        title: 'Exclude ticket from Auto-Merge',
                        type: MacroActionType.User,
                        arguments: {},
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.ExcludeFromCSAT,
                        title: 'Exclude ticket from CSAT',
                        type: MacroActionType.User,
                        arguments: {},
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetCustomFieldValue,
                        title: 'Set ticket field',
                        type: MacroActionType.User,
                        arguments: {
                            custom_field_id: 1,
                            value: 'Carrier delay acknowledged',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.SetCustomerCustomFieldValue,
                        title: 'Set customer field',
                        type: MacroActionType.User,
                        arguments: {
                            custom_field_id: 1,
                            value: 'VIP customer',
                        },
                    }}
                />
            </>,
        )

        expect(screen.getByText('invoice.pdf')).toBeInTheDocument()
        expect(screen.getAllByText('Enabled')).toHaveLength(2)
        expect(
            screen.getByText('Carrier delay acknowledged'),
        ).toBeInTheDocument()
        expect(screen.getByText('VIP customer')).toBeInTheDocument()
    })

    it('renders remove-tags actions and configured fallbacks for empty custom actions', () => {
        render(
            <>
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.RemoveTags,
                        title: 'Remove tags',
                        type: MacroActionType.User,
                        arguments: {
                            tags: 'do-not-reply',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.Http,
                        title: 'HTTP hook',
                        type: MacroActionType.User,
                        arguments: {
                            attachments: [
                                {
                                    name: 'invoice.pdf',
                                    url: 'https://example.com/invoice.pdf',
                                },
                            ],
                            body_html: '<p>ignored</p>',
                            body_text: 'ignored',
                            empty_value: '   ',
                        } as MacroAction['arguments'],
                    }}
                />
            </>,
        )

        expect(screen.getByText('do-not-reply')).toBeInTheDocument()
        expect(screen.getByText('Configured')).toBeInTheDocument()
    })

    it('renders internal note and forward email previews without editor widgets', () => {
        render(
            <>
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.AddInternalNote,
                        title: 'Send internal note',
                        type: MacroActionType.User,
                        arguments: {
                            body_html: '<p>Internal note preview</p>',
                        },
                    }}
                />
                <TicketReplyActionHelpdeskV2
                    action={{
                        name: ACTION_NAMES.ForwardByEmail,
                        title: 'Forward email',
                        type: MacroActionType.User,
                        arguments: {
                            to: 'team@example.com',
                            body_text: 'Forward preview body',
                        },
                    }}
                />
            </>,
        )

        expect(screen.getByText('Internal note preview')).toBeInTheDocument()
        expect(screen.getByText('To: team@example.com')).toBeInTheDocument()
        expect(screen.getByText('Forward preview body')).toBeInTheDocument()
    })

    it('renders generic fallback summaries for unhandled actions', () => {
        renderAction({
            name: ACTION_NAMES.Http,
            title: 'HTTP hook',
            type: MacroActionType.User,
            arguments: {
                method: HttpMethod.Post,
                url: 'https://example.com/orders',
                headers: [
                    {
                        key: 'X-Test',
                        value: '1',
                    },
                ],
                params: [
                    {
                        key: 'order_id',
                        value: '123',
                    },
                ],
            },
        })

        expect(screen.getByText('HTTP hook')).toBeInTheDocument()
        expect(screen.getByText('Method: POST')).toBeInTheDocument()
        expect(
            screen.getByText('Url: https://example.com/orders'),
        ).toBeInTheDocument()
        expect(screen.getByText('Headers: X-Test: 1')).toBeInTheDocument()
        expect(screen.getByText('Params: order_id: 123')).toBeInTheDocument()
    })

    it('renders custom field values as plain text when no definition is available', () => {
        renderAction({
            name: ACTION_NAMES.SetCustomFieldValue,
            title: 'Set ticket field',
            type: MacroActionType.User,
            arguments: {
                custom_field_id: 42,
                value: 'Escalated',
            },
        })

        expect(screen.getByText('Escalated')).toBeInTheDocument()
    })
})
