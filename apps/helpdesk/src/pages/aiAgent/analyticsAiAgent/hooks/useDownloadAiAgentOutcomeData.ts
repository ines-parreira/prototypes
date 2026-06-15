import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchAiAgentOutcomeMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useDownloadAiAgentOutcomeData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchAiAgentOutcomeMetrics(statsFilters, userTimezone)
            .then(({ fileName, files }) => {
                setResult({ fileName, files })
            })
            .catch((error) => {
                reportError(error, {
                    tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                })
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [statsFilters, userTimezone])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
