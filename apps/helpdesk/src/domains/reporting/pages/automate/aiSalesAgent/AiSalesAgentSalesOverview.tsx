import { useEffect, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import AiSalesAgentOverviewDownloadButton from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import css from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentSalesOverview.less'
import SalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview'
import { PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import AIAgentTrialSuccessModal from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const AiSalesAgentSalesOverview = () => {
    useCleanStatsFilters()
    const history = useHistory()
    const milestone = useSalesTrialRevampMilestone()
    const { hasAnyTrialActive } = useTrialAccess()
    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()
    const legacyShouldDisplayPaywall =
        !useCanUseAiSalesAgent() && !atLeastOneStoreHasActiveTrial

    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { storeActivations } = useStoreActivations()

    const isAiSalesAlphaDemoUser = useFlag(
        FeatureFlagKey.AiSalesAgentBypassPlanCheck,
        false,
    )

    const shouldDisplayPaywall =
        milestone === 'milestone-1'
            ? !hasAnyTrialActive &&
              !hasNewAutomatePlan &&
              !isAiSalesAlphaDemoUser
            : legacyShouldDisplayPaywall

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onSuccess = () => {
        setIsModalOpen(true)
    }

    const {
        routes,
        startTrial: startTrialOriginal,
        canStartTrial: canStartTrialOriginal,
        canStartTrialFromFeatureFlag,
        isLoading,
    } = useActivateAiAgentTrial({
        accountDomain,
        storeActivations,
        onSuccess,
    })

    const trialMilestone = useSalesTrialRevampMilestone()
    const isShoppingAssistantTrialRevampEnabled = trialMilestone !== 'off'

    const { canSeeTrialCTA } = useTrialAccess()

    const canStartTrial = isShoppingAssistantTrialRevampEnabled
        ? canSeeTrialCTA
        : canStartTrialOriginal || canStartTrialFromFeatureFlag

    const onStartTrialClicked = () => {
        startTrialOriginal()
    }

    const { earlyAccessModal, showEarlyAccessModal } = useActivation({
        autoDisplayEarlyAccessDisabled:
            atLeastOneStoreHasActiveTrial || isLoading || canStartTrial,
    })
    const { data: earlyAccessPlan } = useEarlyAccessAutomatePlan()

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

    useEffect(() => {
        if (!shouldDisplayPaywall) {
            logEvent(SegmentEvent.StatShoppingAssistantPageViewed)
        }
    }, [shouldDisplayPaywall])

    if (shouldDisplayPaywall) {
        return (
            <>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <div className={css.wrapper}>
                        {earlyAccessPlan && (
                            <AIButton
                                intent="primary"
                                size="medium"
                                onClick={showEarlyAccessModal}
                                className={css.upgradeButton}
                            >
                                Upgrade Now
                            </AIButton>
                        )}

                        {canStartTrial && (
                            <Button
                                fillStyle="ghost"
                                onClick={onStartTrialClicked}
                            >
                                Try for {SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS}{' '}
                                days
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
