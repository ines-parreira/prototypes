import type {
    CustomUserAvailabilityStatus,
    DurationUnit,
} from '@gorgias/helpdesk-queries'

/**
 * Agent status with UI enhancements for table display.
 * Adds is_system flag and custom duration display text.
 */
export type AgentStatusWithSystem = CustomUserAvailabilityStatus & {
    is_system: boolean
    durationDisplay?: string
}

/**
 * Single duration option item
 */
export type DurationOption = {
    name: string
    id: string
    unit: DurationUnit | null
    value: number | null
}
