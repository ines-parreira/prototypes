import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    FeatureFlagKey,
    useFlag,
    useFlagWithLoading,
} from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useEffectOnce } from '@gorgias/toolkit-react'

import { Button, toast } from '@gorgias/axiom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import { useAppSelector } from 'hooks/useAppSelector'
import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { IntegrationType } from 'models/integration/constants'
import { useActivation } from 'pages/aiAgent//Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { ThankYouModal } from 'pages/aiAgent/components/ThankYouModal/ThankYouModal'
import { useNeedsAiAgentTrialOptIn } from 'pages/aiAgent/hooks/useNeedsAiAgentTrialOptIn'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useSkillsAccess } from 'pages/aiAgent/hooks/useSkillsAccess'
import { GoToSkillsBanner } from 'pages/aiAgent/KnowledgeHub/GoToSkillsBanner/GoToSkillsBanner'
import { useHasAccessToOpportunities } from 'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities'
import { useKnowledgeServiceOpportunities } from 'pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities'
import { AiAgentTaskSection } from 'pages/aiAgent/Overview/components/AiAgentTaskSection/AiAgentTaskSection'
import { KpiSection } from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import { ResourcesSection } from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import { SetupModeBanner } from 'pages/aiAgent/Overview/components/SetupModeBanner/SetupModeBanner'
import { TrialOptInBanner } from 'pages/aiAgent/Overview/components/TrialOptInBanner/TrialOptInBanner'
import { usePostOnboardingTasksSection } from 'pages/aiAgent/Overview/hooks/usePostOnboardingTasksSection'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { AiAgentOverviewLayout } from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'
import {
    TOP_OPPORTUNITIES_LIMIT,
    TOP_OPPORTUNITIES_RESTRICTED_LIMIT,
} from 'pages/aiAgent/TopOpportunities/constants'
import { TopOpportunitiesSection } from 'pages/aiAgent/TopOpportunities/TopOpportunitiesSection'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialActivationModal } from 'pages/aiAgent/trial/components/TrialActivationModal'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import {
    getShopifyIntegrationByShopName,
    makeGetRedirectUri,
} from 'state/integrations/selectors'

import { useTrialAccess } from '../trial/hooks/useTrialAccess'

