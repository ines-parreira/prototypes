import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../../constants'
import * as hooks from '../../hooks'
import { render } from '../../tests/render.utils'
import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeaderContainer } from './UserInfoHeaderContainer'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetCurrentUser: vi.fn(),
        useGetUserAvailability: vi.fn(),
    }
})

vi.mock('../../hooks', async () => {
    const actual = await vi.importActual<typeof hooks>('../../hooks')
    return {
        ...actual,
        useUserAvailabilityExpirationTime: vi.fn(),
        useAvailabilityStatusColor: vi.fn(),
    }
})

vi.mock('./UserInfoHeader', () => ({
    UserInfoHeader: vi.fn((props: UserInfoHeaderProps) => (
        <div data-testid="user-info-header">
            <span data-testid="user-name">{props.userName}</span>
            <span data-testid="status-text">{props.statusText}</span>
            <span data-testid="indicator-color">{props.indicatorColor}</span>
            <span data-testid="is-offline">{String(props.isOffline)}</span>
        </div>
    )),
}))

describe('UserInfoHeaderContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
            data: {
                data: {
                    user_status: 'available',
                },
            },
        } as any)
        vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
            undefined,
        )
        vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue(undefined)
    })

    describe('Loading states', () => {
        it.each([
            [true, undefined],
            [false, undefined],
        ])(
            'should return null when loading=%s and data=%s',
            (isLoading, data) => {
                vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                    data,
                    isLoading,
                    isError: false,
                } as any)

                const { container } = render(<UserInfoHeaderContainer />)

                expect(container.firstChild).toBeNull()
            },
        )
    })

    describe('User name display', () => {
        it.each([
            ['John', 'Doe', 'John Doe'],
            ['John', '', 'John'],
            ['', 'Doe', 'Doe'],
            ['', '', 'user@example.com'],
            ['  John  ', '  Doe  ', 'John Doe'],
        ] as const)(
            'should display name for firstname=%s, lastname=%s',
            (firstname, lastname, expectedName) => {
                vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                    data: {
                        data: {
                            id: 1,
                            email: expectedName.includes('@')
                                ? expectedName
                                : 'user@example.com',
                            firstname: firstname as any,
                            lastname: lastname as any,
                        },
                    },
                    isLoading: false,
                    isError: false,
                } as any)

                render(<UserInfoHeaderContainer />)

                expect(screen.getByText(expectedName)).toBeInTheDocument()
            },
        )
    })

    describe('Indicator color computation', () => {
        beforeEach(() => {
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        firstname: 'John',
                        lastname: 'Doe',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)
        })

        it('should show red indicator when agent has phone unavailability status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'available',
                    },
                },
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue('red')

            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={CALL_WRAP_UP_STATUS}
                />,
            )

            expect(screen.getByTestId('indicator-color')).toHaveTextContent(
                'red',
            )
        })

        it('should show green indicator when user status is available and no phone status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'available',
                    },
                },
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue('green')

            render(<UserInfoHeaderContainer />)

            expect(screen.getByTestId('indicator-color')).toHaveTextContent(
                'green',
            )
        })

        it('should show orange indicator when user status is unavailable and no phone status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'unavailable',
                    },
                },
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue(
                'orange',
            )

            render(<UserInfoHeaderContainer />)

            expect(screen.getByTestId('indicator-color')).toHaveTextContent(
                'orange',
            )
        })

        it('should show orange indicator when user status is custom', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'custom',
                    },
                },
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue(
                'orange',
            )

            render(<UserInfoHeaderContainer />)

            expect(screen.queryByTestId('indicator-color')).toHaveTextContent(
                'orange',
            )
        })

        it('should not show indicator when no availability data is present', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: undefined,
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue(
                undefined,
            )

            render(<UserInfoHeaderContainer />)

            expect(screen.queryByTestId('indicator-color')).toHaveTextContent(
                '',
            )
            expect(screen.getByTestId('user-name')).toHaveTextContent(
                'John Doe',
            )
        })

        it('should prioritize phone status over user availability status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'available',
                    },
                },
            } as any)
            vi.mocked(hooks.useAvailabilityStatusColor).mockReturnValue('red')

            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={CALL_WRAP_UP_STATUS}
                />,
            )

            expect(screen.getByTestId('indicator-color')).toHaveTextContent(
                'red',
            )
        })
    })

    describe('Status text', () => {
        beforeEach(() => {
            vi.mocked(helpdeskQueries.useGetCurrentUser).mockReturnValue({
                data: {
                    data: {
                        id: 1,
                        email: 'user@example.com',
                        firstname: 'John',
                        lastname: 'Doe',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'available',
                    },
                },
            } as any)
        })

        it('should display phone unavailability status text when present', () => {
            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={ON_A_CALL_STATUS}
                />,
            )

            expect(screen.getByTestId('status-text')).toHaveTextContent(
                'On a call',
            )
        })

        it('should display call wrap-up status text', () => {
            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={CALL_WRAP_UP_STATUS}
                />,
            )

            expect(screen.getByTestId('status-text')).toHaveTextContent(
                'Call wrap-up',
            )
        })

        it('should display expiration time when no phone unavailability status', () => {
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'custom',
                        custom_user_availability_status_expires_datetime:
                            '2026-01-30T14:30:00Z',
                    },
                },
            } as any)
            vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
                '2:30pm',
            )

            render(<UserInfoHeaderContainer />)

            expect(screen.getByTestId('status-text')).toHaveTextContent(
                '2:30pm',
            )
        })

        it('should display undefined when no expiration time and no phone status', () => {
            vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
                undefined,
            )

            render(<UserInfoHeaderContainer />)

            expect(screen.getByTestId('status-text')).toHaveTextContent('')
        })

        it('should call useUserAvailabilityExpirationTime with expires datetime', () => {
            const expiresAt = '2026-01-30T14:30:00Z'
            vi.mocked(helpdeskQueries.useGetUserAvailability).mockReturnValue({
                data: {
                    data: {
                        user_status: 'custom',
                        custom_user_availability_status_expires_datetime:
                            expiresAt,
                    },
                },
            } as any)

            render(<UserInfoHeaderContainer />)

            expect(
                hooks.useUserAvailabilityExpirationTime,
            ).toHaveBeenCalledWith(expiresAt)
        })
    })
})
