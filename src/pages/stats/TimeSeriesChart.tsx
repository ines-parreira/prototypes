import React from 'react'

import useTimeSeries from 'hooks/reporting/useTimeSeries'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {ReportingGranularity} from 'models/reporting/types'

import LineChart from './LineChart'
import {formatTimeSeriesDate} from './common/utils'

type Props = {
    labels: string[]
    timeSeries: ReturnType<typeof useTimeSeries>
    granularity: ReportingGranularity
}

export default function TimeSeriesChart({
    timeSeries,
    granularity,
    labels,
}: Props) {
    const {data} = timeSeries
    return !data ? (
        <Skeleton height={250} />
    ) : (
        <LineChart
            data={data.map((items, index) => ({
                label: labels[index],
                values: items.map((item) => ({
                    x: formatTimeSeriesDate(item.dateTime, granularity),
                    y: item.value,
                })),
            }))}
            hasBackground
            _displayLegacyTooltip
        />
    )
}
