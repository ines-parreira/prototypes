import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
} from '@repo/reporting'

import type { DateRange } from '../../shared/types'

export type SkillPerformanceTrendData = {
    chartData: ComposedMetricTimeSeriesDataItem[]
    chartMarkers?: ComposedMetricTimeSeriesMarker[]
    dateRange: DateRange
    isLoading: boolean
}
