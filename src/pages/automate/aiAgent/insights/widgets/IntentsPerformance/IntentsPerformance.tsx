import React, {ReactNode} from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {useGridSize} from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import type {Period} from 'models/stat/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import {
    STATS_TIPS_VISIBILITY_KEY,
    OverviewMetric,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import TipsToggle from 'pages/stats/TipsToggle'
import {TooltipData} from 'pages/stats/types'
import {getBadgeTooltipForPreviousPeriod} from 'pages/stats/utils'
import {AIInsightsMetrics, DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    AIInsightsMetric,
    AutoQAMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'state/ui/stats/types'

import css from './IntentPerformance.less'

export const IntentsPerformance = ({
    sectionTitle,
    shouldDisplayTipsCTA,
    period,
    metrics,
}: {
    sectionTitle: string
    shouldDisplayTipsCTA: boolean
    period: Period
    metrics: Array<{
        title: string
        trend: MetricTrend
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        hint?: TooltipData
        metricFormat?: MetricTrendFormat
        tip?: ReactNode
        drillDownMetric?:
            | OverviewMetric
            | SlaMetric
            | AutoQAMetric
            | SatisfactionMetric
            | AIInsightsMetric
        drillDownMetricAdditionalData?: Partial<AIInsightsMetrics>
    }>
}) => {
    const {isAnalyticsNewFilters} = useNewStatsFilters()
    const getGridCellSize = useGridSize()

    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        false
    )

    const metricsConfig = metrics.map((metric) => {
        const formattedMetric = formatMetricValue(
            metric.trend.data?.value,
            metric.metricFormat,
            NOT_AVAILABLE_PLACEHOLDER
        )

        const hasNoData =
            metric.trend.data?.value === null ||
            metric.trend.data?.value === undefined

        const tip =
            hasNoData && metric.tip !== undefined ? (
                <div className={css.noDataTip}>
                    <div className="body-medium">No data</div>
                    <div>No data available for the selected filters.</div>
                </div>
            ) : (
                metric.tip
            )

        return {
            ...metric,
            tip,
            formattedMetric,
        }
    })

    return (
        <DashboardSection
            title={sectionTitle}
            titleExtra={
                shouldDisplayTipsCTA && (
                    <TipsToggle
                        isVisible={!!areTipsVisible}
                        onClick={() => setAreTipsVisible(!areTipsVisible)}
                    />
                )
            }
            className="p-0"
        >
            {metricsConfig.map((config, index) => (
                <DashboardGridCell key={index} size={getGridCellSize(3)}>
                    <MetricCard
                        title={config.title}
                        hint={config.hint}
                        isLoading={config.trend.isFetching}
                        tip={areTipsVisible ? config.tip : undefined}
                    >
                        <BigNumberMetric
                            isLoading={config.trend.isFetching}
                            trendBadge={
                                config.trend.data?.prevValue && (
                                    <TrendBadge
                                        interpretAs={config.interpretAs}
                                        value={config.trend.data?.value}
                                        prevValue={config.trend.data?.prevValue}
                                        tooltipData={{
                                            period: getBadgeTooltipForPreviousPeriod(
                                                period
                                            ),
                                        }}
                                        metricFormat={config.metricFormat}
                                    />
                                )
                            }
                        >
                            {config.drillDownMetric ? (
                                <DrillDownModalTrigger
                                    enabled={!!config.trend.data?.value}
                                    metricData={
                                        {
                                            title: config.title,
                                            metricName: config.drillDownMetric,
                                            ...config.drillDownMetricAdditionalData,
                                        } as DrillDownMetric
                                    }
                                    useNewFilterData={isAnalyticsNewFilters}
                                >
                                    {config.formattedMetric}
                                </DrillDownModalTrigger>
                            ) : (
                                config.formattedMetric
                            )}
                        </BigNumberMetric>
                    </MetricCard>
                </DashboardGridCell>
            ))}
        </DashboardSection>
    )
}
