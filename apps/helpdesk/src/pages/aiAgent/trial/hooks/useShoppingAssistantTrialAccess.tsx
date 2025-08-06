import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { HelpdeskPlanTier } from 'models/billing/types'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    hasTrialActive,
    hasTrialExpired,
    hasTrialOptedIn,
    hasTrialOptedOut,
    hasTrialStarted,
} from 'pages/aiAgent/trial/utils/utils'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin, isTeamLead } from 'utils'

import { useSalesTrialRevampMilestone } from './useSalesTrialRevampMilestone'

export type ShoppingAssistantTrialAccess = {
    /** Whether the user can notify the admin about the trial (only for Leads) */
    canNotifyAdmin: boolean
    /** Whether the user can book a demo (Pro+ Admins without feature flag) */
    canBookDemo: boolean
    /** Whether the user can see the system banner (only for Admins) */
    canSeeSystemBanner: boolean
    /** Whether the user can see the trial CTA (only for Admins) */
    canSeeTrialCTA: boolean

    hasCurrentStoreTrialStarted: boolean
    hasAnyTrialStarted: boolean
    hasCurrentStoreTrialOptedOut: boolean
    hasAnyTrialOptedOut: boolean
    hasCurrentStoreTrialExpired: boolean
    hasAnyTrialExpired: boolean
    /** Whether at least one store has an active trial that hasn't opted out */
    hasAnyTrialOptedIn: boolean
    hasAnyTrialActive: boolean

    isLoading?: boolean
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
export const useShoppingAssistantTrialAccess = (
    currentStoreName?: string,
): ShoppingAssistantTrialAccess => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    // Get all store configurations to check trial history
    const { storeConfigurations } = useStoreConfigurations(accountDomain)

    const { storeActivations, isFetchLoading } = useStoreActivations({
        storeName: currentStoreName,
    })
    const currentStore = currentStoreName
        ? storeActivations[currentStoreName]
        : undefined

    const trialMilestone = useSalesTrialRevampMilestone()

    const flags = useFlags()

    const isRevampTrialEnabled = trialMilestone === 'milestone-1'

    // Automate plan generation 5
    const isOnUsd5Plan =
        currentAutomatePlan?.generation && currentAutomatePlan?.generation < 6

    if (!isRevampTrialEnabled || !isOnUsd5Plan) {
        return {
            canNotifyAdmin: false,
            canBookDemo: false,
            canSeeSystemBanner: false,
            canSeeTrialCTA: false,

            hasCurrentStoreTrialStarted: false,
            hasAnyTrialStarted: false,
            hasCurrentStoreTrialExpired: false,
            hasAnyTrialExpired: false,
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
            hasAnyTrialOptedIn: false,
            hasAnyTrialActive: false,

            isLoading: false,
        }
    }

    const isAdminUser = isAdmin(currentUser)
    const isTeamLeadUser = isTeamLead(currentUser)

    const hasCurrentStoreTrialStarted = currentStore
        ? hasTrialStarted(currentStore.configuration)
        : false
    const hasAnyTrialStarted = storeConfigurations.some(hasTrialStarted)

    const hasCurrentStoreTrialOptedOut = currentStore
        ? hasTrialOptedOut(currentStore.configuration)
        : false
    const hasAnyTrialOptedOut = storeConfigurations.some(hasTrialOptedOut)

    const hasCurrentStoreTrialExpired = currentStore
        ? hasTrialExpired(currentStore.configuration)
        : false
    const hasAnyTrialExpired = storeConfigurations.some(hasTrialExpired)

    const hasAnyTrialOptedIn = storeConfigurations.some(hasTrialOptedIn)

    const hasAnyTrialActive = storeConfigurations.some(hasTrialActive)

    const isOnStarterOrBasicPlan =
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.STARTER ||
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.BASIC

    // Pro+ Helpdesk plan (tiers above Starter & Basic)
    const isOnProPlusPlan = !isOnStarterOrBasicPlan

    // Feature flag to force the display for Pro+ accounts
    const isAiShoppingAssistantTrialMerchantsEnabled =
        flags[FeatureFlagKey.AiShoppingAssistantTrialMerchants]

    const isShoppingAssistantTrialImprovement =
        flags[FeatureFlagKey.ShoppingAssistantTrialImprovement]

    // Check if AI Agent is being used on chat (any store with monitored chat integrations)
    const isUsingAiAgentOnChat = storeConfigurations.some(
        (config) => config.monitoredChatIntegrations.length > 0,
    )

    // System Banner: Global application banner (requires AI Agent on chat)
    const canSeeSystemBanner = Boolean(
        isAdminUser &&
            isOnStarterOrBasicPlan &&
            isUsingAiAgentOnChat &&
            !hasAnyTrialStarted,
    )

    // Trial Banner/CTA: For overview pages and sales paywall
    const canSeeTrialCTA = Boolean(
        isAdminUser &&
            !hasCurrentStoreTrialStarted &&
            (isOnStarterOrBasicPlan ||
                isAiShoppingAssistantTrialMerchantsEnabled),
    )

    // Team leads can notify admin if trial CTA conditions are met (except admin check)
    const canNotifyAdmin = Boolean(
        isTeamLeadUser &&
            !isAdminUser &&
            (isOnStarterOrBasicPlan ||
                (isShoppingAssistantTrialImprovement && isOnProPlusPlan) ||
                isAiShoppingAssistantTrialMerchantsEnabled),
    )

    // Pro+ Admins and Lead Agents without feature flag can book a demo
    const canBookDemo = Boolean(
        (isAdminUser || isTeamLeadUser) &&
            isOnProPlusPlan &&
            // Explicit check to false because the FF is undefined while loading
            isAiShoppingAssistantTrialMerchantsEnabled === false,
    )

    return {
        canNotifyAdmin,
        canBookDemo,
        canSeeSystemBanner,
        canSeeTrialCTA,

        hasCurrentStoreTrialStarted,
        hasAnyTrialStarted,
        hasCurrentStoreTrialExpired,
        hasAnyTrialExpired,
        hasCurrentStoreTrialOptedOut,
        hasAnyTrialOptedOut,
        hasAnyTrialOptedIn,
        hasAnyTrialActive,

        isLoading: isFetchLoading,
    }
}
