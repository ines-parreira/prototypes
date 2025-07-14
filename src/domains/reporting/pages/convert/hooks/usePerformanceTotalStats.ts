import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { useGetTotalsStat } from 'domains/reporting/pages/convert/hooks/stats/useGetTotalsStat'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetCurrencyForStore } from 'domains/reporting/pages/convert/hooks/useGetCurrencyForStore'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

export const usePerformanceTotalStats = () => {
    const {
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        channelConnectionExternalIds,
    } = useCampaignStatsFilters()

    const currency = useGetCurrencyForStore(selectedIntegrations)

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const {
        isFetching,
        isError: totalStatsIsError,
        data: totalStatsData,
    } = useGetTotalsStat(
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        currency,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        userTimezone,
    )

    return {
        isLoading: isFetching,
        totalStatsIsError,
        totalStatsData,
        namespacedShopName,
        selectedCampaignIds,
        selectedCampaignsOperator,
        channelConnectionExternalIds,
    }
}
