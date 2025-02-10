import {StatsFilters} from 'models/stat/types'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/useCsat'
import {useTotalConversations} from 'pages/aiAgent/Overview/hooks/useTotalConversations'

export const useSalesKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const totalConversations = useTotalConversations(filters, timezone)
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, totalConversations, csat],
    }
}
