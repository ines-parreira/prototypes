/**
 * TrendIcon component
 * Temporarily exposed to avoid breaking changes, should be replaced by TrendBadge component
 * @date 2025-09-05
 * @type reporting-ui-kit
 */
export { TrendIcon } from './components/TrendIcon/TrendIcon'
export { TrendBadge } from './components/TrendBadge/TrendBadge'
export {
    type MetricValueFormat,
    type MetricTrendFormat,
    type TwoDimensionalDataItem,
} from './types'
export { LineChart } from './components/LineChart/LineChart'
export { TrendChart } from './components/TrendChart/TrendChart'
export { TrendCard } from './components/TrendCard/TrendCard'
export { formatMetricTrend, formatMetricValue } from './utils/helpers'
