import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchShoppingAssistantPerformanceByEngagementFeatureMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'

export const useDownloadShoppingAssistantPerformanceByEngagementFeatureData =
    () => {
        const { cleanStatsFilters, userTimezone } = useStatsFilters()

        const [result, setResult] = useState<{
            fileName: string
            files: Record<string, string>
        }>()
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            setIsLoading(true)
            fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
                { period: cleanStatsFilters.period },
                userTimezone,
            )
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
        }, [cleanStatsFilters, userTimezone])

        return {
            files: result?.files ?? {},
            fileName: result?.fileName ?? '',
            isLoading,
        }
    }
