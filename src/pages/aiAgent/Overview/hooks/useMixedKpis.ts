import {StatsFilters} from 'models/stat/types'
import {useAutomationRate} from 'pages/aiAgent/Overview/hooks/kpis/useAutomationRate'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/kpis/useCsat'

export const useMixedKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate(filters, timezone)
    const automationRate = useAutomationRate(filters, timezone)
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, automationRate, csat],
    }
}
