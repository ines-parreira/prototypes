import { DateFormatType, TimeFormatType } from '@repo/utils'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import type { User } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
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

describe('useUserDateTimePreferences', () => {
    it('should return default values when user has no settings', async () => {
        const user = mockUser({
            id: 1,
            email: 'agent@example.com',
            settings: [],
        } as User)

        const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(user),
        )

        server.use(mockGetCurrentUser.handler)

        const { result } = renderHook(() => useUserDateTimePreferences())

        await waitFor(() => {
            expect(result.current.dateFormat).toBe(DateFormatType.en_US)
            expect(result.current.timeFormat).toBe(TimeFormatType.AmPm)
        })
    })

    it('should return user preferences when available', async () => {
        const user = mockUser({
            id: 1,
            email: 'agent@example.com',
            settings: [
                {
                    type: 'preferences',
                    data: {
                        date_format: DateFormatType.en_GB,
                        time_format: TimeFormatType.TwentyFourHour,
                    },
                },
            ],
        } as User)

        const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
            HttpResponse.json(user),
        )

        server.use(mockGetCurrentUser.handler)

        const { result } = renderHook(() => useUserDateTimePreferences())

        await waitFor(() => {
            expect(result.current.dateFormat).toBe(DateFormatType.en_GB)
            expect(result.current.timeFormat).toBe(
                TimeFormatType.TwentyFourHour,
            )
        })
    })
})
