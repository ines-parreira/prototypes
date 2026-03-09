import { DateFormatType, TimeFormatType } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import * as helpdeskQueries from '@gorgias/helpdesk-queries'
import type { User } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUserDateTimePreferences } from '../useUserDateTimePreferences'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useGetCurrentUser: vi.fn(),
    }
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    vi.clearAllMocks()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

async function useRealUseGetCurrentUser() {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    vi.mocked(helpdeskQueries.useGetCurrentUser).mockImplementation(
        actual.useGetCurrentUser,
    )
}

function givenCurrentUser(user: User) {
    const handler = mockGetCurrentUserHandler(async () =>
        HttpResponse.json(user),
    )
    server.use(handler.handler)
}

function renderUseUserDateTimePreferences(
    params?: Parameters<typeof useUserDateTimePreferences>[0],
) {
    return renderHook(() => useUserDateTimePreferences(params))
}

const baseUser = {
    id: 1,
    email: 'agent@example.com',
} satisfies Partial<User>

const gb24hPrefs = {
    type: 'preferences',
    data: {
        date_format: DateFormatType.en_GB,
        time_format: TimeFormatType.TwentyFourHour,
    },
}

describe('useUserDateTimePreferences', () => {
    describe('integration', () => {
        beforeEach(async () => {
            await useRealUseGetCurrentUser()
        })

        it.each([
            {
                name: 'fetches and returns user date time preferences',
                userOverrides: {
                    timezone: 'America/New_York',
                    settings: [gb24hPrefs],
                },
                expected: {
                    dateFormat: DateFormatType.en_GB,
                    timeFormat: TimeFormatType.TwentyFourHour,
                    timezone: 'America/New_York',
                },
            },
            {
                name: 'returns defaults when user has no preferences',
                userOverrides: { settings: [] },
                expected: {
                    dateFormat: DateFormatType.en_US,
                    timeFormat: TimeFormatType.AmPm,
                },
            },
            {
                name: 'returns undefined timezone when user has no timezone',
                userOverrides: { settings: [] },
                expected: {
                    timezone: undefined,
                },
            },
        ])('$name', async ({ userOverrides, expected }) => {
            givenCurrentUser(
                mockUser({ ...baseUser, ...userOverrides } as User),
            )

            const { result } = renderUseUserDateTimePreferences({})

            await waitFor(() => {
                expect(result.current).toMatchObject(expected)
            })
        })
    })
})
