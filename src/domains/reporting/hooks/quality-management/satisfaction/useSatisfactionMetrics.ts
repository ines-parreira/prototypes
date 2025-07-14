import { useMemo } from 'react'

import { useAverageScoreTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScoreTrend'
import { useResponseRateTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend'
import { useSatisfactionScoreTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionScoreTrend'
import { useSurveyScores } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import { useSurveysSentTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useSatisfactionMetrics = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const satisfactionScoreTrend = useSatisfactionScoreTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const responseRateTrend = useResponseRateTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const surveysSentTrend = useSurveysSentTrend(
        cleanStatsFilters,
        userTimezone,
    )

    const averageScoreTrend = useAverageScoreTrend(
        cleanStatsFilters,
        userTimezone,
    )

    const surveyScores = useSurveyScores(cleanStatsFilters, userTimezone)

    const loading = useMemo(() => {
        return [
            satisfactionScoreTrend,
            responseRateTrend,
            surveysSentTrend,
            averageScoreTrend,
            surveyScores,
        ].some((data) => data.isFetching)
    }, [
        satisfactionScoreTrend,
        responseRateTrend,
        surveysSentTrend,
        averageScoreTrend,
        surveyScores,
    ])

    return {
        reportData: {
            satisfactionScoreTrend,
            responseRateTrend,
            surveysSentTrend,
            averageScoreTrend,
            surveyScores,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
