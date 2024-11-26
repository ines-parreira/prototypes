import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {SlaMetric} from 'state/ui/stats/types'

export const AchievementRateTrendCard = () => {
    return <TrendCard {...SlaMetricConfig[SlaMetric.AchievementRate]} />
}
