import { SLAPolicyMetricUnit } from '@gorgias/api-types'

export const timeUnits = {
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
