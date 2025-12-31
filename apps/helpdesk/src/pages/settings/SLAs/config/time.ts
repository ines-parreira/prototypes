import { SLAPolicyMetricUnit } from '@gorgias/helpdesk-types'

/**
 * @deprecated
 * @date 2025-12-29
 * @type sla-config-form-migration
 */
export const DEPRECATED_timeUnits = {
    second: {
        label: 'Seconds',
        value: SLAPolicyMetricUnit.Second,
    },
    minute: {
        label: 'Minutes',
        value: SLAPolicyMetricUnit.Minute,
    },
    hour: { label: 'Hours', value: SLAPolicyMetricUnit.Hour },
    day: { label: 'Days', value: SLAPolicyMetricUnit.Day },
}

export type TimeUnitOption = {
    id: SLAPolicyMetricUnit
    label: string
}

export const timeUnits: TimeUnitOption[] = [
    { id: SLAPolicyMetricUnit.Second, label: 'Seconds' },
    { id: SLAPolicyMetricUnit.Minute, label: 'Minutes' },
    { id: SLAPolicyMetricUnit.Hour, label: 'Hours' },
    { id: SLAPolicyMetricUnit.Day, label: 'Days' },
]
