import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {SatisfactionMetric} from 'state/ui/stats/types'

export const SatisfactionScoreTrendCard = ({chartId}: DashboardChartProps) => {
    return (
        <TrendCard
            {...SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]}
            chartId={chartId}
        />
    )
}
