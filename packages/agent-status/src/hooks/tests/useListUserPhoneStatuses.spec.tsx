import { createTestQueryClient, renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
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
    mockListUserPhoneStatusHandler,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'
import type { UserPhoneStatus } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useListUserPhoneStatuses } from '../useListUserPhoneStatuses'

const queryClient = createTestQueryClient()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    queryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useListUserPhoneStatuses', () => {
    describe('basic functionality', () => {
        it('fetches phone statuses for multiple users', async () => {
            const userIds = [1, 2, 3]
            const mockPhoneStatuses = userIds.map((id) =>
                mockUserPhoneStatus({
                    user_id: id,
                    phone_status: 'on-call',
                }),
            )

            const mockListUserPhoneStatus = mockListUserPhoneStatusHandler(
                async () =>
                    HttpResponse.json({
                        data: mockPhoneStatuses,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 10,
                        },
                        object: 'list',
                        uri: '/api/phone/user-phone-status',
                    }),
            )

            server.use(mockListUserPhoneStatus.handler)

            const { result } = renderHook(
                () => useListUserPhoneStatuses({ userIds }),
                { queryClient },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.isError).toBe(false)
            expect(result.current.data?.data?.data).toEqual(mockPhoneStatuses)
        })

        it('does not fetch when userIds is empty', () => {
            const resolver = vi.fn().mockResolvedValue(HttpResponse.json({}))
            const mockListUserPhoneStatus =
                mockListUserPhoneStatusHandler(resolver)

            server.use(mockListUserPhoneStatus.handler)

            renderHook(() => useListUserPhoneStatuses({ userIds: [] }), {
                queryClient,
            })

            expect(resolver).not.toHaveBeenCalled()
        })

        it('does not fetch when enabled is false', () => {
            const resolver = vi.fn().mockResolvedValue(HttpResponse.json({}))
            const mockListUserPhoneStatus =
                mockListUserPhoneStatusHandler(resolver)

            server.use(mockListUserPhoneStatus.handler)

            renderHook(
                () =>
                    useListUserPhoneStatuses({
                        userIds: [1, 2, 3],
                        enabled: false,
                    }),
                { queryClient },
            )

            expect(resolver).not.toHaveBeenCalled()
        })
    })

    describe('cache population', () => {
        it('populates cache successfully with', async () => {
            const users = [
                {
                    user_id: 1,
                    phone_status: 'on-call',
                },
                {
                    user_id: 2,
                    phone_status: 'wrapping-up',
                },
                {
                    user_id: 3,
                    phone_status: 'off-call',
                },
            ] as const

            const mockPhoneStatuses = users.map((user) =>
                mockUserPhoneStatus(user),
            )

            const mockListUserPhoneStatus = mockListUserPhoneStatusHandler(
                async () =>
                    HttpResponse.json({
                        data: mockPhoneStatuses,
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: mockPhoneStatuses.length,
                        },
                        object: 'list',
                        uri: '/api/phone/user-phone-status',
                    }),
            )

            server.use(mockListUserPhoneStatus.handler)

            renderHook(
                () =>
                    useListUserPhoneStatuses({
                        userIds: Object.keys(users).map(Number),
                    }),
                { queryClient },
            )

            await waitFor(() => {
                users.forEach((user) => {
                    const cache = queryClient.getQueryData(
                        queryKeys.voiceUserStatus.getUserPhoneStatus(
                            user.user_id,
                        ),
                    ) as { data: UserPhoneStatus }
                    expect(cache?.data?.phone_status).toBe(user.phone_status)
                })
            })
        })
    })
})
