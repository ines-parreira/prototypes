import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import type { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import type { ButtonConfig } from '../types/ShoppingAssistant'
import {
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logInTrialEvent, logTrialBannerEvent } from '../utils/eventLogger'

/**
 * Returns the secondary CTA for the Shopping Assistant based on the trial type
 * Pre-Trial:
 * - Admin / Lead:
 *   - Basic / Starter plan: Learn more
 *   - Pro + plan: Book a demo
 * In-Trial:
 * - Admin:
 *   - Not opted out: Manage Trial
 *   - Opted out: None
 * - Lead:
 *   - None
 */
export const useShoppingAssistantSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: ReturnType<typeof useTrialAccess>,
    trialFlow: UseShoppingAssistantTrialFlowReturn,
): ButtonConfig | undefined => {
    const isAiAgentExpandingTrialExperienceForAll = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll,
    )

    return useMemo<ButtonConfig | undefined>(() => {
        const isAdminTrialProgress =
            variant === PromoCardVariant.AdminTrialProgress
        const isLeadTrialProgress =
            variant === PromoCardVariant.LeadTrialProgress
        const isOptedOut = trialAccess.hasCurrentStoreTrialOptedOut
        // Should be deleted once we remove the feature flag isAiAgentExpandingTrialExperienceForAll
        const canShowDemo = isAiAgentExpandingTrialExperienceForAll
            ? trialAccess.canBookDemo
            : trialAccess.canNotifyAdmin
        const canSeeTrialCTA = trialAccess.canSeeTrialCTA
        const canNotifyAdmin = trialAccess.canNotifyAdmin

        // ===== Button factories =====
        const manageTrialButton = (): ButtonConfig => ({
            label: 'Manage Trial',
            onClick: () => {
                logInTrialEvent(
                    TrialEventType.ManageTrial,
                    TrialType.ShoppingAssistant,
                )
                trialFlow.openManageTrialModal()
            },
            disabled: false,
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

        if (isAdminTrialProgress) {
            if (isOptedOut) return undefined
            return manageTrialButton()
        }

        if (isLeadTrialProgress) return undefined

        if (canShowDemo && (canSeeTrialCTA || canNotifyAdmin))
            return bookDemoButton()

        return learnMoreButton()
    }, [
        variant,
        trialAccess.hasCurrentStoreTrialOptedOut,
        trialAccess.canNotifyAdmin,
        trialAccess.canBookDemo,
        trialAccess.canSeeTrialCTA,
        trialFlow,
        isAiAgentExpandingTrialExperienceForAll,
    ])
}
