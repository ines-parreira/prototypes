import { render } from '@repo/testing/vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockGetCurrentUserHandler,
    mockGetUserAvailabilityHandler,
    mockUser,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import type { User } from '@gorgias/helpdesk-types'

import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../../constants'
import * as hooks from '../../hooks'
import type { UserInfoHeaderProps } from './UserInfoHeader'
import { UserInfoHeaderContainer } from './UserInfoHeaderContainer'

vi.mock('../../hooks', async () => {
    const actual = await vi.importActual<typeof hooks>('../../hooks')
    return {
        ...actual,
        useUserAvailabilityExpirationTime: vi.fn(),
        useCustomUserUnavailabilityStatus: vi.fn(),
    }
})

vi.mock('./UserInfoHeader', () => ({
    UserInfoHeader: vi.fn((props: UserInfoHeaderProps) => (
        <div data-testid="user-info-header">
            <span data-testid="user-id">{String(props.user?.id)}</span>
            <span data-testid="user-name">{props.userName}</span>
            <span data-testid="status-text">{props.statusText}</span>
        </div>
    )),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function givenCurrentUser(overrides: Partial<User> = {}) {
    server.use(
        mockGetCurrentUserHandler(async () =>
            HttpResponse.json(
                mockUser({
                    id: 1,
                    email: 'user@example.com',
                    firstname: 'John',
                    lastname: 'Doe',
                    ...overrides,
                } as User),
            ),
        ).handler,
    )
}

function givenUserAvailability(
    overrides: Partial<ReturnType<typeof mockUserAvailability>> = {},
) {
    server.use(
        mockGetUserAvailabilityHandler(async () =>
            HttpResponse.json(
                mockUserAvailability({
                    user_status: 'available',
                    ...overrides,
                }),
            ),
        ).handler,
    )
}

describe('UserInfoHeaderContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        givenCurrentUser()
        givenUserAvailability()
        vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
            undefined,
        )
        vi.mocked(hooks.useCustomUserUnavailabilityStatus).mockReturnValue(
            undefined,
        )
    })

    describe('Loading states', () => {
        it('should return null while the current user is loading', () => {
            server.use(
                mockGetCurrentUserHandler(() => new Promise(() => undefined))
                    .handler,
            )

            const { container } = render(<UserInfoHeaderContainer />)

            expect(container.firstChild).toBeNull()
        })

        it('should return null when the current user cannot be loaded', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json({} as User, { status: 500 }),
                ).handler,
            )

            const { container } = render(<UserInfoHeaderContainer />)

            await waitFor(() => {
                expect(container.firstChild).toBeNull()
            })
        })
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
            async (firstname, lastname, expectedName) => {
                givenCurrentUser({
                    email: expectedName.includes('@')
                        ? expectedName
                        : 'user@example.com',
                    firstname: firstname as any,
                    lastname: lastname as any,
                })

                render(<UserInfoHeaderContainer />)

                expect(
                    await screen.findByText(expectedName),
                ).toBeInTheDocument()
            },
        )
    })

    describe('User forwarded to UserInfoHeader', () => {
        it('passes the current user object through to UserInfoHeader', async () => {
            givenCurrentUser({ id: 42 })

            render(<UserInfoHeaderContainer />)

            expect(await screen.findByTestId('user-id')).toHaveTextContent('42')
        })
    })

    describe('Status text', () => {
        beforeEach(() => {
            givenCurrentUser()
            givenUserAvailability()
        })

        it('should display phone unavailability status text when present', async () => {
            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={ON_A_CALL_STATUS}
                />,
            )

            expect(await screen.findByTestId('status-text')).toHaveTextContent(
                'On a call',
            )
        })

        it('should display call wrap-up status text', async () => {
            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={CALL_WRAP_UP_STATUS}
                />,
            )

            expect(await screen.findByTestId('status-text')).toHaveTextContent(
                'Call wrap-up',
            )
        })

        it('should display custom status name with expiration time when no phone unavailability status', async () => {
            givenUserAvailability({
                user_status: 'custom',
                custom_user_availability_status_expires_datetime:
                    '2026-01-30T14:30:00Z',
            })
            vi.mocked(hooks.useCustomUserUnavailabilityStatus).mockReturnValue({
                id: 'custom',
                name: 'In a meeting',
                is_system: false,
            } as any)
            vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
                '2:30pm',
            )

            render(<UserInfoHeaderContainer />)

            expect(await screen.findByTestId('status-text')).toHaveTextContent(
                'In a meeting until 2:30pm',
            )
        })

        it('should display "Available" when user is available and no phone status', async () => {
            givenUserAvailability({ user_status: 'available' })

            render(<UserInfoHeaderContainer />)

            await waitFor(() => {
                expect(screen.getByTestId('status-text')).toHaveTextContent(
                    'Available',
                )
            })
        })

        it('should display "Unavailable" when user is unavailable and no phone status', async () => {
            givenUserAvailability({ user_status: 'unavailable' })

            render(<UserInfoHeaderContainer />)

            await waitFor(() => {
                expect(screen.getByTestId('status-text')).toHaveTextContent(
                    'Unavailable',
                )
            })
        })

        it('should display custom status name without expiration time when no expires datetime', async () => {
            givenUserAvailability({ user_status: 'custom' })
            vi.mocked(hooks.useCustomUserUnavailabilityStatus).mockReturnValue({
                id: 'custom',
                name: 'In a meeting',
                is_system: false,
            } as any)
            vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
                undefined,
            )

            render(<UserInfoHeaderContainer />)

            expect(await screen.findByTestId('status-text')).toHaveTextContent(
                'In a meeting',
            )
        })

        it('should prioritize phone status over user availability status text', async () => {
            givenUserAvailability({
                user_status: 'custom',
                custom_user_availability_status_expires_datetime:
                    '2026-01-30T14:30:00Z',
            })
            vi.mocked(hooks.useCustomUserUnavailabilityStatus).mockReturnValue({
                id: 'custom',
                name: 'In a meeting',
                is_system: false,
            } as any)
            vi.mocked(hooks.useUserAvailabilityExpirationTime).mockReturnValue(
                '2:30pm',
            )

            render(
                <UserInfoHeaderContainer
                    agentPhoneUnavailabilityStatus={ON_A_CALL_STATUS}
                />,
            )

            expect(await screen.findByTestId('status-text')).toHaveTextContent(
                'On a call',
            )
        })

        it('should call useUserAvailabilityExpirationTime with expires datetime', async () => {
            const expiresAt = '2026-01-30T14:30:00Z'
            givenUserAvailability({
                user_status: 'custom',
                custom_user_availability_status_expires_datetime: expiresAt,
            })

            render(<UserInfoHeaderContainer />)

            await waitFor(() => {
                expect(
                    hooks.useUserAvailabilityExpirationTime,
                ).toHaveBeenCalledWith(expiresAt)
            })
        })
    })
})
