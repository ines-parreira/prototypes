import { DateFormatType, TimeFormatType } from '@repo/utils'
import { HttpResponse } from 'msw'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import type { User } from '@gorgias/helpdesk-types'

type CurrentUserOverrides = Partial<User> & {
    settings?: Array<{
        type: string
        data: {
            date_format?: DateFormatType
            time_format?: TimeFormatType
        }
    }>
}

const defaultCurrentUser = {
    id: 1,
    email: 'agent@example.com',
    timezone: 'UTC',
    settings: [
        {
            type: 'preferences',
            data: {
                date_format: DateFormatType.en_US,
                time_format: TimeFormatType.AmPm,
            },
        },
    ],
} satisfies CurrentUserOverrides

export function getCurrentUserHandler(overrides: CurrentUserOverrides = {}) {
    return mockGetCurrentUserHandler(async () =>
        HttpResponse.json(
            mockUser({
                ...defaultCurrentUser,
                ...overrides,
            } as User),
        ),
    )
}
