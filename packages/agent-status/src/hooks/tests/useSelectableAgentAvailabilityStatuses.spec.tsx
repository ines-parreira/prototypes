import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import {
    AVAILABLE_STATUS,
    PREDEFINED_SELECTABLE_STATUSES,
    UNAVAILABLE_STATUS,
} from '../../constants'
import { renderHook } from '../../tests/render.utils'
import { useSelectableAgentAvailabilityStatuses } from '../useSelectableAgentAvailabilityStatuses'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof helpdeskQueries>(
        '@gorgias/helpdesk-queries',
    )
    return {
        ...actual,
        useListCustomUserAvailabilityStatuses: vi.fn(),
    }
})

beforeEach(() => {
    vi.clearAllMocks()
})

describe('useSelectableAgentAvailabilityStatuses', () => {
    describe('data merging', () => {
        it('should merge selectable system statuses with custom statuses', () => {
            const customStatuses = [
                {
                    id: '1',
                    name: 'Lunch break',
                    duration_unit: 'minutes',
                    duration_value: 30,
                    created_datetime: '2024-01-01T00:00:00Z',
                    updated_datetime: '2024-01-01T00:00:00Z',
                },
                {
                    id: '2',
                    name: 'Meeting',
                    duration_unit: 'hours',
                    duration_value: 1,
                    created_datetime: '2024-01-02T00:00:00Z',
                    updated_datetime: '2024-01-02T00:00:00Z',
                },
            ]

            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: customStatuses,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

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
        it('should return only selectable system statuses when no custom statuses exist', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

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
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
            } as any)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('error state', () => {
        it('should handle API errors gracefully', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            } as any)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

            expect(result.current.isError).toBe(true)

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
        it('should preserve all fields from custom statuses', () => {
            const customStatus = {
                id: '1',
                name: 'Lunch break',
                description: 'Taking a lunch break',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
            }
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [customStatus],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() =>
                useSelectableAgentAvailabilityStatuses(),
            )

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
