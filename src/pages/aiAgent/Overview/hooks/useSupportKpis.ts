import {useAutomatedInteractions} from 'pages/aiAgent/Overview/hooks/useAutomatedInteractions'
import {useAutomationRate} from 'pages/aiAgent/Overview/hooks/useAutomationRate'
import {useCoverageRate} from 'pages/aiAgent/Overview/hooks/useCoverageRate'
import {useCsat} from 'pages/aiAgent/Overview/hooks/useCsat'

export const useSupportKpis = () => {
    const automationRate = useAutomationRate()
    const automatedInteractions = useAutomatedInteractions()
    const csat = useCsat()
    const coverageRate = useCoverageRate()

    return {
        metrics: [automationRate, automatedInteractions, csat, coverageRate],
    }
}
