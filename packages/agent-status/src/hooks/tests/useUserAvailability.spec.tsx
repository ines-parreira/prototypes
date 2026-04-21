import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockGetUserAvailabilityHandler,
    mockUserAvailabilityDetail,
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

describe('useUserAvailability', () => {
    const userId = 123

    describe('availability mapping', () => {
        it('should return availability when user is available', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'available',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('available')
            expect(result.current.activeStatusId).toBe('available')
        })

        it('should return availability when user is unavailable', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'unavailable',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('unavailable')
            expect(result.current.activeStatusId).toBe('unavailable')
        })

        it('should return availability and activeStatusId when user has custom status', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'custom',
                            custom_user_availability_status_id: 'custom-123',
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('custom')
            expect(
                result.current.availability?.custom_user_availability_status_id,
            ).toBe('custom-123')
            expect(result.current.activeStatusId).toBe('custom-123')
        })

        it('should return undefined activeStatusId when availability is custom but no id is present', async () => {
            const mockGetUserAvailability = mockGetUserAvailabilityHandler(
                async () =>
                    HttpResponse.json(
                        mockUserAvailabilityDetail({
                            user_status: 'custom',
                            custom_user_availability_status_id: undefined,
                        }),
                    ),
            )
            server.use(mockGetUserAvailability.handler)

            const { result } = renderHook(() => useUserAvailability({ userId }))

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.availability?.user_status).toBe('custom')
            expect(
                result.current.availability?.custom_user_availability_status_id,
            ).toBeUndefined()
            expect(result.current.activeStatusId).toBeUndefined()
        })
    })
})
