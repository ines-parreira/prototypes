import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchSupportAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useDownloadSupportAgentsPerformanceByChannelData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchSupportAgentsPerformanceByChannelMetrics(
            { period: statsFilters.period },
            userTimezone,
            costSavedPerInteraction,
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
    }, [statsFilters, userTimezone, costSavedPerInteraction])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
