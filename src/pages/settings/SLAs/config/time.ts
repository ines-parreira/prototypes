import {CreateSlaPolicyBodyMetricsItemUnit} from '@gorgias/api-types'

export const timeUnits = {
    second: {
        label: 'Seconds',
        value: CreateSlaPolicyBodyMetricsItemUnit.Second,
    },
    minute: {
        label: 'Minutes',
        value: CreateSlaPolicyBodyMetricsItemUnit.Minute,
    },
    hour: {label: 'Hours', value: CreateSlaPolicyBodyMetricsItemUnit.Hour},
    day: {label: 'Days', value: CreateSlaPolicyBodyMetricsItemUnit.Day},
}
