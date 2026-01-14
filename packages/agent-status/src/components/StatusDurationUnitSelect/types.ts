import type { DurationUnit } from '@gorgias/helpdesk-queries'

/**
 * Props for the StatusDurationUnitSelect component
 */
export type StatusDurationUnitSelectProps = {
    /** Currently selected duration unit */
    value: DurationUnit
    /** Callback when a duration unit changes */
    onChange: (unit: DurationUnit) => void
    /** Error message to display */
    error?: string
}
