import { useEffect, useState } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchArticleRecommendationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'
import { reportError } from 'utils/errors'

export const useDownloadArticleRecommendationData = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchArticleRecommendationMetrics({
            period: cleanStatsFilters.period,
        })
            .then(({ fileName, files }) => {
                setResult({ fileName, files })
                setIsLoading(false)
            })
            .catch((error) => {
                reportError(error, {
                    tags: { team: SentryTeam.CRM_REPORTING },
                })
                setIsLoading(false)
            })
    }, [cleanStatsFilters])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
