import React from 'react'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {SlaMetric} from 'state/ui/stats/types'

export const BreachedTicketsRateTrendCard = ({
    isAnalyticsNewFilters = false,
}: {
    isAnalyticsNewFilters?: boolean
}) => {
    return (
        <TrendCard
            {...SlaMetricConfig[SlaMetric.BreachedTicketsRate]}
            isAnalyticsNewFilters={isAnalyticsNewFilters}
        />
    )
}
