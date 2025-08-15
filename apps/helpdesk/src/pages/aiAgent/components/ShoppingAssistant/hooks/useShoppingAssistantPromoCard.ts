import { useEffect, useMemo } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import {
    PromoCardContent,
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'
import { usePrimaryCTA } from './usePrimaryCTA'
import { useSecondaryCTA } from './useSecondaryCTA'
import { useTrialDescription } from './useTrialDescription'
import { useTrialProgress } from './useTrialProgress'

export const useShoppingAssistantPromoCard = (
    shopName: string,
    allShopifyIntegrations: ShopifyIntegration[],
    routeShopName?: string,
): {
    promoCardContent: PromoCardContent | null
    trialFlow: ReturnType<typeof useShoppingAssistantTrialFlow>
    isLoading: boolean
} => {
    const account = useAppSelector(getCurrentAccountState)
    const accountDomain = account.get('domain')

    const isFeatureEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
        false,
    )

    const trialAccess = useShoppingAssistantTrialAccess(shopName)
    const { isDisabled } = useNotifyAdmins(shopName)
    const trialMetrics = useTrialMetrics()
    const trialEnding = useTrialEnding(shopName)
    const storeActivations = useStoreActivations({
        storeName: shopName,
    }).storeActivations
    const trialFlow = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const { button: primaryButton, variant } = usePrimaryCTA({
        trialAccess,
        trialFlow,
        isDisabled,
        trialMetrics,
        routeShopName,
        firstShopifyIntegration: allShopifyIntegrations[0],
    })

    const secondaryButton = useSecondaryCTA(variant, trialAccess, trialFlow)

    const isTrialProgress =
        variant === PromoCardVariant.AdminTrialProgress ||
        variant === PromoCardVariant.LeadTrialProgress

    const { description, shouldShowDescriptionIcon } = useTrialDescription(
        trialAccess.canNotifyAdmin,
        trialMetrics,
        isTrialProgress,
    )
    const { progressPercentage, progressText } = useTrialProgress(
        trialEnding.remainingDays,
    )

    const hasAnyAccess =
        trialAccess.canSeeTrialCTA ||
        trialAccess.canBookDemo ||
        trialAccess.canNotifyAdmin ||
        (trialAccess.hasCurrentStoreTrialStarted &&
            !trialAccess.hasCurrentStoreTrialExpired) ||
        trialAccess.hasAnyTrialStarted

    const promoCardContent = useMemo((): PromoCardContent | null => {
        if (!isFeatureEnabled || !hasAnyAccess) return null

        return {
            variant,
            title: isTrialProgress
                ? 'Shopping Assistant trial'
                : 'Unlock new AI Agent skills',
            description,
            shouldShowDescriptionIcon,
            showVideo: !isTrialProgress,
            shouldShowNotificationIcon: primaryButton.label
                .toLowerCase()
                .includes('admin'),
            primaryButton,
            secondaryButton,
            videoModalButton:
                !isTrialProgress && trialAccess.canSeeTrialCTA
                    ? {
                          label: primaryButton.label,
                          onClick: () => {
                              logShoppingAssistantEvent(
                                  ShoppingAssistantEventType.StartTrial,
                              )
                              trialFlow.openTrialUpgradeModal()
                          },
                          disabled: false,
                      }
                    : undefined,
            showProgressBar: isTrialProgress,
            progressPercentage: isTrialProgress
                ? progressPercentage
                : undefined,
            progressText: isTrialProgress ? progressText : undefined,
        }
    }, [
        isFeatureEnabled,
        hasAnyAccess,
        variant,
        isTrialProgress,
        description,
        shouldShowDescriptionIcon,
        primaryButton,
        secondaryButton,
        progressPercentage,
        progressText,
        trialAccess.canSeeTrialCTA,
        trialFlow,
    ])

    useEffect(() => {
        if (!promoCardContent) return
        const eventType = trialAccess.canSeeTrialCTA
            ? 'Trial'
            : trialAccess.canBookDemo
              ? 'Demo'
              : trialAccess.canNotifyAdmin
                ? 'Notify'
                : null

        if (eventType) {
            logEvent(SegmentEvent.TrialBannerOverviewViewed, {
                type: eventType,
            })
        }
    }, [trialAccess, promoCardContent])

    return {
        promoCardContent,
        trialFlow,
        isLoading: !!(trialMetrics.isLoading || trialAccess.isLoading),
    }
}
