import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { useGetRevenueShareChart } from 'domains/reporting/pages/convert/hooks/stats/useGetRevenueShareChart'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from 'domains/reporting/pages/utils'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

export const title = 'Total store revenue share influenced by campaigns'
const yAxisLabel = 'Revenue share influenced by campaigns'
export const hint = `Impact of campaigns on your store revenue, by day, calculated as:
Campaign revenue / Total store revenue`

export const CampaignRevenueShareStat = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        granularity,
    } = useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const { isFetching, isError, data } = useGetRevenueShareChart(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone,
        granularity,
    )

    const isLoading = isFetching || isError

    return (
        <ChartCard
            title={title}
            hint={{ title: hint }}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                data={[
                    {
                        label: yAxisLabel,
                        values: data || [],
                    },
                ]}
                hasBackground
                yLabel={yAxisLabel}
                renderYTickLabel={renderTickLabelAsPercentage}
                _displayLegacyTooltip
                _renderLegacyTooltipLabel={renderTooltipLabelAsPercentage}
                isLoading={isLoading}
            />
        </ChartCard>
    )
}
