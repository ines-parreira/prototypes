import { StatsFilters } from 'models/stat/types'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useAutomatedInteractions } from 'pages/aiAgent/Overview/hooks/kpis/useAutomatedInteractions'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'

export const useSupportKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const automationRate = useAiAgentAutomationRate(filters, timezone)
    const automatedInteractions = useAutomatedInteractions(filters, timezone)
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, automationRate, automatedInteractions, csat],
    }
}
