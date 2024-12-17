import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {SatisfactionMetric} from 'state/ui/stats/types'

export const SatisfactionScoreTrendCard = () => {
    return (
        <TrendCard
            {...SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]}
        />
    )
}
