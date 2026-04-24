import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { StaticRouter } from 'react-router-dom'

import { Button, Menu } from '@gorgias/axiom'

import { UserMenuUserHeader } from '../UserMenuUserHeader'

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
    useAgentPhoneStatus: jest.fn(),
    UserInfoHeaderContainer: jest.fn(({ agentPhoneUnavailabilityStatus }) => (
        <div>
            {`UserInfoHeaderContainer:${agentPhoneUnavailabilityStatus?.name ?? 'no-status'}`}
        </div>
    )),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

const {
    useCustomAgentUnavailableStatusesFlag,
    useAgentPhoneStatus,
    UserInfoHeaderContainer,
} = jest.requireMock('@repo/agent-status')
const useCustomAgentUnavailableStatusesFlagMock =
    useCustomAgentUnavailableStatusesFlag as jest.Mock
const useAgentPhoneStatusMock = useAgentPhoneStatus as jest.Mock
const logEventMock = assumeMock(logEvent)

const renderInMenu = (
    props: { userId?: number; userEmail?: string; userRole?: string } = {},
) =>
    render(
        <StaticRouter location="/app">
            <Menu defaultOpen trigger={<Button>Open menu</Button>}>
                <UserMenuUserHeader
                    userId={props.userId ?? 1}
                    userEmail={props.userEmail}
                    userRole={props.userRole}
                />
            </Menu>
        </StaticRouter>,
    )

describe('UserMenuUserHeader', () => {
    beforeEach(() => {
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: undefined,
        })
    })

    it('renders nothing when the agent unavailability flag is disabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)

        renderInMenu({ userEmail: 'a@b.c', userRole: 'admin' })

        expect(
            screen.queryByText(/UserInfoHeaderContainer/),
        ).not.toBeInTheDocument()
    })

    it('renders UserInfoHeaderContainer wrapped in a profile link when the flag is enabled', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)

        renderInMenu({ userEmail: 'a@b.c', userRole: 'admin' })

        expect(screen.getByText(/UserInfoHeaderContainer/)).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /UserInfoHeaderContainer/ }),
        ).toHaveAttribute('href', '/app/settings/profile')
    })

    it('forwards agentPhoneUnavailabilityStatus from useAgentPhoneStatus to the container', () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        useAgentPhoneStatusMock.mockReturnValue({
            agentPhoneUnavailabilityStatus: {
                id: 'on-a-call',
                name: 'On a call',
            },
        })

        renderInMenu({ userEmail: 'x@y.z', userRole: 'agent' })

        expect(UserInfoHeaderContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                agentPhoneUnavailabilityStatus: {
                    id: 'on-a-call',
                    name: 'On a call',
                },
            }),
            expect.anything(),
        )
        expect(screen.getByText(/On a call/)).toBeInTheDocument()
    })

    it('logs the your-profile link click with the provided email and role', async () => {
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        const user = userEvent.setup()

        renderInMenu({ userEmail: 'agent@example.com', userRole: 'admin' })

        await user.click(
            screen.getByRole('link', { name: /UserInfoHeaderContainer/ }),
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'your-profile',
                user_email: 'agent@example.com',
                user_role: 'admin',
            },
        )
    })
})
