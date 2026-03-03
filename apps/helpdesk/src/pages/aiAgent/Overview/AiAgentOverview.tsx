import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useParams } from 'react-router-dom'

import { AlertBannerTypes } from 'AlertBanners'
import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { useActivation } from 'pages/aiAgent//Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import ThankYouModal from 'pages/aiAgent/Onboarding/components/ThankYouModal/ThankYouModal'
import { useKnowledgeServiceOpportunities } from 'pages/aiAgent/opportunities/hooks/useKnowledgeServiceOpportunities'
import { AiAgentTaskSection } from 'pages/aiAgent/Overview/components/AiAgentTaskSection/AiAgentTaskSection'
import { KpiSection } from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import { ResourcesSection } from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { AiAgentOverviewLayout } from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'
import {
    TOP_OPPORTUNITIES_LIMIT,
    TOP_OPPORTUNITIES_RESTRICTED_LIMIT,
} from 'pages/aiAgent/TopOpportunities/constants'
import { TopOpportunitiesSection } from 'pages/aiAgent/TopOpportunities/TopOpportunitiesSection'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import {
    getShopifyIntegrationByShopName,
    makeGetRedirectUri,
} from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStyle } from 'state/notifications/types'

import { useTrialAccess } from '../trial/hooks/useTrialAccess'

export const AiAgentOverview = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const [isAiAgentPostLive, setIsAiAgentPostLive] = useState(false)

    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || ''),
    )
    const currentPlansByProduct = useAppSelector(getCurrentPlansByProduct)
    const hasFullAccess =
        currentPlansByProduct?.automation?.plan_id.includes('usd-6')

    const hasResourceSection = useFlag(
        FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection,
    )

    const isShoppingAssistantTrialImprovement = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
    )

    const isShopifyStorefrontPermissionsEnabled = useFlag(
        FeatureFlagKey.ShopifyStorefrontPermissions,
    )

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
        if (hasFullAccess) return isOpportunitiesEnabled

        return (
            isOpportunitiesEnabled &&
            !!opportunities &&
            totalPending >= TOP_OPPORTUNITIES_RESTRICTED_LIMIT
        )
    }, [hasFullAccess, isOpportunitiesEnabled, opportunities, totalPending])

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

    const { isOpen, isLoading, handleModalAction, modalContent } =
        useThankYouModal()

    const { canSeeTrialCTA, canBookDemo, hasAnyTrialStarted, trialType } =
        useTrialAccess(shopName)

    const { storeActivations } = useStoreActivations()

    const {
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
    })

    /* TODO: [AIFLY-547] remove this when the trial improvement is enabled */
    useEffect(() => {
        if (
            (canSeeTrialCTA || canBookDemo) &&
            !hasAnyTrialStarted &&
            !isShoppingAssistantTrialImprovement
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
        trialType,
    ])

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

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
        if (
            isShopifyStorefrontPermissionsEnabled &&
            needScopeUpdate &&
            shopName
        ) {
            dispatch(
                notify({
                    id: `ai-agent-inventory-scope-${shopName}`,
                    style: NotificationStyle.Banner,
                    type: AlertBannerTypes.Warning,
                    message:
                        'Unlock smarter recommendations by giving AI Agent access to your Shopify inventory, ensuring it suggests in-stock items based on shopper location.',
                    CTA: {
                        type: 'action',
                        text: 'Allow Inventory Access',
                        onClick: retriggerOAuthFlow,
                    },
                }),
            )
        }
    }, [
        dispatch,
        isShopifyStorefrontPermissionsEnabled,
        needScopeUpdate,
        shopName,
        retriggerOAuthFlow,
    ])

    return (
        <AiAgentOverviewLayout shopName={shopName}>
            {/* TODO: [AIFLY-547] remove this when the trial improvement is enabled */}
            {!isShoppingAssistantTrialImprovement && (
                <>
                    {(canSeeTrialCTA || canBookDemo) && !hasAnyTrialStarted && (
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
            />
            {hasResourceSection && <ResourcesSection />}

            <ThankYouModal
                isOpen={isOpen}
                title={modalContent.title}
                description={modalContent.description}
                image={<img src={modalImage} alt="Thank you" />}
                actionLabel={modalContent.actionLabel}
                closeLabel={modalContent.closeLabel}
                onClick={onConfirmModal}
                onClose={onCloseModal}
                isLoading={isLoading}
                isActionLoading={modalContent.actionLoading}
            />
            {activationModal}
            {earlyAccessModal}
        </AiAgentOverviewLayout>
    )
}
