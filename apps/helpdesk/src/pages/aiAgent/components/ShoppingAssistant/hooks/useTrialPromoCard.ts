import { useEffect, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import type { PromoCardContent } from '../types/ShoppingAssistant'
import {
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logTrialBannerEvent } from '../utils/eventLogger'
import { getPromoCardTitle } from '../utils/trialPromoCardUtils'
import { usePrimaryCTA } from './usePrimaryCTA'
import { useSecondaryCTA } from './useSecondaryCTA'
import { useTrialDescription } from './useTrialDescription'
import { useTrialProgress } from './useTrialProgress'

export const useTrialPromoCard = (
    shopName: string,
    allShopifyIntegrations: ShopifyIntegration[],
    routeShopName?: string,
): {
    trialAccess: TrialAccess
    promoCardContent: PromoCardContent | null
    trialFlow: ReturnType<typeof useShoppingAssistantTrialFlow>
    isLoading: boolean
    automationRate?: {
        value: number
        prevValue: number
        isLoading: boolean
    }
} => {
    const account = useAppSelector(getCurrentAccountState)
    const accountDomain = account.get('domain')

    const isFeatureEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
        false,
    )
    const isExpandingTrialExperienceMilestone2Enabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceMilestone2,
        false,
    )
    const isAbTestingEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantAbTesting,
        false,
    )

    const trialAccess = useTrialAccess(shopName)
    const { isDisabled } = useNotifyAdmins(shopName, trialAccess.trialType)
    const trialMetrics = useTrialMetrics(trialAccess.trialType, shopName)
    const trialEnding = useTrialEnding(shopName, trialAccess.trialType)
    const storeActivations = useStoreActivations({
        storeName: shopName,
    }).storeActivations
    const trialFlow = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType: trialAccess.trialType,
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
        trialAccess.trialType,
        isExpandingTrialExperienceMilestone2Enabled,
        trialAccess.isOnboarded,
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
        if (!isFeatureEnabled || !hasAnyAccess || isAbTestingEnabled)
            return null

        const title = getPromoCardTitle(
            isExpandingTrialExperienceMilestone2Enabled,
            trialAccess.trialType,
            isTrialProgress,
            trialAccess.isOnboarded,
        )
        if (trialAccess.trialType === TrialType.AiAgent) {
            return {
                variant,
                title,
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
                                  logTrialBannerEvent(
                                      TrialEventType.StartTrial,
                                      TrialType.AiAgent,
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
        }

        return {
            variant,
            title,
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
                              logTrialBannerEvent(TrialEventType.StartTrial)
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
        isAbTestingEnabled,
        variant,
        isTrialProgress,
        description,
        shouldShowDescriptionIcon,
        primaryButton,
        secondaryButton,
        progressPercentage,
        progressText,
        trialAccess.canSeeTrialCTA,
        trialAccess.trialType,
        trialAccess.isOnboarded,
        isExpandingTrialExperienceMilestone2Enabled,
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
                trialType: trialAccess.trialType,
            })
        }
    }, [trialAccess, promoCardContent])

    return {
        trialAccess,
        promoCardContent,
        trialFlow,
        isLoading: !!(trialMetrics.isLoading || trialAccess.isLoading),
        automationRate: trialMetrics.automationRate,
    }
}
