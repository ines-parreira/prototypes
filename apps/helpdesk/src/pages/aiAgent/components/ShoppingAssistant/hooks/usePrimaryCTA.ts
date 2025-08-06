import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import {
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'
import {
    ButtonConfig,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

export const usePrimaryCTA = ({
    trialAccess,
    trialFlow,
    isDisabled,
    trialMetrics,
}: any): {
    button: ButtonConfig
    variant: PromoCardVariant
} => {
    const { gmvInfluencedRate, isLoading: isLoadingMetrics } = trialMetrics

    const gmvAboveThreshold =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
    const isOptedOut =
        trialAccess.hasCurrentStoreTrialOptedOut ||
        trialAccess.hasAnyTrialOptedOut

    const isInTrial = trialAccess.hasCurrentStoreTrialStarted

    const isAdmin = trialAccess.canSeeTrialCTA

    if (isInTrial) {
        if (isAdmin) {
            if (isOptedOut || gmvAboveThreshold) {
                return {
                    variant: PromoCardVariant.AdminTrialProgress,
                    button: {
                        label: 'Upgrade now',
                        onClick: () => {},
                        disabled: isLoadingMetrics,
                    },
                }
            }
            return {
                variant: PromoCardVariant.AdminTrialProgress,
                button: {
                    label: 'Set Up Sales Strategy',
                    onClick: () => {},
                    disabled: false,
                },
            }
        }

        if (isOptedOut || gmvAboveThreshold) {
            return {
                variant: PromoCardVariant.LeadTrialProgress,
                button: {
                    label: '',
                    disabled: true,
                },
            }
        }

        return {
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: 'Set Up Sales Strategy',
                onClick: () => {},
                disabled: false,
            },
        }
    }

    if (trialAccess.canSeeTrialCTA) {
        return {
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: () => {
                    logShoppingAssistantEvent(
                        ShoppingAssistantEventType.StartTrial,
                    )
                    trialFlow.openTrialUpgradeModal()
                },
                disabled: false,
            },
        }
    }

    if (trialAccess.canNotifyAdmin && trialAccess.canBookDemo) {
        return {
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: isDisabled ? 'Admin notified' : 'Notify admin',
                onClick: () => {
                    logShoppingAssistantEvent(
                        ShoppingAssistantEventType.NotifyAdmin,
                    )
                    trialFlow.openTrialRequestModal()
                },
                disabled: isDisabled,
            },
        }
    }

    if (trialAccess.canBookDemo) {
        return {
            variant: PromoCardVariant.AdminDemo,
            button: {
                label: 'Book a demo',
                href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
                onClick: () =>
                    logShoppingAssistantEvent(ShoppingAssistantEventType.Demo),
                disabled: false,
            },
        }
    }

    if (trialAccess.canNotifyAdmin) {
        return {
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: isDisabled ? 'Admin notified' : 'Notify admin',
                onClick: () => {
                    logShoppingAssistantEvent(
                        ShoppingAssistantEventType.NotifyAdmin,
                    )
                    trialFlow.openTrialRequestModal()
                },
                disabled: isDisabled,
            },
        }
    }

    return {
        variant: PromoCardVariant.Hidden,
        button: {
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            onClick: () =>
                logShoppingAssistantEvent(ShoppingAssistantEventType.Learn),
            disabled: false,
        },
    }
}
