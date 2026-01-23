import { ChartCard, HorizontalBarChart } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAiAgentSupportInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric'
import { useSupportInteractionsByIntent } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportInteractionsByIntent'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

const METRIC_TITLE = 'Automated interactions'

export const SupportInteractionsComboChart = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const supportInteractionsTrend = useAiAgentSupportInteractionsMetric()
    const {
        data: chartData,
        isLoading: isChartDataLoading,
        isFieldsAvailable,
    } = useSupportInteractionsByIntent()

    const filteredChartData = chartData
        ?.filter((item) => item.value !== 0)
        .map((item) => ({ ...item, name: item.name.replace('::', '/') }))

    const tooltipPeriod = formatPreviousPeriod(cleanStatsFilters?.period)
    const isLoading = supportInteractionsTrend.isFetching || isChartDataLoading

    const value = supportInteractionsTrend.data?.value ?? undefined
    const prevValue = supportInteractionsTrend.data?.prevValue ?? undefined

    if (!isFieldsAvailable) {
        return <></>
    }

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal"
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            isLoading={isLoading}
        >
            <HorizontalBarChart
                data={filteredChartData ?? []}
                containerHeight={300}
                isLoading={isLoading}
                valueFormatter={(value) => value.toString()}
                initialItemsCount={5}
                showExpandButton={true}
                maxExpandedHeight={280}
            />
        </ChartCard>
    )
}
