import { useMemo } from 'react'

import {
    FeatureFlagKey,
    useFlag,
    useFlagWithLoading,
} from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { useGetTrials } from 'models/aiAgent/queries'
import type { Trial } from 'models/aiAgent/types'
import type { AutomatePlan } from 'models/billing/types'
import { HelpdeskPlanTier } from 'models/billing/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import {
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
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
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import { CompanyTier } from 'state/currentCompany/currentCompanySlice'
import { getCompanyFixedGmvBandTier } from 'state/currentCompany/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin, isTeamLead } from 'utils'

export const gmvBandsAllowedToSelfServe = [
    CompanyTier.Band1, // SMB
    CompanyTier.Band2, // Commercial
]

export const gmvBandsAllowedToBookDemo = [
    CompanyTier.Band2, // Commercial
    CompanyTier.Band3, // Enterprise
    CompanyTier.Band4, // Named Accounts
]

/**
 * Creates a restricted trial access object for early return scenarios.
 * All access flags are set to false, indicating no trial access is available.
 */
const createRestrictedTrialAccess = (
    trialType: TrialType,
    currentAutomatePlan: AutomatePlan | undefined,
    isAdminUser: boolean,
    isTrialingSubscription: boolean,
    trials: Trial[] | undefined,
): TrialAccess => ({
    canNotifyAdmin: false,
    canBookDemo: false,
    canSeeSystemBanner: false,
    canSeeTrialCTA: false,
    canSeeSubscribeNowCTA: false,
    hasCurrentStoreTrialStarted: false,
    hasAiAgentStoreTrialStarted: false,
    hasAnyTrialStarted: false,
    hasCurrentStoreTrialExpired: false,
    hasAnyTrialExpired: false,
    hasCurrentStoreTrialOptedOut: false,
    hasAnyTrialOptedOut: false,
    hasAnyTrialOptedIn: false,
    hasCurrentStoreTrialActive: false,
    hasAnyTrialActive: false,
    isAdminUser,
    isLoading: false,
    trialType,
    currentAutomatePlan,
    isInAiAgentTrial: false,
    isOnboarded: false,
    isTrialingSubscription,
    trials,
})

