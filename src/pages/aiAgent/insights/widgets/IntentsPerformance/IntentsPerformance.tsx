import React, { ReactNode } from 'react'

import { SegmentEvent } from 'common/segment'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { useGridSize } from 'hooks/useGridSize'
import type { Period } from 'models/stat/types'
import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'
import { getBadgeTooltipForPreviousPeriod } from 'pages/stats/utils'
import { AIInsightsMetrics } from 'state/ui/stats/drillDownSlice'

import css from './IntentPerformance.less'

export type IntentsPerformanceProps = {
    sectionTitle: string
    sectionSubtitle?: string
    period: Period
    metrics: Array<{
        title: string
        trend: MetricTrend
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        hint?: TooltipData
        metricFormat?: MetricTrendFormat
        tip?: ReactNode
        metricData?: AIInsightsMetrics
    }>
}

export const IntentsPerformance = ({
    sectionTitle,
    sectionSubtitle,
    period,
    metrics,
}: IntentsPerformanceProps) => {
    const getGridCellSize = useGridSize()

    const metricsConfig = metrics.map((metric) => {
        const formattedMetric = formatMetricValue(
            metric.trend.data?.value,
            metric.metricFormat,
            NOT_AVAILABLE_PLACEHOLDER,
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

    let titleExtra
    if (sectionSubtitle) {
        titleExtra = (
            <div className={css.sectionSubtitle}>{sectionSubtitle}</div>
        )
    }

    return (
        <DashboardSection
            title={sectionTitle}
            titleExtra={titleExtra}
            className="p-0"
        >
            {metricsConfig.map((config, index) => (
                <DashboardGridCell key={index} size={getGridCellSize(3)}>
                    <MetricCard
                        title={config.title}
                        hint={config.hint}
                        isLoading={config.trend.isFetching}
                        className={css.intentPerformanceCell}
                    >
                        <BigNumberMetric
                            className={css.intentPerformanceBigNumberMetric}
                            isLoading={config.trend.isFetching}
                            trendBadge={
                                config.trend.data?.prevValue && (
                                    <TrendBadge
                                        interpretAs={config.interpretAs}
                                        value={config.trend.data?.value}
                                        prevValue={config.trend.data?.prevValue}
                                        tooltipData={{
                                            period: getBadgeTooltipForPreviousPeriod(
                                                period,
                                            ),
                                        }}
                                        metricFormat={config.metricFormat}
                                    />
                                )
                            }
                        >
                            {config.metricData ? (
                                <DrillDownModalTrigger
                                    enabled={!!config.trend.data?.value}
                                    metricData={config.metricData}
                                    segmentEventName={
                                        SegmentEvent.AiAgentTicketDrilldownClicked
                                    }
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
