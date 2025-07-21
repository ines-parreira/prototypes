import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import useCampaignPerformanceTimeSeries from 'domains/reporting/pages/convert/hooks/stats/useCampaignPerformanceTimeSeries'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import useAppSelector from 'hooks/useAppSelector'
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
