import React, {useMemo} from 'react'
import {Scale} from 'chart.js'
import moment from 'moment/moment'
import ChartCard from '../../../ChartCard'
import LineChart from '../../../LineChart'
import {formatTimeSeriesData, SHORT_FORMAT} from '../../../common/utils'
import {ReportingGranularity} from '../../../../../models/reporting/types'
import {TimeSeriesDataItem} from '../../../../../hooks/reporting/useTimeSeries'
import {useArticleViewTimeSeries} from '../../hooks/useArticleViewTimeSeries'
import {StatsFilters} from '../../../../../models/stat/types'

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
        <ChartCard title="Article views">
            <LineChart
                renderXTickLabel={renderXTickLabel}
                isLoading={isLoading}
                _displayLegacyTooltip
                data={formattedDat}
            />
        </ChartCard>
    )
}

type ArticleViewsGraphProps = {
    statsFilters: StatsFilters
    timezone: string
}

const ArticleViewsGraph = ({
    statsFilters,
    timezone,
}: ArticleViewsGraphProps) => {
    const articleViewTimeSeries = useArticleViewTimeSeries(
        statsFilters,
        timezone,
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
