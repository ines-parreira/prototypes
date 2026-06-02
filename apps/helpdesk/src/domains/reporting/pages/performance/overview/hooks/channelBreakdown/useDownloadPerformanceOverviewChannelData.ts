import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetchPerformanceOverviewChannelMetrics } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics'

export const useDownloadPerformanceOverviewChannelData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchPerformanceOverviewChannelMetrics(cleanStatsFilters, userTimezone)
            .then(({ fileName, files }) => setResult({ fileName, files }))
            .catch((error) =>
                reportError(error, {
                    tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                }),
            )
            .finally(() => setIsLoading(false))
    }, [cleanStatsFilters, userTimezone])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
