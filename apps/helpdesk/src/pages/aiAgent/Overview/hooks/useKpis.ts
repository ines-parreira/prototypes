import { StatsFilters } from 'domains/reporting/models/stat/types'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { useCoverageRate } from 'pages/aiAgent/Overview/hooks/kpis/useCoverageRate'
import { useCsat } from 'pages/aiAgent/Overview/hooks/kpis/useCsat'
import { useGmvInfluenced } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluenced'
import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

export const useKpis = ({
    automationRateFilters,
    filters,
    timezone,
    aiAgentType,
    aiAgentUserId,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: {
    automationRateFilters: StatsFilters
    filters: StatsFilters
    timezone: string
    aiAgentType?: AiAgentType
    aiAgentUserId: number
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}) => {
    const coverageRate = useCoverageRate(automationRateFilters, timezone)
    const automationRate = useAiAgentAutomationRate(
        automationRateFilters,
        timezone,
    )
    const gmvInfluenced = useGmvInfluenced({
        filters: filters,
        timezone: timezone,
        aiAgentType: aiAgentType,
        isOnNewPlan: isOnNewPlan,
        showEarlyAccessModal: showEarlyAccessModal,
        showActivationModal: showActivationModal,
    })
    const csat = useCsat(filters, timezone, aiAgentUserId)

    return {
        metrics: [coverageRate, automationRate, gmvInfluenced, csat],
    }
}
