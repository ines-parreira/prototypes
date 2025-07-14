import { useMemo } from 'react'

import { useAccuracyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import { useAccuracyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyTrend'
import { useBrandVoicePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent'
import { useBrandVoiceTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoiceTrend'
import { useCommunicationSkillsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import { useCommunicationSkillsTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsTrend'
import { useEfficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import { useEfficiencyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend'
import { useInternalCompliancePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent'
import { useInternalComplianceTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalComplianceTrend'
import { useLanguageProficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import { useLanguageProficiencyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyTrend'
import { useResolutionCompletenessPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import { useResolutionCompletenessTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend'
import { useReviewedClosedTicketsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import { useReviewedClosedTicketsTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAutoQAMetrics = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const reviewedClosedTicketsTrend = useReviewedClosedTicketsTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const resolutionCompletenessTrend = useResolutionCompletenessTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const communicationSkillsTrend = useCommunicationSkillsTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const languageProficiencyTrend = useLanguageProficiencyTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const accuracyTrend = useAccuracyTrend(cleanStatsFilters, userTimezone)
    const efficiencyTrend = useEfficiencyTrend(cleanStatsFilters, userTimezone)
    const internalComplianceTrend = useInternalComplianceTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const brandVoiceTrend = useBrandVoiceTrend(cleanStatsFilters, userTimezone)

    const resolutionCompletenessPerAgent = useResolutionCompletenessPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const reviewedClosedTicketsPerAgent = useReviewedClosedTicketsPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const communicationSkillsPerAgent = useCommunicationSkillsPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const languageProficiencyPerAgent = useLanguageProficiencyPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const accuracyPerAgent = useAccuracyPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const efficiencyPerAgent = useEfficiencyPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const internalCompliancePerAgent = useInternalCompliancePerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const brandVoicePerAgent = useBrandVoicePerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const loading = useMemo(() => {
        return [
            reviewedClosedTicketsTrend,
            resolutionCompletenessTrend,
            communicationSkillsTrend,
            languageProficiencyTrend,
            accuracyTrend,
            efficiencyTrend,
            internalComplianceTrend,
            brandVoiceTrend,
            resolutionCompletenessPerAgent,
            reviewedClosedTicketsPerAgent,
            communicationSkillsPerAgent,
            languageProficiencyPerAgent,
            accuracyPerAgent,
            efficiencyPerAgent,
            internalCompliancePerAgent,
            brandVoicePerAgent,
        ].some((data) => data.isFetching)
    }, [
        communicationSkillsPerAgent,
        communicationSkillsTrend,
        languageProficiencyTrend,
        accuracyTrend,
        efficiencyTrend,
        internalComplianceTrend,
        brandVoiceTrend,
        resolutionCompletenessPerAgent,
        resolutionCompletenessTrend,
        reviewedClosedTicketsPerAgent,
        reviewedClosedTicketsTrend,
        languageProficiencyPerAgent,
        accuracyPerAgent,
        efficiencyPerAgent,
        internalCompliancePerAgent,
        brandVoicePerAgent,
    ])

    return {
        reportData: {
            communicationSkillsPerAgent,
            communicationSkillsTrend,
            resolutionCompletenessPerAgent,
            resolutionCompletenessTrend,
            reviewedClosedTicketsPerAgent,
            reviewedClosedTicketsTrend,
            languageProficiencyPerAgent,
            languageProficiencyTrend,
            accuracyTrend,
            accuracyPerAgent,
            efficiencyTrend,
            efficiencyPerAgent,
            internalComplianceTrend,
            internalCompliancePerAgent,
            brandVoiceTrend,
            brandVoicePerAgent,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
