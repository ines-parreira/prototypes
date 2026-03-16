import { Handle, Panel } from '@repo/layout'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import {
    NewTicketInfobarNavigation,
    TicketsLegacyBridgeProvider,
} from '@repo/tickets'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldsHandler,
    mockListTagsHandler,
    mockListTeamsHandler,
    mockListUsersHandler,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { NewTicketPage } from '../NewTicketPage'

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = jest.mocked(useTicketInfobarNavigation)

jest.mock('@repo/layout', () => ({
    Handle: jest.fn(() => <div role="separator">Panel Handle</div>),
    Panel: jest.fn(({ children }) => <div>{children}</div>),
}))

jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    NewTicketInfobarNavigation: jest.fn(() => (
        <div role="navigation" aria-label="Infobar Navigation">
            NewTicketInfobarNavigation
        </div>
    )),
}))

jest.mock('@repo/customer', () => ({
    ShopifyCustomer: jest.fn(() => <div>ShopifyCustomer</div>),
    ShopifyCustomerProvider: jest.fn(({ children }) => <>{children}</>),
    TemplateResolverProvider: jest.fn(({ children }) => <>{children}</>),
}))

const mockedPanel = jest.mocked(Panel)
const mockedHandle = jest.mocked(Handle)
const mockedNewTicketInfobarNavigation = jest.mocked(NewTicketInfobarNavigation)

const team1 = mockTeam({ id: 1, name: 'Support', decoration: { emoji: '🛠️' } })
const team2 = mockTeam({ id: 2, name: 'Sales', decoration: { emoji: '💰' } })

const user1 = mockUser({ id: 1, name: 'John Doe' })
const user2 = mockUser({ id: 2, name: 'Jane Smith' })

