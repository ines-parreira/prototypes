import { beforeEach, describe, expect, it } from 'vitest'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    GetUserAvailabilityResult,
    UserAvailabilityDetail,
} from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useUpdateUserAvailabilityInCache } from '../useUpdateUserAvailabilityInCache'

describe('useUpdateUserAvailabilityInCache', () => {
    beforeEach(() => {
        testAppQueryClient.clear()
    })

    it('should update user availability in cache', () => {
        const MOCK_USER_ID = 123

        testAppQueryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(MOCK_USER_ID),
            {
                data: {
                    user_id: MOCK_USER_ID,
                    user_status: 'available',
                    custom_user_availability_status_id: null,
                },
            },
        )

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        const updateData: UserAvailabilityDetail = {
            user_id: MOCK_USER_ID,
            user_status: 'unavailable',
        } as UserAvailabilityDetail

        result.current(updateData)

        const updatedData =
            testAppQueryClient.getQueryData<GetUserAvailabilityResult>(
                queryKeys.userAvailability.getUserAvailability(MOCK_USER_ID),
            )

        expect(updatedData).toEqual({
            data: {
                user_id: MOCK_USER_ID,
                user_status: 'unavailable',
            },
        })
    })

    it('should preserve top-level fields while updating status data', () => {
        const userId = 456

        testAppQueryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
            {
                data: {
                    user_id: userId,
                    user_status: 'available',
                    custom_user_availability_status_id: null,
                },
                meta: { timestamp: 123 },
            },
        )

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        const updateData: UserAvailabilityDetail = {
            user_id: userId,
            user_status: 'custom',
            custom_user_availability_status_id: 'custom-123',
        } as UserAvailabilityDetail

        result.current(updateData)

        const updatedData =
            testAppQueryClient.getQueryData<GetUserAvailabilityResult>(
                queryKeys.userAvailability.getUserAvailability(userId),
            )

        expect(updatedData).toEqual({
            data: {
                user_id: userId,
                user_status: 'custom',
                custom_user_availability_status_id: 'custom-123',
            },
            meta: { timestamp: 123 },
        })
    })

    it('should return both previous and new data', () => {
        const userId = 789

        testAppQueryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
            {
                data: {
                    user_id: userId,
                    user_status: 'available',
                },
            },
        )

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        const updateData: UserAvailabilityDetail = {
            user_id: userId,
            user_status: 'unavailable',
        } as UserAvailabilityDetail

        const updateResult = result.current(updateData)

        expect(updateResult.previousData).toEqual({
            data: {
                user_id: userId,
                user_status: 'available',
            },
        })
        expect(updateResult.newData).toEqual({
            data: {
                user_id: userId,
                user_status: 'unavailable',
            },
        })
    })

    it('should handle undefined previous data', () => {
        const userId = 999

        const { result } = renderHook(() => useUpdateUserAvailabilityInCache())

        const updateData: UserAvailabilityDetail = {
            user_id: userId,
            user_status: 'available',
        } as UserAvailabilityDetail

        const updateResult = result.current(updateData)

        expect(updateResult.previousData).toBeUndefined()
        expect(updateResult.newData).toEqual({
            data: {
                user_id: userId,
                user_status: 'available',
            },
        })

        const updatedData =
            testAppQueryClient.getQueryData<GetUserAvailabilityResult>(
                queryKeys.userAvailability.getUserAvailability(userId),
            )

        expect(updatedData).toEqual({
            data: {
                user_id: userId,
                user_status: 'available',
            },
        })
    })
})
