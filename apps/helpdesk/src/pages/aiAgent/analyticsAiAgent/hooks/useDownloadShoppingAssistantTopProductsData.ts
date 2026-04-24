import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

import { fetchShoppingAssistantTopProductsData } from './useShoppingAssistantTopProductsMetrics'

export const useDownloadShoppingAssistantTopProductsData = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchShoppingAssistantTopProductsData(statsFilters, userTimezone)
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
    }, [statsFilters, userTimezone])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
