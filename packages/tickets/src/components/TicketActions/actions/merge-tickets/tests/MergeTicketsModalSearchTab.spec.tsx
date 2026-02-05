import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import type { TicketsSearchListDataItem, User } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { MergeTicketsModalSearchTab } from '../MergeTicketsModalSearchTab'
import { useMergeTicketsTable } from '../useMergeTicketsTable'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const testTickets: TicketsSearchListDataItem[] = [
    {
        id: 1,
        subject: 'Short subject',
        excerpt: 'Test excerpt',
        customer: { id: 100, name: 'Sarah Jeanne' },
        channel: 'email',
        created_datetime: '2024-02-04T10:30:00Z',
    },
    {
        id: 2,
        subject:
            'This is a very long subject that definitely exceeds the sixty-eight character maximum length and should be truncated',
        excerpt: 'Long excerpt',
        customer: {
            id: 200,
            name: 'Jane Smith with an extremely long name that exceeds the twenty character limit',
        },
        channel: 'chat',
        created_datetime: '2023-12-25T08:00:00Z',
    },
    {
        id: 3,
        subject: 'Ticket with no customer name',
        excerpt: 'Test',
        customer: { id: 300, name: null },
        channel: 'phone',
        created_datetime: '2024-01-15T14:20:00Z',
    },
    {
        id: 4,
        subject: 'Midnight ticket',
        excerpt: 'Created near midnight UTC',
        customer: { id: 400, name: 'Timezone Test' },
        channel: 'email',
        created_datetime: '2024-03-05T01:00:00Z',
    },
]

interface RenderTableWithUserPreferencesOptions {
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
    timezone?: string
}

async function renderTableWithUserPreferences({
    dateFormat,
    timeFormat,
    timezone,
}: RenderTableWithUserPreferencesOptions) {
    const user = mockUser({
        id: 1,
        email: 'agent@example.com',
        timezone,
        settings: [
            {
                type: 'preferences',
                data: {
                    date_format: dateFormat,
                    time_format: timeFormat,
                },
            },
        ],
    } as User)

    server.use(
        mockGetCurrentUserHandler(async () => HttpResponse.json(user)).handler,
    )

    function TestComponent() {
        const { table, columnCount } = useMergeTicketsTable({
            tickets: testTickets,
        })

        return (
            <MergeTicketsModalSearchTab
                table={table}
                columnCount={columnCount}
                subject="Test Subject"
                searchQuery=""
                setSearchQuery={() => {}}
                isFetching={false}
                onRowClick={() => {}}
            />
        )
    }

    return render(<TestComponent />)
}

describe('MergeTicketsModalSearchTab', () => {
    describe('date formatting', () => {
        it.each([
            {
                description: 'MM/DD/YYYY date format',
                dateFormat: DateFormatType.en_US,
                timeFormat: TimeFormatType.AmPm,
                timezone: undefined,
                expectedDates: {
                    ticket1: '02/04/2024',
                    ticket2: '12/25/2023',
                    ticket3: '01/15/2024',
                    ticket4: '03/05/2024',
                },
            },
            {
                description: 'DD/MM/YYYY date format',
                dateFormat: DateFormatType.en_GB,
                timeFormat: TimeFormatType.TwentyFourHour,
                timezone: undefined,
                expectedDates: {
                    ticket1: '04/02/2024',
                    ticket2: '25/12/2023',
                    ticket3: '15/01/2024',
                    ticket4: '05/03/2024',
                },
            },
            {
                description: 'DD/MM/YYYY date format with timezone conversion',
                dateFormat: DateFormatType.en_GB,
                timeFormat: TimeFormatType.TwentyFourHour,
                timezone: 'America/Los_Angeles',
                expectedDates: {
                    ticket1: '04/02/2024',
                    ticket2: '25/12/2023',
                    ticket3: '15/01/2024',
                    ticket4: '04/03/2024', // 01:00 UTC on Mar 5 = 17:00 PST on Mar 4
                },
            },
        ])(
            'renders dates correctly for $description',
            async ({ dateFormat, timeFormat, timezone, expectedDates }) => {
                await renderTableWithUserPreferences({
                    dateFormat,
                    timeFormat,
                    timezone,
                })

                await waitFor(() => {
                    expect(
                        screen.getByText(expectedDates.ticket1),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(expectedDates.ticket2),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(expectedDates.ticket3),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(expectedDates.ticket4),
                    ).toBeInTheDocument()
                })
            },
        )
    })

    it('renders subject/customer truncation and fallback correctly', async () => {
        await renderTableWithUserPreferences({
            dateFormat: DateFormatType.en_US,
            timeFormat: TimeFormatType.AmPm,
            timezone: undefined,
        })

        await waitFor(() => {
            expect(screen.getByText('Short subject')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'This is a very long subject that definitely exceeds the sixty-eight ...',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Sarah Jeanne')).toBeInTheDocument()
            expect(
                screen.getByText('Jane Smith with an e...'),
            ).toBeInTheDocument()

            expect(screen.getByText('#300')).toBeInTheDocument()

            const rows = screen.getAllByRole('row')
            expect(rows).toHaveLength(5)
        })
    })
})
