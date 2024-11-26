import React from 'react'

import useLocalStorage from 'hooks/useLocalStorage'
import {TrendCard} from 'pages/stats/common/components/TrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'

import {MetricName} from 'services/reporting/constants'

export const MedianFirstResponseTimeTrendCard = () => {
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MedianFirstResponseTime]}
            drillDownMetric={OverviewMetric.MedianFirstResponseTime}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        metric={MetricName.MedianFirstResponseTime}
                        {...OverviewMetricConfig[
                            OverviewMetric.MedianFirstResponseTime
                        ]}
                    />
                )
            }
        />
    )
}
