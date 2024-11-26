import React from 'react'

import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {AutoQAMetric} from 'state/ui/stats/types'

export const LanguageProficiencyTrendCard = () => {
    return <TrendCard {...TrendCardConfig[AutoQAMetric.LanguageProficiency]} />
}
