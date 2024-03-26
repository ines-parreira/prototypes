import React from 'react'
import {
    useAutomateMetricsTrendV2,
    useAutomateMetricsTimeseriesV2,
} from 'hooks/reporting/automate/useAutomationDatasetV2'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import AutomateOverviewContent from './AutomateOverviewContent'

export default function AutomateOverviewV2({
    filters,
    timezone,
    granularity,
}: {
    filters: StatsFilters
    timezone: string
    granularity: ReportingGranularity
}) {
    const metricsV2 = useAutomateMetricsTrendV2(filters, timezone)
    const timeseriesV2 = useAutomateMetricsTimeseriesV2(
        filters,
        timezone,
        granularity
    )
    return (
        <AutomateOverviewContent
            metrics={metricsV2}
            timeseries={timeseriesV2}
        />
    )
}
