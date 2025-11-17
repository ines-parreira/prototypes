import React, { useMemo } from 'react'

import type { Scale } from 'chart.js'
import moment from 'moment/moment'

import { useArticleViewTimeSeries } from 'domains/reporting/hooks/help-center/useArticleViewTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import {
    formatTimeSeriesData,
    SHORT_FORMAT,
} from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'domains/reporting/pages/help-center/HelpCenterMetricsConfig'

type ArticleViewsGraphComponentProps = {
    isLoading: boolean
    data?: TimeSeriesDataItem[][]
} & DashboardChartProps

export const renderXTickLabel = function (
    this: Scale,
    _: string | number,
    index: number,
) {
    const labelDate = moment(this.getLabelForValue(index), SHORT_FORMAT)
    if (labelDate.isValid()) {
        return moment(this.getLabelForValue(index), SHORT_FORMAT).format(
            'MMM D',
        )
    }
    return this.getLabelForValue(index)
}

export const ArticleViewsGraphComponent = ({
    isLoading,
    dashboard,
    chartId,
    data,
}: ArticleViewsGraphComponentProps) => {
    const formattedDat = useMemo(
        () =>
            formatTimeSeriesData(
                data,
                'Articles viewed',
                ReportingGranularity.Day,
            ),
        [data],
    )

    return (
        <ChartCard
            title={HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title}
            dashboard={dashboard}
            chartId={chartId}
        >
            <LineChart
                renderXTickLabel={renderXTickLabel}
                isLoading={isLoading}
                _displayLegacyTooltip
                data={formattedDat}
            />
        </ChartCard>
    )
}

const ArticleViewsGraph = ({ chartId, dashboard }: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const articleViewTimeSeries = useArticleViewTimeSeries(
        cleanStatsFilters,
        userTimezone,
        ReportingGranularity.Day,
    )

    return (
        <ArticleViewsGraphComponent
            data={articleViewTimeSeries.data}
            isLoading={articleViewTimeSeries.isFetching}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}

export default ArticleViewsGraph
