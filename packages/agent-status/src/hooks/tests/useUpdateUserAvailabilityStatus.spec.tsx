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
    mockUpdateUserAvailabilityHandler,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { useUpdateUserAvailabilityStatus } from '../useUpdateUserAvailabilityStatus'

const queryClient = createTestQueryClient()

const renderUseUpdateUserAvailabilityStatus = (
    callback = useUpdateUserAvailabilityStatus,
) => {
    return renderHook(callback, { queryClient })
}

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useUpdateUserAvailability: vi.fn(),
    }
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    queryClient.clear()
    vi.clearAllMocks()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUpdateUserAvailabilityStatus', () => {
    const userId = 123

    beforeEach(async () => {
        const actual = await vi.importActual<typeof helpdeskQueries>(
            '@gorgias/helpdesk-queries',
        )
        vi.mocked(helpdeskQueries.useUpdateUserAvailability).mockImplementation(
            actual.useUpdateUserAvailability,
        )
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('updates availability status to available', async () => {
        const mockUpdatedAvailability = mockUserAvailability({
            user_id: userId,
            user_status: 'available',
        })

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () => HttpResponse.json(mockUpdatedAvailability),
        )

        server.use(mockUpdateUserAvailability.handler)

        const { result } = renderUseUpdateUserAvailabilityStatus()

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

        const { result } = renderUseUpdateUserAvailabilityStatus()

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

        const { result } = renderUseUpdateUserAvailabilityStatus()

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

        const queryKey =
            helpdeskQueries.queryKeys.userAvailability.getUserAvailability(
                userId,
            )
        queryClient.setQueryData(queryKey, { data: initialAvailability })

        const mockUpdateUserAvailability = mockUpdateUserAvailabilityHandler(
            async () =>
                HttpResponse.json(
                    {
                        error: { msg: 'Failed to update status' },
                    } as any,
                    { status: 500 },
                ),
        )

        server.use(mockUpdateUserAvailability.handler)

        const { result } = renderUseUpdateUserAvailabilityStatus()

        await expect(
            result.current.updateStatusAsync(userId, 'available'),
        ).rejects.toThrow()

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toBeTruthy()

        const cacheData = queryClient.getQueryData(queryKey) as {
            data: typeof initialAvailability
        }
        expect(cacheData?.data).toEqual(initialAvailability)
    })
})
