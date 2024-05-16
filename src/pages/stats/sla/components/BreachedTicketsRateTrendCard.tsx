import React from 'react'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {SlaMetric} from 'pages/stats/sla/types'
import {TrendCard} from 'pages/stats/common/components/TrendCard'

export const BreachedTicketsRateTrendCard = () => {
    return <TrendCard {...SlaMetricConfig[SlaMetric.BreachedTicketsRate]} />
}
