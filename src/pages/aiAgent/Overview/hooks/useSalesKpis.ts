import { StatsFilters } from 'models/stat/types'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { useTotalConversations } from 'pages/aiAgent/Overview/hooks/kpis/useTotalConversations'

export const useSalesKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const totalConversations = useTotalConversations(filters, timezone)
    const gmvInfluenced = useGmvInfluenced(filters, timezone)

    return {
        metrics: [coverageRate, totalConversations, gmvInfluenced],
    }
}
