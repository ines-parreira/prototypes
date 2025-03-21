import { StatsFilters } from 'models/stat/types'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'

export const useMixedKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const gmvInfluenced = useGmvInfluenced(filters, timezone)
    const automationRate = useAiAgentAutomationRate(filters, timezone)
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, gmvInfluenced, automationRate, csat],
    }
}
