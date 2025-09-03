import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useGetTrials } from 'models/aiAgent/queries'
import { AutomatePlan, HelpdeskPlanTier } from 'models/billing/types'
import { useStoreConfigurations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
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

export type TrialAccess = {
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

    isAdminUser: boolean
    isLoading?: boolean
    trialType: TrialType
    currentAutomatePlan: AutomatePlan | undefined
}

/**
 * This hook centralizes all business rules for Shopping Assistant Trial access and display conditions,
 * as well as AI Agent activation status across stores.
 *
 * It determines what trial-related UI components the user can see and interact with based on:
 * - User role (Admin, Team Lead)
 * - Plan eligibility (USD5 Automate, Starter/Basic Helpdesk, or Pro+ with feature flag)
 * - Store requirements (Shopify stores only)
 * - Trial history (no previous trials)
 * - AI Agent usage (for system banner specifically)
 * - AI Agent activation status (chat/email channels active/inactive)
 *
 * The hook handles both global AI Agent pages (Overview) and store-specific contexts.
 *
 * @returns {TrialAccess} Object containing boolean flags for trial access permissions and AI Agent status
 */
export const useTrialAccess = (currentStoreName?: string): TrialAccess => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    // Get all store configurations to check trial history
    const { storeConfigurations, isLoading: isStoreConfigsLoading } =
        useStoreConfigurations(accountDomain)

    const { data: trials, isLoading: isTrialsLoading } =
        useGetTrials(accountDomain)

    const isLoading = isStoreConfigsLoading || isTrialsLoading

    // Feature flag that controls the list of merchants that can start a trial
    const isAiShoppingAssistantTrialMerchantsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantTrialMerchants,
    )

    // Feature flag that controls new trial experience for shopping assistant
    const isShoppingAssistantTrialImprovement = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
    )

    // Feature flag that controls new trial experience for AI Agent
    const isAiAgentExpandingTrialExperienceForAllEnabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    // Check if AI Agent is being used on chat (any store with monitored chat integrations)
    const isUsingAiAgentOnChat = storeConfigurations.some(
        (config) => config.monitoredChatIntegrations.length > 0,
    )
    const isOnStarterOrBasicPlan =
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.STARTER ||
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.BASIC

    // Pro+ Helpdesk plan (tiers above Starter & Basic)
    const isOnProPlusPlan = !isOnStarterOrBasicPlan

    const trialType = useMemo((): TrialType => {
        // Case 1: Feature flag disabled - return shopping assistant
        if (!isAiAgentExpandingTrialExperienceForAllEnabled) {
            return TrialType.ShoppingAssistant
        }

        // Case 2: USD-4 (no automate plan) - return ai agent
        if (!currentAutomatePlan) {
            return TrialType.AiAgent
        }

        // Case 3: All other cases - return shopping assistant
        return TrialType.ShoppingAssistant
    }, [currentAutomatePlan, isAiAgentExpandingTrialExperienceForAllEnabled])

    const salesTrials = trials?.filter(
        (trial) => trial.type === TrialType.ShoppingAssistant,
    )
    const aiAgentTrials = trials?.filter(
        (trial) => trial.type === TrialType.AiAgent,
    )
    const salesStoreTrials = salesTrials?.filter(
        (trial) => trial.shopName === currentStoreName,
    )
    const aiAgentStoreTrials = aiAgentTrials?.filter(
        (trial) => trial.shopName === currentStoreName,
    )
    const currentStoreTrial =
        trialType === TrialType.AiAgent
            ? aiAgentStoreTrials?.[0]
            : salesStoreTrials?.[0]

    const currentTrials =
        trialType === TrialType.AiAgent ? aiAgentTrials : salesTrials

    // Early return for USD6+ plan users
    const isOnUsd6PlusPlan =
        currentAutomatePlan?.generation && currentAutomatePlan.generation >= 6
    if (isOnUsd6PlusPlan) {
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
            isAdminUser: isAdmin(currentUser),
            isLoading: false,
            trialType: TrialType.ShoppingAssistant,
            currentAutomatePlan,
        }
    }
    const isAdminUser = isAdmin(currentUser)
    const isTeamLeadUser = isTeamLead(currentUser)

    const hasCurrentStoreTrialStarted = currentStoreTrial
        ? hasTrialStarted(currentStoreTrial)
        : false
    const hasAnyTrialStarted =
        currentTrials?.some((trial) => hasTrialStarted(trial)) || false

    const hasCurrentStoreTrialOptedOut = currentStoreTrial
        ? hasTrialOptedOut(currentStoreTrial)
        : false
    const hasAnyTrialOptedOut =
        currentTrials?.some((trial) => hasTrialOptedOut(trial)) || false

    const hasCurrentStoreTrialExpired = currentStoreTrial
        ? hasTrialExpired(currentStoreTrial)
        : false
    const hasAnyTrialExpired =
        currentTrials?.some((trial) => hasTrialExpired(trial)) || false

    const hasAnyTrialOptedIn =
        currentTrials?.some((trial) => hasTrialOptedIn(trial)) || false

    const hasAnyTrialActive =
        currentTrials?.some((trial) => hasTrialActive(trial)) || false

    // System Banner: Global application banner (requires AI Agent on chat)
    const canSeeSystemBanner = Boolean(
        isAdminUser &&
            isOnStarterOrBasicPlan &&
            isUsingAiAgentOnChat &&
            !hasAnyTrialStarted,
    )

    // Trial Banner/CTA: For overview pages and sales paywall
    const canSeeTrialCTA = Boolean(
        !isLoading &&
            isAdminUser &&
            !hasCurrentStoreTrialStarted &&
            !hasCurrentStoreTrialExpired &&
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

    /*
     * Pro+ Admins and Lead Agents without feature flag[isAiShoppingAssistantTrialMerchantsEnabled] can book a demo
     * Flow:
     *   1. Pro+ users that are not on the SLG (Sales Lead Growth) list can see book a demo button
     *   2. After the demo they are added into SLG list
     *   3. They can see CTAs / start trial
     */
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

        isAdminUser,
        isLoading,
        trialType,
        currentAutomatePlan,
    }
}
