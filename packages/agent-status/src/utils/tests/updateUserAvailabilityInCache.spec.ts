import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { patchInfiniteListCache } from '@repo/api-resources'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { updateUserAvailabilityInCache } from '../updateUserAvailabilityInCache'

vi.mock('@repo/api-resources', () => ({
    patchInfiniteListCache: vi.fn(),
}))

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

    it('should call patchInfiniteListCache with the list query key and user id matcher', () => {
        const queryClient = new QueryClient()
        const userId = 123

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'unavailable',
        })

        expect(vi.mocked(patchInfiniteListCache)).toHaveBeenCalledWith({
            queryClient,
            queryKey: queryKeys.userAvailability.listAllUserAvailabilities(),
            match: expect.any(Function),
            patch: expect.any(Function),
        })
    })

    it('should match list cache entries by user_id', () => {
        const queryClient = new QueryClient()
        const userId = 123

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'unavailable',
        })

        const { match } = vi.mocked(patchInfiniteListCache).mock.calls[0][0]

        expect(
            match({
                user_id: userId,
                user_status: 'available',
                updated_datetime: '',
            }),
        ).toBe(true)
        expect(
            match({
                user_id: 999,
                user_status: 'available',
                updated_datetime: '',
            }),
        ).toBe(false)
    })

    it('should patch list cache entry with incoming status fields', () => {
        const queryClient = new QueryClient()
        const userId = 123
        const existing = {
            user_id: userId,
            user_status: 'available' as const,
            updated_datetime: '2024-01-01T00:00:00Z',
            custom_user_availability_status_id: null,
            custom_user_availability_status_expires_datetime: null,
            next_user_status: 'available' as const,
            next_custom_user_availability_status_id: null,
            set_by_user_id: null,
        }

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'custom',
            custom_user_availability_status_id: 'status-42',
            updated_datetime: '2024-06-01T12:00:00Z',
        })

        const { patch } = vi.mocked(patchInfiniteListCache).mock.calls[0][0]

        expect(patch(existing)).toEqual({
            ...existing,
            user_status: 'custom',
            custom_user_availability_status_id: 'status-42',
            updated_datetime: '2024-06-01T12:00:00Z',
        })
    })

    it('should preserve existing list cache fields when incoming detail omits them', () => {
        const queryClient = new QueryClient()
        const userId = 123
        const existing = {
            user_id: userId,
            user_status: 'available' as const,
            updated_datetime: '2024-01-01T00:00:00Z',
            custom_user_availability_status_id: 'old-status',
            custom_user_availability_status_expires_datetime:
                '2024-01-02T00:00:00Z',
            next_user_status: 'available' as const,
            next_custom_user_availability_status_id: null,
            set_by_user_id: 7,
        }

        updateUserAvailabilityInCache(queryClient, {
            user_id: userId,
            user_status: 'unavailable',
        })

        const { patch } = vi.mocked(patchInfiniteListCache).mock.calls[0][0]

        expect(patch(existing)).toEqual({
            ...existing,
            user_status: 'unavailable',
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
