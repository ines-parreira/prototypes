/**
 * TrendIcon component
 * Temporarily exposed to avoid breaking changes, should be replaced by TrendBadge component
 * @date 2025-09-05
 * @type reporting-ui-kit
 */
export { TrendIcon } from './components/TrendIcon/TrendIcon'

export { MetricCardHeader } from './components/MetricCardHeader/MetricCardHeader'

export { TrendBadge } from './components/TrendBadge/TrendBadge'

// Formatting functions
export {
    formatMetricTrend,
    formatDuration,
    formatMetricValue,
} from './utils/helpers'

// Types
export {
    type MetricTrendFormat,
    type MetricValueFormat,
    type TooltipData,
} from './types'

// Constants
export {
    NOT_AVAILABLE_PLACEHOLDER,
    NOT_AVAILABLE_TEXT,
    DEFAULT_LOCALE,
} from './constants'