export const AiAgentOverview = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const [isAiAgentPostLive, setIsAiAgentPostLive] = useState(false)

    const location = useLocation<
        { aiAgentSetupComplete?: boolean } | undefined
    >()
    const history = useHistory()

    useEffect(() => {
        if (!location.state?.aiAgentSetupComplete) return

        toast.success('AI Agent setup complete')
        history.replace({
            pathname: location.pathname,
            search: location.search,
        })
    }, [location.state, location.pathname, location.search, history])

    const currentAccount = useAppSelector(getCurrentAccountState)
    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || ''),
    )
    const hasAccessToOpportunities = useHasAccessToOpportunities(shopName)

    const isShoppingAssistantTrialImprovement = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
    )

    const {
        value: isAiAgentOnboardingV3Enabled,
        isLoading: isAiAgentOnboardingV3FlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentOnboardingV3, false)

    const isTopOpportunitiesEnabled = useFlag(
        FeatureFlagKey.IncreaseVisibilityOfOpportunity,
        false,
    )

    const isUseKnowledgeServiceEnabled = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
        false,
    )

    const isOpportunitiesEnabled = useMemo(
        () => isTopOpportunitiesEnabled && isUseKnowledgeServiceEnabled,
        [isTopOpportunitiesEnabled, isUseKnowledgeServiceEnabled],
    )

    const shopIntegrationId = useShopIntegrationId(shopName)
    const {
        opportunities,
        isLoading: isOpportunitiesLoading,
        allowedOpportunityIds,
        totalPending,
    } = useKnowledgeServiceOpportunities(
        shopIntegrationId ?? 0,
        !!shopIntegrationId &&
            !!isTopOpportunitiesEnabled &&
            !!isUseKnowledgeServiceEnabled,
        TOP_OPPORTUNITIES_LIMIT,
    )

    const displayTopOpportunitiesSection = useMemo(() => {
        if (hasAccessToOpportunities) return isOpportunitiesEnabled

        return (
            isOpportunitiesEnabled &&
            !!opportunities &&
            totalPending >= TOP_OPPORTUNITIES_RESTRICTED_LIMIT
        )
    }, [
        hasAccessToOpportunities,
        isOpportunitiesEnabled,
        opportunities,
        totalPending,
    ])

    const {
        activationModal,
        earlyAccessModal,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
    } = useActivation({
        autoDisplayEarlyAccessDisabled: true,
    })

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOverviewPageView, {
            shopName,
            shopType,
        })
    })

    const accountDomain = currentAccount.get('domain')

    // V2 post-wizard "go live" modal, opened via the `from=onboarding` query
    // param. V3 replaces it with the setup-complete toast above; keeping the
    // modal gated behind that param means a V3 rollback restores the V2 flow.
    const {
        isOpen: isThankYouModalOpen,
        isLoading: isThankYouModalLoading,
        handleModalAction,
        modalContent,
    } = useThankYouModal()

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

    const { canSeeTrialCTA, canBookDemo, hasAnyTrialStarted, trialType } =
        useTrialAccess(shopName)

    const { needsOptIn } = useNeedsAiAgentTrialOptIn(shopName)
    const hasSkillsAccess = useSkillsAccess()

    const { isStepCompleted } = usePostOnboardingTasksSection({
        shopName,
        shopType,
    })

    // Both setup banners are V3-only and shown only while the user still needs to
    // opt into the trial (`needsOptIn`): once the trial has started, neither
    // banner renders. The trial opt-in is offered only once AI Agent has been
    // configured — Train (5 guidances) and Test (a playground execution) both
    // complete; until then we keep the user in setup mode rather than inviting
    // them to start the trial prematurely.
    const isAiAgentConfigured =
        isStepCompleted(StepName.TRAIN) && isStepCompleted(StepName.TEST)

    const { storeActivations, isFetchLoading } = useStoreActivations({
        storeName: shopName,
        withChatIntegrationsStatus: needsOptIn,
        withStoresKnowledgeStatus: needsOptIn,
    })

    const {
        startTrial,
        startTrialDeprecated,
        isLoading: isTrialRevampLoading,
        isTrialModalOpen: isTrialUpgradeModalOpen,
        isSuccessModalOpen,
        closeTrialUpgradeModal,
        closeSuccessModal,
        onConfirmTrial,
        onDismissTrialUpgradeModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
        // The trial opt-in modal is owned here (see render below) but only when
        // `needsOptIn` (V3-gated). Scope the source to that case so confirming uses
        // the post-setup flow — a ShoppingAssistant trial start then skips the
        // finish-setup modal, which V3 Overview does not render — while leaving the
        // V2 path (which uses startTrialDeprecated, ignoring source) untouched.
        source: needsOptIn ? 'overview_post_setup' : undefined,
    })

    /* TODO: [COACH-718] remove this when the trial improvement is enabled */
    useEffect(() => {
        if (
            (canSeeTrialCTA || canBookDemo) &&
            !hasAnyTrialStarted &&
            !isShoppingAssistantTrialImprovement &&
            !isAiAgentOnboardingV3FlagLoading &&
            !isAiAgentOnboardingV3Enabled
        ) {
            logEvent(SegmentEvent.TrialBannerOverviewViewed, {
                type: canBookDemo ? 'Demo' : 'Trial',
                trialType,
            })
        }
    }, [
        canSeeTrialCTA,
        canBookDemo,
        hasAnyTrialStarted,
        isShoppingAssistantTrialImprovement,
        isAiAgentOnboardingV3FlagLoading,
        isAiAgentOnboardingV3Enabled,
        trialType,
    ])

    const trialModalProps = useTrialModalProps({ onConfirmTrial })

    const redirectUriTemplate = getRedirectUri(IntegrationType.Shopify)

    const REQUIRED_INVENTORY_SCOPES = [
        'unauthenticated_read_product_listings',
        'unauthenticated_read_product_inventory',
    ]

    const currentScopes = shopifyIntegration?.getIn(
        ['meta', 'oauth', 'scope'],
        '',
    )
    const isMissingInventoryScopes = REQUIRED_INVENTORY_SCOPES.some(
        (scope) => !currentScopes?.includes(scope),
    )

    const needScopeUpdate =
        Boolean(
            shopifyIntegration?.getIn(['meta', 'need_scope_update'], false),
        ) && isMissingInventoryScopes

    const retriggerOAuthFlow = useCallback(() => {
        if (redirectUriTemplate && shopName) {
            window.location.href = redirectUriTemplate.replace(
                '{shop_name}',
                shopName,
            )
        }
    }, [shopName, redirectUriTemplate])

    useEffect(() => {
        if (needScopeUpdate && shopName) {
            toast.warning(
                'Unlock smarter recommendations by giving AI Agent access to your Shopify inventory, ensuring it suggests in-stock items based on shopper location.',
                {
                    id: `ai-agent-inventory-scope-${shopName}`,
                    duration: Infinity,
                    actions: (
                        <Button size="sm" onClick={retriggerOAuthFlow}>
                            Allow Inventory Access
                        </Button>
                    ),
                },
            )
        }
    }, [needScopeUpdate, shopName, retriggerOAuthFlow])

    return (
        <AiAgentOverviewLayout shopName={shopName}>
            {needsOptIn && (
                <>
                    {isAiAgentConfigured ? (
                        <TrialOptInBanner
                            shopName={shopName}
                            storeActivations={storeActivations}
                        />
                    ) : (
                        <SetupModeBanner />
                    )}
                    {/*
                     * Single render site for the trial opt-in modal. It's opened
                     * from multiple triggers — the TrialOptInBanner button (post
                     * Train + Test) and the DeploySection deploy toggles (setup
                     * mode) — which all flip the same shared useModalManager state
                     * keyed by trialType. Mounting it here, at the level that owns
                     * the whole opt-in flow, keeps exactly one instance available
                     * for both phases.
                     */}
                    <TrialActivationModal
                        isOpen={isTrialUpgradeModalOpen}
                        onClose={closeTrialUpgradeModal}
                        onConfirm={startTrial}
                        trialType={trialType}
                        newPlan={
                            trialModalProps.newTrialUpgradePlanModal.newPlan
                        }
                        isLoading={isTrialRevampLoading}
                        isConfirmDisabled={isFetchLoading}
                    />
                </>
            )}
            {hasSkillsAccess && (
                <GoToSkillsBanner
                    shopName={shopName}
                    title="Skills are here: review and enable your recommendations"
                    description="We created the core set of skills your AI Agent needs."
                    width="fit-content"
                />
            )}

            {/* TODO: [COACH-718] remove this when the trial improvement is enabled */}
            {!isShoppingAssistantTrialImprovement &&
                !needsOptIn &&
                !isAiAgentOnboardingV3FlagLoading &&
                !isAiAgentOnboardingV3Enabled && (
                    <>
                        {(canSeeTrialCTA || canBookDemo) &&
                            !hasAnyTrialStarted && (
                                <TrialAlertBanner
                                    {...trialModalProps.trialAlertBanner}
                                />
                            )}

                        {isTrialUpgradeModalOpen && (
                            <UpgradePlanModal
                                {...trialModalProps.trialUpgradePlanModal}
                                onClose={closeTrialUpgradeModal}
                                onConfirm={startTrialDeprecated}
                                onDismiss={onDismissTrialUpgradeModal}
                                isLoading={isTrialRevampLoading}
                                isTrial
                            />
                        )}

                        {isSuccessModalOpen && (
                            <TrialActivatedModal
                                {...trialModalProps.trialActivatedModal}
                                onConfirm={closeSuccessModal}
                            />
                        )}
                    </>
                )}

            {isAiAgentPostLive && (
                <KpiSection
                    isOnNewPlan={isOnNewPlan}
                    showActivationModal={showActivationModal}
                    showEarlyAccessModal={showEarlyAccessModal}
                    shopName={shopName}
                />
            )}

            {displayTopOpportunitiesSection && (
                <TopOpportunitiesSection
                    shopName={shopName}
                    shopIntegrationId={shopIntegrationId}
                    opportunities={opportunities}
                    isLoading={isOpportunitiesLoading}
                    totalCount={totalPending}
                    allowedOpportunityIds={allowedOpportunityIds}
                />
            )}

            <AiAgentTaskSection
                shopName={shopName}
                shopType={shopType}
                setIsAiAgentPostLive={setIsAiAgentPostLive}
                needsTrialOptIn={needsOptIn}
            />
            <ResourcesSection />

            <ThankYouModal
                isOpen={isThankYouModalOpen}
                title={modalContent.title}
                description={modalContent.description}
                image={<img src={modalImage} alt="Thank you" />}
                actionLabel={modalContent.actionLabel}
                closeLabel={modalContent.closeLabel}
                onClick={onConfirmModal}
                onClose={onCloseModal}
                isLoading={isThankYouModalLoading}
                isActionLoading={modalContent.actionLoading}
            />
            {activationModal}
            {earlyAccessModal}
        </AiAgentOverviewLayout>
    )
}
