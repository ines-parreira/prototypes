import { useHistory } from 'react-router-dom'

import type { ShopifyIntegration } from '@gorgias/helpdesk-types'

import type { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import type { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

import { AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD } from '../constants/shoppingAssistant'
import type { ButtonConfig } from '../types/ShoppingAssistant'
import {
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
 * Returns the primary CTA for the AI Agent based on the trial type
 * Pre-Trial:
 * - Admin:
 *   - Non-Automate account: Try for free
 *   - Automate account: Try for free
 * - Lead:
 *   - Notify admin
 *
 * In-Trial:
 * - Admin:
 *   - Opted out or automation above threshold: Upgrade now
 *   - Opted in and automation below threshold: Set Up Automation
 * - Lead:
 *   - Opted out or automation above threshold: None
 *   - Opted in and automation below threshold: Set Up Automation
 */
export const useAiAgentPrimaryCTA = ({
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

    const automationRate = trialMetrics.automationRate?.value ?? 0
    const automationAboveThreshold =
        automationRate != null &&
        automationRate > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD

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
        logTrialBannerEvent(TrialEventType.StartTrial, TrialType.AiAgent)
        if (!routeShopName) {
            redirectToFirstShopifyIntegration()
        } else {
            trialFlow.openTrialUpgradeModal()
        }
    }

    const upgradeNowButton = (): ButtonConfig => ({
        label: 'Upgrade now',
        onClick: async () => {
            logInTrialEvent(TrialEventType.UpgradePlan, TrialType.AiAgent)
            await upgradePlanAsync()
        },
        disabled: isUpgradePlanLoading,
        isLoading: isUpgradePlanLoading,
    })

    const disabledButton = (label = ''): ButtonConfig => ({
        label,
        disabled: true,
    })

    if (trialAccess.hasCurrentStoreTrialExpired) {
        return {
            variant: PromoCardVariant.Hidden,
            button: disabledButton(''),
        }
    }

    // ===== IN-TRIAL =====
    if (isInTrial) {
        const shouldShowUpgrade = isOptedOut || automationAboveThreshold

        if (isAdmin) {
            // Admin in-trial
            if (shouldShowUpgrade) {
                return {
                    variant: PromoCardVariant.AdminTrialProgress,
                    button: upgradeNowButton(),
                }
            }
            // Intended: "Set Up Automation"; current behavior keeps "Upgrade now"
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
        // Intended: "Set Up Automation"; current behavior keeps disabled empty label
        return {
            variant: PromoCardVariant.LeadTrialProgress,
            button: disabledButton(''),
        }
    }

    // ===== PRE-TRIAL (Admin-visible CTAs) =====
    const adminSeesTrialCTA =
        trialAccess.canSeeTrialCTA || (isAdmin && trialAccess.canBookDemo)

    if (adminSeesTrialCTA) {
        const startTrialButton: ButtonConfig = {
            label: 'Try for free',
            onClick: handleStartTrial,
            disabled: false,
        }

        return {
            variant: PromoCardVariant.AdminTrial,
            button: startTrialButton,
        }
    }

    // ===== PRE-TRIAL (Lead notify admin) =====
    if (trialAccess.canNotifyAdmin) {
        return {
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: isDisabled ? 'Admin notified' : 'Notify admin',
                onClick: () => {
                    logTrialBannerEvent(
                        TrialEventType.NotifyAdmin,
                        TrialType.AiAgent,
                    )
                    trialFlow.openTrialRequestModal()
                },
                disabled: isDisabled,
            },
        }
    }

    // ===== Hidden by default =====
    return {
        variant: PromoCardVariant.Hidden,
        button: disabledButton(''),
    }
}
