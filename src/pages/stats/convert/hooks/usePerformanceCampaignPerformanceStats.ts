import useAppSelector from 'hooks/useAppSelector'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import useCampaignPerformanceTimeSeries from 'pages/stats/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { getTimezone } from 'state/currentUser/selectors'

export const usePerformanceCampaignPerformanceStats = () => {
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

    const { isFetching, data, isError } = useCampaignPerformanceTimeSeries(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone,
        granularity,
    )

    return {
        isError,
        isLoading: isFetching,
        campaignPerformanceSeries: data,
    }
}
