import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchAllAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useDownloadAllAgentsPerformanceByChannelData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const { value: isInstagramDmsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentInstagramDms,
    )
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
        fetchAllAgentsPerformanceByChannelMetrics(
            statsFilters,
            userTimezone,
            costSavedPerInteraction,
            isInstagramDmsEnabled,
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
    }, [
        statsFilters,
        userTimezone,
        costSavedPerInteraction,
        isInstagramDmsEnabled,
    ])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
