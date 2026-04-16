import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, within } from '@testing-library/react'

import { DataTable } from '@gorgias/axiom'
import {
    mockTicketCompact,
    mockTicketCompactCustomer,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { TicketMessageSourceType } from '@gorgias/helpdesk-types'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime'

import { render } from '../../../../tests/render.utils'
import type { SearchTicket } from '../../../types/search'
import { getTicketTableDisplayRow } from '../../../utils/getTicketTableDisplayRow'
import type { TicketTableColumnsParams } from '../TicketTableColumns'
import { createTicketTableColumns } from '../TicketTableColumns'

vi.mock('@gorgias/realtime', () => ({
    useAgentActivity: vi.fn(),
}))

vi.mock('../../TicketListItem/components/TicketListItemAgentsViewing', () => ({
    TicketListItemAgentsViewing: ({
        agents,
    }: {
        agents: Array<{ id: number }>
    }) => <div>{agents.length} agents viewing</div>,
}))

const mockGetTicketActivity = vi.fn().mockReturnValue({ viewing: [] })

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00Z'))
    vi.mocked(useAgentActivityMock).mockReturnValue({
        viewTickets: vi.fn(),
        joinTicket: vi.fn(),
        leaveTicket: vi.fn(),
        getTicketActivity: mockGetTicketActivity,
        startTyping: vi.fn().mockResolvedValue(undefined),
        stopTyping: vi.fn().mockResolvedValue(undefined),
    } as any)
    mockGetTicketActivity.mockReturnValue({ viewing: [] })
})

afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
})

const dateTimePreferences = {
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.AmPm,
    timezone: undefined,
}

type RenderColumnParams = Partial<TicketTableColumnsParams> & {
    translationMap?: Record<
        number,
        ReturnType<typeof mockTicketTranslationCompact>
    >
    shouldShowTranslatedContent?: (
        language?: ReturnType<typeof mockTicketCompact>['language'],
    ) => boolean
}

const renderColumn = (
    columnId: string | string[],
    ticket: ReturnType<typeof mockTicketCompact>,
    columnsParams?: RenderColumnParams,
) => {
    const ids = Array.isArray(columnId) ? columnId : [columnId]
    const columns = createTicketTableColumns({
        dateTimePreferences,
        ...columnsParams,
    }).filter((c) => ids.includes(c.id!))
    const displayRow = getTicketTableDisplayRow({
        ticket,
        translation: columnsParams?.translationMap?.[ticket.id],
        showTranslatedContent:
            columnsParams?.shouldShowTranslatedContent?.(ticket.language) ??
            false,
    })

    return render(
        <DataTable
            data={[
                {
                    ...ticket,
                    displayCustomer: displayRow.customer,
                    displaySubject: displayRow.subject,
                    displayExcerpt: displayRow.excerpt,
                    displayTicketId: displayRow.ticketId,
                },
            ]}
            columns={columns}
        />,
    )
}

