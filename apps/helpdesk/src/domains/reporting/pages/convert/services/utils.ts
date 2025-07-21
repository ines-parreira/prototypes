import _get from 'lodash/get'
import _keyBy from 'lodash/keyBy'
import _mapValues from 'lodash/mapValues'

import { CubeMetric } from 'domains/reporting/pages/convert/clients/types'

export const getMetricValue = (
    data: CubeMetric,
    metricName: string,
    defaultValue = '0',
    parser = parseFloat,
): number => {
    return parser(_get(data, metricName, defaultValue) || defaultValue) || 0
}

export const getDefaultsForMetricKeys = <T extends Record<any, any>>(
    metrics: T,
): Record<T[keyof T], string> => {
    const metricNames = Object.values(metrics)
    return _mapValues(_keyBy(metricNames), () => '0')
}
