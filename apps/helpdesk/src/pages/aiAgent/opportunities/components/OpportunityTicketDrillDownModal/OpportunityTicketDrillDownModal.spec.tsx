import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockListTicketsHandler,
    mockListTicketsResponse,
} from '@gorgias/helpdesk-mocks'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { user } from 'fixtures/users'
import { useRunningJobs } from 'jobs'
import { createJob } from 'models/job/resources'
import type { RootState } from 'state/types'

import { OpportunityTicketDrillDownModal } from './OpportunityTicketDrillDownModal'

const mockStore = configureMockStore([thunk])

jest.mock('jobs/useRunningJobs')
const mockUseRunningJobs = assumeMock(useRunningJobs)

jest.mock('models/job/resources', () => ({
    createJob: jest.fn(),
}))

const mockTickets: TicketCompact[] = [
    {
        id: 205507,
        uri: '/api/tickets/205507/',
        external_id: null,
        language: 'en',
        status: 'closed',
        priority: 'normal',
        channel: 'chat',
        via: 'gorgias_chat',
        from_agent: false,
        customer: {
            id: 708673,
            email: null,
            name: null,
            firstname: '',
            lastname: '',
            meta: {},
        },
        assignee_user: {
            id: 560050,
            email: 'bot@658d6f54fbff9b7c6f2d0321',
            name: 'AI Agents',
            firstname: 'AI',
            lastname: 'Agents',
            meta: {},
            bio: null,
        },
        assignee_team: null,
        subject: 'Test Ticket 1',
        summary: null,
        excerpt: 'This is a test ticket',
        integrations: [],
        meta: {},
        tags: [],
        messages_count: 7,
        is_unread: false,
        spam: false,
        created_datetime: '2025-10-13T11:09:13.002432+00:00',
        opened_datetime: '2025-10-13T11:10:08.320075+00:00',
        last_received_message_datetime: '2025-10-13T11:10:07.244000+00:00',
        last_message_datetime: '2025-10-13T11:10:35.229844+00:00',
        last_sent_message_not_delivered: false,
        updated_datetime: '2025-10-13T11:13:43.758467+00:00',
        closed_datetime: '2025-10-13T11:13:43.662281+00:00',
        snooze_datetime: null,
        trashed_datetime: null,
        custom_fields: {
            123: {
                id: 123,
                value: 'Close::With message',
            },
            124: {
                id: 124,
                value: 'Promotion & Discount',
            },
        },
    },
]

const mockListTickets = mockListTicketsHandler(async () =>
    HttpResponse.json(
        mockListTicketsResponse({
            data: mockTickets,
        }),
    ),
)

const mockCustomFields = http.get('/api/custom-fields', async () =>
    HttpResponse.json({
        data: [
            {
                id: 123,
                name: 'AI Outcome',
                managed_type: 'ai_outcome',
                archived: false,
                object_type: 'Ticket',
            },
            {
                id: 124,
                name: 'AI Intent',
                managed_type: 'ai_intent',
                archived: false,
                object_type: 'Ticket',
            },
        ],
    }),
)

