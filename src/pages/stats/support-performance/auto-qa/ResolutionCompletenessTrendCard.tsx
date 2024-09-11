import React from 'react'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {AutoQAMetric} from 'state/ui/stats/types'

export const ResolutionCompletenessTrendCard = ({
    isAnalyticsNewFilters = false,
}: {
    isAnalyticsNewFilters?: boolean
}) => {
    return (
        <TrendCard
            {...TrendCardConfig[AutoQAMetric.ResolutionCompleteness]}
            isAnalyticsNewFilters={isAnalyticsNewFilters}
        />
    )
}
