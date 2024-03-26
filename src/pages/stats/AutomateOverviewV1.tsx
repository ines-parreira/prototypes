import React from 'react'
import {
    useAutomateMetricsTrend,
    useAutomateMetricsTimeseries,
} from 'hooks/reporting/automate/useAutomationDataset'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import AutomateOverviewContent from './AutomateOverviewContent'

export default function AutomateOverviewV1({
    filters,
    timezone,
    granularity,
}: {
    filters: StatsFilters
    timezone: string
    granularity: ReportingGranularity
}) {
    const metricsV1 = useAutomateMetricsTrend(filters, timezone)
    const timeseriesV1 = useAutomateMetricsTimeseries(
        filters,
        timezone,
        granularity
    )
    return (
        <AutomateOverviewContent
            metrics={metricsV1}
            timeseries={timeseriesV1}
        />
    )
}
