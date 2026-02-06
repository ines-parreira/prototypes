import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { OverflowList } from '@gorgias/axiom'
import {
    mockGetCurrentUserHandler,
    mockListIntegrationsHandler,
    mockListPhoneNumbersHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomer, User } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarBaseCustomerFields } from '../InfobarBaseCustomerFields'

const mockPush = vi.fn()

const { useHistory } = vi.hoisted(() => ({
    useHistory: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory,
    }
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockPush.mockClear()
    useHistory.mockReturnValue({ push: mockPush })
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

const setupMocks = (userSettings = [{}]) => {
    const user = mockUser({
        id: 1,
        email: 'agent@example.com',
        settings: userSettings,
    } as User)

    const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
        HttpResponse.json(user),
    )

    server.use(
        mockGetCurrentUser.handler,
        mockListIntegrationsHandler().handler,
        mockListPhoneNumbersHandler().handler,
    )
}

const TestComponent = ({ customer }: { customer: TicketCustomer }) => {
    return (
        <OverflowList nonExpandedLineCount={7}>
            <InfobarBaseCustomerFields
                ticketId={ticketId}
                customer={customer}
            />
        </OverflowList>
    )
}

describe('InfobarBaseCustomerFields', () => {
    it('should render all basic fields', async () => {
        const customer = createMockCustomer()
        setupMocks([
            {
                type: 'preferences',
                data: {
                    date_format: 'en_US',
                    time_format: 'am_pm',
                },
            },
        ])

        render(<TestComponent customer={customer} />)

        expect(await screen.findByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Location')).toBeInTheDocument()
        expect(screen.getByText('Local time')).toBeInTheDocument()
        expect(screen.getByText('Phone')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should not render location when not available', async () => {
        const customer = createMockCustomer({
            meta: {
                location_info: {},
            },
        })
        setupMocks()

        render(<TestComponent customer={customer} />)

        await screen.findByText('Note')

        expect(screen.queryByText('Location')).not.toBeInTheDocument()
    })

    it('should render multiple phone channels with label only on first', async () => {
        const customer = createMockCustomer({
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
        } as TicketCustomer)
        setupMocks()

        render(<TestComponent customer={customer} />)

        await screen.findByText('Note')

        const phoneLabels = screen.getAllByText('Phone')
        expect(phoneLabels).toHaveLength(1)

        expect(screen.getByText(/1234567890/)).toBeInTheDocument()
        expect(screen.getByText(/0987654321/)).toBeInTheDocument()
    })

    it('should render multiple email channels with label only on first', async () => {
        const customer = createMockCustomer({
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
        } as TicketCustomer)
        setupMocks()

        render(<TestComponent customer={customer} />)

        await screen.findByText('Note')

        const emailLabels = screen.getAllByText('Email')
        expect(emailLabels).toHaveLength(1)

        expect(screen.getByText('primary@example.com')).toBeInTheDocument()
        expect(screen.getByText('secondary@example.com')).toBeInTheDocument()
    })

    it('should render other channel types with formatted and grouped labels', async () => {
        const customer = createMockCustomer({
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
        } as TicketCustomer)
        setupMocks()

        render(<TestComponent customer={customer} />)

        await screen.findByText('Note')

        expect(screen.getAllByText('Whatsapp')).toHaveLength(1)
        expect(screen.getByText('+15555555555')).toBeInTheDocument()
        expect(screen.getByText('+16666666666')).toBeInTheDocument()
        expect(screen.getByText('foo-address')).toBeInTheDocument()
        expect(screen.getByText('Foo Bar')).toBeInTheDocument()
    })

    describe('Draft ticket functionality', () => {
        async function openEmailMenu(user: ReturnType<typeof render>['user']) {
            await waitFor(() => {
                expect(screen.getByText('test@example.com')).toBeInTheDocument()
            })

            const emailText = screen.getByText('test@example.com')

            await act(() => user.click(emailText))

            await waitFor(() => {
                expect(screen.getByText('Send email')).toBeInTheDocument()
            })
        }

        async function openDraftSubmenu(
            user: ReturnType<typeof render>['user'],
        ) {
            await openEmailMenu(user)

            const sendEmailItems = screen.getAllByText('Send email')
            const sendEmailButton = sendEmailItems[sendEmailItems.length - 1]

            await act(() => user.click(sendEmailButton))

            await waitFor(() => {
                expect(
                    screen.getByText('A draft ticket already exists'),
                ).toBeInTheDocument()
            })
        }

        it('should show draft-related menu items when a draft exists', async () => {
            const customer = createMockCustomer()
            setupMocks()

            const onResumeDraft = vi.fn()
            const onDiscardDraft = vi.fn()

            const { user } = render(<TestComponent customer={customer} />, {
                handleTicketDraft: {
                    hasDraft: true,
                    onResumeDraft,
                    onDiscardDraft,
                },
            })

            await screen.findByText('Note')

            await openDraftSubmenu(user)

            expect(
                await screen.findByText('A draft ticket already exists'),
            ).toBeInTheDocument()
            expect(screen.getByText('Resume draft')).toBeInTheDocument()
            expect(
                screen.getByText('Discard and create new ticket'),
            ).toBeInTheDocument()
        })

        it('should call onResumeDraft when "Resume draft" is clicked', async () => {
            const customer = createMockCustomer()
            setupMocks()

            const onResumeDraft = vi.fn()
            const onDiscardDraft = vi.fn()

            const { user } = render(<TestComponent customer={customer} />, {
                handleTicketDraft: {
                    hasDraft: true,
                    onResumeDraft,
                    onDiscardDraft,
                },
            })

            await screen.findByText('Note')

            await openDraftSubmenu(user)

            const resumeButton = await screen.findByText('Resume draft')
            await act(() => user.click(resumeButton))

            expect(onResumeDraft).toHaveBeenCalledTimes(1)
        })

        it('should call onDiscardDraft with correct location when "Discard and create new ticket" is clicked', async () => {
            const customer = createMockCustomer()
            setupMocks()

            const onResumeDraft = vi.fn()
            const onDiscardDraft = vi.fn()

            const { user } = render(<TestComponent customer={customer} />, {
                handleTicketDraft: {
                    hasDraft: true,
                    onResumeDraft,
                    onDiscardDraft,
                },
            })

            await screen.findByText('Note')

            await openDraftSubmenu(user)

            const discardButton = await screen.findByText(
                'Discard and create new ticket',
            )
            await act(() => user.click(discardButton))

            expect(onDiscardDraft).toHaveBeenCalledTimes(1)
            expect(onDiscardDraft).toHaveBeenCalledWith(
                expect.objectContaining({
                    pathname: '/app/ticket/new',
                    search: `?customer=${customer.id}`,
                    state: {
                        receiver: {
                            name: customer.name,
                            address: customer.channels[0].address,
                        },
                        _navigationKey: expect.any(Number),
                    },
                }),
            )
        })

        it('should show regular "Send email" menu item when no draft exists', async () => {
            const customer = createMockCustomer()
            setupMocks()

            const onResumeDraft = vi.fn()
            const onDiscardDraft = vi.fn()

            const { user } = render(<TestComponent customer={customer} />, {
                handleTicketDraft: {
                    hasDraft: false,
                    onResumeDraft,
                    onDiscardDraft,
                },
            })

            await screen.findByText('Note')

            await openEmailMenu(user)

            expect(await screen.findByText('Send email')).toBeInTheDocument()

            expect(
                screen.queryByText('A draft ticket already exists'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Resume draft')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Discard and create new ticket'),
            ).not.toBeInTheDocument()

            const sendEmailMenuItem = await screen.findByRole('menuitem', {
                name: /send email/i,
            })
            await act(() => user.click(sendEmailMenuItem))

            expect(mockPush).toHaveBeenCalledTimes(1)
            expect(mockPush).toHaveBeenCalledWith(
                expect.objectContaining({
                    pathname: '/app/ticket/new',
                    search: `?customer=${customer.id}`,
                    state: {
                        receiver: {
                            name: customer.name,
                            address: customer.channels[0].address,
                        },
                        _navigationKey: expect.any(Number),
                    },
                }),
            )
        })
    })
})
