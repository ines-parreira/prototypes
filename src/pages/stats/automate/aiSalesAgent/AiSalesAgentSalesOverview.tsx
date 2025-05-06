import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import AiSalesAgentOverviewDownloadButton from 'pages/stats/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'pages/stats/automate/aiSalesAgent/constants'
import StatsPage from 'pages/stats/common/layout/StatsPage'

import SalesOverview from './components/SalesOverview'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()

    const shouldDisplayPaywall = !useCanUseAiSalesAgent()
    const { earlyAccessModal, showEarlyAccessModal } = useActivation(
        window.location.pathname,
    )

    if (shouldDisplayPaywall) {
        return (
            <>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <AIButton
                        intent="primary"
                        size="medium"
                        onClick={showEarlyAccessModal}
                    >
                        Upgrade Now
                    </AIButton>
                    <div data-candu-id="ai-sales-agent-stats-paywall" />
                </AiAgentPaywallView>
                {earlyAccessModal}
            </>
        )
    }

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <SalesOverview />
        </StatsPage>
    )
}

export default AiSalesAgentSalesOverview
