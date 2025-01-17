import {Scale} from 'chart.js'

import moment from 'moment/moment'

import React, {useMemo} from 'react'

import {useArticleViewTimeSeries} from 'hooks/reporting/help-center/useArticleViewTimeSeries'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {ReportingGranularity} from 'models/reporting/types'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatTimeSeriesData, SHORT_FORMAT} from 'pages/stats/common/utils'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'

type ArticleViewsGraphComponentProps = {
    isLoading: boolean
    data?: TimeSeriesDataItem[][]
}

export const renderXTickLabel = function (
    this: Scale,
    _: string | number,
    index: number
) {
    const labelDate = moment(this.getLabelForValue(index), SHORT_FORMAT)
    if (labelDate.isValid()) {
        return moment(this.getLabelForValue(index), SHORT_FORMAT).format(
            'MMM D'
        )
    }
    return this.getLabelForValue(index)
}

export const ArticleViewsGraphComponent = ({
    isLoading,
    data,
}: ArticleViewsGraphComponentProps) => {
    const formattedDat = useMemo(
        () =>
            formatTimeSeriesData(
                data,
                'Articles viewed',
                ReportingGranularity.Day
            ),
        [data]
    )

    return (
        <ChartCard
            title={HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title}
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

const ArticleViewsGraph = () => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const articleViewTimeSeries = useArticleViewTimeSeries(
        cleanStatsFilters,
        userTimezone,
        ReportingGranularity.Day
    )

    return (
        <ArticleViewsGraphComponent
            data={articleViewTimeSeries.data}
            isLoading={articleViewTimeSeries.isFetching}
        />
    )
}

export default ArticleViewsGraph
