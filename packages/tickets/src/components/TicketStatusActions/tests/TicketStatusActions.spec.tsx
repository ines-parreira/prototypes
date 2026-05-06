import { shortcutManager } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldsHandler,
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockTicket,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketStatusActions } from '../TicketStatusActions'
import * as useSnoozeTicketModule from '../useSnoozeTicket'
import { TicketStatus } from '../utils'

const ticketId = 123

const openTicket = mockTicket({
    id: ticketId,
    status: TicketStatus.Open,
    snooze_datetime: null,
    closed_datetime: null,
})

const closedTicket = mockTicket({
    id: ticketId,
    status: TicketStatus.Closed,
    snooze_datetime: null,
    closed_datetime: new Date('2025-12-10T10:00:00Z').toISOString(),
})

const snoozedTicket = mockTicket({
    id: ticketId,
    status: TicketStatus.Closed,
    snooze_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    closed_datetime: null,
})

const mockGetTicket = mockGetTicketHandler(async ({ params }) => {
    const id = Number(params?.id)
    if (id === ticketId) {
        return HttpResponse.json(openTicket)
    }

    return HttpResponse.json(mockTicket({ id }))
})

const mockUpdateTicket = mockUpdateTicketHandler(async ({ data }) =>
    HttpResponse.json(
        mockTicket({
            ...data,
            id: ticketId,
        }),
    ),
)

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json(
        mockUser({
            ...data,
            timezone: 'America/New_York',
        }),
    ),
)

const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(mockGetViewResponse({ id: 1 })),
)

const mockListViewItems = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: [
            mockTicket({ id: 122 }),
            mockTicket({ id: 123 }),
            mockTicket({ id: 124 }),
        ],
        meta: {
            current_cursor: null,
            next_items: null,
            prev_items: null,
        },
        object: 'list',
        uri: '/api/views/1/items/',
    } as any),
)

const mockListViewItemsUpdates = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: {
            current_cursor: undefined,
            next_items: undefined,
            prev_items: undefined,
        },
    }),
)

const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: { next_cursor: null, prev_cursor: null, total_resources: 0 },
        object: 'list',
        uri: '/api/custom-fields',
    }),
)

const mockListCustomFieldConditions = mockListCustomFieldConditionsHandler(
    async () =>
        HttpResponse.json({
            data: [],
            meta: { next_cursor: null, prev_cursor: null, total_resources: 0 },
            object: 'list',
            uri: '/api/custom-field-conditions',
        }),
)

const localHandlers = [
    mockGetTicket.handler,
    mockUpdateTicket.handler,
    mockGetCurrentUser.handler,
    mockGetView.handler,
    mockListViewItems.handler,
    mockListViewItemsUpdates.handler,
    mockListCustomFields.handler,
    mockListCustomFieldConditions.handler,
]

const waitForSnoozeButton = async (ticket = openTicket) => {
    const buttonName = ticket.snooze_datetime
        ? 'Change snooze time'
        : 'Snooze ticket'

    await waitFor(() => {
        expect(
            screen.getByRole('button', {
                name: buttonName,
            }),
        ).toBeInTheDocument()
    })
}

const clickElement = async (
    user: ReturnType<typeof render>['user'],
    element: HTMLElement,
) => {
    await act(async () => {
        await user.click(element)
    })
}

const triggerShortcut = async (shortcut: string) => {
    await act(async () => {
        shortcutManager.trigger(shortcut)
    })
}

const openDirectSnoozePicker = async (
    user: ReturnType<typeof render>['user'],
    ticket = openTicket,
) => {
    await waitForSnoozeButton(ticket)

    await clickElement(
        user,
        screen.getByRole('button', {
            name: 'Snooze ticket',
        }),
    )

    return screen.findByRole('grid')
}

const openSnoozedMenu = async (user: ReturnType<typeof render>['user']) => {
    await waitForSnoozeButton(snoozedTicket)

    await clickElement(
        user,
        screen.getByRole('button', {
            name: 'Change snooze time',
        }),
    )

    await screen.findByText('Unsnooze')
    await screen.findByText('Update snooze')
}

