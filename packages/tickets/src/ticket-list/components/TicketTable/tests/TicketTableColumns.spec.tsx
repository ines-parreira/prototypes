import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { DataTable } from '@gorgias/axiom'
import {
    mockTicketCompact,
    mockTicketCompactCustomer,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import { TicketMessageSourceType } from '@gorgias/helpdesk-types'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime'

import { render } from '../../../../tests/render.utils'
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

const renderColumn = (
    columnId: string | string[],
    ticket: ReturnType<typeof mockTicketCompact>,
    columnsParams?: Partial<TicketTableColumnsParams>,
) => {
    const ids = Array.isArray(columnId) ? columnId : [columnId]
    const columns = createTicketTableColumns({
        translationMap: {},
        shouldShowTranslatedContent: () => false,
        dateTimePreferences,
        ...columnsParams,
    }).filter((c) => ids.includes(c.id!))
    return render(<DataTable data={[ticket]} columns={columns} />)
}

describe('createTicketTableColumns', () => {
    it('keeps the Ticket column visible and outside column editing', () => {
        const columns = createTicketTableColumns({
            translationMap: {},
            shouldShowTranslatedContent: () => false,
            dateTimePreferences,
        })

        expect(columns.find((c) => c.id === 'subject')).toEqual(
            expect.objectContaining({
                id: 'subject',
                header: 'Ticket',
                enableHiding: false,
            }),
        )
    })

    it('marks the supported sortable columns as sortable', () => {
        const columns = createTicketTableColumns({
            translationMap: {},
            shouldShowTranslatedContent: () => false,
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

    describe('subject column (TicketCell)', () => {
        it('renders the ticket subject and excerpt', () => {
            const ticket = mockTicketCompact({
                id: 1,
                subject: 'Help with order',
                excerpt: 'I need help with my order',
            })

            renderColumn('subject', ticket)

            expect(screen.getByText('Help with order')).toBeInTheDocument()
            expect(
                screen.getByText('I need help with my order'),
            ).toBeInTheDocument()
        })

        it('renders translated subject when showTranslatedContent is true', () => {
            const ticket = mockTicketCompact({
                id: 1,
                subject: 'Original subject',
            })

            renderColumn('subject', ticket, {
                translationMap: {
                    1: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(screen.getByText('Translated subject')).toBeInTheDocument()
        })

        it('renders agents viewing', () => {
            mockGetTicketActivity.mockReturnValue({
                viewing: [
                    { id: 99, name: 'Agent One', email: 'agent@example.com' },
                ],
            })

            renderColumn('subject', mockTicketCompact({ id: 1 }), {
                currentUserId: 1,
            })

            expect(screen.getByText('1 agents viewing')).toBeInTheDocument()
        })
    })

    describe('subject_text column (SubjectOnlyCell)', () => {
        it('renders translated subject when showTranslatedContent is true', () => {
            const ticket = mockTicketCompact({
                id: 42,
                subject: 'Original subject',
            })

            renderColumn('subject_text', ticket, {
                translationMap: {
                    42: mockTicketTranslationCompact({
                        subject: 'Translated subject',
                    }),
                },
                shouldShowTranslatedContent: () => true,
            })

            expect(screen.getByText('Translated subject')).toBeInTheDocument()
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

            expect(container.querySelector('tbody')?.textContent?.trim()).toBe(
                '',
            )
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
