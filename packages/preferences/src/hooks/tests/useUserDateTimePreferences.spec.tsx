import { renderHook } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import type { User } from '@gorgias/helpdesk-types'

import { useUserDateTimePreferences } from '../useUserDateTimePreferences'

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
