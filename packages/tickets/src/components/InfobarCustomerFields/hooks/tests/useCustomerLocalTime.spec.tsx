import { DateFormatType, TimeFormatType } from '@repo/utils'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler, mockUser } from '@gorgias/helpdesk-mocks'
import type { TicketCustomer, User } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../../tests/render.utils'
import { useCustomerLocalTime } from '../useCustomerLocalTime'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2025-11-26T12:00:00Z'))
})

afterEach(() => {
    server.resetHandlers()
    vi.useRealTimers()
})

afterAll(() => {
    server.close()
})

const setupUserPreferences = (
    dateFormat: DateFormatType = DateFormatType.en_US,
    timeFormat: TimeFormatType = TimeFormatType.AmPm,
) => {
    const user = mockUser({
        id: 1,
        email: 'agent@example.com',
        settings: [
            {
                type: 'preferences',
                data: {
                    date_format: dateFormat,
                    time_format: timeFormat,
                },
            },
        ],
    } as User)

    const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
        HttpResponse.json(user),
    )

    server.use(mockGetCurrentUser.handler)
}

describe('useCustomerLocalTime', () => {
    it('should return null when timezone offset is not available', async () => {
        setupUserPreferences()

        const customer: Partial<TicketCustomer> = {
            meta: {},
        }

        const { result } = renderHook(() =>
            useCustomerLocalTime(customer as TicketCustomer),
        )

        await act(async () => {
            await waitFor(() => {
                expect(result.current).toBeNull()
            })
        })
    })

    it('should return formatted local time when timezone offset is available', async () => {
        setupUserPreferences(DateFormatType.en_US, TimeFormatType.AmPm)

        const customer: Partial<TicketCustomer> = {
            meta: {
                location_info: {
                    time_zone: {
                        offset: '-05:00',
                    },
                },
            },
        }

        const { result } = renderHook(() =>
            useCustomerLocalTime(customer as TicketCustomer),
        )

        await act(async () => {
            await waitFor(() => {
                // System time is 12:00 UTC, with -05:00 offset it should be 7:00 AM
                expect(result.current).toBe('07:00 AM')
            })
        })
    })
})
