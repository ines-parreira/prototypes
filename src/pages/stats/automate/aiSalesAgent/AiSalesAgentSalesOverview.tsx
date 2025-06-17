import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import AIAgentTrialSuccessModal from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import AiSalesAgentOverviewDownloadButton from 'pages/stats/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'pages/stats/automate/aiSalesAgent/constants'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import SalesOverview from './components/SalesOverview'

import css from './AiSalesAgentSalesOverview.less'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()
    const history = useHistory()
    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()

    const shouldDisplayPaywall =
        !useCanUseAiSalesAgent() && !atLeastOneStoreHasActiveTrial

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { storeActivations } = useStoreActivations()

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onSuccess = () => {
        setIsModalOpen(true)
    }

    const {
        routes,
        startTrial,
        canStartTrial,
        canStartTrialFromFeatureFlag,
        isLoading,
    } = useActivateAiAgentTrial({
        accountDomain,
        storeActivations,
        onSuccess,
    })

    const { earlyAccessModal, showEarlyAccessModal } = useActivation({
        autoDisplayEarlyAccessDisabled:
            atLeastOneStoreHasActiveTrial ||
            isLoading ||
            canStartTrial ||
            canStartTrialFromFeatureFlag,
    })

    const component: React.ReactNode = (
        <AIAgentTrialSuccessModal
            isOpen={isModalOpen}
            onClick={() => {
                history.push(routes.customerEngagement)
                setIsModalOpen(false)
            }}
            onClose={() => {
                setIsModalOpen(false)
            }}
        />
    )

    if (shouldDisplayPaywall) {
        return (
            <>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <div className={css.wrapper}>
                        <AIButton
                            intent="primary"
                            size="medium"
                            onClick={showEarlyAccessModal}
                        >
                            Upgrade Now
                        </AIButton>

                        {canStartTrial && (
                            <Button fillStyle="ghost" onClick={startTrial}>
                                Start 14-Day Trial At No Additional Cost
                            </Button>
                        )}

                        <div data-candu-id="ai-sales-agent-stats-paywall" />
                    </div>
                </AiAgentPaywallView>
                {earlyAccessModal}
                {component}
            </>
        )
    }

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <SalesOverview />
            {component}
        </StatsPage>
    )
}

export default AiSalesAgentSalesOverview
