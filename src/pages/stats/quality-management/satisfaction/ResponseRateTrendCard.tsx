import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {SatisfactionMetric} from 'state/ui/stats/types'

export const ResponseRateTrendCard = () => {
    return (
        <TrendCard
            {...SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]}
        />
    )
}
