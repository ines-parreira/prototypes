import { UserRole } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { MoreActionsMenu } from '../MoreActionsMenu'

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

const basicAgentUser = mockUser({
    id: 2,
    email: 'basic@test.com',
    firstname: 'Basic',
    lastname: 'Agent',
    role: { name: UserRole.BasicAgent },
})

const mockAgentCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(agentUser),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockAgentCurrentUser.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    isDisabled: false,
    onMarkAsUnread: vi.fn(),
    onMarkAsRead: vi.fn(),
    onChangePriority: vi.fn(),
    onExportTickets: vi.fn(),
    onMoveToTrash: vi.fn(),
}

async function openMenu(user: ReturnType<typeof render>['user']) {
    await user.click(screen.getByRole('button', { name: /more actions/i }))
    await waitFor(() => {
        expect(
            screen.getByRole('menuitem', { name: /mark as unread/i }),
        ).toBeInTheDocument()
    })
}

describe('MoreActionsMenu', () => {
    it('renders the trigger button', () => {
        render(<MoreActionsMenu {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).toBeInTheDocument()
    })

    it('disables the trigger button when isDisabled is true', () => {
        render(<MoreActionsMenu {...defaultProps} isDisabled />)

        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).toBeDisabled()
    })

    describe('menu items', () => {
        it('renders standard items when opened', async () => {
            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            expect(
                screen.getByRole('menuitem', { name: /mark as read/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /move to trash/i }),
            ).toBeInTheDocument()
        })

        it('shows export tickets for an agent', async () => {
            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /export tickets/i }),
                ).toBeInTheDocument()
            })
        })

        it('hides export tickets for a user below agent level', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(basicAgentUser),
                ).handler,
            )

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            await waitFor(() => {
                expect(
                    screen.queryByRole('menuitem', { name: /export tickets/i }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('handler callbacks', () => {
        it('calls onMarkAsUnread when that item is activated', async () => {
            const onMarkAsUnread = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMarkAsUnread={onMarkAsUnread}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /mark as unread/i }),
            )

            expect(onMarkAsUnread).toHaveBeenCalledTimes(1)
        })

        it('calls onMarkAsRead when that item is activated', async () => {
            const onMarkAsRead = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMarkAsRead={onMarkAsRead}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /mark as read/i }),
            )

            expect(onMarkAsRead).toHaveBeenCalledTimes(1)
        })

        it('calls onMoveToTrash when that item is activated', async () => {
            const onMoveToTrash = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMoveToTrash={onMoveToTrash}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /move to trash/i }),
            )

            expect(onMoveToTrash).toHaveBeenCalledTimes(1)
        })

        it('calls onChangePriority with the correct value when a priority item is activated', async () => {
            const onChangePriority = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onChangePriority={onChangePriority}
                />,
            )
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitem', { name: /change priority/i }),
            )
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /critical/i }),
                ).toBeInTheDocument()
            })
            await user.click(
                screen.getByRole('menuitem', { name: /critical/i }),
            )

            expect(onChangePriority).toHaveBeenCalledWith('critical')
        })

        it('calls onExportTickets when that item is activated', async () => {
            const onExportTickets = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onExportTickets={onExportTickets}
                />,
            )
            await openMenu(user)
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /export tickets/i }),
                ).toBeInTheDocument()
            })
            await user.click(
                screen.getByRole('menuitem', { name: /export tickets/i }),
            )

            expect(onExportTickets).toHaveBeenCalledTimes(1)
        })
    })
})
