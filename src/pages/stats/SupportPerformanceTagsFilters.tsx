import React from 'react'

import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {
    getStatsFilters,
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsMessagingAndAppIntegrations,
    getPageStatsFiltersWithLogicalOperators,
} from 'state/stats/selectors'

export const SupportPerformanceTagsFilters = () => {
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const messagingIntegrations = useAppSelector(
        getStatsMessagingAndAppIntegrations
    )
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )

    return (
        <>
            <DEPRECATED_IntegrationsStatsFilter
                value={integrationsStatsFilter}
                integrations={messagingIntegrations}
                isMultiple
            />
            <ChannelsStatsFilter value={statsFilters.channels} />
            <DEPRECATED_TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
