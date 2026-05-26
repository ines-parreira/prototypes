import { assumeMock, renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUser,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useUserStatus } from '../useUserStatus'

vi.mock('@gorgias/realtime')

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })

    const { handler } = mockListUserAvailabilitiesHandler(async () =>
        HttpResponse.json(
            mockListUserAvailabilitiesResponse({
                data: [],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: null,
                },
            }),
        ),
    )
    server.use(handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUserStatus', () => {
    it('returns offline status when the user is not in onlineAgents', () => {
        const { result } = renderHook(() => useUserStatus(1))

        expect(result.current.status).toBe('offline')
    })

    it('returns online status when the user is in onlineAgents', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: mockUser({ id: 1, name: 'Alice' }) },
        })

        const { result } = renderHook(() => useUserStatus(1))

        expect(result.current.status).toBe('online')
    })

    it('returns offline status when userId is undefined', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: mockUser({ id: 1, name: 'Alice' }) },
        })

        const { result } = renderHook(() => useUserStatus(undefined))

        expect(result.current.status).toBe('offline')
    })

    it('exposes availability for the user from the list cache', async () => {
        const availability = mockUserAvailability({
            user_id: 1,
            user_status: 'unavailable',
        })
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [availability],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { result } = renderHook(() => useUserStatus(1))

        await waitFor(() => {
            expect(result.current.availability).toEqual(availability)
        })
    })

    it('returns undefined availability when no entry matches the userId', async () => {
        const otherUserAvailability = mockUserAvailability({ user_id: 2 })
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [otherUserAvailability],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { result } = renderHook(() => useUserStatus(1))

        await waitFor(() => {
            expect(result.current.availability).toBeUndefined()
        })
    })
})
