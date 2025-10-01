import { useHistory } from 'react-router-dom'

import { ShopifyIntegration } from 'models/integration/types'
import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

import {
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'
import {
    ButtonConfig,
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logInTrialEvent, logTrialBannerEvent } from '../utils/eventLogger'

type Params = {
    trialAccess: TrialAccess
    trialFlow: UseShoppingAssistantTrialFlowReturn
    isDisabled: boolean
    trialMetrics: TrialMetrics
    routeShopName?: string
    firstShopifyIntegration: ShopifyIntegration
}

type Result = {
    button: ButtonConfig
    variant: PromoCardVariant
}

/**
 * Returns the primary CTA for the Shopping Assistant based on the trial type.
 */
export const useShoppingAssistantPrimaryCTA = ({
    trialAccess,
    trialFlow,
    isDisabled,
    trialMetrics,
    routeShopName,
    firstShopifyIntegration,
}: Params): Result => {
    const history = useHistory()
    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const { gmvInfluencedRate } = trialMetrics
    const gmvAboveThreshold =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD

    const isAdmin = trialAccess.isAdminUser
    const isOptedOut = trialAccess.hasCurrentStoreTrialOptedOut
    const isInTrial =
        trialAccess.hasCurrentStoreTrialStarted &&
        !trialAccess.hasCurrentStoreTrialExpired

    // ===== Reusable handlers / button factories =====
    const redirectToFirstShopifyIntegration = () => {
        history.push(
            `/app/ai-agent/shopify/${firstShopifyIntegration.meta.shop_name}/sales`,
        )
    }

    const handleStartTrial = () => {
        logTrialBannerEvent(
            TrialEventType.StartTrial,
            TrialType.ShoppingAssistant,
        )
        if (!routeShopName) {
            redirectToFirstShopifyIntegration()
        } else {
            trialFlow.openTrialUpgradeModal()
        }
    }

    const upgradeNowButton = (): ButtonConfig => ({
        label: 'Upgrade now',
        onClick: async () => {
            logInTrialEvent(
                TrialEventType.UpgradePlan,
                TrialType.ShoppingAssistant,
            )
            if (isOptedOut) {
                trialFlow.openUpgradePlanModal(false)
            } else {
                await upgradePlanAsync()
            }
        },
        disabled: isUpgradePlanLoading,
        isLoading: isUpgradePlanLoading,
    })

    const disabledButton = (label = ''): ButtonConfig => ({
        label,
        disabled: true,
    })

    const bookDemoButton = (): ButtonConfig => ({
        label: 'Book a demo',
        href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
        target: '_blank',
        onClick: () =>
            logTrialBannerEvent(
                TrialEventType.Demo,
                TrialType.ShoppingAssistant,
            ),
        disabled: false,
    })

    const notifyAdminButton = (): ButtonConfig => ({
        label: isDisabled ? 'Admin notified' : 'Notify admin',
        onClick: () => {
            logTrialBannerEvent(
                TrialEventType.NotifyAdmin,
                TrialType.ShoppingAssistant,
            )
            trialFlow.openTrialRequestModal()
        },
        disabled: isDisabled,
    })

    const learnMoreButton = (): ButtonConfig => ({
        label: 'Learn more',
        href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
        target: '_blank',
        onClick: () =>
            logTrialBannerEvent(
                TrialEventType.Learn,
                TrialType.ShoppingAssistant,
            ),
        disabled: false,
    })

    if (trialAccess.hasCurrentStoreTrialExpired) {
        return {
            variant: PromoCardVariant.Hidden,
            button: learnMoreButton(),
        }
    }
    // ===== IN-TRIAL =====
    if (isInTrial) {
        const shouldShowUpgrade = isOptedOut || gmvAboveThreshold

        if (isAdmin) {
            if (shouldShowUpgrade) {
                return {
                    variant: PromoCardVariant.AdminTrialProgress,
                    button: upgradeNowButton(),
                }
            }
            // Intended: "Set Up Sales Strategy" (see Figma). Flow not ready; keep current "Upgrade now".
            return {
                variant: PromoCardVariant.AdminTrialProgress,
                button: upgradeNowButton(),
            }
        }

        // Lead in-trial
        if (shouldShowUpgrade) {
            return {
                variant: PromoCardVariant.LeadTrialProgress,
                button: disabledButton(''),
            }
        }
        // Intended: "Set Up Sales Strategy". Currently no button shown.
        return {
            variant: PromoCardVariant.LeadTrialProgress,
            button: disabledButton(''),
        }
    }

    // ===== PRE-TRIAL (Admin-visible CTAs) =====
    if (trialAccess.canSeeTrialCTA) {
        return {
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: handleStartTrial,
                disabled: false,
            },
        }
    }

    // ===== PRE-TRIAL (Lead notify admin with demo eligibility) =====
    if (trialAccess.canNotifyAdmin && trialAccess.canBookDemo) {
        return {
            variant: PromoCardVariant.LeadNotify,
            button: notifyAdminButton(),
        }
    }

    // ===== PRE-TRIAL (Admin can book demo) =====
    // Should be deleted once we remove the feature flag isAiAgentExpandingTrialExperienceForAll
    if (trialAccess.canBookDemo) {
        return {
            variant: PromoCardVariant.AdminDemo,
            button: bookDemoButton(),
        }
    }

    // ===== PRE-TRIAL (Lead notify admin only) =====
    // Should be deleted once we remove the feature flag isAiAgentExpandingTrialExperienceForAll
    if (trialAccess.canNotifyAdmin) {
        return {
            variant: PromoCardVariant.LeadNotify,
            button: notifyAdminButton(),
        }
    }

    // ===== Default: Hidden with Learn More =====
    return {
        variant: PromoCardVariant.Hidden,
        button: learnMoreButton(),
    }
}
