import type { DurationOption } from '../../types'

/**
 * Props for the StatusDurationSelect component
 */
export type StatusDurationSelectProps = {
    /** Currently selected duration value */
    value: DurationOption
    /** Callback when a duration value changes */
    onChange: (duration: DurationOption) => void
    /** Error message to display */
    error?: string
    /** Optional aria-label for accessibility */
    'aria-label'?: string
}
