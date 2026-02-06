import { Handle, Panel } from '@repo/layout'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { NewTicketInfobarNavigation } from '@repo/tickets'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
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

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(
        mockListTeams.handler,
        mockListUsers.handler,
        mockGetCurrentUser.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const renderComponent = () => {
    const user = userEvent.setup()
    const result = renderWithStoreAndQueryClientAndRouter(
        <NewTicketPage />,
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
        const prioritySelect = screen.getAllByLabelText('Priority selection')
        expect(prioritySelect[0]).not.toBeDisabled()
    })
}

describe('NewTicketPage', () => {
    describe('when infobar is expanded', () => {
        beforeEach(() => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
            } as any)
        })

        it('renders the header with title', async () => {
            renderComponent()

            expect(screen.getByText('New ticket')).toBeInTheDocument()
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

        it('renders the header with title', async () => {
            renderComponent()

            expect(screen.getByText('New ticket')).toBeInTheDocument()
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
                    await act(() => user.click(prioritySelect))

                    const highOptions = await screen.findAllByText('High')
                    await act(() =>
                        user.click(highOptions[highOptions.length - 1]),
                    )

                    await waitFor(() => {
                        const highTexts = screen.getAllByText('High')
                        expect(highTexts.length).toBeGreaterThan(0)
                    })
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
                    await act(() => user.click(userSelect))

                    await waitFor(() => {
                        expect(screen.getByText('John Doe')).toBeInTheDocument()
                    })

                    const johnOptions = await screen.findAllByText('John Doe')
                    await act(() =>
                        user.click(johnOptions[johnOptions.length - 1]),
                    )

                    await waitFor(() => {
                        const johnTexts = screen.getAllByText('John Doe')
                        expect(johnTexts.length).toBeGreaterThan(0)
                    })
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
                    await act(() => user.click(teamSelect))

                    await waitFor(() => {
                        expect(screen.getByText('Support')).toBeInTheDocument()
                    })

                    const supportOptions = await screen.findAllByText('Support')
                    await act(() =>
                        user.click(supportOptions[supportOptions.length - 1]),
                    )

                    await waitFor(() => {
                        const supportTexts = screen.getAllByText('Support')
                        expect(supportTexts.length).toBeGreaterThan(0)
                    })
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
        it('renders Shopify content when activeTab is Shopify', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
                activeTab: TicketInfobarTab.Shopify,
            } as any)

            renderComponent()

            expect(screen.getByText('ShopifyCustomer')).toBeInTheDocument()
            expect(
                screen.queryByText(/Content to extract/),
            ).not.toBeInTheDocument()
            await waitForSelectsToLoad()
        })

        it('renders Customer content when activeTab is Customer', async () => {
            useTicketInfobarNavigationMock.mockReturnValue({
                isExpanded: true,
                activeTab: TicketInfobarTab.Customer,
            } as any)

            renderComponent()

            expect(
                screen.getByText(
                    /Content to extract from the Infobar ticket area/,
                ),
            ).toBeInTheDocument()
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
                screen.queryByText(/Content to extract/),
            ).not.toBeInTheDocument()
            await waitForSelectsToLoad()
        })
    })
})
