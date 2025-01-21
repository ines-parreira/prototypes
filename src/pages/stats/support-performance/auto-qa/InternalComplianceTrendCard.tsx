import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {AutoQAMetric} from 'state/ui/stats/types'

export const InternalComplianceTrendCard = ({chartId}: DashboardChartProps) => {
    return (
        <TrendCard
            {...TrendCardConfig[AutoQAMetric.InternalCompliance]}
            chartId={chartId}
        />
    )
}
