import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { ConfigurableGraph, ConfigurableGraphType } from '@repo/reporting'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useAutomationRateByFeature } from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

import { DEPRECATED_AutomationRateComboChart } from './DEPRECATED_AutomationRateComboChart'

const METRIC_TITLE = 'Overall automation rate'

const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const AutomationRateComboChart = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const isAnalyticsDashboardsNewChartsEnable = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const { statsFilters, userTimezone } = useAutomateFilters()

    const tooltipPeriod = formatPreviousPeriod(statsFilters?.period)

    const period = statsFilters?.period
        ? {
              start_datetime: moment(statsFilters.period.start_datetime).format(
                  DATE_FORMAT,
              ),
              end_datetime: moment(statsFilters.period.end_datetime).format(
                  DATE_FORMAT,
              ),
          }
        : undefined

    const metrics: ConfigurableGraphMetricConfig[] = [
        {
            id: 'automationRate',
            name: METRIC_TITLE,
            metricFormat: 'decimal-to-percent',
            interpretAs: 'more-is-better',
            tooltipData: { period: tooltipPeriod },
            useTrendData: () =>
                useAutomationRateTrend(statsFilters, userTimezone),
            groupings: [
                {
                    id: 'feature',
                    name: 'Feature',
                    chartType: ConfigurableGraphType.Donut,
                    useChartData: useAutomationRateByFeature,
                    valueFormatter: (value) => `${value}%`,
                    period,
                },
            ],
        },
    ]

    return isAnalyticsDashboardsNewChartsEnable ? (
        <ConfigurableGraph
            metrics={metrics}
            actionMenu={
                chartId && chartConfig ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={chartConfig.label}
                    />
                ) : undefined
            }
        />
    ) : (
        <DEPRECATED_AutomationRateComboChart />
    )
}
