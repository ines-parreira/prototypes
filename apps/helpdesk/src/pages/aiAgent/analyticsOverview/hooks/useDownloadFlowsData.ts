import { useEffect, useState } from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchFlowsMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { reportError } from 'utils/errors'

export const useDownloadFlowsData = () => {
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
        fetchFlowsMetrics(
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
