import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { updateUserAvailabilityInCache } from '../updateUserAvailabilityInCache'

describe('updateUserAvailabilityInCache', () => {
    it('should update user availability in cache', () => {
        const queryClient = new QueryClient()
        const userId = 123

        queryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
            {
                data: {
                    user_status: 'available',
                    custom_user_availability_status_id: null,
                },
            },
        )

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'unavailable',
        })

        const updatedData = queryClient.getQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
        )

        expect(updatedData).toEqual({
            data: {
                user_status: 'unavailable',
                custom_user_availability_status_id: undefined,
                user_id: userId,
            },
        })
    })

    it('should preserve top-level fields while updating status data', () => {
        const queryClient = new QueryClient()
        const userId = 456

        queryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
            {
                data: {
                    user_status: 'available',
                    custom_user_availability_status_id: null,
                },
                meta: { timestamp: 123 },
            },
        )

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'custom',
            custom_user_availability_status_id: 'custom-123',
        })

        const updatedData = queryClient.getQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
        )

        expect(updatedData).toEqual({
            data: {
                user_status: 'custom',
                custom_user_availability_status_id: 'custom-123',
                user_id: userId,
            },
            meta: { timestamp: 123 },
        })
    })

    it('should return both previous and new data', () => {
        const queryClient = new QueryClient()
        const userId = 789

        queryClient.setQueryData(
            queryKeys.userAvailability.getUserAvailability(userId),
            {
                data: {
                    user_status: 'available',
                },
            },
        )

        const result = updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'unavailable',
        })

        expect(result.previousData).toEqual({
            data: {
                user_status: 'available',
            },
        })
        expect(result.newData).toEqual({
            data: {
                user_status: 'unavailable',
                custom_user_availability_status_id: undefined,
                user_id: userId,
            },
        })
    })
})
