import React from 'react'
import {TicketChannel} from 'business/types/ticket'
import {
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
} from 'config/stats'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {ScoreStatsFilter} from 'pages/stats/ScoreStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

export const SupportPerformanceSatisfactionFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    return (
        <>
            <IntegrationsStatsFilter
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
            <AgentsStatsFilter value={statsFilters.agents} />
            <TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
