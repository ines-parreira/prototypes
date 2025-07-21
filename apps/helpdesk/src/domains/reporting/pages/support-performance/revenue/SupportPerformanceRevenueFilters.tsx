import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import ChannelsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter'
import CampaignsStatsFilter from 'domains/reporting/pages/support-performance/revenue/CampaignsStatsFilter'
import { getStatsFiltersWithInitialStoreIntegration } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'

export const SupportPerformanceRevenueFilters = () => {
    const isConvertSubscriber: boolean = useIsConvertSubscriber()
    const { statsFilters, storeIntegrations } = useAppSelector(
        getStatsFiltersWithInitialStoreIntegration,
    )
    useCleanStatsFilters()

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
