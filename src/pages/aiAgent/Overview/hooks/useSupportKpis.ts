import {StatsFilters} from 'models/stat/types'
import {useAutomatedInteractions} from 'pages/aiAgent/Overview/hooks/useAutomatedInteractions'
import {useAutomationRate} from 'pages/aiAgent/Overview/hooks/useAutomationRate'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/useCsat'

export const useSupportKpis = (filters: StatsFilters, timezone: string) => {
    const automationRate = useAutomationRate()
    const automatedInteractions = useAutomatedInteractions(filters, timezone)
    const csat = useCsat(filters, timezone)
    const coverageRate = useCoverageRate()

    return {
        metrics: [automationRate, automatedInteractions, csat, coverageRate],
    }
}
