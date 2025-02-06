import {StatsFilters} from 'models/stat/types'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/useCsat'
import {useGmvInfluenced} from 'pages/aiAgent/Overview/hooks/useGmvInfluenced'
import {useTotalConversations} from 'pages/aiAgent/Overview/hooks/useTotalConversations'

export const useSalesKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate()
    const gmvInfluenced = useGmvInfluenced()
    const totalConversations = useTotalConversations()
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, gmvInfluenced, totalConversations, csat],
    }
}
