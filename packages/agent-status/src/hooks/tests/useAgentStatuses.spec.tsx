import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
} from '@gorgias/helpdesk-mocks'

import { useAgentStatuses } from '../useAgentStatuses'

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

describe('useAgentStatuses', () => {
    it('merges system statuses with custom statuses', async () => {
        const customStatuses = [
            mockCustomUserAvailabilityStatus({
                id: '1',
                name: 'Lunch break',
                duration_unit: 'minutes',
                duration_value: 30,
            }),
            mockCustomUserAvailabilityStatus({
                id: '2',
                name: 'Meeting',
                duration_unit: 'hours',
                duration_value: 1,
            }),
        ]

        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: customStatuses,
                }),
        )

        server.use(listStatusesMock.handler)

        const { result } = renderHook(() => useAgentStatuses())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toHaveLength(5)
        expect(result.current.data[0]).toMatchObject({
            name: 'Unavailable',
            is_system: true,
        })
        expect(result.current.data[1]).toMatchObject({
            name: 'On a call',
            is_system: true,
        })
        expect(result.current.data[2]).toMatchObject({
            name: 'Call wrap-up',
            is_system: true,
        })
        expect(result.current.data[3]).toMatchObject({
            ...customStatuses[0],
            is_system: false,
        })
        expect(result.current.data[4]).toMatchObject({
            ...customStatuses[1],
            is_system: false,
        })
    })

    it('returns only system statuses when no custom statuses exist', async () => {
        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                }),
        )

        server.use(listStatusesMock.handler)

        const { result } = renderHook(() => useAgentStatuses())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toHaveLength(3)
        expect(result.current.data.map(({ name }) => name)).toEqual([
            'Unavailable',
            'On a call',
            'Call wrap-up',
        ])
    })

    it('keeps the system statuses available when the request fails', async () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async () =>
                HttpResponse.json(
                    { error: { msg: 'Failed to fetch' } } as never,
                    { status: 500 },
                ),
        )

        server.use(listStatusesMock.handler)

        const { result } = renderHook(() => useAgentStatuses())

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.data.map(({ name }) => name)).toEqual([
            'Unavailable',
            'On a call',
            'Call wrap-up',
        ])

        consoleErrorSpy.mockRestore()
    })

    it.each([
        { returnedStatusCount: 0, expectedHasReachedLimit: false },
        { returnedStatusCount: 24, expectedHasReachedLimit: false },
        { returnedStatusCount: 25, expectedHasReachedLimit: true },
        { returnedStatusCount: 26, expectedHasReachedLimit: true },
    ])(
        'returns $expectedHasReachedLimit when $returnedStatusCount custom statuses exist',
        async ({ returnedStatusCount, expectedHasReachedLimit }) => {
            const customStatuses = Array.from(
                { length: returnedStatusCount },
                (_, index) =>
                    mockCustomUserAvailabilityStatus({
                        id: `${index}`,
                        name: `Status ${index}`,
                        duration_unit: 'minutes',
                        duration_value: 30,
                    }),
            )

            const listStatusesMock =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: customStatuses,
                        }),
                )

            server.use(listStatusesMock.handler)

            const { result } = renderHook(() => useAgentStatuses())

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.hasReachedCreateLimit).toBe(
                expectedHasReachedLimit,
            )
        },
    )
})
