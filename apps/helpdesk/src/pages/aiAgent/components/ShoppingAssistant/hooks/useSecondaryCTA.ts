import { useMemo } from 'react'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import {
    ButtonConfig,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

export const useSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: any,
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
                onClick: () =>
                    logShoppingAssistantEvent(ShoppingAssistantEventType.Demo),
                disabled: false,
            }
        }

        return {
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            onClick: () =>
                logShoppingAssistantEvent(ShoppingAssistantEventType.Learn),
            disabled: false,
        }
    }, [variant, trialAccess])
}
