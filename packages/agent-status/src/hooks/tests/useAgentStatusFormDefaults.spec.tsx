import { describe, expect, it } from 'vitest'

import { DURATION_OPTIONS } from '../../constants'
import { renderHook } from '../../tests/render.utils'
import type { AgentStatusWithSystem } from '../../types'
import { useAgentStatusFormDefaults } from '../useAgentStatusFormDefaults'

describe('useAgentStatusFormDefaults', () => {
    describe('Create mode (no status)', () => {
        it('should return default values for create mode', () => {
            const { result } = renderHook(() => useAgentStatusFormDefaults())

            expect(result.current).toEqual({
                statusName: '',
                description: '',
                durationOption: DURATION_OPTIONS[0],
                customDurationValue: 1,
                customDurationUnit: 'hours',
            })
        })

        it('should return unlimited as default duration option', () => {
            const { result } = renderHook(() => useAgentStatusFormDefaults())

            expect(result.current.durationOption).toEqual(DURATION_OPTIONS[0])
            expect(result.current.durationOption.id).toBe('unlimited')
        })
    })

    describe('Edit mode (with status)', () => {
        it('should return values from status', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Lunch Break',
                description: 'Taking lunch',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.statusName).toBe('Lunch Break')
            expect(result.current.description).toBe('Taking lunch')
            expect(result.current.customDurationValue).toBe(30)
            expect(result.current.customDurationUnit).toBe('minutes')
        })

        it('should find correct preset duration option', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Short Break',
                description: '',
                duration_unit: 'minutes',
                duration_value: 30,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.durationOption.id).toBe('30-minutes')
            expect(result.current.durationOption.unit).toBe('minutes')
            expect(result.current.durationOption.value).toBe(30)
        })

        it('should use custom option for non-preset durations', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Custom Break',
                description: '',
                duration_unit: 'minutes',
                duration_value: 45,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.durationOption.id).toBe('custom')
            expect(result.current.customDurationValue).toBe(45)
            expect(result.current.customDurationUnit).toBe('minutes')
        })

        it('should handle unlimited duration (null values)', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Unlimited Status',
                description: '',
                duration_unit: null,
                duration_value: null,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.durationOption.id).toBe('unlimited')
            expect(result.current.durationOption.unit).toBe(null)
            expect(result.current.durationOption.value).toBe(null)
        })

        it('should handle status without description', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Meeting',
                description: undefined,
                duration_unit: 'hours',
                duration_value: 1,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.description).toBe('')
        })

        it('should default to hours and 1 when duration values are null', () => {
            const status: AgentStatusWithSystem = {
                id: '123',
                name: 'Status',
                description: '',
                duration_unit: null,
                duration_value: null,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                is_system: false,
            }

            const { result } = renderHook(() =>
                useAgentStatusFormDefaults(status),
            )

            expect(result.current.customDurationValue).toBe(1)
            expect(result.current.customDurationUnit).toBe('hours')
        })
    })
})
