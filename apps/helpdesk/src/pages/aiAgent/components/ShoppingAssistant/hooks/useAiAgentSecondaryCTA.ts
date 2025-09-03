import { useMemo } from 'react'

import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import {
    ButtonConfig,
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logInTrialEvent, logTrialBannerEvent } from '../utils/eventLogger'

/**
 * Returns the secondary CTA for the AI Agent based on the trial type
 * Pre-Trial:
 * - Admin / Lean:
 *   - Basic / Starter plan: Learn more
 *   - Pro + plan: Book a demo
 * In-Trial:
 * - Admin:
 *   - Not opted out: Manage Trial
 *   - Opted out: None
 * - Lead:
 *   - None
 */
export const useAiAgentSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: ReturnType<typeof useTrialAccess>,
    trialFlow: UseShoppingAssistantTrialFlowReturn,
): ButtonConfig | undefined => {
    return useMemo<ButtonConfig | undefined>(() => {
        const isAdminTrialProgress =
            variant === PromoCardVariant.AdminTrialProgress
        const isLeadTrialProgress =
            variant === PromoCardVariant.LeadTrialProgress
        const isOptedOut = trialAccess.hasCurrentStoreTrialOptedOut
        const canShowDemo = trialAccess.canBookDemo

        // ===== Button factories =====
        const manageTrialButton = (): ButtonConfig => ({
            label: 'Manage Trial',
            onClick: () => {
                logInTrialEvent(TrialEventType.ManageTrial, TrialType.AiAgent)
                trialFlow.openManageTrialModal()
            },
            disabled: false,
        })

        const bookDemoButton = (): ButtonConfig => ({
            label: 'Book a demo',
            href: EXTERNAL_URLS.AI_AGENT_TRIAL_BOOK_DEMO,
            target: '_blank',
            onClick: () =>
                logTrialBannerEvent(TrialEventType.Demo, TrialType.AiAgent),
            disabled: false,
        })

        const learnMoreButton = (): ButtonConfig => ({
            label: 'Learn more',
            href: EXTERNAL_URLS.AI_AGENT_TRIAL_LEARN_MORE,
            target: '_blank',
            onClick: () =>
                logTrialBannerEvent(TrialEventType.Learn, TrialType.AiAgent),
            disabled: false,
        })

        if (isAdminTrialProgress) {
            if (isOptedOut) return undefined
            return manageTrialButton()
        }

        if (isLeadTrialProgress) return undefined

        if (canShowDemo) return bookDemoButton()

        return learnMoreButton()
    }, [
        variant,
        trialAccess.hasCurrentStoreTrialOptedOut,
        trialAccess.canBookDemo,
        trialFlow,
    ])
}
