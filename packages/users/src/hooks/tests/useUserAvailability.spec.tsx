import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useUserAvailability } from '../useUserAvailability'

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

const seedList = () =>
    mockListUserAvailabilitiesHandler(async () =>
        HttpResponse.json(
            mockListUserAvailabilitiesResponse({
                data: [
                    mockUserAvailability({
                        user_id: 1,
                        user_status: 'available',
                    }),
                    mockUserAvailability({
                        user_id: 2,
                        user_status: 'custom',
                        custom_user_availability_status_id: 'lunch',
                    }),
                ],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: 2,
                },
            }),
        ),
    ).handler

describe('useUserAvailability', () => {
    it('returns the matching availability payload from the list', async () => {
        server.use(seedList())

        const { result } = renderHook(() => useUserAvailability(2))

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    user_id: 2,
                    user_status: 'custom',
                    custom_user_availability_status_id: 'lunch',
                }),
            )
        })
    })

    it('returns undefined when no availability matches the user', async () => {
        server.use(seedList())

        const { result } = renderHook(() => useUserAvailability(999))

        await waitFor(() => {
            expect(result.current).toBeUndefined()
        })
    })

    it('returns undefined when userId is undefined', async () => {
        server.use(seedList())

        const { result } = renderHook(() => useUserAvailability(undefined))

        expect(result.current).toBeUndefined()
    })
})
