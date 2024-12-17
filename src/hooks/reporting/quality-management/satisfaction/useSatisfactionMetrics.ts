import {useMemo} from 'react'

import {useResponseRateTrend} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {useSatisfactionScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

export const useSatisfactionMetrics = () => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const satisfactionScoreTrend = useSatisfactionScoreTrend(
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
        return [
            satisfactionScoreTrend,
            responseRateTrend,
            surveysSentTrend,
        ].some((data) => data.isFetching)
    }, [satisfactionScoreTrend, responseRateTrend, surveysSentTrend])

    return {
        reportData: {
            satisfactionScoreTrend,
            responseRateTrend,
            surveysSentTrend,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
