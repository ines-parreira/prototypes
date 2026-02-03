import { useSessionStorage } from '@repo/hooks'
import type { MetricTrendFormat } from '@repo/reporting'

import { useAchievedExposuresVoiceCallsTrend } from 'domains/reporting/hooks/voice/useVoiceCallsTrends'
import { TableValueModeSwitch } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import { ValueMode, VoiceMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceCallSlaAchievementRateChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [selectedFormat, setSelectedFormat] =
        useSessionStorage<MetricTrendFormat>(
            chartId ?? 'voice-metric-format',
            'percent',
        )

    return selectedFormat === 'percent' ? (
        <AchievementRateChart
            toggleSelectedFormat={() => setSelectedFormat('decimal')}
            dashboard={dashboard}
            chartId={chartId}
        />
    ) : (
        <AchievedCountChart
            toggleSelectedFormat={() => setSelectedFormat('percent')}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}

type ChartProps = {
    toggleSelectedFormat: () => void
} & DashboardChartProps

const AchievementRateChart = ({
    toggleSelectedFormat,
    dashboard,
    chartId,
}: ChartProps) => {
    return (
        <TrendCard
            /* useTrend and interpretAs are already defined in VoiceMetricsConfig,
         avoiding type issues before all metrics configs are updated
         */
            useTrend={useVoiceCallSlaAchievementRateTrend}
            interpretAs="more-is-better"
            {...VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]}
            titleExtra={
                <TableValueModeSwitch
                    size="extraSmall"
                    valueMode={ValueMode.Percentage}
                    toggleValueMode={toggleSelectedFormat}
                />
            }
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}

const AchievedCountChart = ({
    toggleSelectedFormat,
    dashboard,
    chartId,
}: ChartProps) => {
    return (
        <TrendCard
            {...VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]}
            useTrend={useAchievedExposuresVoiceCallsTrend}
            metricFormat={'decimal'}
            interpretAs="more-is-better"
            titleExtra={
                <TableValueModeSwitch
                    size="extraSmall"
                    valueMode={ValueMode.TotalCount}
                    toggleValueMode={toggleSelectedFormat}
                />
            }
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