const mockListTeams = mockListTeamsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [team1, team2],
        meta: {
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [user1, user2],
        meta: {
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockGetCurrentUser = mockGetCurrentUserHandler()
const mockListTags = mockListTagsHandler()
const mockListCustomFields = mockListCustomFieldsHandler()
const mockListCustomFieldConditions = mockListCustomFieldConditionsHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockListTeams.handler,
        mockListUsers.handler,
        mockGetCurrentUser.handler,
        mockListTags.handler,
        mockListCustomFields.handler,
        mockListCustomFieldConditions.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const legacyBridgeTestProps = {
    dispatchNotification: jest.fn(),
    dispatchDismissNotification: jest.fn(),
    dispatchAuditLogEvents: jest.fn(),
    dispatchHideAuditLogEvents: jest.fn(),
    toggleQuickReplies: jest.fn(),
    onToggleUnread: jest.fn(),
    ticketViewNavigation: {
        shouldDisplay: false,
        shouldUseLegacyFunctions: false,
        previousTicketId: undefined,
        nextTicketId: undefined,
        legacyGoToPrevTicket: jest.fn(),
        isPreviousEnabled: false,
        legacyGoToNextTicket: jest.fn(),
        isNextEnabled: false,
    },
    handleTicketDraft: {
        hasDraft: false,
        onResumeDraft: jest.fn(),
        onDiscardDraft: jest.fn(),
    },
    makeOutboundCall: jest.fn(),
    voiceDevice: {
        device: {},
        call: null,
    },
    dtpToggle: {
        isEnabled: false,
        setIsEnabled: jest.fn(),
        previousTicketId: undefined,
        nextTicketId: undefined,
        setPrevNextTicketIds: jest.fn(),
        shouldRedirectToSplitView: false,
        setShouldRedirectToSplitView: jest.fn(),
    },
    dtpEnabled: {
        isEnabled: false,
    },
    humanizeChannel: jest.fn(),
}

const renderComponent = () => {
    const user = userEvent.setup()
    const result = renderWithStoreAndQueryClientAndRouter(
        <TicketsLegacyBridgeProvider {...legacyBridgeTestProps}>
            <NewTicketPage />
        </TicketsLegacyBridgeProvider>,
        {},
        {
            path: '/app/tickets/new',
            route: '/app/tickets/new',
        },
    )
    return { ...result, user }
}

const waitForSelectsToLoad = async () => {
    await waitFor(() => {
        expect(
            screen.getAllByLabelText('Priority selection')[0],
        ).not.toBeDisabled()
        expect(screen.getAllByLabelText('User selection')[0]).not.toBeDisabled()
        expect(screen.getAllByLabelText('Team selection')[0]).not.toBeDisabled()
    })
}

describe('NewTicketPage', () => {
    describe('when infobar is expanded', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders the header with title input', async () => {
            renderComponent()

            const titleInput = screen.getByRole('textbox')
            expect(titleInput).toHaveAttribute('data-placeholder', 'New ticket')
            await waitForSelectsToLoad()
        })

        it('renders the main content panel', async () => {
            renderComponent()

            expect(screen.getByText('Main content here')).toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders the infobar navigation', async () => {
            renderComponent()

            expect(
                screen.getByRole('navigation', { name: 'Infobar Navigation' }),
            ).toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders the panel handle', async () => {
            renderComponent()

            expect(screen.getByRole('separator')).toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders Panel with expanded config', async () => {
            renderComponent()

            const expandedPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'infobar-expanded',
            )

            expect(expandedPanelCalls).toHaveLength(1)
            expect(expandedPanelCalls[0][0].config).toEqual({
                defaultSize: 340,
                minSize: 340,
                maxSize: 0.33,
            })
            await waitForSelectsToLoad()
        })
    })

    describe('when infobar is collapsed', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: false,
            } as any)
        })

        it('renders the header with title input', async () => {
            renderComponent()

            const titleInput = screen.getByRole('textbox')
            expect(titleInput).toHaveAttribute('data-placeholder', 'New ticket')
            await waitForSelectsToLoad()
        })

        it('renders the main content panel', async () => {
            renderComponent()

            expect(screen.getByText('Main content here')).toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders Panel with collapsed config', async () => {
            renderComponent()

            const collapsedPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'infobar-collapsed',
            )

            expect(collapsedPanelCalls).toHaveLength(1)
            expect(collapsedPanelCalls[0][0].config).toEqual({
                defaultSize: 0,
                minSize: 0,
                maxSize: 0,
            })
            await waitForSelectsToLoad()
        })
    })

    describe('panel configuration', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders ticket detail panel with correct config', async () => {
            renderComponent()

            const ticketDetailPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'ticket-detail',
            )

            expect(ticketDetailPanelCalls).toHaveLength(1)
            expect(ticketDetailPanelCalls[0][0].config).toEqual({
                defaultSize: Infinity,
                minSize: 300,
                maxSize: Infinity,
            })
            await waitForSelectsToLoad()
        })

        it('renders Handle component between panels', async () => {
            renderComponent()

            expect(mockedHandle).toHaveBeenCalledWith({}, {})
            await waitForSelectsToLoad()
        })

        it('renders NewTicketInfobarNavigation', async () => {
            renderComponent()

            expect(mockedNewTicketInfobarNavigation).toHaveBeenCalled()
            await waitForSelectsToLoad()
        })

        describe('header select components', () => {
            beforeEach(() => {
                useTicketInfobarNavigationMock.mockReturnValue({
                    isExpanded: true,
                } as any)
            })

            describe('PrioritySelect', () => {
                it('renders with default "Normal" placeholder', async () => {
                    renderComponent()

                    await waitForSelectsToLoad()

                    const normalTexts = screen.getAllByText('Normal')
                    expect(normalTexts.length).toBeGreaterThan(0)
                })

                it('allows selecting a different priority', async () => {
                    const { user } = renderComponent()

                    await waitForSelectsToLoad()

                    const prioritySelect =
                        screen.getAllByLabelText('Priority selection')[0]
                    await user.click(prioritySelect)
                    await waitFor(() => {
                        expect(screen.getByRole('listbox')).toBeInTheDocument()
                    })

                    const highOptions = screen.getAllByText('High')
                    await user.click(highOptions[highOptions.length - 1])

                    await waitFor(() => {
                        expect(
                            screen.queryByRole('listbox'),
                        ).not.toBeInTheDocument()
                    })

                    const highTexts = screen.getAllByText('High')
                    expect(highTexts.length).toBeGreaterThan(0)
                })
            })

            describe('UserAssigneeSelect', () => {
                it('renders with "Unassigned" placeholder', async () => {
                    renderComponent()

                    await waitForSelectsToLoad()

                    const unassignedTexts = screen.getAllByText('Unassigned')
                    expect(unassignedTexts.length).toBeGreaterThan(0)
                })

                it('allows selecting a user', async () => {
                    const { user } = renderComponent()

                    await waitForSelectsToLoad()

                    const userSelect =
                        screen.getAllByLabelText('User selection')[0]
                    await user.click(userSelect)
                    await waitFor(() => {
                        expect(screen.getByRole('listbox')).toBeInTheDocument()
                    })

                    const johnOptions = screen.getAllByText('John Doe')
                    await user.click(johnOptions[johnOptions.length - 1])

                    await waitFor(() => {
                        expect(
                            screen.queryByRole('listbox'),
                        ).not.toBeInTheDocument()
                    })

                    const johnTexts = screen.getAllByText('John Doe')
                    expect(johnTexts.length).toBeGreaterThan(0)
                })
            })

            describe('TeamAssigneeSelect', () => {
                it('renders with "No team" placeholder', async () => {
                    renderComponent()

                    await waitForSelectsToLoad()

                    const noTeamTexts = screen.getAllByText('No team')
                    expect(noTeamTexts.length).toBeGreaterThan(0)
                })

                it('allows selecting a team', async () => {
                    const { user } = renderComponent()

                    await waitForSelectsToLoad()

                    const teamSelect =
                        screen.getAllByLabelText('Team selection')[0]
                    await user.click(teamSelect)
                    await waitFor(() => {
                        expect(screen.getByRole('listbox')).toBeInTheDocument()
                    })

                    const supportOptions = screen.getAllByText('Support')
                    await user.click(supportOptions[supportOptions.length - 1])

                    await waitFor(() => {
                        expect(
                            screen.queryByRole('listbox'),
                        ).not.toBeInTheDocument()
                    })

                    const supportTexts = screen.getAllByText('Support')
                    expect(supportTexts.length).toBeGreaterThan(0)
                })
            })
        })

        it('renders infobar navigation panel with correct config', async () => {
            renderComponent()

            const infobarNavigationPanelCalls = mockedPanel.mock.calls.filter(
                (call) => call[0].name === 'infobar-navigation',
            )

            expect(infobarNavigationPanelCalls).toHaveLength(1)
            expect(infobarNavigationPanelCalls[0][0].config).toEqual({
                defaultSize: 49,
                minSize: 49,
                maxSize: 49,
            })
            await waitForSelectsToLoad()
        })
    })

    describe('infobar content based on activeTab', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders Shopify content when activeTab is Shopify', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
                activeTab: TicketInfobarTab.Shopify,
            } as any)

            renderComponent()

            expect(screen.getByText('ShopifyCustomer')).toBeInTheDocument()
            expect(
                screen.queryByRole('heading', { name: 'Ticket details' }),
            ).not.toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders Customer content when activeTab is Customer', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
                activeTab: TicketInfobarTab.Customer,
            } as any)

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Ticket details' }),
                ).toBeInTheDocument()
            })
            expect(
                screen.queryByText('ShopifyCustomer'),
            ).not.toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders no infobar content when activeTab is Timeline', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
                activeTab: TicketInfobarTab.Timeline,
            } as any)

            renderComponent()

            expect(
                screen.queryByText('ShopifyCustomer'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('heading', { name: 'Ticket details' }),
            ).not.toBeInTheDocument()
            await waitForSelectsToLoad()
        })
    })
})
