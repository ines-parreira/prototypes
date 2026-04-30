import { render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'

import { UserMenuTrigger } from '../UserMenuTrigger'

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
    AgentAvatar: jest.fn(({ userId, name, url }) => (
        <div data-testid="agent-avatar">
            AgentAvatar:{userId}:{name}:{String(url)}
        </div>
    )),
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

const { useCustomAgentUnavailableStatusesFlag, AgentAvatar } =
    jest.requireMock('@repo/agent-status')
const { Avatar, AvatarStatusIndicator } = jest.requireMock('@gorgias/axiom')

const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock

describe('UserMenuTrigger', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAppSelectorMock.mockReturnValue(true)
    })

    it('renders the AgentAvatar when the agent unavailability flag is enabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        render(
            <UserMenuTrigger
                userId={42}
                userName="Jane Doe"
                profilePictureUrl="https://example.com/avatar.jpg"
            />,
        )

        expect(screen.getByTestId('agent-avatar')).toBeInTheDocument()
        expect(screen.queryByTestId('axiom-avatar')).not.toBeInTheDocument()
        expect(AgentAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 42,
                name: 'Jane Doe',
                url: 'https://example.com/avatar.jpg',
            }),
            expect.anything(),
        )
    })

    it('passes url as undefined to AgentAvatar when profilePictureUrl is null', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        render(
            <UserMenuTrigger
                userId={7}
                userName="Anon"
                profilePictureUrl={null}
            />,
        )

        expect(AgentAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 7,
                name: 'Anon',
                url: undefined,
            }),
            expect.anything(),
        )
    })

    it('renders the axiom Avatar when the agent unavailability flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(
            <UserMenuTrigger
                userId={99}
                userName="Legacy User"
                profilePictureUrl="https://example.com/legacy.jpg"
            />,
        )

        expect(screen.getByTestId('axiom-avatar')).toBeInTheDocument()
        expect(screen.queryByTestId('agent-avatar')).not.toBeInTheDocument()
        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Legacy User',
                url: 'https://example.com/legacy.jpg',
            }),
            expect.anything(),
        )
    })

    it('shows a green status indicator when the agent is available', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(true)

        render(
            <UserMenuTrigger
                userId={1}
                userName="User"
                profilePictureUrl={null}
            />,
        )

        expect(AvatarStatusIndicator).toHaveBeenCalledWith(
            expect.objectContaining({ color: 'green' }),
            expect.anything(),
        )
    })

    it('shows an orange status indicator when the agent is unavailable', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useAppSelectorMock.mockReturnValue(false)

        render(
            <UserMenuTrigger
                userId={1}
                userName="User"
                profilePictureUrl={null}
            />,
        )

        expect(AvatarStatusIndicator).toHaveBeenCalledWith(
            expect.objectContaining({ color: 'orange' }),
            expect.anything(),
        )
    })

    it('renders inside a tertiary Button with the candu data attribute', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(
            <UserMenuTrigger
                userId={1}
                userName="User"
                profilePictureUrl="https://example.com/u.jpg"
            />,
        )

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('data-candu-id', 'navbar-user-menu')
    })
})
