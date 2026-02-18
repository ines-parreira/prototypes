import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListUsersHandler,
    mockTicket,
    mockTicketUser,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { UserAssignee } from '../UserAssignee'

let capturedActions: Record<string, { action: (event: Event) => void }> = {}

vi.mock('@repo/utils', async () => {
    const actual = await vi.importActual('@repo/utils')
    return {
        ...actual,
        useShortcuts: (
            _component: string,
            actions: Record<string, { action: (event: Event) => void }>,
        ) => {
            capturedActions = actions
        },
    }
})

const mockEvent = { preventDefault: vi.fn() } as unknown as Event

const triggerShortcut = (actionName: string) => {
    act(() => {
        capturedActions[actionName]?.action(mockEvent)
    })
}

const ticketId = 123

const userPartial = {
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
}

const currentTicketAssignee = mockTicketUser(userPartial)
const currentUser = mockUser(userPartial)
const user2 = mockUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' })
const user3 = mockUser({
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
})

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(currentUser),
)

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [currentUser, user2, user3],
        meta: {
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockUpdateTicket = mockUpdateTicketHandler(async () => {
    return HttpResponse.json(
        mockTicket({
            id: ticketId,
            assignee_user: currentTicketAssignee,
        }),
    )
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockGetCurrentUser.handler,
        mockListUsers.handler,
        mockUpdateTicket.handler,
    )
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    let selectElement: HTMLElement = {} as HTMLElement
    await waitFor(() => {
        const select = screen.getAllByLabelText('User selection')
        expect(select[0]).not.toBeDisabled()
        selectElement = select[0]
    })
    return selectElement
}

describe('UserAssignee', () => {
    it('should render with "Unassigned" placeholder when no user assigned', async () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        await waitUntilLoaded()

        expect(screen.getByText('Unassigned')).toBeInTheDocument()
    })

    it('should render with current assignee name when user is assigned', async () => {
        render(
            <UserAssignee
                ticketId={ticketId}
                currentAssignee={currentTicketAssignee}
            />,
        )

        await waitUntilLoaded()

        expect(screen.getByText(currentTicketAssignee.name)).toBeInTheDocument()
    })

    it('should be disabled while loading', () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        const select = screen.getAllByLabelText('User selection')
        expect(select[0]).toBeDisabled()
    })

    it('should show "Assign yourself" section for current user, as well as other users when not assigned', async () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        await waitUntilLoaded()

        await waitFor(() => {
            expect(screen.getByText('Assign yourself')).toBeInTheDocument()
            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
        })
    })

    it('should show "Unassigned" section when user is already assigned', async () => {
        const { user } = render(
            <UserAssignee
                ticketId={ticketId}
                currentAssignee={currentTicketAssignee}
            />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options[0]).toHaveTextContent('Unassigned')
        })
    })

    it('should render and include current assignee in options when not in loaded users list', async () => {
        const notLoadedUser = mockTicketUser({
            id: 123,
            name: 'Random User',
            email: 'random@example.com',
        })
        const notLoadedAssignee = mockTicketUser(notLoadedUser)

        const { user } = render(
            <UserAssignee
                ticketId={ticketId}
                currentAssignee={notLoadedAssignee}
            />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        await waitFor(() => {
            const randomUserTexts = screen.getAllByText('Random User')
            expect(randomUserTexts.length).toBe(3)
        })
    })

    it('should update user assignment when selecting current user (Assign yourself)', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        const yourselfOptions = await screen.findAllByText('Assign yourself')
        await act(async () => {
            await user.click(yourselfOptions[yourselfOptions.length - 1])
        })

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_user: { id: 1 },
            })
        })
    })

    it('should update user assignment when selecting another user', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        const janeOptions = await screen.findAllByText('Jane Smith')
        await act(async () => {
            await user.click(janeOptions[janeOptions.length - 1])
        })

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_user: { id: 2 },
            })
        })
    })

    it('should update user assignment when selecting "Unassigned" option', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <UserAssignee
                ticketId={ticketId}
                currentAssignee={currentTicketAssignee}
            />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        const unassignedOptions = await screen.findAllByText('Unassigned')
        await act(async () => {
            await user.click(unassignedOptions[unassignedOptions.length - 1])
        })

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_user: null,
            })
        })
    })

    it('should open dropdown when OPEN_USER_ASSIGNEE shortcut is triggered', async () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        await waitUntilLoaded()

        triggerShortcut('OPEN_USER_ASSIGNEE')

        await waitFor(() => {
            expect(screen.getByRole('searchbox')).toBeInTheDocument()
        })
    })

    it('should close dropdown when OPEN_USER_ASSIGNEE shortcut is triggered while open', async () => {
        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        await waitFor(() => {
            expect(screen.getByRole('searchbox')).toBeInTheDocument()
        })

        triggerShortcut('OPEN_USER_ASSIGNEE')

        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })
    })

    it('should clear search when dropdown is closed via shortcut', async () => {
        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        await waitUntilLoaded()

        triggerShortcut('OPEN_USER_ASSIGNEE')

        const searchInput = await screen.findByRole('searchbox')
        await act(async () => {
            await user.type(searchInput, 'test search')
        })

        expect(searchInput).toHaveValue('test search')

        triggerShortcut('OPEN_USER_ASSIGNEE')

        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        triggerShortcut('OPEN_USER_ASSIGNEE')

        const searchInputAfterReopen = await screen.findByRole('searchbox')
        expect(searchInputAfterReopen).toHaveValue('')
    })

    it('should clear search when dropdown is closed', async () => {
        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await act(async () => {
            await user.click(select)
        })

        const searchInput = await screen.findByRole('searchbox')
        await act(async () => {
            await user.type(searchInput, 'test search')
        })

        expect(searchInput).toHaveValue('test search')

        await act(async () => {
            await user.click(select)
        })
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        await act(async () => {
            await user.click(select)
        })
        const searchInputAfterReopen = await screen.findByRole('searchbox')

        expect(searchInputAfterReopen).toHaveValue('')
    })
})
