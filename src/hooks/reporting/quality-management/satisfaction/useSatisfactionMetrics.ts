import {useMemo} from 'react'

import {useAverageScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {useResponseRateTrend} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

export const useSatisfactionMetrics = () => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const averageScoreTrend = useAverageScoreTrend(
        cleanStatsFilters,
        userTimezone
    )
    const responseRateTrend = useResponseRateTrend(
        cleanStatsFilters,
        userTimezone
    )
    const surveysSentTrend = useSurveysSentTrend(
        cleanStatsFilters,
        userTimezone
    )

    const loading = useMemo(() => {
        return [averageScoreTrend, responseRateTrend, surveysSentTrend].some(
            (data) => data.isFetching
        )
    }, [averageScoreTrend, responseRateTrend, surveysSentTrend])

    return {
        reportData: {
            averageScoreTrend,
            responseRateTrend,
            surveysSentTrend,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
