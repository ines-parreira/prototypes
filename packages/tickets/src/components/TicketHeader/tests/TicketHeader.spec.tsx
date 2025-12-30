import { useFlag } from '@repo/feature-flags'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockListTeamsHandler,
    mockListUsersHandler,
    mockSearchTicketsHandler,
    mockTicket,
    mockTicketCustomer,
    mockUpdateTicketHandler,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import type { CurrentUser } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { DisplayedContent } from '../../../translations/store/constants'
import { useTicketMessageTranslationDisplay } from '../../../translations/store/useTicketMessageTranslationDisplay'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { TicketHeader } from '../TicketHeader'

vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn(),
}))

const mockUseFlag = vi.mocked(useFlag)

const server = setupServer()

const mockListTeams = mockListTeamsHandler()
const mockListUsers = mockListUsersHandler()
const mockSearchTickets = mockSearchTicketsHandler()

const mockLanguagePreferencesEnglish = {
    id: 2,
    user_id: 123,
    type: UserSettingType.LanguagePreferences,
    data: {
        enabled: false,
        primary: Language.En,
        proficient: [Language.Es],
    },
}

const mockGetCurrentUser = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [mockLanguagePreferencesEnglish],
    } as CurrentUser['data']),
)

const defaultMockTicket = mockTicket({
    id: 1234,
    customer: mockTicketCustomer({ name: 'John Doe', id: 1234 }),
    subject: 'Test ticket',
    trashed_datetime: null,
    language: Language.En,
})
const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(defaultMockTicket),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockUseFlag.mockReturnValue(false)
    useTicketMessageTranslationDisplay.setState({
        ticketMessagesTranslationDisplayMap: {},
        allMessageDisplayState: DisplayedContent.Original,
    })
    server.use(
        mockListTeams.handler,
        mockListUsers.handler,
        mockGetCurrentUser.handler,
        mockGetTicket.handler,
        mockSearchTickets.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('TicketHeader', () => {
    it('should render an empty div if the ticket is not yet loaded', () => {
        const { container } = render(<TicketHeader ticketId={999999} />)
        expect(container.firstChild).toBeEmptyDOMElement()
    })

    describe('TicketTitle', () => {
        describe('Breadcrumbs', () => {
            it('should render the customer name and ticket subject', async () => {
                render(<TicketHeader ticketId={1234} />)

                await waitFor(() => {
                    expect(screen.getByText('John Doe')).toBeInTheDocument()
                    expect(
                        screen.getByRole('link', { name: 'John Doe' }),
                    ).toHaveAttribute('href', '/app/customer/1234')
                })
                expect(screen.getByText('Test ticket')).toBeInTheDocument()
            })

            it('should render "New ticket" when subject is null', async () => {
                const { handler } = mockGetTicketHandler(async () =>
                    HttpResponse.json({
                        ...defaultMockTicket,
                        subject: null,
                    }),
                )
                server.use(handler)

                render(<TicketHeader ticketId={1234} />)

                await waitFor(() => {
                    expect(screen.getByText('New ticket')).toBeInTheDocument()
                })
            })

            it('should update the ticket subject when the user edits the breadcrumb', async () => {
                const mockUpdateTicket = mockUpdateTicketHandler()
                const dispatchNotification = vi.fn()

                server.use(mockUpdateTicket.handler)

                const { user } = render(<TicketHeader ticketId={1234} />, {
                    dispatchNotification,
                })

                await waitFor(() => {
                    expect(screen.getByText('Test ticket')).toBeInTheDocument()
                })

                const subject = screen.getByRole('textbox')

                const waitForUpdateTicketRequest =
                    mockUpdateTicket.waitForRequest(server)

                await act(async () => {
                    await user.click(subject)
                    await user.clear(subject)
                    await user.type(subject, 'Test ticket updated')
                    await user.tab()
                })

                await waitForUpdateTicketRequest(async (request) => {
                    const body = await request.json()
                    expect(body).toMatchObject({
                        subject: 'Test ticket updated',
                    })
                })

                expect(dispatchNotification).not.toHaveBeenCalled()
            })

            it('should dispatch a notification when the ticket subject update fails', async () => {
                const mockUpdateTicket = mockUpdateTicketHandler(async () => {
                    return HttpResponse.json(null, { status: 500 })
                })
                const dispatchNotification = vi.fn()

                server.use(mockUpdateTicket.handler)

                const { user } = render(<TicketHeader ticketId={1234} />, {
                    dispatchNotification,
                })

                await waitFor(() => {
                    expect(screen.getByText('Test ticket')).toBeInTheDocument()
                })

                const subject = screen.getByRole('textbox')

                await act(async () => {
                    await user.click(subject)
                    await user.clear(subject)
                    await user.type(subject, 'Test ticket updated')
                    await user.tab()
                })

                await waitFor(() => {
                    expect(dispatchNotification).toHaveBeenCalledWith(
                        expect.objectContaining({
                            status: NotificationStatus.Error,
                            message: 'Failed to update subject',
                        }),
                    )
                })
            })

            it('should focus the subject when the edit icon is clicked', async () => {
                const { user } = render(<TicketHeader ticketId={1234} />)

                await waitFor(() => {
                    expect(screen.getByText('Test ticket')).toBeInTheDocument()
                })

                const editIcon = screen.getByRole('textbox').nextElementSibling
                expect(editIcon).toBeInTheDocument()

                await act(() => user.click(editIcon!))

                const subject = screen.getByRole('textbox')
                expect(subject).toHaveFocus()
            })
        })
    })

    describe('TicketTranslationMenu', () => {
        it('should not render when feature flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            render(<TicketHeader ticketId={1234} />)

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /translate/i }),
            ).not.toBeInTheDocument()
        })

        it('should render when feature flag is enabled', async () => {
            const mockGetCurrentUserWithTranslations =
                mockGetCurrentUserHandler(async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        settings: [
                            {
                                ...mockLanguagePreferencesEnglish,
                                data: {
                                    enabled: true,
                                    primary: Language.En,
                                    proficient: [Language.Es],
                                },
                            },
                        ],
                    } as CurrentUser['data']),
                )

            const { handler: ticketHandler } = mockGetTicketHandler(async () =>
                HttpResponse.json({
                    ...defaultMockTicket,
                    language: Language.Fr,
                }),
            )

            server.use(
                mockGetCurrentUserWithTranslations.handler,
                ticketHandler,
            )

            mockUseFlag.mockReturnValue(true)

            render(<TicketHeader ticketId={1234} />)

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument()
            })

            expect(
                screen.getByRole('button', { name: /translate/i }),
            ).toBeInTheDocument()
        })
    })

    describe('TrashedTicket', () => {
        it('should not render the trash tag when trashed_datetime is null', async () => {
            render(<TicketHeader ticketId={defaultMockTicket.id} />)

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument()
            })

            expect(screen.queryByText('Trash')).not.toBeInTheDocument()
        })

        it('should render the trash tag when trashed_datetime is present', async () => {
            const { handler } = mockGetTicketHandler(async () =>
                HttpResponse.json({
                    ...defaultMockTicket,
                    trashed_datetime: '2025-01-15T10:30:00Z',
                }),
            )
            server.use(handler)

            render(<TicketHeader ticketId={defaultMockTicket.id} />)

            await waitFor(() => {
                expect(screen.getByText('Trash')).toBeInTheDocument()
            })
        })
    })
})
