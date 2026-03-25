import {
    BarChart,
    ChartCard,
    DonutChart,
    formatMetricValue,
} from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartTypeToggle } from 'pages/aiAgent/analyticsOverview/components/ChartTypeToggle/ChartTypeToggle'
import { useChartTypeToggle } from 'pages/aiAgent/analyticsOverview/hooks/useChartTypeToggle'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

import { useTotalSalesByProduct } from '../../hooks/useTotalSalesByProduct'

const METRIC_TITLE = 'Total sales'

const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

export const DEPRECATED_TotalSalesByProductComboChart = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { chartType, setChartType } = useChartTypeToggle()

    const { data, isFetching } = useTotalSalesByProduct()

    const { chartData, totalValue, prevTotalValue, currency } = data

    const filteredChartData = chartData.filter((item) => item.value !== 0)

    const tooltipPeriod = formatPreviousPeriod(cleanStatsFilters?.period)

    const isLoading = isFetching

    const chartControls = (
        <ChartTypeToggle
            chartType={chartType}
            onChartTypeChange={setChartType}
        />
    )

    const valueFormatter = (value: number) =>
        formatMetricValue(value, 'currency', currency)

    const period = cleanStatsFilters?.period
        ? {
              start_datetime: moment(
                  cleanStatsFilters?.period?.start_datetime,
              ).format(DATE_FORMAT),
              end_datetime: moment(
                  cleanStatsFilters?.period?.end_datetime,
              ).format(DATE_FORMAT),
          }
        : undefined

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={totalValue ?? undefined}
            prevValue={prevTotalValue ?? undefined}
            metricFormat="currency-precision-1"
            currency={currency}
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            chartControls={chartControls}
            isLoading={isLoading}
        >
            {chartType === 'donut' ? (
                <DonutChart
                    data={filteredChartData}
                    containerHeight={280}
                    period={period}
                    isLoading={isLoading}
                    valueFormatter={valueFormatter}
                />
            ) : (
                <BarChart
                    data={filteredChartData}
                    containerHeight={280}
                    isLoading={isLoading}
                    valueFormatter={valueFormatter}
                    yAxisFormatter={valueFormatter}
                    period={period}
                />
            )}
        </ChartCard>
    )
}
