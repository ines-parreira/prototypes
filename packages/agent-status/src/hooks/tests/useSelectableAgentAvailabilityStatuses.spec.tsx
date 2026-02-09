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
} from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
} from '@gorgias/helpdesk-mocks'

import {
    AVAILABLE_STATUS,
    PREDEFINED_SELECTABLE_STATUSES,
    UNAVAILABLE_STATUS,
} from '../../constants'
import { renderHook, testAppQueryClient } from '../../tests/render.utils'
import { useSelectableAgentAvailabilityStatuses } from '../useSelectableAgentAvailabilityStatuses'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSelectableAgentAvailabilityStatuses', () => {
    describe('data merging', () => {
        it('should merge selectable system statuses with custom statuses', async () => {
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

            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: customStatuses,
                        }),
                )

            server.use(mockListStatuses.handler)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            const allStatuses = result.current.allStatuses
            expect(allStatuses).toHaveLength(
                PREDEFINED_SELECTABLE_STATUSES.length + customStatuses.length,
            )

            // Verify selectable system statuses are present and placed first
            expect(allStatuses[0]).toMatchObject(AVAILABLE_STATUS)
            expect(allStatuses[1]).toMatchObject(UNAVAILABLE_STATUS)

            // Verify custom statuses are present
            expect(allStatuses[2].name).toBe('Lunch break')
            expect(allStatuses[2].is_system).toBe(false)
            expect(allStatuses[3].name).toBe('Meeting')
            expect(allStatuses[3].is_system).toBe(false)
        })
    })

    describe('empty state', () => {
        it('should return only selectable system statuses when no custom statuses exist', async () => {
            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [],
                        }),
                )

            server.use(mockListStatuses.handler)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.allStatuses).toHaveLength(
                PREDEFINED_SELECTABLE_STATUSES.length,
            )
            expect(result.current.allStatuses[0]).toMatchObject(
                AVAILABLE_STATUS,
            )
            expect(result.current.allStatuses[1]).toMatchObject(
                UNAVAILABLE_STATUS,
            )
        })
    })

    describe('loading state', () => {
        it('should return isLoading: true when data is loading', () => {
            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler()

            server.use(mockListStatuses.handler)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('error state', () => {
        it('should handle API errors gracefully', async () => {
            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Failed to fetch' } } as any,
                        { status: 500 },
                    ),
                )

            server.use(mockListStatuses.handler)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            // Should still return selectable system statuses
            expect(result.current.allStatuses).toHaveLength(
                PREDEFINED_SELECTABLE_STATUSES.length,
            )
            expect(result.current.allStatuses[0]).toMatchObject(
                AVAILABLE_STATUS,
            )
            expect(result.current.allStatuses[1]).toMatchObject(
                UNAVAILABLE_STATUS,
            )
        })
    })

    describe('data structure', () => {
        it('should preserve all fields from custom statuses', async () => {
            const customStatus = mockCustomUserAvailabilityStatus({
                id: '1',
                name: 'Lunch break',
                duration_unit: 'minutes',
                duration_value: 30,
            })

            const mockListStatuses =
                mockListCustomUserAvailabilityStatusesHandler(
                    async ({ data }) =>
                        HttpResponse.json({
                            ...data,
                            data: [customStatus],
                        }),
                )

            server.use(mockListStatuses.handler)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            const customStatusFinal = result.current.allStatuses.find(
                (s) => s.name === 'Lunch break',
            )

            expect(customStatusFinal).toMatchObject({
                ...customStatus,
                is_system: false,
            })
        })
    })
})
