import type { DurationUnit } from '@gorgias/helpdesk-queries'

import type {
    AgentStatusWithSystem,
    DurationMinMaxLimit,
    DurationOption,
    DurationUnitOption,
} from './types'

/**
 * Duration options for dropdown using new format (unit + value).
 * For unlimited duration, both unit and value are null.
 */
export const DURATION_OPTIONS: DurationOption[] = [
    {
        name: 'Unlimited',
        id: 'unlimited',
        unit: null,
        value: null,
    },
    {
        name: '15 minutes',
        id: '15-minutes',
        unit: 'minutes',
        value: 15,
    },
    {
        name: '30 minutes',
        id: '30-minutes',
        unit: 'minutes',
        value: 30,
    },
    {
        name: '1 hour',
        id: '1-hour',
        unit: 'hours',
        value: 1,
    },
    {
        name: '4 hours',
        id: '4-hours',
        unit: 'hours',
        value: 4,
    },
    {
        name: 'Custom',
        id: 'custom',
        unit: null,
        value: null,
    },
]

/**
 * Duration unit options for custom duration selection
 */
export const DURATION_UNIT_OPTIONS: ReadonlyArray<DurationUnitOption> = [
    { id: 'minutes', name: 'Minutes' },
    { id: 'hours', name: 'Hours' },
    { id: 'days', name: 'Days' },
] as const

/**
 * Validation limits for custom duration values by unit
 */
export const DURATION_LIMITS: Record<DurationUnit, DurationMinMaxLimit> = {
    minutes: { min: 1, max: 1440 },
    hours: { min: 1, max: 24 },
    days: { min: 1, max: 30 },
} as const

/**
 * Built-in system statuses, always shown first in table.
 * Cannot be edited or deleted. Use fixed timestamps as sentinel values.
 */
export const SYSTEM_STATUSES: readonly AgentStatusWithSystem[] = [
    {
        id: 'unavailable',
        name: 'Unavailable',
        description: 'Default unavailable status set manually by each agent',
        duration_unit: null,
        duration_value: null,
        durationDisplay: 'Until changed',
        is_system: true,
        created_datetime: '1970-01-01T00:00:00.000Z',
        updated_datetime: '1970-01-01T00:00:00.000Z',
    },
    {
        id: 'on-a-call',
        name: 'On a call',
        description: 'Set automatically when agents are on an active call',
        duration_unit: null,
        duration_value: null,
        durationDisplay: 'Call duration',
        is_system: true,
        created_datetime: '1970-01-01T00:00:00.000Z',
        updated_datetime: '1970-01-01T00:00:00.000Z',
    },
    {
        id: 'call-wrap-up',
        name: 'Call wrap-up',
        description:
            'Set automatically while agents complete post-call wrap-up',
        duration_unit: null,
        duration_value: null,
        durationDisplay: 'Wrap-up duration',
        is_system: true,
        created_datetime: '1970-01-01T00:00:00.000Z',
        updated_datetime: '1970-01-01T00:00:00.000Z',
    },
]

/**
 * Form validation constraints (character limits)
 */
export const VALIDATION = {
    NAME_MAX_LENGTH: 30,
    DESCRIPTION_MAX_LENGTH: 70,
} as const