export type TrialAccess = {
    /** Whether the user can notify the admin about the trial (only for Leads) */
    canNotifyAdmin: boolean
    /** Whether the user can book a demo (Pro+ Admins without feature flag) */
    canBookDemo: boolean
    /** Whether the user can see the system banner (only for Admins) */
    canSeeSystemBanner: boolean
    /** Whether the user can see the trial CTA (only for Admins) */
    canSeeTrialCTA: boolean
    /** Whether the user can see the subscribe now CTA (only for Admins) */
    canSeeSubscribeNowCTA: boolean

    hasCurrentStoreTrialStarted: boolean
    /**
     * True when an AI Agent trial exists for the current store, regardless of
     * `trialType`. Use this to recognize a started AI Agent trial for Gen5+
     * Automate users whose `trialType` resolves to `ShoppingAssistant`.
     */
    hasAiAgentStoreTrialStarted: boolean
    hasAnyTrialStarted: boolean
    hasCurrentStoreTrialOptedOut: boolean
    hasAnyTrialOptedOut: boolean
    hasCurrentStoreTrialExpired: boolean
    hasAnyTrialExpired: boolean
    /** Whether at least one store has an active trial that hasn't opted out */
    hasAnyTrialOptedIn: boolean
    hasCurrentStoreTrialActive: boolean
    hasAnyTrialActive: boolean

    isAdminUser: boolean
    isLoading?: boolean
    isError?: boolean
    trialType: TrialType
    currentAutomatePlan: AutomatePlan | undefined
    isInAiAgentTrial: boolean
    isOnboarded: boolean | undefined
    isTrialingSubscription: boolean
    trials: Trial[] | undefined
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
    const onboardingState = useAiAgentOnboardingState(currentStoreName ?? '')
    const gmvBandTier =
        useAppSelector(getCompanyFixedGmvBandTier) ?? CompanyTier.Band1 // Default to SMB

    const isTrialingSubscription = useAppSelector(isTrialing)

    const {
        data: trials,
        isLoading: isTrialsLoading,
        isError: isTrialsError,
    } = useGetTrials(accountDomain)

    const isLoading = isTrialsLoading

    // Feature flag that controls the list of merchants that can start a trial
    const isAiShoppingAssistantTrialMerchantsEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantTrialMerchants,
    )

    // Gates the no-automate AI Agent trial experience for helpdesk-trialing
    // merchants. While off, this cohort keeps the legacy restricted behavior.
    const { value: expandingTrialForAll } = useFlagWithLoading<
        boolean | 'loading_state'
    >(FeatureFlagKey.AiAgentExpandingTrialExperienceForAll, false)
    const isExpandingTrialForAllEnabled = expandingTrialForAll === true
    const { value: isV3OnboardingEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentOnboardingV3,
        false,
    )
    // The wizard-first, pre-trial cohort only exists under V3. Require V3 here so
    // V2 behavior stays on the legacy restricted path even though the expanding
    // flag is GA; the expanding flag remains a global kill-switch.
    const isWizardFirstTrialEnabled =
        isExpandingTrialForAllEnabled && isV3OnboardingEnabled === true

    const isOnStarterOrBasicPlan =
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.STARTER ||
        currentHelpdeskPlan?.tier === HelpdeskPlanTier.BASIC

    // Pro+ Helpdesk plan (tiers above Starter & Basic)
    const isOnProPlusPlan = !isOnStarterOrBasicPlan

    const trialType = useMemo((): TrialType => {
        // Case 1: USD-4 (no automate plan) - return ai agent
        if (!currentAutomatePlan) {
            return TrialType.AiAgent
        }

        // Case 2: All other cases - return shopping assistant
        return TrialType.ShoppingAssistant
    }, [currentAutomatePlan])

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

    // Keeps an already-started AI Agent trial alive if V3 is rolled back, so the
    // early return below can't re-lock access mid-trial. Shop vs no-shop mirrors
    // useAiAgentAccess (hasCurrentStoreTrialActive vs hasAnyTrialActive). V2
    // never starts this trial, so it stays false there.
    const hasActiveAiAgentTrial =
        trialType === TrialType.AiAgent &&
        (currentStoreName
            ? !!currentStoreTrial && hasTrialActive(currentStoreTrial)
            : aiAgentTrials?.some((trial) => hasTrialActive(trial)) === true)

    // Early return suppresses a Shopping Assistant trial offer while the helpdesk
    // subscription is still trialing. Skip it for the no-automate AI Agent path:
    // under V3 those merchants trial AI Agent now, and canned-false state would
    // hide the CTA and blind the started trial. Gated on V3 (not the GA expanding
    // flag) so V2 surfaces stay legacy; hasActiveAiAgentTrial covers V3 rollback.
    if (
        isTrialingSubscription &&
        !(
            trialType === TrialType.AiAgent &&
            (isWizardFirstTrialEnabled || hasActiveAiAgentTrial)
        )
    ) {
        return createRestrictedTrialAccess(
            trialType,
            currentAutomatePlan,
            isAdmin(currentUser),
            isTrialingSubscription,
            trials,
        )
    }

    // Early return for USD6+ plan users
    const isOnUsd6PlusPlan =
        currentAutomatePlan?.generation && currentAutomatePlan.generation >= 6
    if (isOnUsd6PlusPlan) {
        return createRestrictedTrialAccess(
            TrialType.ShoppingAssistant,
            currentAutomatePlan,
            isAdmin(currentUser),
            isTrialingSubscription,
            trials,
        )
    }
    const isAdminUser = isAdmin(currentUser)
    const isTeamLeadUser = isTeamLead(currentUser)

    const hasCurrentStoreTrialStarted = currentStoreTrial
        ? hasTrialStarted(currentStoreTrial)
        : false
    const hasAiAgentStoreTrialStarted =
        aiAgentStoreTrials?.some((trial) => hasTrialStarted(trial)) || false
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

    const hasCurrentStoreTrialActive = currentStoreTrial
        ? hasTrialActive(currentStoreTrial)
        : false
    const hasAnyTrialActive =
        currentTrials?.some((trial) => hasTrialActive(trial)) || false

    // Calculate onboarding state early, needed for CTA logic below
    const isOnboarded =
        onboardingState === OnboardingState.Loading
            ? undefined
            : onboardingState === OnboardingState.Onboarded

    // System Banner: Global application banner (requires AI Agent on chat)
    const canSeeSystemBanner = Boolean(
        (isAdminUser || isTeamLeadUser) && !hasAnyTrialStarted,
    )

    // Trial Banner/CTA: For overview pages and sales paywall
    const canSeeTrialCTA = Boolean(
        !isLoading &&
        isAdminUser &&
        !hasCurrentStoreTrialStarted &&
        !hasCurrentStoreTrialExpired &&
        (isAiShoppingAssistantTrialMerchantsEnabled ||
            gmvBandsAllowedToSelfServe.includes(gmvBandTier)),
    )

    // Subscribe Now Banner/CTA
    const canSeeSubscribeNowCTA = Boolean(
        !isLoading &&
        isAdminUser &&
        (hasCurrentStoreTrialStarted || hasCurrentStoreTrialExpired) &&
        (isAiShoppingAssistantTrialMerchantsEnabled ||
            gmvBandsAllowedToSelfServe.includes(gmvBandTier)),
    )

    // Team leads can notify admin if trial CTA conditions are met (except admin check)
    const canNotifyAdmin = Boolean(
        isTeamLeadUser &&
        !isAdminUser &&
        (isOnStarterOrBasicPlan ||
            isOnProPlusPlan ||
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
        gmvBandsAllowedToBookDemo.includes(gmvBandTier) &&
        // Explicit check to false because the FF is undefined while loading
        isAiShoppingAssistantTrialMerchantsEnabled === false,
    )

    const isInAiAgentTrial =
        trialType === TrialType.AiAgent &&
        hasCurrentStoreTrialStarted &&
        !hasCurrentStoreTrialExpired

    return {
        canNotifyAdmin,
        canBookDemo,
        canSeeSystemBanner,
        canSeeTrialCTA,
        canSeeSubscribeNowCTA,

        hasCurrentStoreTrialStarted,
        hasAiAgentStoreTrialStarted,
        hasAnyTrialStarted,
        hasCurrentStoreTrialExpired,
        hasAnyTrialExpired,
        hasCurrentStoreTrialOptedOut,
        hasAnyTrialOptedOut,
        hasAnyTrialOptedIn,
        hasCurrentStoreTrialActive,
        hasAnyTrialActive,

        isAdminUser,
        isLoading,
        isError: isTrialsError,
        trialType,
        currentAutomatePlan,
        isInAiAgentTrial,
        isOnboarded,
        isTrialingSubscription,
        trials,
    }
}
