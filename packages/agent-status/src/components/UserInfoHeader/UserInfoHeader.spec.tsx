import type * as FeatureFlags from '@repo/feature-flags'
import { render } from '@repo/testing/vitest'
import type * as Users from '@repo/users'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@gorgias/helpdesk-queries'

import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeader } from './UserInfoHeader'

vi.mock('@repo/feature-flags', async (importOriginal) => {
    const actual = await importOriginal<typeof FeatureFlags>()
    return {
        ...actual,
        useHelpdeskV2WayfindingMS1Flag: vi.fn(),
    }
})

vi.mock('@repo/users', () => ({
    UserAvatar: vi.fn(
        ({
            user,
            size,
        }: {
            user?: { name?: string; email?: string }
            size?: string
        }) => (
            <div data-testid="mock-user-avatar" data-size={size}>
                {user?.name || user?.email}
            </div>
        ),
    ),
}))

const { useHelpdeskV2WayfindingMS1Flag } = await import('@repo/feature-flags')
const useHelpdeskV2WayfindingMS1FlagMock = vi.mocked(
    useHelpdeskV2WayfindingMS1Flag,
)

const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
} as User

const defaultProps: UserInfoHeaderProps = {
    user: mockUser,
    userName: 'John Doe',
}

const renderUserInfoHeader = (props?: Partial<UserInfoHeaderProps>) =>
    render(<UserInfoHeader {...defaultProps} {...props} />)

describe('UserInfoHeader', () => {
    let MockUserAvatar: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        vi.clearAllMocks()
        const users = (await import('@repo/users')) as typeof Users
        MockUserAvatar = vi.mocked(users.UserAvatar)
    })

    describe('legacy layout (wayfinding MS1 flag off)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        it('passes the user to UserAvatar with size "lg"', () => {
            renderUserInfoHeader()

            expect(MockUserAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: mockUser,
                    size: 'lg',
                }),
                expect.anything(),
            )
        })

        describe('Text content', () => {
            it('should render the user name', () => {
                renderUserInfoHeader({ userName: 'Jane Smith' })

                const textElements = screen.getAllByText('Jane Smith')
                expect(textElements.length).toBeGreaterThan(0)
            })

            it('should render status text when provided', () => {
                renderUserInfoHeader({ statusText: 'On a call' })

                expect(screen.getByText('On a call')).toBeInTheDocument()
            })

            it('should not render a "View profile" affordance', () => {
                renderUserInfoHeader()

                expect(
                    screen.queryByText('View profile'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('MS1 layout (wayfinding MS1 flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('passes the user to UserAvatar with size "sm"', () => {
            renderUserInfoHeader()

            expect(MockUserAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: mockUser,
                    size: 'sm',
                }),
                expect.anything(),
            )
        })

        it('renders a "View profile" affordance', () => {
            renderUserInfoHeader()

            expect(screen.getByText('View profile')).toBeInTheDocument()
        })

        it('renders the status text when provided', () => {
            renderUserInfoHeader({ statusText: 'On a call' })

            expect(screen.getByText('On a call')).toBeInTheDocument()
        })

        it('omits the status text when not provided', () => {
            renderUserInfoHeader({ statusText: undefined })

            expect(screen.queryByText('On a call')).not.toBeInTheDocument()
        })
    })
})
