import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockGetUserAvailabilityHandler,
    mockUpdateUserAvailabilityHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useUpdateUserAvailabilityStatus } from '../useUpdateUserAvailabilityStatus'
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

describe('useUpdateUserAvailabilityStatus', () => {
    const userId = 123

    it('updates availability status to available', async () => {
        const mockUpdatedAvailability = mockUserAvailability({
            user_id: userId,
            user_status: 'available',
        })

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () => HttpResponse.json(mockUpdatedAvailability),
        )

        server.use(mockUpdateUserAvailability.handler)

        const { result } = renderHook(() => useUpdateUserAvailabilityStatus())

        await result.current.updateStatusAsync(userId, 'available')

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.data).toEqual(mockUpdatedAvailability)
    })

    it('updates availability status to unavailable', async () => {
        const mockUpdatedAvailability = mockUserAvailability({
            user_id: userId,
            user_status: 'unavailable',
        })

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () => HttpResponse.json(mockUpdatedAvailability),
        )

        server.use(mockUpdateUserAvailability.handler)

        const { result } = renderHook(() => useUpdateUserAvailabilityStatus())

        await result.current.updateStatusAsync(userId, 'unavailable')

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.data).toEqual(mockUpdatedAvailability)
    })

    it('updates availability status to custom status', async () => {
        const customStatusId = 'custom-123'
        const mockUpdatedAvailability = mockUserAvailability({
            user_id: userId,
            user_status: 'custom',
            custom_user_availability_status_id: customStatusId,
        })

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () => HttpResponse.json(mockUpdatedAvailability),
        )

        server.use(mockUpdateUserAvailability.handler)

        const { result } = renderHook(() => useUpdateUserAvailabilityStatus())

        await result.current.updateStatusAsync(userId, customStatusId)

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data?.data).toEqual(mockUpdatedAvailability)
        expect(
            result.current.data?.data.custom_user_availability_status_id,
        ).toBe(customStatusId)
    })

    it('handles API errors', async () => {
        const initialAvailability = mockUserAvailability({
            user_id: userId,
            user_status: 'unavailable',
        })
        const mockGetUserAvailability = mockGetUserAvailabilityHandler(
            async () => HttpResponse.json(initialAvailability),
        )

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () =>
                HttpResponse.json(
                    {
                        error: { msg: 'Failed to update status' },
                    } as any,
                    { status: 500 },
                ),
        )

        server.use(
            mockGetUserAvailability.handler,
            mockUpdateUserAvailability.handler,
        )

        const { result } = renderHook(() => {
            const mutation = useUpdateUserAvailabilityStatus()
            const availability = useUserAvailability({ userId })

            return {
                mutation,
                availability,
            }
        })

        await waitFor(() => {
            expect(result.current.availability.availability).toEqual(
                initialAvailability,
            )
        })

        await expect(
            result.current.mutation.updateStatusAsync(userId, 'available'),
        ).rejects.toThrow()

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true)
        })

        expect(result.current.mutation.error).toBeTruthy()
        expect(result.current.availability.availability).toEqual(
            initialAvailability,
        )
    })
})
