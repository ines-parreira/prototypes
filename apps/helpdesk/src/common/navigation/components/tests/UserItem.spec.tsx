import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { assumeMock, render, userEvent } from '@repo/testing'
import { useCurrentUser } from '@repo/users'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    getCurrentUser,
    isAvailable as getIsAvailable,
} from 'state/currentUser/selectors'

import UserItem from '../UserItem'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
    isAvailable: jest.fn(),
}))
const getCurrentUserMock = assumeMock(getCurrentUser)
const getIsAvailableMock = assumeMock(getIsAvailable)

jest.mock('../UserMenu', () => () => <div>UserMenu</div>)

jest.mock('@repo/agent-status', () => ({
    useCustomAgentUnavailableStatusesFlag: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    UserAvatar: ({ user }: { user: { name?: string; email?: string } }) => (
        <div data-testid="user-avatar">{user?.name || user?.email}</div>
    ),
    useCurrentUser: jest.fn(),
}))

const useCustomAgentUnavailableStatusesFlagMock = assumeMock(
    useCustomAgentUnavailableStatusesFlag,
)
const useCurrentUserMock = assumeMock(useCurrentUser)

describe('UserItem', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ id: 123, name: 'John Doe' }),
        )
        getIsAvailableMock.mockReturnValue(true)
        useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        useCurrentUserMock.mockReturnValue({
            id: 123,
            name: 'John Doe',
        } as any)
    })

    describe('with feature flag disabled (legacy behavior)', () => {
        beforeEach(() => {
            useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(false)
        })

        it('should render the legacy user avatar', () => {
            render(<UserItem />)
            expect(screen.getByText('JD')).toBeInTheDocument()
        })

        it('should fall back to the user email if the name is not given', () => {
            getCurrentUserMock.mockReturnValue(
                fromJS({ id: 123, email: 'john.doe@example.com' }),
            )
            render(<UserItem />)
            expect(screen.getByText('j')).toBeInTheDocument()
        })

        it('should render the badge as available', () => {
            const { container } = render(<UserItem />)
            const badge = container.querySelector('.badge')
            expect(badge).toHaveStyle(
                'background-color: var(--feedback-success)',
            )
        })

        it('should render the badge as unavailable', () => {
            getIsAvailableMock.mockReturnValue(false)
            const { container } = render(<UserItem />)
            const badge = container.querySelector('.badge')
            expect(badge).toHaveStyle(
                'background-color: var(--feedback-warning)',
            )
        })

        it('should show the user menu on click', () => {
            render(<UserItem />)
            userEvent.click(screen.getByText('JD'))
            expect(screen.getByText('UserMenu')).toBeInTheDocument()
        })
    })

    describe('with feature flag enabled (UserAvatar)', () => {
        beforeEach(() => {
            useCustomAgentUnavailableStatusesFlagMock.mockReturnValue(true)
        })

        it('should render UserAvatar instead of legacy avatar', () => {
            render(<UserItem />)
            expect(screen.getByTestId('user-avatar')).toBeInTheDocument()
            expect(screen.queryByText('JD')).not.toBeInTheDocument()
        })

        it('should pass the current user to UserAvatar', () => {
            useCurrentUserMock.mockReturnValue({
                id: 456,
                name: 'Jane Smith',
                meta: {
                    profile_picture_url: 'https://example.com/pic.jpg',
                },
            } as any)
            render(<UserItem />)

            const userAvatar = screen.getByTestId('user-avatar')
            expect(userAvatar).toHaveTextContent('Jane Smith')
        })

        it('should fall back to email when name is not provided', () => {
            useCurrentUserMock.mockReturnValue({
                id: 123,
                email: 'test@example.com',
            } as any)
            render(<UserItem />)

            const userAvatar = screen.getByTestId('user-avatar')
            expect(userAvatar).toHaveTextContent('test@example.com')
        })

        it('should fall back to the legacy avatar while the current user is loading', () => {
            useCurrentUserMock.mockReturnValue(undefined)
            render(<UserItem />)
            expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument()
            expect(screen.getByText('JD')).toBeInTheDocument()
        })

        it('should not render legacy badge', () => {
            const { container } = render(<UserItem />)
            const badge = container.querySelector('.badge')
            expect(badge).not.toBeInTheDocument()
        })

        it('should show the user menu on click', () => {
            render(<UserItem />)
            const button = screen.getByRole('button')
            userEvent.click(button)
            expect(screen.getByText('UserMenu')).toBeInTheDocument()
        })
    })
})
