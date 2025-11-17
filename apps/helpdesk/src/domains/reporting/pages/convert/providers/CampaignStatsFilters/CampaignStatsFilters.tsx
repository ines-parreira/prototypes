import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { WithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { useFirstStoreWithAiSalesData } from 'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData'
import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import { useShopifyIntegrations } from 'domains/reporting/pages/convert/hooks/useShopifyIntegrations'
import { FiltersContext } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters/context'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import { isCleanStatsDirty } from 'domains/reporting/state/ui/stats/selectors'
import { periodAndAggregationWindowToReportingGranularity } from 'domains/reporting/utils/reporting'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { Value } from 'pages/common/forms/SelectField/types'
import { CONVERT_ROUTE_PARAM_NAME } from 'pages/convert/common/constants'
import type { ConvertRouteParams } from 'pages/convert/common/types'
import { getIntegrationById } from 'state/integrations/selectors'

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
        (integrationIds: (string | number)[]) => {
            const numericIds = integrationIds.map((id) => Number(id))
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.StoreIntegrations]:
                        withDefaultLogicalOperator(numericIds),
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
        (campaignIds: WithLogicalOperator<string> | Value[]) => {
            const values = Array.isArray(campaignIds)
                ? campaignIds
                : campaignIds.values

            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.Campaigns]: withDefaultLogicalOperator(
                        values.map(String),
                    ),
                }),
            )
        },
        [dispatch],
    )

    const handleChangeCampaignsByStatus = useCallback(
        (statuses: WithLogicalOperator<string> | Value[]) => {
            const values = Array.isArray(statuses) ? statuses : statuses.values

            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    [FilterKey.CampaignStatuses]: withDefaultLogicalOperator(
                        values.map(String),
                    ),
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
