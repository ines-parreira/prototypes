import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import CampaignsStatsFilter from 'pages/stats/CampaignsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {getStatsFilters, getStatsStoreIntegrations} from 'state/stats/selectors'

export const SupportPerformanceRevenueFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    const isConvertSubscriber: boolean = useIsConvertSubscriber()

    return (
        <>
            <IntegrationsStatsFilter
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
            <TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
