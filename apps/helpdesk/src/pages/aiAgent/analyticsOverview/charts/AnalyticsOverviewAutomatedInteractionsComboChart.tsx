import { BarChart, ChartCard, DonutChart } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'

import { useAutomatedInteractionsBySkill } from 'domains/reporting/hooks/automate/useAutomatedInteractionsBySkill'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useAiAgentAutomatedInteractionsMetric } from '../../analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric'
import { ChartTypeToggle } from '../components/ChartTypeToggle/ChartTypeToggle'
import { useChartTypeToggle } from '../hooks/useChartTypeToggle'
import { formatPreviousPeriod } from '../utils/formatPreviousPeriod'

const METRIC_TITLE = 'Automated interactions'

const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

export const AnalyticsOverviewAutomatedInteractionsComboChart = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { chartType, setChartType } = useChartTypeToggle()

    const trend = useAiAgentAutomatedInteractionsMetric()

    const { data: chartData, isLoading: isChartDataLoading } =
        useAutomatedInteractionsBySkill(cleanStatsFilters, userTimezone)

    const filteredChartData = chartData?.filter((item) => item.value !== 0)

    const tooltipPeriod = formatPreviousPeriod(cleanStatsFilters?.period)

    const isLoading =
        trend.isFetching || isChartDataLoading || !filteredChartData

    const value =
        trend.data?.value !== null && trend.data?.value !== undefined
            ? trend.data.value
            : undefined

    const prevValue =
        trend.data?.prevValue !== null && trend.data?.prevValue !== undefined
            ? trend.data.prevValue
            : undefined

    const chartControls = (
        <ChartTypeToggle
            chartType={chartType}
            onChartTypeChange={setChartType}
        />
    )

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal"
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            chartControls={chartControls}
            isLoading={isLoading}
        >
            {chartType === 'donut' ? (
                <DonutChart
                    data={filteredChartData ?? []}
                    containerHeight={280}
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
                />
            ) : (
                <BarChart
                    data={filteredChartData ?? []}
                    containerHeight={280}
                    isLoading={isLoading}
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