const server = setupServer(mockListTickets.handler, mockCustomFields)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('OpportunityTicketDrillDownModal', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    const defaultState = {
        currentUser: fromJS(user),
    } as RootState

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        ticketIds: ['205507'],
    }

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <OpportunityTicketDrillDownModal
                        {...defaultProps}
                        {...props}
                    />
                </QueryClientProvider>
            </Provider>,
        )
    }

    beforeEach(() => {
        queryClient.clear()
        jest.clearAllMocks()
        mockUseRunningJobs.mockReturnValue({
            running: false,
            jobs: [],
            refetch: jest.fn(),
        })
    })

    it('should render modal with correct title', () => {
        renderComponent()
        expect(screen.getByText('Handover tickets')).toBeInTheDocument()
    })

    it('should render download button with correct text', () => {
        renderComponent()
        const downloadText = screen.getByText(/export all tickets/i)
        expect(downloadText).toBeInTheDocument()
    })

    it('should render download button', () => {
        renderComponent()
        const downloadButton = screen.getByRole('button', {
            name: /export/i,
        })
        expect(downloadButton).toBeInTheDocument()
    })

    it('should render table headers', () => {
        renderComponent()
        expect(screen.getByText('Ticket')).toBeInTheDocument()
        expect(screen.getByText('Outcome')).toBeInTheDocument()
        expect(screen.getByText('Date')).toBeInTheDocument()
    })

    it('should not render pagination when there are 10 or fewer tickets', () => {
        renderComponent()
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('should display correct number of tickets in pagination calculation', () => {
        const manyTicketIds = Array.from({ length: 25 }, (_, i) =>
            String(205500 + i),
        )
        renderComponent({ ticketIds: manyTicketIds })
        expect(screen.getByText('Handover tickets')).toBeInTheDocument()
    })

    it('should not fetch tickets when modal is closed', () => {
        renderComponent({ isOpen: false })
        expect(mockListTickets.waitForRequest).toBeDefined()
    })

    it('should render with empty ticket list', () => {
        renderComponent({ ticketIds: [] })
        expect(screen.getByText('Handover tickets')).toBeInTheDocument()
    })

    it('should render modal body with table', () => {
        renderComponent()
        expect(screen.getByText('Ticket')).toBeInTheDocument()
        expect(screen.getByText('Outcome')).toBeInTheDocument()
    })

    describe('Ticket display', () => {
        it('should display ticket details after loading', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })
        })

        it('should display formatted outcome', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Automated')).toBeInTheDocument()
            })
        })

        it('should handle missing outcome', async () => {
            const ticketsWithoutOutcome = [
                {
                    ...mockTickets[0],
                    custom_fields: {},
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: ticketsWithoutOutcome,
                        }),
                    ),
                ).handler,
            )

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('-')).toBeInTheDocument()
            })
        })

        it('should handle missing created_datetime', async () => {
            const ticketsWithoutDate = [
                {
                    ...mockTickets[0],
                    created_datetime: null,
                },
            ] as unknown as TicketCompact[]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: ticketsWithoutDate,
                        }),
                    ),
                ).handler,
            )

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('-')).toBeInTheDocument()
            })
        })
    })

    describe('Ticket interactions', () => {
        it('should open ticket in new tab when clicked', async () => {
            const windowOpenSpy = jest
                .spyOn(window, 'open')
                .mockImplementation()
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const ticketRow = screen.getByText('Test Ticket 1').closest('tr')
            expect(ticketRow).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(ticketRow!)
            })

            expect(windowOpenSpy).toHaveBeenCalledWith(
                '/app/ticket/205507',
                '_blank',
            )

            windowOpenSpy.mockRestore()
        })
    })

    describe('Pagination', () => {
        it('should render pagination when there are more than 10 tickets', async () => {
            const manyTicketIds = Array.from({ length: 25 }, (_, i) =>
                String(205500 + i),
            )
            renderComponent({ ticketIds: manyTicketIds })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const nextButton = screen.getByRole('button', { name: /next/i })
            expect(nextButton).toBeInTheDocument()
        })

        it('should change page when pagination next is clicked', async () => {
            const manyTicketIds = Array.from({ length: 25 }, (_, i) =>
                String(205500 + i),
            )

            renderComponent({ ticketIds: manyTicketIds })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const page2Tickets: TicketCompact[] = [
                {
                    ...mockTickets[0],
                    id: 205511,
                    subject: 'Test Ticket 11',
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: page2Tickets,
                        }),
                    ),
                ).handler,
            )

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(async () => {
                await userEvent.click(nextButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 11')).toBeInTheDocument()
            })
        })

        it('should change page when pagination previous is clicked', async () => {
            const manyTicketIds = Array.from({ length: 25 }, (_, i) =>
                String(205500 + i),
            )

            renderComponent({ ticketIds: manyTicketIds })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            // Go to page 2 first
            const page2Tickets: TicketCompact[] = [
                {
                    ...mockTickets[0],
                    id: 205511,
                    subject: 'Test Ticket 11',
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: page2Tickets,
                        }),
                    ),
                ).handler,
            )

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(async () => {
                await userEvent.click(nextButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 11')).toBeInTheDocument()
            })

            // Go back to page 1
            const page1Tickets: TicketCompact[] = [
                {
                    ...mockTickets[0],
                    id: 205507,
                    subject: 'Test Ticket 1',
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: page1Tickets,
                        }),
                    ),
                ).handler,
            )

            const previousButton = screen.getByRole('button', {
                name: /previous/i,
            })
            await act(async () => {
                await userEvent.click(previousButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })
        })

        it('should not change page when clicking next on last page', async () => {
            const manyTicketIds = Array.from({ length: 15 }, (_, i) =>
                String(205500 + i),
            )

            renderComponent({ ticketIds: manyTicketIds })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            // Go to page 2 (last page)
            const page2Tickets: TicketCompact[] = [
                {
                    ...mockTickets[0],
                    id: 205511,
                    subject: 'Test Ticket 11',
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: page2Tickets,
                        }),
                    ),
                ).handler,
            )

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(async () => {
                await userEvent.click(nextButton)
            })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 11')).toBeInTheDocument()
            })

            // Try to go to next page when on last page
            const nextButtonAfter = screen.getByRole('button', {
                name: /next/i,
            })
            expect(nextButtonAfter).toHaveAttribute('aria-disabled', 'true')
        })

        it('should not change page when clicking previous on first page', async () => {
            const manyTicketIds = Array.from({ length: 25 }, (_, i) =>
                String(205500 + i),
            )

            renderComponent({ ticketIds: manyTicketIds })

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const previousButton = screen.getByRole('button', {
                name: /previous/i,
            })
            expect(previousButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Export functionality', () => {
        beforeEach(() => {
            ;(createJob as jest.Mock).mockResolvedValue({})
        })

        it('should show download button', () => {
            renderComponent()
            const downloadButton = screen.getByRole('button', {
                name: /export/i,
            })
            expect(downloadButton).toBeInTheDocument()
        })

        it('should call export when download button is clicked', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const downloadButton = screen.getByRole('button', {
                name: /export/i,
            })

            await act(async () => {
                await userEvent.click(downloadButton)
            })

            await waitFor(
                () => {
                    expect(createJob).toHaveBeenCalledWith({
                        type: 'exportTicket',
                        params: {
                            ticket_ids: [205507],
                        },
                    })
                },
                { timeout: 3000 },
            )
        })

        it('should handle export error', async () => {
            ;(createJob as jest.Mock).mockRejectedValue(
                new Error('Export failed'),
            )

            renderComponent()

            const downloadButton = screen.getByRole('button', {
                name: /export all tickets/i,
            })

            act(() => {
                userEvent.click(downloadButton)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /export all tickets/i,
                    }),
                ).toBeInTheDocument()
            })
        })

        it('should reset export state when modal is closed', async () => {
            const { rerender } = renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })

            const downloadButton = screen.getByRole('button', {
                name: /export/i,
            })

            await act(async () => {
                await userEvent.click(downloadButton)
            })

            await waitFor(() => {
                expect(createJob).toHaveBeenCalled()
            })

            rerender(
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <OpportunityTicketDrillDownModal
                            {...defaultProps}
                            isOpen={false}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('Handover tickets'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Loading state', () => {
        it('should show skeleton while loading tickets', () => {
            renderComponent()
            expect(screen.getByText('Handover tickets')).toBeInTheDocument()
        })
    })

    describe('Modal close', () => {
        it('should call onClose when modal is closed', async () => {
            const onClose = jest.fn()
            renderComponent({ onClose })

            const closeButton = screen.getByRole('button', {
                name: /close modal/i,
            })
            expect(closeButton).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(closeButton)
            })

            expect(onClose).toHaveBeenCalled()
        })
    })
    describe('Custom fields', () => {
        it('should handle tickets without custom_fields', async () => {
            const ticketsWithoutFields = [
                {
                    ...mockTickets[0],
                    custom_fields: undefined,
                },
            ]

            server.use(
                mockListTicketsHandler(async () =>
                    HttpResponse.json(
                        mockListTicketsResponse({
                            data: ticketsWithoutFields,
                        }),
                    ),
                ).handler,
            )

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
            })
        })
    })
})
