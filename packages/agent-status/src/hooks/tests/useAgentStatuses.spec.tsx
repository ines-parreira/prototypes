import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as helpdeskQueries from '@gorgias/helpdesk-queries'

import { renderHook } from '../../tests/render.utils'
import { useAgentStatuses } from '../useAgentStatuses'

// Mock the helpdesk queries module
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

describe('useAgentStatuses', () => {
    describe('data merging', () => {
        it('should merge system statuses with custom statuses', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [
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
                        ],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useAgentStatuses())

            expect(result.current.data).toHaveLength(5) // 3 system + 2 custom
        })

        it('should place system statuses first', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [
                            {
                                id: '1',
                                name: 'Custom Status',
                                duration_unit: 'minutes',
                                duration_value: 15,
                                created_datetime: '2024-01-01T00:00:00Z',
                                updated_datetime: '2024-01-01T00:00:00Z',
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useAgentStatuses())

            const statuses = result.current.data

            // First 3 should be system statuses
            expect(statuses[0].name).toBe('Unavailable')
            expect(statuses[0].is_system).toBe(true)
            expect(statuses[1].name).toBe('On a call')
            expect(statuses[1].is_system).toBe(true)
            expect(statuses[2].name).toBe('Call wrap-up')
            expect(statuses[2].is_system).toBe(true)

            // Last one should be custom status
            expect(statuses[3].name).toBe('Custom Status')
            expect(statuses[3].is_system).toBe(false)
        })

        it('should mark custom statuses with is_system: false', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [
                            {
                                id: '1',
                                name: 'Lunch break',
                                duration_unit: 'minutes',
                                duration_value: 30,
                                created_datetime: '2024-01-01T00:00:00Z',
                                updated_datetime: '2024-01-01T00:00:00Z',
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useAgentStatuses())

            const customStatus = result.current.data.find(
                (s) => s.name === 'Lunch break',
            )
            expect(customStatus?.is_system).toBe(false)
        })
    })

    describe('empty state', () => {
        it('should return only system statuses when no custom statuses exist', () => {
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

            const { result } = renderHook(() => useAgentStatuses())

            expect(result.current.data).toHaveLength(3)
            expect(result.current.data[0].name).toBe('Unavailable')
            expect(result.current.data[1].name).toBe('On a call')
            expect(result.current.data[2].name).toBe('Call wrap-up')
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

            const { result } = renderHook(() => useAgentStatuses())

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isLoading: false after data loads', () => {
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

            const { result } = renderHook(() => useAgentStatuses())

            expect(result.current.isLoading).toBe(false)
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

            const { result } = renderHook(() => useAgentStatuses())

            expect(result.current.isError).toBe(true)

            // Should still return system statuses
            expect(result.current.data).toHaveLength(3)
            expect(result.current.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'Unavailable' }),
                    expect.objectContaining({ name: 'On a call' }),
                    expect.objectContaining({ name: 'Call wrap-up' }),
                ]),
            )
        })
    })

    describe('data structure', () => {
        it('should preserve all fields from custom statuses', () => {
            vi.mocked(
                helpdeskQueries.useListCustomUserAvailabilityStatuses,
            ).mockReturnValue({
                data: {
                    data: {
                        data: [
                            {
                                id: '1',
                                name: 'Lunch break',
                                description: 'Taking a lunch break',
                                duration_unit: 'minutes',
                                duration_value: 30,
                                created_datetime: '2024-01-01T00:00:00Z',
                                updated_datetime: '2024-01-02T00:00:00Z',
                            },
                        ],
                    },
                },
                isLoading: false,
                isError: false,
            } as any)

            const { result } = renderHook(() => useAgentStatuses())

            const customStatus = result.current.data.find(
                (s) => s.name === 'Lunch break',
            )

            expect(customStatus).toMatchObject({
                id: '1',
                name: 'Lunch break',
                description: 'Taking a lunch break',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-02T00:00:00Z',
                is_system: false,
            })
        })
    })
})
