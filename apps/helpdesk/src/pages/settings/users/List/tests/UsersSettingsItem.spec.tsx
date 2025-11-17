import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import { Badge } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-types'

import {
    AvailabilityStatusChannel,
    AvailabilityStatusDetailCode,
    AvailabilityStatusTag,
    UserRole,
} from 'config/types/user'
import { agents } from 'fixtures/agents'
import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import { RoleLabel } from 'pages/common/utils/labels'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'
import { getAccountOwnerId } from 'state/currentAccount/selectors'

import { UsersSettingsItem } from '../UsersSettingsItem'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ children }) => <div data-testid="link">{children}</div>),
}))

jest.mock('@gorgias/axiom', () => ({
    Badge: jest.fn(({ children, type }) => (
        <div data-testid={`badge-${type}`}>{children}</div>
    )),
}))

jest.mock('pages/common/components/Avatar/Avatar', () =>
    jest.fn(() => <div data-testid="avatar" />),
)

jest.mock('pages/common/utils/labels', () => ({
    RoleLabel: jest.fn(() => <div data-testid="role-label" />),
}))

jest.mock('hooks/useAppSelector')
jest.mock('state/currentAccount/selectors')

const mockedUseAppSelector = assumeMock(useAppSelector)
const mockedGetAccountOwnerId = assumeMock(getAccountOwnerId)
const mockedLink = assumeMock(Link)
const mockedBadge = assumeMock(Badge)
const mockedAvatar = assumeMock(Avatar)
const mockedRoleLabel = assumeMock(RoleLabel)

describe('<UsersSettingsItem />', () => {
    const defaultUser = {
        ...agents[0],
        has_2fa_enabled: true,
        availability_status: {
            status: AvailabilityStatusTag.Online,
            channel: AvailabilityStatusChannel.Phone,
            status_detail_code: AvailabilityStatusDetailCode.NotConnected,
        },
    } as User

    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({} as any),
        )
        mockedGetAccountOwnerId.mockReturnValue(2) // Not the account owner
    })

    it('should render user information correctly', () => {
        render(<UsersSettingsItem user={defaultUser} />)

        expect(mockedAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: defaultUser.name,
                badgeColor: 'var(--feedback-success)', // Online status
            }),
            {},
        )

        expect(screen.getByText(defaultUser.name!)).toBeInTheDocument()
        expect(screen.getByText(defaultUser.email!)).toBeInTheDocument()

        // 2FA badge
        expect(mockedBadge).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'light-success' }),
            {},
        )
        expect(screen.getByText('Enabled')).toBeInTheDocument()

        // Link to "edit user" settings page
        expect(mockedLink).toHaveBeenCalledWith(
            expect.objectContaining({
                to: `/app/settings/users/${defaultUser.id}`,
            }),
            expect.anything(),
        )
    })

    it('should render account owner badge when user is account owner', () => {
        mockedGetAccountOwnerId.mockReturnValue(defaultUser.id!)

        render(<UsersSettingsItem user={defaultUser} />)

        expect(mockedBadge).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'blue' }),
            {},
        )
        expect(screen.getByText('Account Owner')).toBeInTheDocument()

        expect(mockedRoleLabel).not.toHaveBeenCalled()
    })

    it('should render role label when user is not account owner', () => {
        render(<UsersSettingsItem user={defaultUser} />)

        expect(screen.queryByText('Account Owner')).not.toBeInTheDocument()

        expect(mockedRoleLabel).toHaveBeenCalledWith(
            expect.objectContaining({
                role: { name: defaultUser.role!.name },
            }),
            {},
        )
    })

    it('should render different badge for 2FA disabled', () => {
        const user = { ...defaultUser, has_2fa_enabled: false }

        render(<UsersSettingsItem user={user} />)

        // 2FA badge
        expect(mockedBadge).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'light-error',
            }),
            expect.anything(),
        )
        expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should render different avatar badge color based on availability status', () => {
        // Busy status
        const busyUser = {
            ...defaultUser,
            availability_status: {
                status: AvailabilityStatusTag.Busy,
            },
        } as User

        const { rerender } = render(<UsersSettingsItem user={busyUser} />)

        expect(mockedAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                badgeColor: 'var(--feedback-warning)',
            }),
            {},
        )

        // Offline status
        const offlineUser = {
            ...defaultUser,
            availability_status: {
                status: AvailabilityStatusTag.Offline,
            },
        } as User

        rerender(<UsersSettingsItem user={offlineUser} />)

        expect(mockedAvatar).toHaveBeenCalledWith(
            expect.objectContaining({
                badgeColor: 'var(--neutral-grey-4)',
            }),
            {},
        )
    })

    it('should render AI Agent bot user', () => {
        const aiAgentUser = {
            ...defaultUser,
            role: { name: UserRole.Bot },
            client_id: AI_AGENT_CLIENT_ID,
        }

        render(<UsersSettingsItem user={aiAgentUser} />)

        expect(screen.getByText(aiAgentUser.name!)).toBeInTheDocument()
        expect(screen.getByText('N/A')).toBeInTheDocument()
        expect(mockedBadge).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'light-grey',
            }),
            expect.anything(),
        )
    })
})
