import { ReactNode } from 'react'

import { useGridSize } from '@repo/hooks'

import { SegmentEvent } from 'common/segment'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { Period } from 'domains/reporting/models/stat/types'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { TooltipData } from 'domains/reporting/pages/types'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'
import { AIInsightsMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'

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
