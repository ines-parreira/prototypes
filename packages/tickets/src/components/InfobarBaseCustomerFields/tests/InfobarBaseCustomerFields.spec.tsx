import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockTicket,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomer, User } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarBaseCustomerFields } from '../InfobarBaseCustomerFields'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const ticketId = '123'

const createMockCustomer = (
    overrides?: Partial<TicketCustomer>,
): TicketCustomer => {
    const defaults = {
        id: 1,
        name: 'Test Customer',
        email: 'test@example.com',
        note: 'Test note',
        channels: [
            {
                id: 1,
                address: 'test@example.com',
                type: 'email',
                preferred: true,
            },
            {
                id: 2,
                address: '+1234567890',
                type: 'phone',
                preferred: false,
            },
        ],
        meta: {
            location_info: {
                city: 'New York',
                country_name: 'United States',
                time_zone: {
                    offset: '-05:00',
                },
            },
        },
    }

    return {
        ...defaults,
        ...overrides,
        meta: overrides?.meta ?? defaults.meta,
        channels: overrides?.channels ?? defaults.channels,
    } as TicketCustomer
}

const setupMocks = (customer: TicketCustomer, userSettings = [{}]) => {
    const user = mockUser({
        id: 1,
        email: 'agent@example.com',
        settings: userSettings,
    } as User)

    const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
        HttpResponse.json(user),
    )

    const ticket = mockTicket({
        id: 123,
        customer,
    })

    const mockGetTicket = mockGetTicketHandler(async () =>
        HttpResponse.json(ticket),
    )

    server.use(mockGetCurrentUser.handler, mockGetTicket.handler)
}

describe('InfobarBaseCustomerFields', () => {
    it('should return null when no ticketId', () => {
        setupMocks(createMockCustomer())

        const { container } = render(<InfobarBaseCustomerFields />, {
            initialEntries: ['/'],
            path: '/',
        })

        expect(container.firstChild).toBeNull()
    })
    it('should render all basic fields', async () => {
        setupMocks(createMockCustomer(), [
            {
                type: 'preferences',
                data: {
                    date_format: 'en_US',
                    time_format: 'am_pm',
                },
            },
        ])

        render(<InfobarBaseCustomerFields />, {
            initialEntries: [`/ticket/${ticketId}`],
            path: '/ticket/:ticketId',
        })

        expect(await screen.findByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Location')).toBeInTheDocument()
        expect(screen.getByText('Local time')).toBeInTheDocument()
        expect(screen.getByText('Phone')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should not render location when not available', async () => {
        setupMocks(
            createMockCustomer({
                meta: {
                    location_info: {},
                },
            }),
        )

        render(<InfobarBaseCustomerFields />, {
            initialEntries: [`/ticket/${ticketId}`],
            path: '/ticket/:ticketId',
        })

        await screen.findByText('Note')

        expect(screen.queryByText('Location')).not.toBeInTheDocument()
    })

    it('should render multiple phone channels with label only on first', async () => {
        setupMocks(
            createMockCustomer({
                channels: [
                    {
                        id: 1,
                        address: '+1234567890',
                        type: 'phone',
                        preferred: true,
                    },
                    {
                        id: 2,
                        address: '+0987654321',
                        type: 'phone',
                        preferred: false,
                    },
                ],
            } as TicketCustomer),
        )

        render(<InfobarBaseCustomerFields />, {
            initialEntries: [`/ticket/${ticketId}`],
            path: '/ticket/:ticketId',
        })

        await screen.findByText('Note')

        const phoneLabels = screen.getAllByText('Phone')
        expect(phoneLabels).toHaveLength(1)

        expect(screen.getByText(/1234567890/)).toBeInTheDocument()
        expect(screen.getByText(/0987654321/)).toBeInTheDocument()
    })

    it('should render multiple email channels with label only on first', async () => {
        setupMocks(
            createMockCustomer({
                channels: [
                    {
                        id: 1,
                        address: 'primary@example.com',
                        type: 'email',
                        preferred: true,
                    },
                    {
                        id: 2,
                        address: 'secondary@example.com',
                        type: 'email',
                        preferred: false,
                    },
                ],
            } as TicketCustomer),
        )

        render(<InfobarBaseCustomerFields />, {
            initialEntries: [`/ticket/${ticketId}`],
            path: '/ticket/:ticketId',
        })

        await screen.findByText('Note')

        const emailLabels = screen.getAllByText('Email')
        expect(emailLabels).toHaveLength(1)

        expect(screen.getByText('primary@example.com')).toBeInTheDocument()
        expect(screen.getByText('secondary@example.com')).toBeInTheDocument()
    })

    it('should render other channel types with formatted and grouped labels', async () => {
        setupMocks(
            createMockCustomer({
                channels: [
                    {
                        id: 1,
                        address: '+15555555555',
                        type: 'whatsapp',
                        preferred: false,
                    },
                    {
                        id: 2,
                        address: '+16666666666',
                        type: 'whatsapp',
                        preferred: false,
                    },
                    {
                        id: 3,
                        address: 'foo-address',
                        type: 'foo-bar',
                        preferred: false,
                    },
                ],
            } as TicketCustomer),
        )

        render(<InfobarBaseCustomerFields />, {
            initialEntries: [`/ticket/${ticketId}`],
            path: '/ticket/:ticketId',
        })

        await screen.findByText('Note')

        expect(screen.getAllByText('Whatsapp')).toHaveLength(1)
        expect(screen.getByText('+15555555555')).toBeInTheDocument()
        expect(screen.getByText('+16666666666')).toBeInTheDocument()
        expect(screen.getByText('foo-address')).toBeInTheDocument()
        expect(screen.getByText('Foo Bar')).toBeInTheDocument()
    })
})
