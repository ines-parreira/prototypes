import {StatsFilters} from 'models/stat/types'
import {useAutomatedInteractions} from 'pages/aiAgent/Overview/hooks/kpis/useAutomatedInteractions'
import {useAutomationRate} from 'pages/aiAgent/Overview/hooks/kpis/useAutomationRate'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/kpis/useCsat'

export const useSupportKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const automationRate = useAutomationRate(filters, timezone)
    const automatedInteractions = useAutomatedInteractions(filters, timezone)
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, automationRate, automatedInteractions, csat],
    }
}
