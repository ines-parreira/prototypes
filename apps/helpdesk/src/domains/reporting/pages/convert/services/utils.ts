import { get } from '@gorgias/toolkit'
import type { CubeMetric } from 'domains/reporting/pages/convert/clients/types'

const hasOwnProperty = (object: object, key: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(object, key)

const getMetricRawValue = (
    data: CubeMetric | undefined,
    metricName: string,
    defaultValue: string,
): string => {
    if (data && hasOwnProperty(data, metricName)) {
        return data[metricName]
    }

    if (!data) {
        return defaultValue
    }

    return get(data, metricName, defaultValue) as string
}

export const getMetricValue = (
    data: CubeMetric | undefined,
    metricName: string,
    defaultValue = '0',
    parser = parseFloat,
): number => {
    return (
        parser(
            String(
                getMetricRawValue(data, metricName, defaultValue) ||
                    defaultValue,
            ),
        ) || 0
    )
}

export const getDefaultsForMetricKeys = <T extends Record<any, any>>(
    metrics: T,
): Record<T[keyof T], string> => {
    const metricNames = Object.values(metrics)
    return Object.fromEntries(
        metricNames.map((metricName) => [metricName, '0']),
    ) as Record<T[keyof T], string>
}
