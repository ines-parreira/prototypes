import React, {useMemo} from 'react'
import {Scale} from 'chart.js'
import moment from 'moment/moment'
import ChartCard from '../../../ChartCard'
import LineChart from '../../../LineChart'
import {formatTimeSeriesData, SHORT_FORMAT} from '../../../common/utils'
import {ReportingGranularity} from '../../../../../models/reporting/types'
import {TimeSeriesDataItem} from '../../../../../hooks/reporting/useTimeSeries'

type ArticleViewsGraphProps = {isLoading: boolean; data: TimeSeriesDataItem[][]}

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

const ArticleViewsGraph = ({isLoading, data}: ArticleViewsGraphProps) => {
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
                yAxisScale={{min: 0, max: 5000}}
                renderXTickLabel={renderXTickLabel}
                isLoading={isLoading}
                _displayLegacyTooltip
                data={formattedDat}
            />
        </ChartCard>
    )
}

export default ArticleViewsGraph
