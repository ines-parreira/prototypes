import { createTestQueryClient, renderHook } from '@repo/testing/vitest'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockUserPhoneStatus } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UserPhoneStatus } from '@gorgias/helpdesk-types'

import { useUpdateUserPhoneStatusInCache } from '../useUpdateUserPhoneStatusInCache'

const queryClient = createTestQueryClient()

describe('useUpdateUserPhoneStatusInCache', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    it('should update user phone status in cache', () => {
        const MOCK_USER_ID = 123

        queryClient.setQueryData(
            queryKeys.voiceUserStatus.getUserPhoneStatus(MOCK_USER_ID),
            mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'off-call',
                call_activities: [],
            }),
        )

        const { result } = renderHook(() => useUpdateUserPhoneStatusInCache(), {
            queryClient: queryClient,
        })

        const updateData: UserPhoneStatus = {
            user_id: MOCK_USER_ID,
            phone_status: 'on-call',
            call_activities: [],
        }

        result.current(updateData)

        const updatedData = queryClient.getQueryData(
            queryKeys.voiceUserStatus.getUserPhoneStatus(MOCK_USER_ID),
        )

        expect(updatedData).toEqual({
            data: {
                user_id: MOCK_USER_ID,
                phone_status: 'on-call',
                call_activities: [],
            },
        })
    })

    it('should handle undefined previous data', () => {
        const userId = 999

        const { result } = renderHook(() => useUpdateUserPhoneStatusInCache(), {
            queryClient: queryClient,
        })

        const updateData: UserPhoneStatus = {
            user_id: userId,
            phone_status: 'wrapping-up',
            call_activities: [],
        }

        const updateResult = result.current(updateData)

        expect(updateResult.previousData).toBeUndefined()
        expect(updateResult.newData).toEqual({
            user_id: userId,
            phone_status: 'wrapping-up',
            call_activities: [],
        })

        const updatedData = queryClient.getQueryData<{
            data: UserPhoneStatus
        }>(queryKeys.voiceUserStatus.getUserPhoneStatus(userId))

        expect(updatedData).toEqual({
            data: {
                user_id: userId,
                phone_status: 'wrapping-up',
                call_activities: [],
            },
        })
    })
})
