import { useMemo } from 'react'

import { useAverageScoreTrend } from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import { useResponseRateTrend } from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import { useSatisfactionScoreTrend } from 'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
import { useSurveyScores } from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import { useSurveysSentTrend } from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'

export const useSatisfactionMetrics = () => {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()

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
