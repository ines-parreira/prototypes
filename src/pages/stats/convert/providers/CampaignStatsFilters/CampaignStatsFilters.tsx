import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { FilterKey } from 'models/stat/types'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import { ConvertRouteParams } from 'pages/convert/common/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { useFirstStoreWithAiSalesData } from 'pages/stats/convert/hooks/useFirstStoreWithAiSalesData'
import { useGetCampaignsForStore } from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import { useShopifyIntegrations } from 'pages/stats/convert/hooks/useShopifyIntegrations'
import { getIntegrationById } from 'state/integrations/selectors'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { isCleanStatsDirty } from 'state/ui/stats/selectors'
import { periodAndAggregationWindowToReportingGranularity } from 'utils/reporting'

import { FiltersContext } from './context'

type Props = {
    children: ReactNode
    isSelectStoreWithData?: boolean
}

const defaultOperator = LogicalOperatorEnum.ONE_OF

export const CampaignStatsFilters = ({
    children,
    isSelectStoreWithData = false,
}: Props) => {
    const { [CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId } =
        useParams<ConvertRouteParams>()
    const chatIntegration = useAppSelector(
        getIntegrationById(parseInt(chatIntegrationId)),
    )
    const isFilterDirty = useAppSelector(isCleanStatsDirty)

    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    useCleanStatsFilters()

    const storeIntegrationId = useMemo(
        () =>
            parseInt(
                chatIntegration.getIn(['meta', 'shop_integration_id']) ?? 0,
            ),
        [chatIntegration],
    )

    const dispatch = useAppDispatch()

    const storeIntegrations = useShopifyIntegrations()

    const { storeId: fallbackStoreId, isLoading } =
        useFirstStoreWithAiSalesData({ enabled: isSelectStoreWithData })

    const selectedIntegrations = useMemo(() => {
        if (storeIntegrationId) return [storeIntegrationId]

        const fromFilters = statsFilters.storeIntegrations?.values?.[0]
        if (fromFilters) return [fromFilters]

        if (fallbackStoreId) return [fallbackStoreId]

        if (storeIntegrations.length > 0) return [storeIntegrations[0].id]

        return []
    }, [
        storeIntegrationId,
        statsFilters.storeIntegrations,
        storeIntegrations,
        fallbackStoreId,
    ])

    const { campaigns, channelConnectionExternalIds } = useGetCampaignsForStore(
        selectedIntegrations,
        chatIntegration.getIn(['meta', 'app_id']),
        true,
    )

    const selectedCampaigns = useMemo(() => {
        return statsFilters?.[FilterKey.Campaigns]?.values ?? []
    }, [statsFilters])

    const selectedCampaignStatuses = useMemo(() => {
        return statsFilters?.[FilterKey.CampaignStatuses]?.values ?? []
    }, [statsFilters])

    const getCampaignIds = useCallback(() => {
        // no filter is selected, don't specify campaignIds
        if (!selectedCampaigns.length && !selectedCampaignStatuses.length) {
            return []
        }

        const campaignIds = campaigns
            .filter((campaign) => {
                const isMatchingStatus =
                    selectedCampaignStatuses.includes(campaign.status) ||
                    !selectedCampaignStatuses.length
                const isMatchingCampaignId =
                    selectedCampaigns.includes(campaign.id) ||
                    !selectedCampaigns.length

                return isMatchingStatus && isMatchingCampaignId
            })
            .map((campaign) => campaign.id)

        // if no campaign passed the selected filters, we shouldn't fetch any data
        return campaignIds.length ? campaignIds : null
    }, [campaigns, selectedCampaignStatuses, selectedCampaigns])

    const [selectedCampaignIds, setSelectedCampaignIds] = useState<
        string[] | null
    >(getCampaignIds())

    const [selectedCampaignsOperator, setSelectedCampaignsOperator] =
        useState<LogicalOperatorEnum>(defaultOperator)

    useEffect(() => {
        // Reset campaigns when chat integration is changed
        if (chatIntegration) {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([]),
                    [FilterKey.CampaignStatuses]: withDefaultLogicalOperator(
                        [],
                    ),
                }),
            )
        }
    }, [chatIntegration, dispatch])

    useEffect(() => {
        if (!isFilterDirty) {
            setSelectedCampaignIds(getCampaignIds())
            setSelectedCampaignsOperator(
                statsFilters?.[FilterKey.Campaigns]?.operator ||
                    defaultOperator,
            )
        }
    }, [isFilterDirty, getCampaignIds, statsFilters])

    const selectedPeriod = useMemo(() => {
        return statsFilters.period
    }, [statsFilters])

    const handleChangeIntegration = useCallback(
        (integrationIds) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]:
                        withDefaultLogicalOperator(integrationIds),
                    [FilterKey.Campaigns]: withDefaultLogicalOperator([]),
                    [FilterKey.CampaignStatuses]: withDefaultLogicalOperator(
                        [],
                    ),
                }),
            )
        },
        [dispatch],
    )

    const [hasDispatchedFallback, setHasDispatchedFallback] = useState(false)

    useEffect(() => {
        if (isLoading) return
        if (hasDispatchedFallback) return

        const currentStoreIds = statsFilters.storeIntegrations?.values ?? []

        const needsFallbackSet =
            selectedIntegrations.length > 0 &&
            (!currentStoreIds.length ||
                !currentStoreIds.includes(selectedIntegrations[0]))

        if (needsFallbackSet) {
            setHasDispatchedFallback(true)
            handleChangeIntegration(selectedIntegrations)
        }
    }, [
        selectedIntegrations,
        statsFilters.storeIntegrations,
        hasDispatchedFallback,
        handleChangeIntegration,
        isLoading,
    ])

    const handleChangeCampaigns = useCallback(
        (campaignIds) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.Campaigns]:
                        withDefaultLogicalOperator(campaignIds),
                }),
            )
        },
        [dispatch],
    )

    const handleChangeCampaignsByStatus = useCallback(
        (statuses) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.CampaignStatuses]:
                        withDefaultLogicalOperator(statuses),
                }),
            )
        },
        [dispatch],
    )

    return (
        <FiltersContext.Provider
            value={{
                campaigns,
                granularity: periodAndAggregationWindowToReportingGranularity(
                    statsFilters.period,
                    statsFilters.aggregationWindow,
                ),
                storeIntegrations: storeIntegrations,
                isStorePreSelected: !!storeIntegrationId,
                selectedCampaignIds,
                selectedCampaigns,
                selectedCampaignsOperator,
                selectedCampaignStatuses,
                selectedIntegrations,
                selectedPeriod,
                channelConnectionExternalIds:
                    channelConnectionExternalIds || [],
                onChangeCampaigns: handleChangeCampaigns,
                onChangeCampaignsByStatus: handleChangeCampaignsByStatus,
                onChangeIntegration: handleChangeIntegration,
            }}
        >
            {children}
        </FiltersContext.Provider>
    )
}
