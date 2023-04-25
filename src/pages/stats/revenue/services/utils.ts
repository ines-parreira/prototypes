import _get from 'lodash/get'
import {CubeMetric} from 'pages/stats/revenue/clients/types'

export const getMetricValue = (
    data: CubeMetric,
    metricName: string,
    defaultValue = '0',
    parser = parseFloat
): number => {
    return parser(_get(data, metricName, defaultValue) || defaultValue) || 0
}
