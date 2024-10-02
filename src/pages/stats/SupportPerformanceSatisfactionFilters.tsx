import React from 'react'
import {TicketChannel} from 'business/types/ticket'
import {
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
} from 'config/stats'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {ScoreStatsFilter} from 'pages/stats/ScoreStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
import {
    getStatsFilters,
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsMessagingAndAppIntegrations,
    getPageStatsFiltersWithLogicalOperators,
} from 'state/stats/selectors'

export const SupportPerformanceSatisfactionFilters = () => {
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
            <ChannelsStatsFilter
                value={statsFilters.channels}
                channelsFilter={[TicketChannel.Chat, TicketChannel.Email]}
            />
            <ScoreStatsFilter
                value={statsFilters.score}
                minValue={SATISFACTION_SURVEY_MIN_SCORE}
                maxValue={SATISFACTION_SURVEY_MAX_SCORE}
                isDescending
            />
            <DEPRECATED_AgentsStatsFilter value={statsFilters.agents} />
            <DEPRECATED_TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
