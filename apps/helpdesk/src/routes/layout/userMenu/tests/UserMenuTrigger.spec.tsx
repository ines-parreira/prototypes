import { render, screen } from '@testing-library/react'

import { UserMenuTrigger } from '../UserMenuTrigger'

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
    AgentAvatar: jest.fn(({ userId, name, url }) => (
        <div data-testid="agent-avatar">
            AgentAvatar:{userId}:{name}:{String(url)}
        </div>
    )),
}))

jest.mock('pages/common/components/Avatar/Avatar', () => ({
    __esModule: true,
    default: jest.fn(({ name, url, shape, size }) => (
        <div data-testid="legacy-avatar">
            LegacyAvatar:{name}:{String(url)}:{shape}:{size}
        </div>
    )),
}))

const { useCustomAgentUnavailableStatusesFlag, AgentAvatar } =
    jest.requireMock('@repo/agent-status')
const LegacyAvatar = jest.requireMock(
    'pages/common/components/Avatar/Avatar',
).default

const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock

describe('UserMenuTrigger', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
        expect(screen.queryByTestId('legacy-avatar')).not.toBeInTheDocument()
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

    it('renders the LegacyAvatar when the agent unavailability flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        render(
            <UserMenuTrigger
                userId={99}
                userName="Legacy User"
                profilePictureUrl="https://example.com/legacy.jpg"
            />,
        )

        expect(screen.getByTestId('legacy-avatar')).toBeInTheDocument()
        expect(screen.queryByTestId('agent-avatar')).not.toBeInTheDocument()
        expect(LegacyAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Legacy User',
                url: 'https://example.com/legacy.jpg',
                shape: 'round',
                size: 24,
            }),
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
