import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
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

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('@repo/agent-status', () => ({
    AgentAvatar: ({ name }: { name: string }) => (
        <div data-testid="agent-avatar">{name}</div>
    ),
}))

const { useFlag } = jest.requireMock('@repo/feature-flags')
const useFlagMock = useFlag as jest.Mock

describe('UserItem', () => {
    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({ id: 123, name: 'John Doe' }),
        )
        getIsAvailableMock.mockReturnValue(true)
        useFlagMock.mockReturnValue(false)
    })

    describe('with feature flag disabled (legacy behavior)', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
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

    describe('with feature flag enabled (AgentAvatar)', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('should render AgentAvatar instead of legacy avatar', () => {
            render(<UserItem />)
            expect(screen.getByTestId('agent-avatar')).toBeInTheDocument()
            expect(screen.queryByText('JD')).not.toBeInTheDocument()
        })

        it('should pass correct props to AgentAvatar', () => {
            getCurrentUserMock.mockReturnValue(
                fromJS({
                    id: 456,
                    name: 'Jane Smith',
                    meta: {
                        profile_picture_url: 'https://example.com/pic.jpg',
                    },
                }),
            )
            render(<UserItem />)

            const agentAvatar = screen.getByTestId('agent-avatar')
            expect(agentAvatar).toHaveTextContent('Jane Smith')
        })

        it('should fall back to email when name is not provided', () => {
            getCurrentUserMock.mockReturnValue(
                fromJS({
                    id: 123,
                    email: 'test@example.com',
                }),
            )
            render(<UserItem />)

            const agentAvatar = screen.getByTestId('agent-avatar')
            expect(agentAvatar).toHaveTextContent('test@example.com')
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