describe('createTicketTableColumns', () => {
    it('keeps the Ticket column visible and outside column editing', () => {
        const columns = createTicketTableColumns({
            dateTimePreferences,
        })

        expect(columns.find((c) => c.id === 'ticket')).toEqual(
            expect.objectContaining({
                id: 'ticket',
                header: 'Ticket',
                enableHiding: false,
            }),
        )
    })

    it('marks the supported sortable columns as sortable', () => {
        const columns = createTicketTableColumns({
            dateTimePreferences,
        })

        expect(columns.find((c) => c.id === 'priority')).toEqual(
            expect.objectContaining({ enableSorting: true }),
        )
        expect(columns.find((c) => c.id === 'last_message_datetime')).toEqual(
            expect.objectContaining({ enableSorting: true }),
        )
        expect(columns.find((c) => c.id === 'created_datetime')).toEqual(
            expect.objectContaining({ enableSorting: true }),
        )
        expect(columns.find((c) => c.id === 'updated_datetime')).toEqual(
            expect.objectContaining({ enableSorting: true }),
        )
        expect(
            columns.find((c) => c.id === 'last_received_message_datetime'),
        ).toEqual(expect.objectContaining({ enableSorting: true }))
    })

    describe('ticket column (TicketCell)', () => {
        it('renders the ticket subject and excerpt', () => {
            const ticket = mockTicketCompact({
                id: 1,
                subject: 'Help with order',
                excerpt: 'I need help with my order',
                last_sent_message_not_delivered: false,
            })

            renderColumn('ticket', ticket)

            expect(screen.getByText('Help with order')).toBeInTheDocument()
            expect(
                screen.getByText('I need help with my order'),
            ).toBeInTheDocument()
        })

        it('renders the failed message tag instead of the excerpt', () => {
            const ticket = mockTicketCompact({
                id: 1,
                subject: 'Help with order',
                excerpt: 'I need help with my order',
                last_sent_message_not_delivered: true,
            })

            renderColumn('ticket', ticket)

            expect(
                screen.getByText('Last message not delivered'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('I need help with my order'),
            ).not.toBeInTheDocument()
        })

        it('renders translated subject when showTranslatedContent is true', () => {
            const ticket = mockTicketCompact({
                id: 1,
                subject: 'Original subject',
            })

            renderColumn('ticket', ticket, {
                translationMap: {
                    1: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(screen.getByText('Translated subject')).toBeInTheDocument()
        })

        it('renders "No subject" when the subject is empty', () => {
            renderColumn(
                'ticket',
                mockTicketCompact({
                    id: 1,
                    subject: '',
                }),
            )

            expect(screen.getByText('No subject')).toBeInTheDocument()
        })

        it('renders agents viewing', () => {
            mockGetTicketActivity.mockReturnValue({
                viewing: [
                    { id: 99, name: 'Agent One', email: 'agent@example.com' },
                ],
            })

            renderColumn('ticket', mockTicketCompact({ id: 1 }), {
                currentUserId: 1,
            })

            expect(screen.getByText('1 agents viewing')).toBeInTheDocument()
        })

        it('renders highlighted search values for the subject, excerpt, and customer', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 1,
                    subject: 'Original subject',
                    excerpt: 'Original excerpt',
                    last_sent_message_not_delivered: false,
                    customer: mockTicketCompactCustomer({
                        name: 'Original customer',
                        email: 'customer@example.com',
                    }),
                }),
                highlights: {
                    subject: ['<em>Highlighted</em> subject'],
                    messages: {
                        body: ['Message <em>match</em>'],
                        from: {
                            name: ['<em>Customer</em> Name'],
                        },
                    },
                },
            } as SearchTicket

            renderColumn(['ticket', 'customer'], ticket)

            const [ticketCell, customerCell] = screen.getAllByRole('cell')

            expect(
                within(ticketCell).getByText(
                    (_, node) =>
                        node?.getAttribute('data-name') === 'text' &&
                        node.textContent === 'Highlighted subject',
                ),
            ).toBeInTheDocument()
            expect(
                within(ticketCell).getByText(
                    (_, node) =>
                        node?.getAttribute('data-name') === 'text' &&
                        node.textContent === 'Message match',
                ),
            ).toBeInTheDocument()
            expect(
                within(customerCell).getByText(
                    (_, node) =>
                        node?.getAttribute('data-name') === 'text' &&
                        node.textContent === 'Customer Name',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Original excerpt'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Original customer'),
            ).not.toBeInTheDocument()
        })

        it('prefers translated subject and excerpt when highlights have no match markup', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 1,
                    subject: 'Original subject',
                    excerpt: 'Original excerpt',
                    last_sent_message_not_delivered: false,
                }),
                highlights: {
                    subject: ['Highlighted subject'],
                    messages: {
                        body: ['Message match'],
                    },
                },
            } as SearchTicket

            renderColumn('ticket', ticket, {
                translationMap: {
                    1: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                        excerpt: 'Translated excerpt',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(screen.getByText('Translated subject')).toBeInTheDocument()
            expect(screen.getByText('Translated excerpt')).toBeInTheDocument()
            expect(
                screen.queryByText('Highlighted subject'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Message match')).not.toBeInTheDocument()
        })

        it('keeps highlighted subject and excerpt when they contain match markup', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 1,
                    subject: 'Original subject',
                    excerpt: 'Original excerpt',
                    last_sent_message_not_delivered: false,
                }),
                highlights: {
                    subject: ['<em>Highlighted</em> subject'],
                    messages: {
                        body: ['Message <em>match</em>'],
                    },
                },
            } as SearchTicket

            renderColumn('ticket', ticket, {
                translationMap: {
                    1: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                        excerpt: 'Translated excerpt',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(
                screen.getByText(
                    (_, node) =>
                        node?.getAttribute('data-name') === 'text' &&
                        node.textContent === 'Highlighted subject',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    (_, node) =>
                        node?.getAttribute('data-name') === 'text' &&
                        node.textContent === 'Message match',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Translated subject'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Translated excerpt'),
            ).not.toBeInTheDocument()
        })
    })

    describe('subject column (SubjectOnlyCell)', () => {
        it('renders translated subject when showTranslatedContent is true', () => {
            const ticket = mockTicketCompact({
                id: 42,
                subject: 'Original subject',
            })

            renderColumn('subject', ticket, {
                translationMap: {
                    42: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(screen.getByText('Translated subject')).toBeInTheDocument()
        })

        it('renders "No subject" when the subject is empty', () => {
            renderColumn(
                'subject',
                mockTicketCompact({
                    id: 42,
                    subject: '',
                }),
            )

            expect(screen.getByText('No subject')).toBeInTheDocument()
        })
    })

    describe('id column', () => {
        it('renders the ticket id as text', () => {
            renderColumn(
                'id',
                mockTicketCompact({
                    id: 123,
                }),
            )

            expect(screen.getByText('123')).toBeInTheDocument()
        })
    })

    describe('customer column', () => {
        it('renders the resolved customer name', () => {
            const ticket = mockTicketCompact({
                customer: mockTicketCompactCustomer({
                    name: 'Customer Name',
                    email: 'customer@example.com',
                }),
            })

            renderColumn('customer', ticket)

            expect(screen.getByText('Customer Name')).toBeInTheDocument()
        })
    })

    describe('assignee column', () => {
        it('renders "Unassigned" when there is no assignee', () => {
            renderColumn('assignee', mockTicketCompact({ assignee_user: null }))

            expect(screen.getByText('Unassigned')).toBeInTheDocument()
        })

        it('renders the assignee full name', () => {
            const ticket = mockTicketCompact({
                assignee_user: {
                    id: 5,
                    firstname: 'Jane',
                    lastname: 'Doe',
                    email: 'jane@example.com',
                } as any,
            })

            renderColumn('assignee', ticket)

            expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        })

        it('falls back to email when the assignee has no name', () => {
            const ticket = mockTicketCompact({
                assignee_user: {
                    id: 5,
                    firstname: '',
                    lastname: '',
                    email: 'jane@example.com',
                } as any,
            })

            renderColumn('assignee', ticket)

            expect(screen.getByText('jane@example.com')).toBeInTheDocument()
        })
    })

    describe('status column', () => {
        it('renders "Open" for an open ticket', () => {
            renderColumn(
                'status',
                mockTicketCompact({ status: 'open', snooze_datetime: null }),
            )

            expect(screen.getByText('Open')).toBeInTheDocument()
        })

        it('renders "Closed" for a closed ticket', () => {
            renderColumn(
                'status',
                mockTicketCompact({ status: 'closed', snooze_datetime: null }),
            )

            expect(screen.getByText('Closed')).toBeInTheDocument()
        })

        it('renders "Snoozed" when snooze_datetime is set', () => {
            renderColumn(
                'status',
                mockTicketCompact({ snooze_datetime: '2026-03-20T10:00:00Z' }),
            )

            expect(screen.getByText('Snoozed')).toBeInTheDocument()
        })
    })

    describe('tags column (TagsCell)', () => {
        it('renders nothing when the ticket has no tags', () => {
            const { container } = renderColumn(
                'tags',
                mockTicketCompact({ tags: [] }),
            )

            expect(
                container.querySelectorAll('[data-name="tag"]'),
            ).toHaveLength(0)
        })

        it('renders tag names', () => {
            const ticket = mockTicketCompact({
                tags: [
                    { id: 1, name: 'billing' },
                    { id: 2, name: 'urgent' },
                ] as any,
            })

            renderColumn('tags', ticket)

            expect(screen.getByText('billing')).toBeInTheDocument()
            expect(screen.getByText('urgent')).toBeInTheDocument()
        })
    })

    describe('priority column', () => {
        it('renders the priority label', () => {
            renderColumn(
                'priority',
                mockTicketCompact({ priority: 'critical' }),
            )

            expect(screen.getByText('Critical')).toBeInTheDocument()
        })
    })

    describe('assignee_team column', () => {
        it('renders nothing when there is no team', () => {
            const { container } = renderColumn(
                'assignee_team',
                mockTicketCompact({ assignee_team: null }),
            )

            expect(container.querySelector('tbody')?.textContent?.trim()).toBe(
                '',
            )
        })

        it('renders the team name', () => {
            const ticket = mockTicketCompact({
                assignee_team: { id: 1, name: 'Support' } as any,
            })

            renderColumn('assignee_team', ticket)

            expect(screen.getByText('Support')).toBeInTheDocument()
        })
    })

    describe('integrations column', () => {
        it('renders nothing when there are no integrations', () => {
            const { container } = renderColumn(
                'integrations',
                mockTicketCompact({ integrations: [] }),
            )

            expect(container.querySelector('tbody')?.textContent?.trim()).toBe(
                '',
            )
        })

        it('renders integration names joined by comma', () => {
            const ticket = mockTicketCompact({
                integrations: [{ name: 'Shopify' }, { name: 'Stripe' }] as any,
            })

            renderColumn('integrations', ticket)

            expect(screen.getByText('Shopify, Stripe')).toBeInTheDocument()
        })
    })

    describe('language column', () => {
        it('renders the language display name', () => {
            renderColumn('language', mockTicketCompact({ language: 'en' }))

            expect(screen.getByText('English')).toBeInTheDocument()
        })

        it('falls back to the language code when Intl.DisplayNames has no name for it', () => {
            renderColumn(
                'language',
                mockTicketCompact({ language: 'xx' as any }),
            )

            expect(screen.getByText('xx')).toBeInTheDocument()
        })
    })

    describe('channel column (ChannelCell)', () => {
        it('renders nothing when ticket has no channel', () => {
            const { container } = renderColumn(
                'channel',
                mockTicketCompact({ channel: undefined }),
            )

            expect(container.querySelector('svg')).not.toBeInTheDocument()
        })

        it('renders the channel icon', () => {
            const { container } = renderColumn(
                'channel',
                mockTicketCompact({ channel: TicketMessageSourceType.Email }),
            )

            expect(container.querySelector('svg')).toBeInTheDocument()
        })

        it('wraps the channel icon in a tooltip trigger', () => {
            const { container } = renderColumn(
                'channel',
                mockTicketCompact({ channel: TicketMessageSourceType.Email }),
            )

            const trigger = container.querySelector(
                '[data-name="tooltip-trigger"]',
            )

            expect(trigger).toBeInTheDocument()
        })
    })

    describe('datetime columns', () => {
        it.each([
            {
                id: 'last_message_datetime',
                field: 'last_message_datetime' as const,
            },
            { id: 'created_datetime', field: 'created_datetime' as const },
            { id: 'updated_datetime', field: 'updated_datetime' as const },
            {
                id: 'last_received_message_datetime',
                field: 'last_received_message_datetime' as const,
            },
            { id: 'closed', field: 'closed_datetime' as const },
            { id: 'snooze', field: 'snooze_datetime' as const },
        ])('$id renders a formatted date label', ({ id, field }) => {
            renderColumn(
                id,
                mockTicketCompact({ [field]: '2026-03-15T09:30:00Z' }),
            )

            expect(screen.getByText('Yesterday at 9:30am')).toBeInTheDocument()
        })

        it.each([
            {
                id: 'last_message_datetime',
                field: 'last_message_datetime' as const,
            },
            { id: 'created_datetime', field: 'created_datetime' as const },
            { id: 'updated_datetime', field: 'updated_datetime' as const },
            {
                id: 'last_received_message_datetime',
                field: 'last_received_message_datetime' as const,
            },
            { id: 'closed', field: 'closed_datetime' as const },
            { id: 'snooze', field: 'snooze_datetime' as const },
        ])('$id renders nothing when datetime is null', ({ id }) => {
            const ticket = mockTicketCompact({
                last_message_datetime: null,
                updated_datetime: null,
                created_datetime: undefined,
                last_received_message_datetime: null,
                closed_datetime: null,
                snooze_datetime: null,
            })
            const { container } = renderColumn(id, ticket)

            expect(container.querySelector('tbody')?.textContent?.trim()).toBe(
                '',
            )
        })
    })
})
