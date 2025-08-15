import { useHistory } from 'react-router-dom'

import { ShopifyIntegration } from 'models/integration/types'
import { ShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'

import {
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from '../constants/shoppingAssistant'
import {
    ButtonConfig,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import {
    logShoppingAssistantEvent,
    logShoppingAssistantInTrialEvent,
} from '../utils/eventLogger'

export const usePrimaryCTA = ({
    trialAccess,
    trialFlow,
    isDisabled,
    trialMetrics,
    routeShopName,
    firstShopifyIntegration,
}: {
    trialAccess: ShoppingAssistantTrialAccess
    trialFlow: UseShoppingAssistantTrialFlowReturn
    isDisabled: boolean
    trialMetrics: TrialMetrics
    routeShopName: string | undefined
    firstShopifyIntegration: ShopifyIntegration
}): {
    button: ButtonConfig
    variant: PromoCardVariant
} => {
    const history = useHistory()
    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const { gmvInfluencedRate } = trialMetrics

    const gmvAboveThreshold =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
    const isOptedOut = trialAccess.hasCurrentStoreTrialOptedOut
    const isInTrial =
        trialAccess.hasCurrentStoreTrialStarted &&
        !trialAccess.hasCurrentStoreTrialExpired

    const redirectToFirstShopifyIntegration = () => {
        history.push(
            `/app/ai-agent/shopify/${firstShopifyIntegration.meta.shop_name}/sales`,
        )
    }

    if (isInTrial) {
        if (trialAccess.isAdminUser) {
            if (isOptedOut || gmvAboveThreshold) {
                return {
                    variant: PromoCardVariant.AdminTrialProgress,
                    button: {
                        label: 'Upgrade now',
                        onClick: async () => {
                            logShoppingAssistantInTrialEvent(
                                ShoppingAssistantEventType.UpgradePlan,
                            )
                            await upgradePlanAsync()
                        },
                        disabled: isUpgradePlanLoading,
                        isLoading: isUpgradePlanLoading,
                    },
                }
            }

            // This case is supposed to have label `Set Up Sales Strategy`
            // as based on the design: https://www.figma.com/design/Mz0ejOxuLqF5NmpQjCFJfk/Post-GA-Shopping-Assistant-Trial-Improvements?node-id=6219-52993&m=dev
            // Currently the flow does not exist yet, so we just show `Upgrade now`
            return {
                variant: PromoCardVariant.AdminTrialProgress,
                button: {
                    label: 'Upgrade now',
                    onClick: async () => {
                        logShoppingAssistantInTrialEvent(
                            ShoppingAssistantEventType.UpgradePlan,
                        )
                        await upgradePlanAsync()
                    },
                    disabled: isUpgradePlanLoading,
                    isLoading: isUpgradePlanLoading,
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

        // This case is supposed to have label `Set Up Sales Strategy`
        // as based on the design: https://www.figma.com/design/Mz0ejOxuLqF5NmpQjCFJfk/Post-GA-Shopping-Assistant-Trial-Improvements?node-id=6219-52993&m=dev
        // Currently the flow does not exist yet, so we don't show any button
        return {
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: '',
                disabled: true,
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

                    if (!routeShopName) {
                        redirectToFirstShopifyIntegration()
                    } else {
                        trialFlow.openTrialUpgradeModal()
                    }
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
                target: '_blank',
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
            target: '_blank',
            onClick: () =>
                logShoppingAssistantEvent(ShoppingAssistantEventType.Learn),
            disabled: false,
        },
    }
}
