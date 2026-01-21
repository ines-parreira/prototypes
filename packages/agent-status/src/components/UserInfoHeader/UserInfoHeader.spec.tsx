import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserAvailabilityStatus } from '@gorgias/helpdesk-queries'

import type * as hooks from '../../hooks'
import { render } from '../../tests/render.utils'
import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeader } from './UserInfoHeader'

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual('@gorgias/axiom')
    return {
        ...actual,
        Avatar: vi.fn(({ name, statusSlot }) => (
            <div data-testid="mock-avatar">
                {name}
                {statusSlot}
            </div>
        )),
        AvatarStatusIndicator: vi.fn(() => (
            <div data-testid="status-indicator" />
        )),
    }
})

vi.mock('../../hooks', async () => {
    const actual = await vi.importActual<typeof hooks>('../../hooks')
    return {
        ...actual,
        useAvailabilityStatusColor: vi.fn(() => 'green'),
    }
})

describe('UserInfoHeader', () => {
    let MockAvatar: ReturnType<typeof vi.fn>
    let MockAvatarStatusIndicator: ReturnType<typeof vi.fn>

    const defaultProps: UserInfoHeaderProps = {
        userName: 'John Doe',
        status: 'available' as UserAvailabilityStatus,
        isOffline: false,
    }

    const renderUserInfoHeader = (props?: Partial<UserInfoHeaderProps>) => {
        return render(<UserInfoHeader {...defaultProps} {...props} />)
    }

    beforeEach(async () => {
        vi.clearAllMocks()
        const axiom = await import('@gorgias/axiom')
        MockAvatar = vi.mocked(axiom.Avatar)
        MockAvatarStatusIndicator = vi.mocked(axiom.AvatarStatusIndicator)
    })

    describe('Avatar props', () => {
        it.each([
            ['Jane Smith', undefined],
            ['John Doe', 'https://example.com/avatar.jpg'],
            ['Test User', ''],
        ] as const)('should pass name=%s and url=%s', (userName, avatarUrl) => {
            renderUserInfoHeader({ userName, avatarUrl })

            expect(MockAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: userName,
                    url: avatarUrl,
                    size: 'lg',
                }),
                expect.anything(),
            )
        })
    })

    describe('AvatarStatusIndicator props', () => {
        it.each([
            ['available', false, 'green', 'primary'],
            ['unavailable', true, 'green', 'secondary'],
            ['custom', false, 'green', 'primary'],
        ] as const)(
            'should pass correct props for status=%s, isOffline=%s',
            (status, isOffline, color, variant) => {
                renderUserInfoHeader({ status, isOffline })

                expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                    expect.objectContaining({
                        size: 'xl',
                        color,
                        variant,
                    }),
                    expect.anything(),
                )
            },
        )
    })

    describe('Text content', () => {
        it('should render user name as bold text', () => {
            renderUserInfoHeader({ userName: 'Jane Smith' })

            const textElements = screen.getAllByText('Jane Smith')
            // The second occurrence is the bold text (not in the mock avatar)
            expect(textElements[1]).toBeInTheDocument()
        })

        it('should render status text when provided', () => {
            renderUserInfoHeader({ statusText: 'On a call' })

            expect(screen.getByText('On a call')).toBeInTheDocument()
        })
    })
})
