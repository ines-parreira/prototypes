import { useMemo } from 'react'

import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import {
    ButtonConfig,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import {
    logShoppingAssistantEvent,
    logShoppingAssistantInTrialEvent,
} from '../utils/eventLogger'

export const useSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: ReturnType<typeof useShoppingAssistantTrialAccess>,
    trialFlow: UseShoppingAssistantTrialFlowReturn,
): ButtonConfig | undefined => {
    return useMemo(() => {
        if (variant === PromoCardVariant.AdminTrialProgress) {
            const isOptedOut = trialAccess.hasCurrentStoreTrialOptedOut

            if (isOptedOut) return undefined

            return {
                label: 'Manage Trial',
                onClick: () => {
                    logShoppingAssistantInTrialEvent(
                        ShoppingAssistantEventType.ManageTrial,
                    )
                    trialFlow.openManageTrialModal()
                },
                disabled: false,
            }
        }

        if (variant === PromoCardVariant.LeadTrialProgress) return undefined

        if (trialAccess.canNotifyAdmin && trialAccess.canBookDemo) {
            return {
                label: 'Book a demo',
                href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
                target: '_blank',
                onClick: () =>
                    logShoppingAssistantEvent(ShoppingAssistantEventType.Demo),
                disabled: false,
            }
        }

        return {
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            target: '_blank',
            onClick: () =>
                logShoppingAssistantEvent(ShoppingAssistantEventType.Learn),
            disabled: false,
        }
    }, [variant, trialAccess, trialFlow])
}
