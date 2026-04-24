import type * as FeatureFlags from '@repo/feature-flags'
import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeader } from './UserInfoHeader'

vi.mock('@repo/feature-flags', async (importOriginal) => {
    const actual = await importOriginal<typeof FeatureFlags>()
    return {
        ...actual,
        useHelpdeskV2WayfindingMS1Flag: vi.fn(),
    }
})

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

const { useHelpdeskV2WayfindingMS1Flag } = await import('@repo/feature-flags')
const useHelpdeskV2WayfindingMS1FlagMock = vi.mocked(
    useHelpdeskV2WayfindingMS1Flag,
)

const defaultProps: UserInfoHeaderProps = {
    userName: 'John Doe',
    indicatorColor: 'green',
}

const renderUserInfoHeader = (props?: Partial<UserInfoHeaderProps>) =>
    render(<UserInfoHeader {...defaultProps} {...props} />)

describe('UserInfoHeader', () => {
    let MockAvatar: ReturnType<typeof vi.fn>
    let MockAvatarStatusIndicator: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        vi.clearAllMocks()
        const axiom = await import('@gorgias/axiom')
        MockAvatar = vi.mocked(axiom.Avatar)
        MockAvatarStatusIndicator = vi.mocked(axiom.AvatarStatusIndicator)
    })

    describe('legacy layout (wayfinding MS1 flag off)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
        })

        describe('Avatar props', () => {
            it.each([
                ['Jane Smith', undefined],
                ['John Doe', 'https://example.com/avatar.jpg'],
                ['Test User', ''],
            ] as const)(
                'should pass name=%s and url=%s with size "lg"',
                (userName, avatarUrl) => {
                    renderUserInfoHeader({ userName, avatarUrl })

                    expect(MockAvatar).toHaveBeenCalledWith(
                        expect.objectContaining({
                            name: userName,
                            url: avatarUrl,
                            size: 'lg',
                        }),
                        expect.anything(),
                    )
                },
            )
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

            it('should not render a "View profile" affordance', () => {
                renderUserInfoHeader()

                expect(
                    screen.queryByText('View profile'),
                ).not.toBeInTheDocument()
            })
        })

        describe('Optional props', () => {
            it('should render without status and isOffline props', () => {
                renderUserInfoHeader({
                    userName: 'Test User',
                    indicatorColor: 'green',
                })

                const textElements = screen.getAllByText('Test User')
                expect(textElements.length).toBeGreaterThan(0)
                expect(MockAvatarStatusIndicator).toHaveBeenCalled()
            })

            it('should render without indicatorColor', () => {
                renderUserInfoHeader({
                    userName: 'Test User',
                    indicatorColor: undefined,
                })

                const textElements = screen.getAllByText('Test User')
                expect(textElements.length).toBeGreaterThan(0)
                expect(MockAvatarStatusIndicator).not.toHaveBeenCalled()
            })
        })
    })

    describe('MS1 layout (wayfinding MS1 flag on)', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('renders the Avatar with the compact "sm" size', () => {
            renderUserInfoHeader({
                userName: 'Jane Smith',
                avatarUrl: 'https://example.com/avatar.jpg',
            })

            expect(MockAvatar).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Smith',
                    url: 'https://example.com/avatar.jpg',
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

            // Sanity check — the only textContent elements should be userName + View profile
            expect(screen.queryByText('On a call')).not.toBeInTheDocument()
        })

        it.each([
            ['green', false, 'primary'],
            ['red', true, 'secondary'],
        ] as const)(
            'forwards indicatorColor=%s and isOffline=%s to AvatarStatusIndicator (variant=%s)',
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

        it('does not render the status indicator when indicatorColor is undefined', () => {
            renderUserInfoHeader({ indicatorColor: undefined })

            expect(MockAvatarStatusIndicator).not.toHaveBeenCalled()
        })
    })
})
