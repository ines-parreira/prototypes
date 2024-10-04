import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import {useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsFilters,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'

import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {getIntegrationById} from 'state/integrations/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import {isCleanStatsDirty} from 'state/ui/stats/selectors'
import {FilterKey} from 'models/stat/types'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'

import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {periodAndAggregationWindowToReportingGranularity} from 'utils/reporting'
import {FiltersContext} from './context'

type Props = {
    children: ReactNode
}

const defaultOperator = LogicalOperatorEnum.ONE_OF

export const CampaignStatsFilters = ({children}: Props) => {
    const AnalyticsNewFiltersConvert =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersConvert]
    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()
    const chatIntegration = useAppSelector(
        getIntegrationById(parseInt(chatIntegrationId))
    )
    const isFilterDirty = useAppSelector(isCleanStatsDirty)

    const storeStatsFilter = useAppSelector(getStoreIntegrationsStatsFilter)

    const legacyStatsFilters = useAppSelector(getStatsFilters)

    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    useCleanStatsFiltersWithLogicalOperators(statsFilters)

    const storeIntegrationId = useMemo(
        () =>
            parseInt(
                chatIntegration.getIn(['meta', 'shop_integration_id']) ?? 0
            ),
        [chatIntegration]
    )

    const dispatch = useAppDispatch()

    const integrations = useShopifyIntegrations()

    const selectedIntegrations = useMemo(() => {
        if (storeIntegrationId) return [storeIntegrationId]

        const fallback = integrations?.[0]?.id ? [integrations[0].id] : []

        return storeStatsFilter.length ? storeStatsFilter : fallback
    }, [storeIntegrationId, integrations, storeStatsFilter])

    const {campaigns, channelConnectionExternalIds} = useGetCampaignsForStore(
        selectedIntegrations,
        chatIntegration.getIn(['meta', 'app_id']),
        true
    )

    const selectedCampaigns = useMemo(() => {
        return (
            (AnalyticsNewFiltersConvert
                ? statsFilters?.[FilterKey.Campaigns]?.values
                : legacyStatsFilters.campaigns) ?? []
        )
    }, [legacyStatsFilters, AnalyticsNewFiltersConvert, statsFilters])

    const selectedCampaignStatuses = useMemo(() => {
        return (
            (AnalyticsNewFiltersConvert
                ? statsFilters?.[FilterKey.CampaignStatuses]?.values
                : legacyStatsFilters.campaignStatuses) ?? []
        )
    }, [legacyStatsFilters, AnalyticsNewFiltersConvert, statsFilters])

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
                    campaigns: withDefaultLogicalOperator([]),
                    campaignStatuses: withDefaultLogicalOperator([]),
                })
            )
        }
    }, [chatIntegration, dispatch])

    useEffect(() => {
        if (!AnalyticsNewFiltersConvert || !isFilterDirty) {
            setSelectedCampaignIds(getCampaignIds())
            setSelectedCampaignsOperator(
                statsFilters?.[FilterKey.Campaigns]?.operator || defaultOperator
            )
        }
    }, [
        isFilterDirty,
        getCampaignIds,
        statsFilters,
        AnalyticsNewFiltersConvert,
    ])

    const selectedPeriod = useMemo(() => {
        return statsFilters.period
    }, [statsFilters])

    const handleChangeIntegration = useCallback(
        (integrationIds) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    integrations: withDefaultLogicalOperator(integrationIds),
                    campaigns: withDefaultLogicalOperator([]),
                    campaignStatuses: withDefaultLogicalOperator([]),
                })
            )
        },
        [dispatch]
    )

    const handleChangeCampaigns = useCallback(
        (campaignIds) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaigns: withDefaultLogicalOperator(campaignIds),
                })
            )
        },
        [dispatch]
    )

    const handleChangeCampaignsByStatus = useCallback(
        (statuses) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaignStatuses: withDefaultLogicalOperator(statuses),
                })
            )
        },
        [dispatch]
    )

    return (
        <FiltersContext.Provider
            value={{
                campaigns,
                granularity: periodAndAggregationWindowToReportingGranularity(
                    statsFilters.period,
                    statsFilters.aggregationWindow
                ),
                integrations,
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
