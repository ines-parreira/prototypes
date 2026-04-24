import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchShoppingAssistantPerformanceByEngagementFeatureMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useDownloadShoppingAssistantPerformanceByEngagementFeatureData =
    () => {
        const { statsFilters, userTimezone } = useAiAgentStatsFilters()

        const [result, setResult] = useState<{
            fileName: string
            files: Record<string, string>
        }>()
        const [isLoading, setIsLoading] = useState(true)

        useEffect(() => {
            setIsLoading(true)
            fetchShoppingAssistantPerformanceByEngagementFeatureMetrics(
                { period: statsFilters.period },
                userTimezone,
            )
                .then(({ fileName, files }) => {
                    setResult({ fileName, files })
                    setIsLoading(false)
                })
                .catch((error) => {
                    reportError(error, {
                        tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                    })
                    setIsLoading(false)
                })
        }, [statsFilters, userTimezone])

        return {
            files: result?.files ?? {},
            fileName: result?.fileName ?? '',
            isLoading,
        }
    }
