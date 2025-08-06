import { useMemo } from 'react'

import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import {
    ButtonConfig,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

export const useSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: ReturnType<typeof useShoppingAssistantTrialAccess>,
): ButtonConfig | undefined => {
    return useMemo(() => {
        if (variant === PromoCardVariant.AdminTrialProgress) {
            const isOptedOut =
                trialAccess.hasCurrentStoreTrialOptedOut ||
                trialAccess.hasAnyTrialOptedOut

            if (isOptedOut) return undefined

            return {
                label: 'Manage Trial',
                onClick: () => {},
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
    }, [variant, trialAccess])
}
