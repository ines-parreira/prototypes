import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { CAMPAIGN_REVENUE_LABEL } from 'domains/reporting/pages/convert/constants/labels'
import useGetCampaignRevenueTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useGetCampaignRevenueTimeSeries'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetCurrencyForStore } from 'domains/reporting/pages/convert/hooks/useGetCurrencyForStore'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

const CampaignRevenueChart = ({ chartId, dashboard }: DashboardChartProps) => {
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

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const { isFetching, isError, data } = useGetCampaignRevenueTimeSeries(
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
            title={OverviewMetricConfig.revenue.title}
            hint={OverviewMetricConfig.revenue.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                data={[
                    {
                        label: `${CAMPAIGN_REVENUE_LABEL} ${currency}`,
                        values: data || [],
                    },
                ]}
                isLoading={isLoading}
            />
        </ChartCard>
    )
}

export default CampaignRevenueChart
