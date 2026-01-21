import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { render } from '../../tests/render.utils'
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
})
