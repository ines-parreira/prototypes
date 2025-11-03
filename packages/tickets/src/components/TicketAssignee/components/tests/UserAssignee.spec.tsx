import { screen, waitFor } from '@testing-library/react'
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
            assignee_user: mockTicketUser({
                id: 1,
                name: 'Current User',
                email: 'current@example.com',
            }),
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

        const currentUserTexts = screen.getAllByText('You')
        expect(currentUserTexts.length).toBe(2)
    })

    it('should be disabled while loading', () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        const select = screen.getAllByLabelText('User selection')
        expect(select[0]).toBeDisabled()
    })

    it('should show "You" section for current user, as well as other users when not assigned', async () => {
        render(<UserAssignee ticketId={ticketId} currentAssignee={null} />)

        await waitUntilLoaded()

        await waitFor(() => {
            expect(screen.getByText('You')).toBeInTheDocument()
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
        await user.click(select)

        // Should show "Unassigned" option first
        await waitFor(() => {
            const options = screen.getAllByRole('option')
            expect(options[0]).toHaveTextContent('Unassigned')
        })
    })

    it('should update user assignment when selecting current user (You)', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await user.click(select)

        const youOptions = await screen.findAllByText('You')
        await user.click(youOptions[youOptions.length - 1])

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
        await user.click(select)

        const janeOptions = await screen.findAllByText('Jane Smith')
        await user.click(janeOptions[janeOptions.length - 1])

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
        await user.click(select)

        const unassignedOptions = await screen.findAllByText('Unassigned')
        await user.click(unassignedOptions[unassignedOptions.length - 1])

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_user: null,
            })
        })
    })

    it('should disable trigger while updating user', async () => {
        const mockUpdateTicketSlow = mockUpdateTicketHandler(
            async () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve(
                                HttpResponse.json(
                                    mockTicket({
                                        id: ticketId,
                                        assignee_user: mockTicketUser({
                                            id: 1,
                                            name: 'Current User',
                                            email: 'current@example.com',
                                        }),
                                    }),
                                ),
                            ),
                        100,
                    ),
                ),
        )

        server.use(mockUpdateTicketSlow.handler)

        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        expect(select).not.toBeDisabled()

        await user.click(select)

        const youOptions = await screen.findAllByText('You')
        await user.click(youOptions[youOptions.length - 1])

        await waitFor(() => {
            expect(select).toBeDisabled()
        })

        await waitFor(() => {
            expect(select).not.toBeDisabled()
        })
    })

    it('should clear search when dropdown is closed', async () => {
        const { user } = render(
            <UserAssignee ticketId={ticketId} currentAssignee={null} />,
        )

        const select = await waitUntilLoaded()
        await user.click(select)

        const searchInput = await screen.findByRole('searchbox')
        await user.type(searchInput, 'test search')

        expect(searchInput).toHaveValue('test search')

        await user.click(select)
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        await user.click(select)
        const searchInputAfterReopen = await screen.findByRole('searchbox')

        expect(searchInputAfterReopen).toHaveValue('')
    })
})
