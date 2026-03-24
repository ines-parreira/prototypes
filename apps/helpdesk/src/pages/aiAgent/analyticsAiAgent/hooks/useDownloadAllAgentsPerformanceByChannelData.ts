import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchAllAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useDownloadAllAgentsPerformanceByChannelData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
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
            { period: cleanStatsFilters.period },
            userTimezone,
            costSavedPerInteraction,
        )
            .then(({ fileName, files }) => {
                setResult({ fileName, files })
                setIsLoading(false)
            })
            .catch((error) => {
                reportError(error, { tags: { team: SentryTeam.CRM_REPORTING } })
                setIsLoading(false)
            })
    }, [cleanStatsFilters, userTimezone, costSavedPerInteraction])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