const openUpdateSnoozePicker = async (
    user: ReturnType<typeof render>['user'],
) => {
    await openSnoozedMenu(user)
    await clickElement(user, screen.getByText('Update snooze'))
    return screen.findByRole('grid')
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    vi.restoreAllMocks()
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketStatusActions', () => {
    const optimisticCloseTestTimeout = 15000

    describe('Open ticket', () => {
        it('shows separate snooze and close controls', async () => {
            render(<TicketStatusActions ticket={openTicket} />)

            await waitForSnoozeButton(openTicket)

            expect(
                screen.getByRole('button', { name: 'Close ticket' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Close')).toBeInTheDocument()
        })

        it('snoozes ticket immediately when preset button is clicked', async () => {
            const { user } = render(<TicketStatusActions ticket={openTicket} />)

            await openDirectSnoozePicker(user)

            const nextWeekButton = await screen.findByText('1 Week')
            await clickElement(user, nextWeekButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Ticket has been snoozed',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })

        it(
            'shows Apply disabled until a date is selected',
            { timeout: 15000 },
            async () => {
                const { user } = render(
                    <TicketStatusActions ticket={openTicket} />,
                )

                await openDirectSnoozePicker(user)

                const applyButton = await screen.findByRole('button', {
                    name: 'Apply',
                })
                expect(applyButton).toBeDisabled()

                const nextMonthButton = await screen.findByRole('button', {
                    name: 'Next month',
                })
                await clickElement(user, nextMonthButton)

                const day15 = await screen.findByRole('button', {
                    name: /15/,
                })
                await clickElement(user, day15)

                await waitFor(() => {
                    expect(applyButton).toBeEnabled()
                })
            },
        )

        it(
            'optimistically closes the picker when Apply is clicked before the API resolves',
            async () => {
                let resolveSnooze: () => void
                const snoozePromise = new Promise<void>((resolve) => {
                    resolveSnooze = resolve
                })
                const snoozeTicket = vi
                    .fn()
                    .mockImplementation(() => snoozePromise)

                vi.spyOn(
                    useSnoozeTicketModule,
                    'useSnoozeTicket',
                ).mockReturnValue({
                    snoozeTicket,
                })

                const { user } = render(
                    <TicketStatusActions ticket={openTicket} />,
                )

                await openDirectSnoozePicker(user)

                const nextMonthButton = await screen.findByRole('button', {
                    name: 'Next month',
                })
                await clickElement(user, nextMonthButton)

                const day15 = await screen.findByRole('button', {
                    name: /15/,
                })
                await clickElement(user, day15)

                const applyButton = await screen.findByRole('button', {
                    name: 'Apply',
                })

                await waitFor(() => {
                    expect(applyButton).toBeEnabled()
                })

                await clickElement(user, applyButton)

                await waitFor(() => {
                    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
                })

                expect(snoozeTicket).toHaveBeenCalledTimes(1)
                expect(snoozeTicket).toHaveBeenCalledWith({
                    snooze_datetime: expect.any(String),
                    status: TicketStatus.Closed,
                })
                expect(screen.queryByRole('status')).not.toBeInTheDocument()

                resolveSnooze!()
                await snoozePromise
            },
            optimisticCloseTestTimeout,
        )

        it('shows an error notification when snooze fails', async () => {
            const { user } = render(<TicketStatusActions ticket={openTicket} />)

            server.use(
                mockUpdateTicketHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            await openDirectSnoozePicker(user)

            const nextWeekButton = await screen.findByText('1 Week')
            await clickElement(user, nextWeekButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to snooze ticket',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })

    describe('Closed ticket', () => {
        it('shows a primary closed button that reopens the ticket', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)
            const { user } = render(
                <TicketStatusActions ticket={closedTicket} />,
            )

            const closedButton = screen.getByRole('button', {
                name: 'Reopen ticket',
            })
            await clickElement(user, closedButton)

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'open',
                    snooze_datetime: null,
                })
            })
        })

        it('snoozes a closed ticket when a preset is clicked', async () => {
            const { user } = render(
                <TicketStatusActions ticket={closedTicket} />,
            )

            await openDirectSnoozePicker(user, closedTicket)

            const nextWeekButton = await screen.findByText('1 Week')
            await clickElement(user, nextWeekButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Ticket has been snoozed',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })

        it('shows an error notification when reopen fails', async () => {
            const { user } = render(
                <TicketStatusActions ticket={closedTicket} />,
            )

            server.use(
                mockUpdateTicketHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            await clickElement(
                user,
                screen.getByRole('button', { name: 'Reopen ticket' }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to open ticket',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })

    describe('Snoozed ticket', () => {
        it('shows the snoozed trigger menu options', async () => {
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            await openSnoozedMenu(user)

            expect(screen.getByText('Unsnooze')).toBeInTheDocument()
            expect(screen.getByText('Update snooze')).toBeInTheDocument()
        })

        it('unsnoozes the ticket', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            await openSnoozedMenu(user)
            await clickElement(user, screen.getByText('Unsnooze'))

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'open',
                    snooze_datetime: null,
                })
            })
        })

        it('shows the current snooze time in the update picker', async () => {
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            const datePicker = await openUpdateSnoozePicker(user)

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })

        it('updates snooze time when a preset is clicked', async () => {
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            await openUpdateSnoozePicker(user)

            const nextWeekButton = await screen.findByText('1 Week')
            await clickElement(user, nextWeekButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Ticket has been snoozed',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })

        it('disables dates before today in the update picker', async () => {
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            const datePicker = await openUpdateSnoozePicker(user)

            const disabledCells = datePicker.querySelectorAll(
                '[aria-disabled="true"]',
            )
            expect(disabledCells.length).toBeGreaterThan(0)
        })
    })

    describe('Timezone handling', () => {
        it('parses the snooze date when the user has a timezone configured', async () => {
            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            const datePicker = await openUpdateSnoozePicker(user)

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })

        it('parses the snooze date when the user has no timezone configured', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json(
                    mockUser({
                        ...data,
                        timezone: undefined,
                    }),
                ),
            )

            server.use(handler)

            const { user } = render(
                <TicketStatusActions ticket={snoozedTicket} />,
            )

            const datePicker = await openUpdateSnoozePicker(user)

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })
    })

    describe('Keyboard shortcuts', () => {
        it('opens the snooze picker for an open ticket when "b" is pressed', async () => {
            render(<TicketStatusActions ticket={openTicket} />)

            await waitForSnoozeButton(openTicket)

            await triggerShortcut('b')

            expect(await screen.findByRole('grid')).toBeInTheDocument()
        })

        it('opens the update snooze picker for a snoozed ticket when "b" is pressed', async () => {
            render(<TicketStatusActions ticket={snoozedTicket} />)

            await waitForSnoozeButton(snoozedTicket)

            await triggerShortcut('b')

            expect(await screen.findByRole('grid')).toBeInTheDocument()
            expect(screen.getByText('Unsnooze')).toBeInTheDocument()
            expect(screen.getByText('Update snooze')).toBeInTheDocument()
        })

        it('closes an open ticket when "c" is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusActions ticket={openTicket} />)

            await waitForSnoozeButton(openTicket)

            await triggerShortcut('c')

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'closed',
                    snooze_datetime: null,
                })
            })
        })

        it('closes an already closed ticket when "c" is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusActions ticket={closedTicket} />)

            await waitForSnoozeButton(closedTicket)

            await triggerShortcut('c')

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'closed',
                    snooze_datetime: null,
                })
            })
        })

        it('closes a snoozed ticket when "c" is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusActions ticket={snoozedTicket} />)

            await waitForSnoozeButton(snoozedTicket)

            await triggerShortcut('c')

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'closed',
                    snooze_datetime: null,
                })
            })
        })

        it('opens a closed ticket when "o" is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusActions ticket={closedTicket} />)

            await waitForSnoozeButton(closedTicket)

            await triggerShortcut('o')

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'open',
                    snooze_datetime: null,
                })
            })
        })

        it('opens a snoozed ticket when "o" is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusActions ticket={snoozedTicket} />)

            await waitForSnoozeButton(snoozedTicket)

            await triggerShortcut('o')

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    status: 'open',
                    snooze_datetime: null,
                })
            })
        })

        it('does not open an already open ticket when "o" is pressed', async () => {
            let requestMade = false
            const mockUpdateTicketLocal = mockUpdateTicketHandler(
                async ({ data }) => {
                    requestMade = true
                    return HttpResponse.json(
                        mockTicket({ ...data, id: ticketId }),
                    )
                },
            )

            server.use(mockUpdateTicketLocal.handler)

            render(<TicketStatusActions ticket={openTicket} />)

            await waitForSnoozeButton(openTicket)

            await triggerShortcut('o')

            await waitFor(
                () => {
                    expect(requestMade).toBe(false)
                },
                { timeout: 500 },
            )
        })

        it('shows an error notification when the close shortcut fails', async () => {
            server.use(
                mockUpdateTicketHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            render(<TicketStatusActions ticket={openTicket} />)

            await waitForSnoozeButton(openTicket)

            await triggerShortcut('c')

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to close ticket',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('shows an error notification when the open shortcut fails', async () => {
            server.use(
                mockUpdateTicketHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            render(<TicketStatusActions ticket={closedTicket} />)

            await waitForSnoozeButton(closedTicket)

            await triggerShortcut('o')

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to open ticket',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})
