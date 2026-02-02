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
 * Validation limits for custom duration values by unit.
 * Backend constraint: duration must be < 1 year (365 days = 8760 hours = 525,600 minutes)
 */
export const DURATION_LIMITS: Record<DurationUnit, DurationMinMaxLimit> = {
    minutes: { min: 1, max: 525599 }, // < 1 year in minutes
    hours: { min: 1, max: 8759 }, // < 1 year in hours
    days: { min: 1, max: 364 }, // < 1 year in days
} as const

/**
 * Available status - agent is available to receive tickets
 */
export const AVAILABLE_STATUS: AgentStatusWithSystem = {
    id: 'available',
    name: 'Available',
    description: 'Available to receive tickets',
    duration_unit: null,
    duration_value: null,
    durationDisplay: 'Until changed',
    is_system: true,
    created_datetime: '1970-01-01T00:00:00.000Z',
    updated_datetime: '1970-01-01T00:00:00.000Z',
}

/**
 * Unavailable status - default unavailable status set manually by each agent
 */
export const UNAVAILABLE_STATUS: AgentStatusWithSystem = {
    id: 'unavailable',
    name: 'Unavailable',
    description: 'Default unavailable status set manually by each agent',
    duration_unit: null,
    duration_value: null,
    durationDisplay: 'Until changed',
    is_system: true,
    created_datetime: '1970-01-01T00:00:00.000Z',
    updated_datetime: '1970-01-01T00:00:00.000Z',
}

/**
 * On a call status - set automatically when agents are on an active call
 */
export const ON_A_CALL_STATUS: AgentStatusWithSystem = {
    id: 'on-a-call',
    name: 'On a call',
    description: 'Set automatically when agents are on an active call',
    duration_unit: null,
    duration_value: null,
    durationDisplay: 'Call duration',
    is_system: true,
    created_datetime: '1970-01-01T00:00:00.000Z',
    updated_datetime: '1970-01-01T00:00:00.000Z',
}

/**
 * Call wrap-up status - set automatically while agents complete post-call wrap-up
 */
export const CALL_WRAP_UP_STATUS: AgentStatusWithSystem = {
    id: 'call-wrap-up',
    name: 'Call wrap-up',
    description: 'Set automatically while agents complete post-call wrap-up',
    duration_unit: null,
    duration_value: null,
    durationDisplay: 'Wrap-up duration',
    is_system: true,
    created_datetime: '1970-01-01T00:00:00.000Z',
    updated_datetime: '1970-01-01T00:00:00.000Z',
}

/**
 * Built-in system statuses (unavailability statuses), always shown first in table.
 * Cannot be edited or deleted. Use fixed timestamps as sentinel values.
 */
export const SYSTEM_STATUSES: readonly AgentStatusWithSystem[] = [
    UNAVAILABLE_STATUS,
    ON_A_CALL_STATUS,
    CALL_WRAP_UP_STATUS,
]

/**
 * Manually selectable statuses for user menu.
 * These can be set by users directly via the status dropdown.
 * Includes both available and unavailable, plus custom statuses.
 */
export const PREDEFINED_SELECTABLE_STATUSES: readonly AgentStatusWithSystem[] =
    [AVAILABLE_STATUS, UNAVAILABLE_STATUS]

/**
 * Form validation constraints (character limits)
 */
export const VALIDATION = {
    NAME_MAX_LENGTH: 30,
    DESCRIPTION_MAX_LENGTH: 70,
} as const

/**
 * Custom unavailability statuses (w/ predefined ones)
 */
export const CUSTOM_UNAVAILABILITY_STATUS_LIMIT = 25
