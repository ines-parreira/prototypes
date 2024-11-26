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

export const MedianResolutionTimeTrendCard = () => {
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MedianResolutionTime]}
            drillDownMetric={OverviewMetric.MedianResolutionTime}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        {...OverviewMetricConfig[
                            OverviewMetric.MedianResolutionTime
                        ]}
                        metric={MetricName.MedianResolutionTime}
                    />
                )
            }
        />
    )
}
