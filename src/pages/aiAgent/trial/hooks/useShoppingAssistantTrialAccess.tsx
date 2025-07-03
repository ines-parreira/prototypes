import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { HelpdeskPlanTier } from 'models/billing/types'
import { useStoreConfigurations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin, isTeamLead } from 'utils'

type ShoppingAssistantTrialAccess = {
    /** Whether the user can notify the admin about the trial (only for Leads) */
    canNotifyAdmin: boolean
    /** Whether the user can book a demo (Pro+ Admins without feature flag) */
    canBookDemo: boolean
    /** Whether the user can see the system banner (only for Admins) */
    canSeeSystemBanner: boolean
    /** Whether the user can see the trial CTA (only for Admins) */
    canSeeTrialCTA: boolean
}

/**
 * This hook centralizes all business rules for Shopping Assistant Trial access and display conditions.
 * It determines what trial-related UI components the user can see and interact with based on:
 * - User role (Admin, Team Lead)
 * - Plan eligibility (USD5 Automate, Starter/Basic Helpdesk, or Pro+ with feature flag)
 * - Store requirements (Shopify stores only)
 * - Trial history (no previous trials)
 * - AI Agent usage (for system banner specifically)
 *
 * The hook handles both global AI Agent pages (Overview) and store-specific contexts.
 *
 * @returns {ShoppingAssistantTrialAccess} Object containing boolean flags for each trial access permission
 */
export const useShoppingAssistantTrialAccess =
    (): ShoppingAssistantTrialAccess => {
        const currentUser = useAppSelector(getCurrentUser)
        const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
        const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
        const currentAccount = useAppSelector(getCurrentAccountState)
        const accountDomain = currentAccount.get('domain')

        // Get all store configurations to check trial history
        const { storeConfigurations } = useStoreConfigurations(accountDomain)

        // Hook must be called unconditionally due to React rules
        // We're checking trial history differently now, but keeping for compatibility
        useAtLeastOneStoreHasActiveTrial()

        // User is an admin
        const isAdminUser = isAdmin(currentUser)

        // User is a team lead
        const isTeamLeadUser = isTeamLead(currentUser)

        // Automate plan generation 5
        const isOnUsd5Plan =
            currentAutomatePlan?.generation &&
            currentAutomatePlan?.generation < 6

        // Starter or Basic Helpdesk plan
        const isOnStarterOrBasicPlan =
            currentHelpdeskPlan?.tier === HelpdeskPlanTier.STARTER ||
            currentHelpdeskPlan?.tier === HelpdeskPlanTier.BASIC

        // Pro+ Helpdesk plan (not Starter/Basic)
        const isOnProPlusPlan = !isOnStarterOrBasicPlan

        const flags = useFlags()

        const isRevampTrialEnabled =
            flags[FeatureFlagKey.ShoppingAssistantTrialRevamp]

        if (!isRevampTrialEnabled) {
            return {
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
            }
        }

        // Feature flag to force the display for Pro+ accounts
        const isAiShoppingAssistantTrialMerchantsEnabled =
            flags[FeatureFlagKey.AiShoppingAssistantTrialMerchants]

        // Check if AI Agent is being used on chat (any store with monitored chat integrations)
        const isUsingAiAgentOnChat = storeConfigurations.some(
            (config) => config.monitoredChatIntegrations.length > 0,
        )

        // System Banner: Global application banner (requires AI Agent on chat)
        const canSeeSystemBanner = Boolean(
            isAdminUser &&
                isOnUsd5Plan &&
                isOnStarterOrBasicPlan &&
                isUsingAiAgentOnChat,
        )

        // Trial Banner/CTA: For overview pages and sales paywall
        const canSeeTrialCTA = Boolean(
            isAdminUser &&
                isOnUsd5Plan &&
                (isOnStarterOrBasicPlan ||
                    isAiShoppingAssistantTrialMerchantsEnabled),
        )

        // Team leads can notify admin if trial CTA conditions are met (except admin check)
        const canNotifyAdmin = Boolean(
            isTeamLeadUser &&
                isOnUsd5Plan &&
                (isOnStarterOrBasicPlan ||
                    isAiShoppingAssistantTrialMerchantsEnabled),
        )

        // Pro+ Admins without feature flag can book a demo
        const canBookDemo = Boolean(
            isAdminUser &&
                isOnUsd5Plan &&
                isOnProPlusPlan &&
                !isAiShoppingAssistantTrialMerchantsEnabled,
        )

        return {
            canNotifyAdmin,
            canBookDemo,
            canSeeSystemBanner,
            canSeeTrialCTA,
        }
    }
