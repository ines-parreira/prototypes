import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { fetchStoreIntegrationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { useStoreIntegrations } from 'pages/automate/common/hooks/useStoreIntegrations'

export const useDownloadStoreIntegrationData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const storeIntegrations = useStoreIntegrations()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const displayNames = Object.fromEntries(
            storeIntegrations.map((s) => [s.id.toString(), s.name]),
        )
        setIsLoading(true)
        fetchStoreIntegrationMetrics(
            statsFilters,
            userTimezone,
            costSavedPerInteraction,
            displayNames,
        )
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
    }, [statsFilters, userTimezone, costSavedPerInteraction, storeIntegrations])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
