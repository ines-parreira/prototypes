import { UserRole } from '@repo/permissions'
import { assumeMock, render } from '@repo/testing/vitest'
import { screen, waitFor } from '@testing-library/react'

import { mockUser } from '@gorgias/helpdesk-mocks'
import type { UserRoleName } from '@gorgias/helpdesk-types'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useAllUsers } from '../../hooks/useAllUsers'
import { useAllUsersLoadingState } from '../../hooks/useAllUsersLoadingState'
import { UsersListPage } from './UsersListPage'

vi.mock('@gorgias/realtime')
vi.mock('../../hooks/useAllUsers')
vi.mock('../../hooks/useAllUsersLoadingState')

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)
const useAllUsersMock = assumeMock(useAllUsers)
const useAllUsersLoadingStateMock = assumeMock(useAllUsersLoadingState)
const originalGetComputedStyle = window.getComputedStyle
const originalResizeObserver = globalThis.ResizeObserver

class MockResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

const visibleAgent = mockUser({
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: { name: UserRole.Admin },
})
const aiAgentBot = mockUser({
    id: 2,
    name: 'AI Agent',
    email: 'ai-agent@example.com',
    role: { name: UserRole.Bot },
    client_id: '658d6f54fbff9b7c6f2d0321',
})
const hiddenBot = mockUser({
    id: 3,
    name: 'Automation Bot',
    email: 'bot@example.com',
    role: { name: UserRole.Bot },
    client_id: 'legacy-bot-client',
})

const renderPage = () => render(<UsersListPage />)

describe('UsersListPage', () => {
    beforeAll(() => {
        vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
            originalGetComputedStyle(element),
        )
        globalThis.ResizeObserver =
            MockResizeObserver as unknown as typeof ResizeObserver
        window.GORGIAS_STATE = {
            currentAccount: { domain: 'acme', user_id: visibleAgent.id },
        } as Window['GORGIAS_STATE']
    })

    afterAll(() => {
        vi.restoreAllMocks()
        globalThis.ResizeObserver = originalResizeObserver
    })

    beforeEach(() => {
        useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })
        useAllUsersMock.mockReturnValue([visibleAgent, aiAgentBot, hiddenBot])
        useAllUsersLoadingStateMock.mockReturnValue({
            isLoading: false,
            isError: false,
        })
    })

    it('renders visible settings users', () => {
        const { getByText, queryByText } = renderPage()

        expect(getByText('Ada Lovelace')).toBeInTheDocument()
        expect(getByText('AI Agent')).toBeInTheDocument()
        expect(queryByText('Automation Bot')).not.toBeInTheDocument()
    })

    it('marks the account owner with a dedicated tag', () => {
        const { getByText } = renderPage()

        expect(getByText('Account Owner')).toBeInTheDocument()
    })

    it('links the create button and rows to their settings routes', () => {
        const { getByRole } = renderPage()

        expect(getByRole('link', { name: 'Create user' })).toHaveAttribute(
            'href',
            '/app/settings/users/add/',
        )
        expect(getByRole('link', { name: /Ada Lovelace/ })).toHaveAttribute(
            'href',
            `/app/settings/users/${visibleAgent.id}`,
        )
    })

    it('renders the email and 2FA columns for each user', () => {
        const adminWith2fa = mockUser({
            id: 10,
            name: 'Grace Hopper',
            email: 'grace@example.com',
            role: { name: UserRole.Agent },
            has_2fa_enabled: true,
        })
        const agentWithout2fa = mockUser({
            id: 11,
            name: 'Alan Turing',
            email: 'alan@example.com',
            role: { name: UserRole.BasicAgent },
            has_2fa_enabled: false,
        })
        useAllUsersMock.mockReturnValue([adminWith2fa, agentWithout2fa])

        const { getByText } = renderPage()

        expect(getByText('grace@example.com')).toBeInTheDocument()
        expect(getByText('alan@example.com')).toBeInTheDocument()
        expect(getByText('Enabled')).toBeInTheDocument()
        expect(getByText('Disabled')).toBeInTheDocument()
    })

    it('falls back to the email in the user column when a name is missing', () => {
        const namelessUser = mockUser({
            id: 20,
            name: undefined,
            email: 'nameless@example.com',
            role: { name: UserRole.Agent },
        })
        useAllUsersMock.mockReturnValue([namelessUser])

        const { getAllByText } = renderPage()

        // Rendered once in the user column (name fallback) and once in the
        // email column.
        expect(getAllByText('nameless@example.com')).toHaveLength(2)
    })

    it('shows N/A for the 2FA column of bot users', () => {
        const { getByText } = renderPage()

        expect(getByText('N/A')).toBeInTheDocument()
    })

    it('renders a raw tag for unknown roles and omits missing roles', () => {
        const customRoleUser = mockUser({
            id: 12,
            name: 'Merlin',
            email: 'merlin@example.com',
            role: { name: 'wizard' as UserRoleName },
        })
        const rolelessUser = mockUser({
            id: 13,
            name: 'No Role',
            email: 'norole@example.com',
            role: undefined,
        })
        useAllUsersMock.mockReturnValue([customRoleUser, rolelessUser])

        const { getByText, getByRole } = renderPage()

        expect(getByText('wizard')).toBeInTheDocument()
        expect(getByRole('link', { name: /No Role/ })).toBeInTheDocument()
    })

    it('shows an error toast when users fail to load', async () => {
        const { rerender } = renderPage()

        useAllUsersLoadingStateMock.mockReturnValue({
            isLoading: false,
            isError: true,
        })
        rerender(<UsersListPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Failed to fetch users' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
