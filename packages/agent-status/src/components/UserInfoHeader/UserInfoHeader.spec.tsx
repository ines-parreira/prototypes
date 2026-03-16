import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '../../tests/render.utils'
import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeader } from './UserInfoHeader'

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual('@gorgias/axiom')
    return {
        ...actual,
        Avatar: vi.fn(({ name, status }) => (
            <div data-testid="mock-avatar">
                {name}
                {status}
            </div>
        )),
        AvatarStatusIndicator: vi.fn(() => (
            <div data-testid="status-indicator" />
        )),
    }
})

describe('UserInfoHeader', () => {
    let MockAvatar: ReturnType<typeof vi.fn>
    let MockAvatarStatusIndicator: ReturnType<typeof vi.fn>

    const defaultProps: UserInfoHeaderProps = {
        userName: 'John Doe',
        indicatorColor: 'green',
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
            ['green', false, 'primary'],
            ['red', false, 'primary'],
            ['orange', false, 'primary'],
            ['green', true, 'secondary'],
            ['red', true, 'secondary'],
        ] as const)(
            'should pass correct props for indicatorColor=%s, isOffline=%s',
            (indicatorColor, isOffline, variant) => {
                renderUserInfoHeader({ indicatorColor, isOffline })

                expect(MockAvatarStatusIndicator).toHaveBeenCalledWith(
                    expect.objectContaining({
                        color: indicatorColor,
                        variant,
                    }),
                    expect.anything(),
                )
            },
        )

        it('should not render status indicator when indicatorColor is undefined', () => {
            renderUserInfoHeader({ indicatorColor: undefined })

            expect(MockAvatarStatusIndicator).not.toHaveBeenCalled()
        })

        it('should render status indicator when indicatorColor is provided', () => {
            renderUserInfoHeader({ indicatorColor: 'green' })

            expect(MockAvatarStatusIndicator).toHaveBeenCalled()
        })
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

    describe('Optional props', () => {
        it('should render without status and isOffline props', () => {
            renderUserInfoHeader({
                userName: 'Test User',
                indicatorColor: 'green',
            })

            const textElements = screen.getAllByText('Test User')
            // Verify the user name is rendered (appears twice: in mock avatar and as bold text)
            expect(textElements.length).toBeGreaterThan(0)
            expect(MockAvatarStatusIndicator).toHaveBeenCalled()
        })

        it('should render without indicatorColor', () => {
            renderUserInfoHeader({
                userName: 'Test User',
                indicatorColor: undefined,
            })

            const textElements = screen.getAllByText('Test User')
            // Verify the user name is rendered (appears twice: in mock avatar and as bold text)
            expect(textElements.length).toBeGreaterThan(0)
            expect(MockAvatarStatusIndicator).not.toHaveBeenCalled()
        })
    })
})
