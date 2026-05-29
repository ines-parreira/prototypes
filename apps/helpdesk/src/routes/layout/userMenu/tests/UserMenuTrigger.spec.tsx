import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { User } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'

import { UserMenuTrigger } from '../UserMenuTrigger'

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    UserAvatar: jest.fn(
        ({ user }: { user: { name?: string; email?: string } }) => (
            <div data-testid="user-avatar">
                UserAvatar:{user?.name}:{user?.email}
            </div>
        ),
    ),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Avatar: jest.fn(({ name, url, status }) => (
        <div data-testid="axiom-avatar">
            Avatar:{name}:{String(url)}:{status}
        </div>
    )),
    AvatarStatusIndicator: jest.fn(({ color }) => (
        <div data-testid="avatar-status-indicator">status:{color}</div>
    )),
    Button: jest.fn(({ icon, ...props }) => <button {...props}>{icon}</button>),
}))

jest.mock('hooks/useAppSelector')

const { useCustomAgentUnavailableStatusesFlag } =
    jest.requireMock('@repo/agent-status')
const { UserAvatar } = jest.requireMock('@repo/users')
const { Avatar, AvatarStatusIndicator } = jest.requireMock('@gorgias/axiom')

const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

const buildUser = (overrides: Partial<User> = {}): User =>
    ({
        id: 42,
        name: 'Jane Doe',
        email: 'jane@example.com',
        meta: { profile_picture_url: 'https://example.com/avatar.jpg' },
        ...overrides,
    }) as User

describe('UserMenuTrigger', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAppSelectorMock.mockReturnValue(true)
    })

    it('renders the UserAvatar when the agent unavailability flag is enabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        const user = buildUser()
        render(<UserMenuTrigger user={user} />)

        expect(screen.getByTestId('user-avatar')).toBeInTheDocument()
        expect(screen.queryByTestId('axiom-avatar')).not.toBeInTheDocument()
        expect(UserAvatar).toHaveBeenCalledWith(
            expect.objectContaining({ user }),
            expect.anything(),
        )
    })

    it('renders the axiom Avatar when the agent unavailability flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        const user = buildUser({
            name: 'Legacy User',
            meta: { profile_picture_url: 'https://example.com/legacy.jpg' },
        })
        render(<UserMenuTrigger user={user} />)

        expect(screen.getByTestId('axiom-avatar')).toBeInTheDocument()
        expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument()
        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Legacy User',
                url: 'https://example.com/legacy.jpg',
            }),
            expect.anything(),
        )
    })

    it('passes url as undefined to the legacy Avatar when profile_picture_url is missing', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        const user = buildUser({ meta: undefined })
        render(<UserMenuTrigger user={user} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({ url: undefined }),
            expect.anything(),
        )
    })

    it('falls back to email for the legacy Avatar name when the user has no name', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        const user = buildUser({
            name: undefined,
            email: 'fallback@example.com',
        })
        render(<UserMenuTrigger user={user} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'fallback@example.com' }),
            expect.anything(),
        )
    })

    it('shows a green status indicator when the agent is available', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(true)

        render(<UserMenuTrigger user={buildUser()} />)

        expect(AvatarStatusIndicator).toHaveBeenCalledWith(
            expect.objectContaining({ color: 'green' }),
            expect.anything(),
        )
    })

    it('shows an orange status indicator when the agent is unavailable', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(false)

        render(<UserMenuTrigger user={buildUser()} />)

        expect(AvatarStatusIndicator).toHaveBeenCalledWith(
            expect.objectContaining({ color: 'orange' }),
            expect.anything(),
        )
    })

    it('renders inside a tertiary Button with the candu data attribute', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(<UserMenuTrigger user={buildUser()} />)

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('data-candu-id', 'navbar-user-menu')
    })
})
