import { TicketChannel } from 'business/types/ticket'
import {
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
} from 'domains/reporting/config/stats'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import DEPRECATED_AgentsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_AgentsStatsFilter'
import ChannelsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'
import { DEPRECATED_ScoreStatsFilter } from 'domains/reporting/pages/common/filters/DEPRECATED_ScoreStatsFilter'
import DEPRECATED_TagsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_TagsStatsFilter'
import {
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingAndAppIntegrations,
} from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

export const SupportPerformanceSatisfactionFilters = () => {
    useCleanStatsFilters()
    const statsFilters = useAppSelector(getStatsFilters)
    const messagingIntegrations = useAppSelector(
        getStatsMessagingAndAppIntegrations,
    )
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter,
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
                channelsFilter={[
                    TicketChannel.Chat,
                    TicketChannel.ContactForm,
                    TicketChannel.Email,
                    TicketChannel.HelpCenter,
                ]}
            />
            <DEPRECATED_ScoreStatsFilter
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
