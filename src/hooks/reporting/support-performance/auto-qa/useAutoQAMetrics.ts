import {useMemo} from 'react'

import {User} from 'config/types/user'
import {useCommunicationSkillsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {useCommunicationSkillsTrend} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import {useLanguageProficiencyPerAgent} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import {useLanguageProficiencyTrend} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyTrend'
import {useResolutionCompletenessPerAgent} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {useReviewedClosedTicketsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {getSortedAutoQAAgents} from 'state/ui/stats/autoQAAgentPerformanceSlice'

export const useAutoQAMetrics = () => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const agents = useAppSelector<User[]>(getSortedAutoQAAgents)

    const reviewedClosedTicketsTrend = useReviewedClosedTicketsTrend(
        cleanStatsFilters,
        userTimezone
    )
    const resolutionCompletenessTrend = useResolutionCompletenessTrend(
        cleanStatsFilters,
        userTimezone
    )
    const communicationSkillsTrend = useCommunicationSkillsTrend(
        cleanStatsFilters,
        userTimezone
    )
    const languageProficiencyTrend = useLanguageProficiencyTrend(
        cleanStatsFilters,
        userTimezone
    )

    const resolutionCompletenessPerAgent = useResolutionCompletenessPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const reviewedClosedTicketsPerAgent = useReviewedClosedTicketsPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const communicationSkillsPerAgent = useCommunicationSkillsPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const languageProficiencyPerAgent = useLanguageProficiencyPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const loading = useMemo(() => {
        return [
            reviewedClosedTicketsTrend,
            resolutionCompletenessTrend,
            communicationSkillsTrend,
            languageProficiencyTrend,
            resolutionCompletenessPerAgent,
            reviewedClosedTicketsPerAgent,
            communicationSkillsPerAgent,
            languageProficiencyPerAgent,
        ].some((data) => data.isFetching)
    }, [
        communicationSkillsPerAgent,
        communicationSkillsTrend,
        languageProficiencyTrend,
        resolutionCompletenessPerAgent,
        resolutionCompletenessTrend,
        reviewedClosedTicketsPerAgent,
        reviewedClosedTicketsTrend,
        languageProficiencyPerAgent,
    ])

    return {
        reportData: {
            agents,
            communicationSkillsPerAgent,
            communicationSkillsTrend,
            resolutionCompletenessPerAgent,
            resolutionCompletenessTrend,
            reviewedClosedTicketsPerAgent,
            reviewedClosedTicketsTrend,
            languageProficiencyPerAgent,
            languageProficiencyTrend,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
