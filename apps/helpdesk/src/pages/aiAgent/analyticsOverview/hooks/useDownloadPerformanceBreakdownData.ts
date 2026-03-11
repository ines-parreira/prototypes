import { useEffect, useState } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { fetchPerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/fetchPerformanceBreakdownData'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { reportError } from 'utils/errors'

export const useDownloadPerformanceBreakdownData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const aiAgentUserId = useAIAgentUserId()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const filters: StatsFilters = { period: cleanStatsFilters.period }
        setIsLoading(true)
        fetchPerformanceMetricsPerFeature(
            filters,
            userTimezone,
            aiAgentUserId,
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
    }, [
        cleanStatsFilters,
        userTimezone,
        aiAgentUserId,
        costSavedPerInteraction,
    ])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
