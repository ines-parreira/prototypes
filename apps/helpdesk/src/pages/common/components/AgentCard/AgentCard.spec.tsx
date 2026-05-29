import React from 'react'

import { render } from '@repo/testing'
import { UserAvatar } from '@repo/users'
import { screen } from '@testing-library/react'

import Avatar from 'pages/common/components/Avatar/Avatar'

import AgentCard from './AgentCard'

jest.mock('pages/common/components/Avatar/Avatar', () => ({
    __esModule: true,
    default: jest.fn(() => <div>AvatarMock</div>),
}))
jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    UserAvatar: jest.fn(() => <div>UserAvatarMock</div>),
}))

const AvatarMock = Avatar as unknown as jest.Mock
const UserAvatarMock = UserAvatar as unknown as jest.Mock

describe('AgentCard', () => {
    const defaultProps = {
        name: 'John Doe',
        url: 'https://example.com/avatar.png',
        badgeColor: '#ff0000',
        description: 'Lorem ipsum dolor sit amet',
    }

    const renderComponent = (
        props: Partial<React.ComponentProps<typeof AgentCard>> = {},
    ) => render(<AgentCard {...defaultProps} {...props} />)

    it('should render the agent name and description', () => {
        renderComponent()
        expect(screen.getByText(defaultProps.name)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
    })

    it('should render the legacy avatar with the correct props when userId is missing', () => {
        renderComponent()
        expect(AvatarMock).toHaveBeenCalledWith(
            expect.objectContaining({
                shape: 'round',
                name: defaultProps.name,
                url: defaultProps.url,
                size: 36,
                badgeColor: defaultProps.badgeColor,
            }),
            {},
        )
        expect(UserAvatarMock).not.toHaveBeenCalled()
    })

    it('renders UserAvatar when userId is provided and useLegacyAvatar is false', () => {
        renderComponent({ userId: 42, useLegacyAvatar: false })

        expect(UserAvatarMock).toHaveBeenCalledWith(
            expect.objectContaining({
                user: {
                    id: 42,
                    name: defaultProps.name,
                    meta: { profile_picture_url: defaultProps.url },
                },
            }),
            {},
        )
        expect(AvatarMock).not.toHaveBeenCalled()
    })

    it('falls back to the legacy avatar when useLegacyAvatar is true even if userId is provided', () => {
        renderComponent({ userId: 42, useLegacyAvatar: true })

        expect(AvatarMock).toHaveBeenCalled()
        expect(UserAvatarMock).not.toHaveBeenCalled()
    })

    it('falls back to the legacy avatar when userId is missing even if useLegacyAvatar is false', () => {
        renderComponent({ useLegacyAvatar: false })

        expect(AvatarMock).toHaveBeenCalled()
        expect(UserAvatarMock).not.toHaveBeenCalled()
    })
})
