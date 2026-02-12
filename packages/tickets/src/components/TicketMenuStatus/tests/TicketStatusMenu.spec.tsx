import { shortcutManager } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldsHandler,
    mockTicket,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { TicketStatusMenu } from '../TicketStatusMenu'
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

const mockUpdateTicket = mockUpdateTicketHandler(async ({ data }) => {
    return HttpResponse.json(
        mockTicket({
            ...data,
            id: ticketId,
        }),
    )
})

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json(
        mockUser({
            ...data,
            timezone: 'America/New_York',
        }),
    ),
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

const server = setupServer(
    mockGetTicket.handler,
    mockUpdateTicket.handler,
    mockGetCurrentUser.handler,
    mockListCustomFields.handler,
    mockListCustomFieldConditions.handler,
)

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

describe('TicketStatus', () => {
    const waitForMenu = async () => {
        await waitFor(() => {
            expect(
                screen.queryByRole('button', {
                    name: 'Ticket status menu',
                }),
            ).toBeInTheDocument()
        })
    }

    const openMenu = async (user: ReturnType<typeof render>['user']) => {
        // Wait for the component to be fully loaded by waiting for the current user query
        await waitForMenu()

        const statusButton = screen.getByRole('button', {
            name: 'Ticket status menu',
        })
        await user.click(statusButton)
        return statusButton
    }

    describe('Open ticket', () => {
        it('should render and show correct menu options', async () => {
            const { user } = render(<TicketStatusMenu ticket={openTicket} />)

            expect(screen.getByText('Open')).toBeInTheDocument()

            await openMenu(user)

            await waitFor(() => {
                expect(screen.getAllByText('Open')).toHaveLength(2)
                expect(screen.getByText('Snooze')).toBeInTheDocument()
                expect(screen.getByText('Close')).toBeInTheDocument()
            })
        })

        it('should snooze ticket immediately when preset button is clicked', async () => {
            const dispatchNotification = vi.fn()
            const legacyGoToNextTicket = vi.fn()
            const { user } = render(<TicketStatusMenu ticket={openTicket} />, {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                dispatchNotification,
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: true,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket,
                    isNextEnabled: true,
                },
            })

            await openMenu(user)

            const snoozeOption = await screen.findByText('Snooze')
            await act(() => user.click(snoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            const nextWeekButton = await screen.findByText('1 Week')
            await act(() => user.click(nextWeekButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Success,
                        message: 'Ticket has been snoozed',
                    }),
                )
                expect(legacyGoToNextTicket).toHaveBeenCalled()
            })
        })

        it(
            'should show Apply button that is disabled until date is selected',
            { timeout: 15000 },
            async () => {
                const { user } = render(
                    <TicketStatusMenu ticket={openTicket} />,
                )

                await openMenu(user)

                const snoozeOption = await screen.findByText('Snooze')
                await act(() => user.click(snoozeOption))

                const datePicker = await screen.findByRole('grid')
                expect(datePicker).toBeInTheDocument()

                const applyButton = await screen.findByRole('button', {
                    name: 'Apply',
                })
                expect(applyButton).toBeDisabled()

                const nextMonthButton = await screen.findByRole('button', {
                    name: 'Next month',
                })
                await act(() => user.click(nextMonthButton))

                const day15 = await screen.findByRole('button', {
                    name: /15/,
                })
                await act(() => user.click(day15))

                await waitFor(() => {
                    expect(applyButton).not.toBeDisabled()
                })
            },
        )

        it('should display error notification when snooze fails', async () => {
            const dispatchNotification = vi.fn()
            const { user } = render(<TicketStatusMenu ticket={openTicket} />, {
                dispatchNotification,
            })

            server.use(
                mockUpdateTicketHandler(async () => {
                    return HttpResponse.json(null, { status: 500 })
                }).handler,
            )

            await openMenu(user)

            const snoozeOption = await screen.findByText('Snooze')
            await act(() => user.click(snoozeOption))

            await screen.findByRole('grid')
            const nextWeekButton = await screen.findByText('1 Week')
            await act(() => user.click(nextWeekButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Error,
                        message: 'Failed to snooze ticket',
                    }),
                )
            })
        })

        it('should close menu when "Close" option is clicked', async () => {
            const { user } = render(<TicketStatusMenu ticket={openTicket} />)

            await openMenu(user)

            const closeOption = await screen.findByText('Close')
            await act(() => user.click(closeOption))

            await waitFor(() => {
                expect(screen.queryByText('Close')).not.toBeInTheDocument()
            })
        })
    })

    describe('Closed ticket', () => {
        it('should render and show correct menu options', async () => {
            const { user } = render(<TicketStatusMenu ticket={closedTicket} />)

            const closedButton = await screen.findByText('Closed')
            await act(() => user.click(closedButton))

            await waitFor(() => {
                expect(screen.getByText('Reopen')).toBeInTheDocument()
                expect(screen.getByText('Snooze')).toBeInTheDocument()
                expect(screen.getByText('Close')).toBeInTheDocument()
            })
        })

        it('should reopen ticket and close menu', async () => {
            const { user } = render(<TicketStatusMenu ticket={closedTicket} />)

            const closedButton = await screen.findByText('Closed')
            await act(() => user.click(closedButton))

            const reopenOption = await screen.findByText('Reopen')
            await act(() => user.click(reopenOption))

            await waitFor(() => {
                expect(screen.queryByText('Reopen')).not.toBeInTheDocument()
            })
        })

        it('should snooze closed ticket when date is selected', async () => {
            const dispatchNotification = vi.fn()
            const legacyGoToNextTicket = vi.fn()
            const { user } = render(
                <TicketStatusMenu ticket={closedTicket} />,
                {
                    initialEntries: ['/app/views/1/123'],
                    path: '/app/views/:viewId/:ticketId',
                    dispatchNotification,
                    ticketViewNavigation: {
                        shouldDisplay: true,
                        shouldUseLegacyFunctions: true,
                        previousTicketId: 122,
                        nextTicketId: 124,
                        legacyGoToPrevTicket: vi.fn(),
                        isPreviousEnabled: true,
                        legacyGoToNextTicket,
                        isNextEnabled: true,
                    },
                },
            )

            const closedButton = await screen.findByText('Closed')
            await act(() => user.click(closedButton))

            const snoozeOption = await screen.findByText('Snooze')
            await act(() => user.click(snoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            const nextWeekButton = await screen.findByText('1 Week')
            await act(() => user.click(nextWeekButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Success,
                        message: 'Ticket has been snoozed',
                    }),
                )
                expect(legacyGoToNextTicket).toHaveBeenCalled()
            })
        })

        it('should display error notification when reopen fails', async () => {
            const dispatchNotification = vi.fn()
            const { user } = render(
                <TicketStatusMenu ticket={closedTicket} />,
                {
                    dispatchNotification,
                },
            )

            server.use(
                mockUpdateTicketHandler(async () => {
                    return HttpResponse.json(null, { status: 500 })
                }).handler,
            )

            const closedButton = await screen.findByText('Closed')
            await act(() => user.click(closedButton))

            const reopenOption = await screen.findByText('Reopen')
            await act(() => user.click(reopenOption))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Error,
                        message: 'Failed to open ticket',
                    }),
                )
            })
        })
    })

    describe('Timezone handling', () => {
        it('should handle date parsing when user has timezone configured', async () => {
            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            const changeSnoozeOption =
                await screen.findByText('Change snooze time')
            await act(() => user.click(changeSnoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })

        it('should handle date parsing when user has no timezone configured', async () => {
            const { handler } = mockGetCurrentUserHandler(async ({ data }) =>
                HttpResponse.json(
                    mockUser({
                        ...data,
                        timezone: undefined,
                    }),
                ),
            )

            server.use(handler)

            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            const changeSnoozeOption =
                await screen.findByText('Change snooze time')
            await act(() => user.click(changeSnoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })
    })

    describe('Snoozed ticket', () => {
        it('should show correct menu options', async () => {
            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            await waitFor(() => {
                expect(screen.getByText('Reopen')).toBeInTheDocument()
                expect(
                    screen.getByText('Change snooze time'),
                ).toBeInTheDocument()
                expect(screen.getByText('Close')).toBeInTheDocument()
            })
        })

        it('should reopen ticket', async () => {
            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            const reopenOption = await screen.findByText('Reopen')
            await act(() => user.click(reopenOption))

            await waitFor(() => {
                expect(screen.queryByText('Reopen')).not.toBeInTheDocument()
            })
        })

        it('should show current snooze time in date picker', async () => {
            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            const changeSnoozeOption =
                await screen.findByText('Change snooze time')
            await act(() => user.click(changeSnoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            await waitFor(() => {
                const selectedDate = datePicker.querySelector(
                    '[data-selected="true"]',
                )
                expect(selectedDate).toBeInTheDocument()
            })
        })

        it('should update snooze time when new date is selected', async () => {
            const dispatchNotification = vi.fn()
            const legacyGoToNextTicket = vi.fn()
            const { user } = render(
                <TicketStatusMenu ticket={snoozedTicket} />,
                {
                    initialEntries: ['/app/views/1/123'],
                    path: '/app/views/:viewId/:ticketId',
                    dispatchNotification,
                    ticketViewNavigation: {
                        shouldDisplay: true,
                        shouldUseLegacyFunctions: true,
                        previousTicketId: 122,
                        nextTicketId: 124,
                        legacyGoToPrevTicket: vi.fn(),
                        isPreviousEnabled: true,
                        legacyGoToNextTicket,
                        isNextEnabled: true,
                    },
                },
            )

            await openMenu(user)

            const changeSnoozeOption =
                await screen.findByText('Change snooze time')
            await act(() => user.click(changeSnoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            const nextWeekButton = await screen.findByText('1 Week')
            await act(() => user.click(nextWeekButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Success,
                        message: 'Ticket has been snoozed',
                    }),
                )
                expect(legacyGoToNextTicket).toHaveBeenCalled()
            })
        })

        it('should disable dates before today when changing snooze time', async () => {
            const { user } = render(<TicketStatusMenu ticket={snoozedTicket} />)

            await openMenu(user)

            const changeSnoozeOption =
                await screen.findByText('Change snooze time')
            await act(() => user.click(changeSnoozeOption))

            const datePicker = await screen.findByRole('grid')
            expect(datePicker).toBeInTheDocument()

            const disabledCells = datePicker.querySelectorAll(
                '[aria-disabled="true"]',
            )
            expect(disabledCells.length).toBeGreaterThan(0)
        })
    })

    describe('Keyboard shortcuts', () => {
        it('should close open ticket when "c" key is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusMenu ticket={openTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('c')
            })

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({ status: 'closed' })
            })
        })

        it('should close already closed ticket when "c" key is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusMenu ticket={closedTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('c')
            })

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({ status: 'closed' })
            })
        })

        it('should close snoozed ticket when "c" key is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusMenu ticket={snoozedTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('c')
            })

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({ status: 'closed' })
            })
        })

        it('should open closed ticket when "o" key is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusMenu ticket={closedTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('o')
            })

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({ status: 'open', snooze_datetime: null })
            })
        })

        it('should open snoozed ticket when "o" key is pressed', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            render(<TicketStatusMenu ticket={snoozedTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('o')
            })

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({ status: 'open', snooze_datetime: null })
            })
        })

        it('should not open already open ticket when "o" key is pressed', async () => {
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

            render(<TicketStatusMenu ticket={openTicket} />)

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('o')
            })

            await new Promise((resolve) => setTimeout(resolve, 500))

            expect(requestMade).toBe(false)
        })

        it('should show error notification when close shortcut fails', async () => {
            const dispatchNotification = vi.fn()

            server.use(
                mockUpdateTicketHandler(async () => {
                    return HttpResponse.json(null, { status: 500 })
                }).handler,
            )

            render(<TicketStatusMenu ticket={openTicket} />, {
                dispatchNotification,
            })

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('c')
            })

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Error,
                        message: 'Failed to close ticket',
                    }),
                )
            })
        })

        it('should show error notification when open shortcut fails', async () => {
            const dispatchNotification = vi.fn()

            server.use(
                mockUpdateTicketHandler(async () => {
                    return HttpResponse.json(null, { status: 500 })
                }).handler,
            )

            render(<TicketStatusMenu ticket={closedTicket} />, {
                dispatchNotification,
            })

            await waitForMenu()

            act(() => {
                shortcutManager.trigger('o')
            })

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: NotificationStatus.Error,
                        message: 'Failed to open ticket',
                    }),
                )
            })
        })
    })
})
