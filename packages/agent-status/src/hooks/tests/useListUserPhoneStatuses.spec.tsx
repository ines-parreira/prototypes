import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockListUserPhoneStatusHandler,
    mockUserPhoneStatus,
} from '@gorgias/helpdesk-mocks'

import { useAgentPhoneStatus } from '../useAgentPhoneStatus'
import { useListUserPhoneStatuses } from '../useListUserPhoneStatuses'

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

describe('useListUserPhoneStatuses', () => {
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

            const { result } = renderHook(() => {
                const batch = useListUserPhoneStatuses({
                    userIds: users.map(({ user_id }) => user_id),
                })
                const firstPhoneStatus = useAgentPhoneStatus({
                    userId: 1,
                    cacheOnly: true,
                })
                const secondPhoneStatus = useAgentPhoneStatus({
                    userId: 2,
                    cacheOnly: true,
                })
                const thirdPhoneStatus = useAgentPhoneStatus({
                    userId: 3,
                    cacheOnly: true,
                })

                return {
                    batch,
                    firstPhoneStatus,
                    secondPhoneStatus,
                    thirdPhoneStatus,
                }
            })

            await waitFor(() => {
                expect(result.current.batch.isLoading).toBe(false)
                expect(result.current.firstPhoneStatus.data?.phone_status).toBe(
                    'on-call',
                )
                expect(
                    result.current.secondPhoneStatus.data?.phone_status,
                ).toBe('wrapping-up')
                expect(result.current.thirdPhoneStatus.data?.phone_status).toBe(
                    'off-call',
                )
            })
        })
    })
})
