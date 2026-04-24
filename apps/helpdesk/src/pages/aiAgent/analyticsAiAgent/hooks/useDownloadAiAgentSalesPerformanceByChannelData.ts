import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchAiAgentSalesPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useDownloadAiAgentSalesPerformanceByChannelData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchAiAgentSalesPerformanceByChannelMetrics(statsFilters, userTimezone)
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
