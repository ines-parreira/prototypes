import React from 'react'

import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import CampaignsStatsFilter from 'pages/stats/CampaignsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsFiltersWithInitialStoreIntegration,
} from 'state/stats/selectors'

export const SupportPerformanceRevenueFilters = () => {
    const isConvertSubscriber: boolean = useIsConvertSubscriber()
    const { statsFilters, storeIntegrations } = useAppSelector(
        getStatsFiltersWithInitialStoreIntegration,
    )
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators,
    )

    return (
        <>
            <DEPRECATED_IntegrationsStatsFilter
                value={statsFilters.integrations}
                integrations={storeIntegrations}
                isRequired
            />
            {isConvertSubscriber && (
                <CampaignsStatsFilter
                    value={statsFilters.campaigns}
                    selectedIntegrations={statsFilters.integrations}
                />
            )}
            <ChannelsStatsFilter value={statsFilters.channels} />
            <DEPRECATED_TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
