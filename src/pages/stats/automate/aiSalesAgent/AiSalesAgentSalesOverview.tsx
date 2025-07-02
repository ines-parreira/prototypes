import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
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
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
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
    const [isTrialModalRevampOpen, setIsTrialModalRevampOpen] = useState(false)

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
        startTrial: startTrialOriginal,
        canStartTrial: canStartTrialOriginal,
        canStartTrialFromFeatureFlag,
        isLoading,
    } = useActivateAiAgentTrial({
        accountDomain,
        storeActivations,
        onSuccess,
    })

    const isShoppingAssistantTrialRevampEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialRevamp,
        false,
    )

    const { canSeeTrialCTA } = useShoppingAssistantTrialAccess()

    const canStartTrial = isShoppingAssistantTrialRevampEnabled
        ? canSeeTrialCTA
        : canStartTrialOriginal || canStartTrialFromFeatureFlag

    const onStartTrialClicked = () => {
        if (isShoppingAssistantTrialRevampEnabled) {
            setIsTrialModalRevampOpen(true)
        } else {
            startTrialOriginal()
        }
    }

    const { earlyAccessModal, showEarlyAccessModal } = useActivation({
        autoDisplayEarlyAccessDisabled:
            atLeastOneStoreHasActiveTrial ||
            isLoading ||
            canStartTrialOriginal ||
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
                {isTrialModalRevampOpen && (
                    <UpgradePlanModal
                        title="Try Shopping Assistant for 14 days at no additional cost"
                        onClose={() => {
                            setIsTrialModalRevampOpen(false)
                        }}
                        onConfirm={() => {
                            setIsTrialModalRevampOpen(false)
                        }}
                        currentPlan={{
                            title: 'Support Agent',
                            description:
                                'Provide best-in-class automated support',
                            price: '$450',
                            billingPeriod: 'month',
                            features: [
                                '2000 automated interactions',
                                'Deliver instant answers to repetitive questions and improve customer satisfaction',
                                'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                            ],
                            buttonText: 'Keep current plan',
                        }}
                        newPlan={{
                            title: 'Support Agent and Shopping Assistant ',
                            description:
                                'Unlock full potential to drive more sales',
                            price: '$530',
                            billingPeriod: 'month after trial ends',
                            features: [
                                'Everything in Support Agent skills',
                                'Proactively engage with customers to guide discovery',
                                'Personalize recommendations with rich customer insights',
                                'Intelligent upsell using customer input, not guesswork',
                                'Offer discounts based on purchase intent',
                            ],
                            buttonText: 'Try for 14 days',
                            priceTooltipText:
                                'Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a $X.XX helpdesk fee.',
                        }}
                    />
                )}
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
                            <Button
                                fillStyle="ghost"
                                onClick={onStartTrialClicked}
                            >
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
