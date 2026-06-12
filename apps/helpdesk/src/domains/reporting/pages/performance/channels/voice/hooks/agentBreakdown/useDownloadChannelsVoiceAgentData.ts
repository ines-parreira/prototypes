import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'
import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchChannelsVoiceAgentMetrics } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { useAppSelector } from 'hooks/useAppSelector'

export const useDownloadChannelsVoiceAgentData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const agents = useAppSelector(getFilteredAgents)

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchChannelsVoiceAgentMetrics(cleanStatsFilters, userTimezone, agents)
            .then(({ fileName, files }) => setResult({ fileName, files }))
            .catch((error) =>
                reportError(error, {
                    tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                }),
            )
            .finally(() => setIsLoading(false))
    }, [cleanStatsFilters, userTimezone, agents])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
