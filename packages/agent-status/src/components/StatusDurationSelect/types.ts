import type { DurationOption } from '../../types'

export type StatusDurationSelectProps = {
    value: DurationOption
    onChange: (duration: DurationOption) => void
    error?: string
}
