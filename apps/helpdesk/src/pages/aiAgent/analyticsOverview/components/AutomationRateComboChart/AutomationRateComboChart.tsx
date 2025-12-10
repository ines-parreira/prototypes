import { useMemo, useState } from 'react'

import { BarChart, ChartCard, DonutChart } from '@repo/reporting'
import type { ChartType } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'

import { ButtonGroup, ButtonGroupItem, Icon } from '@gorgias/axiom'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { useAutomationRateByFeature } from '../../hooks/useAutomationRateByFeature'

const METRIC_TITLE = 'Overall automation rate'

const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

export const AutomationRateComboChart = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [chartType, setChartType] = useState<ChartType>('donut')

    const automationRateTrend = useAIAgentAutomationRateTrend(
        cleanStatsFilters,
        userTimezone,
    )

    const { data: chartData, isLoading: isChartDataLoading } =
        useAutomationRateByFeature()

    const filteredChartData = chartData?.filter((item) => item.value !== 0)

    const previousPeriod = getPreviousPeriod(cleanStatsFilters?.period)
    const tooltipPeriod = previousPeriod
        ? `${moment(previousPeriod.start_datetime).format(DATE_FORMAT)} - ${moment(previousPeriod.end_datetime).format(DATE_FORMAT)}`
        : ''

    const isLoading =
        automationRateTrend.isFetching ||
        isChartDataLoading ||
        !filteredChartData

    const value =
        automationRateTrend.data?.value !== null &&
        automationRateTrend.data?.value !== undefined
            ? automationRateTrend.data.value
            : undefined

    const prevValue =
        automationRateTrend.data?.prevValue !== null &&
        automationRateTrend.data?.prevValue !== undefined
            ? automationRateTrend.data.prevValue
            : undefined

    const chartControls = useMemo(
        () => (
            <ButtonGroup
                defaultSelectedKey="donut"
                selectedKey={chartType}
                onSelectionChange={(selectedKey) =>
                    setChartType(selectedKey as ChartType)
                }
            >
                <ButtonGroupItem id="donut" aria-label="Show donut chart">
                    <Icon name="chart-pie" />
                </ButtonGroupItem>
                <ButtonGroupItem id="bar" aria-label="Show bar chart">
                    <Icon name="chart-bar-vertical" />
                </ButtonGroupItem>
            </ButtonGroup>
        ),
        [chartType],
    )

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal-to-percent"
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            chartControls={chartControls}
        >
            {chartType === 'donut' ? (
                <DonutChart
                    data={filteredChartData ?? []}
                    containerHeight={320}
                    period={
                        cleanStatsFilters?.period
                            ? {
                                  start_datetime: moment(
                                      cleanStatsFilters?.period?.start_datetime,
                                  ).format(DATE_FORMAT),
                                  end_datetime: moment(
                                      cleanStatsFilters?.period?.end_datetime,
                                  ).format(DATE_FORMAT),
                              }
                            : undefined
                    }
                    isLoading={isLoading}
                    valueFormatter={(value) => `${value}%`}
                />
            ) : (
                <BarChart
                    data={filteredChartData ?? []}
                    containerHeight={320}
                    isLoading={isLoading}
                    valueFormatter={(value) => `${value}%`}
                    period={{
                        start_datetime: moment(
                            cleanStatsFilters?.period?.start_datetime,
                        ).format(DATE_FORMAT),
                        end_datetime: moment(
                            cleanStatsFilters?.period?.end_datetime,
                        ).format(DATE_FORMAT),
                    }}
                />
            )}
        </ChartCard>
    )
}
