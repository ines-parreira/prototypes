import {StatsFilters} from 'models/stat/types'
import {useAutomationRate} from 'pages/aiAgent/Overview/hooks/useAutomationRate'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/useCsat'
import {useGmvInfluenced} from 'pages/aiAgent/Overview/hooks/useGmvInfluenced'

export const useMixedKpis = (filters: StatsFilters, timezone: string) => {
    const coverageRate = useCoverageRate()
    const gmvInfluenced = useGmvInfluenced()
    const automationRate = useAutomationRate()
    const csat = useCsat(filters, timezone)

    return {
        metrics: [coverageRate, gmvInfluenced, automationRate, csat],
    }
}
