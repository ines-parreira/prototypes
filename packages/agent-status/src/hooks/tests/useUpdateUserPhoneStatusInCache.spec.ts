import { beforeEach, describe, expect, it } from 'vitest'

import { mockUserPhoneStatus } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { UserPhoneStatus } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUpdateUserPhoneStatusInCache } from '../useUpdateUserPhoneStatusInCache'

describe('useUpdateUserPhoneStatusInCache', () => {
    beforeEach(() => {
        testAppQueryClient.clear()
    })

    it('should update user phone status in cache', () => {
        const MOCK_USER_ID = 123

        testAppQueryClient.setQueryData(
            queryKeys.voiceUserStatus.getUserPhoneStatus(MOCK_USER_ID),
            mockUserPhoneStatus({
                user_id: MOCK_USER_ID,
                phone_status: 'off-call',
                call_activities: [],
            }),
        )

        const { result } = renderHook(() => useUpdateUserPhoneStatusInCache())

        const updateData: UserPhoneStatus = {
            user_id: MOCK_USER_ID,
            phone_status: 'on-call',
            call_activities: [],
        }

        result.current(updateData)

        const updatedData = testAppQueryClient.getQueryData(
            queryKeys.voiceUserStatus.getUserPhoneStatus(MOCK_USER_ID),
        )

        expect(updatedData).toEqual({
            user_id: MOCK_USER_ID,
            phone_status: 'on-call',
            call_activities: [],
        })
    })

    it('should handle undefined previous data', () => {
        const userId = 999

        const { result } = renderHook(() => useUpdateUserPhoneStatusInCache())

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

        const updatedData = testAppQueryClient.getQueryData<{
            data: UserPhoneStatus
        }>(queryKeys.voiceUserStatus.getUserPhoneStatus(userId))

        expect(updatedData).toEqual({
            user_id: userId,
            phone_status: 'wrapping-up',
            call_activities: [],
        })
    })
})
