import { useEffect, useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useDownloadOrderManagementData = () => {
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
        fetchOrderManagementMetrics(
            { period: cleanStatsFilters.period },
            userTimezone,
            costSavedPerInteraction,
        ).then(({ fileName, files }) => {
            setResult({ fileName, files })
            setIsLoading(false)
        })
    }, [cleanStatsFilters, userTimezone, costSavedPerInteraction])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
