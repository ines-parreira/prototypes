import { useCallback, useEffect, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export enum PromoCardVariant {
    AdminTrial = 'admin-trial',
    AdminDemo = 'admin-demo',
    LeadNotify = 'lead-notify',
    AdminTrialProgress = 'admin-trial-progress',
    LeadTrialProgress = 'lead-trial-progress',
    Hidden = 'hidden',
}

export enum ShoppingAssistantEventType {
    StartTrial = 'Start Trial',
    Demo = 'Demo',
    Learn = 'Learn',
    NotifyAdmin = 'Notify Admin',
}

export interface ButtonConfig {
    label: string
    href?: string
    target?: string
    onClick?: () => void
    disabled?: boolean
}

export interface PromoCardContent {
    variant: PromoCardVariant
    title: string
    description: string
    shouldShowDescriptionIcon: boolean
    showVideo: boolean
    shouldShowNotificationIcon: boolean
    primaryButton: ButtonConfig
    secondaryButton?: ButtonConfig
    videoModalButton?: ButtonConfig
    showProgressBar?: boolean
    progressPercentage?: number
    progressText?: string
}

const GMV_THRESHOLD = 0.05
const TRIAL_DURATION_DAYS = 14

type TrialMetricsStatus = {
    gmvAboveThreshold: boolean
    shouldShowGmvDescription: boolean
    isLoadingMetrics: boolean
}

const useTrialMetricsStatus = (
    gmvInfluencedRate: number,
    isMetricsLoading: boolean,
    trialAccess: any,
): TrialMetricsStatus => {
    return useMemo(() => {
        const gmvAboveThreshold = gmvInfluencedRate > GMV_THRESHOLD
        const isInTrial =
            trialAccess.hasCurrentStoreTrialStarted ||
            trialAccess.hasAnyTrialStarted
        const isOptedOut =
            trialAccess.hasCurrentStoreTrialOptedOut ||
            trialAccess.hasAnyTrialOptedOut

        // Show GMV description when opted out or when GMV is above threshold
        const shouldShowGmvDescription =
            isInTrial && (isOptedOut || gmvAboveThreshold)

        return {
            gmvAboveThreshold,
            shouldShowGmvDescription,
            isLoadingMetrics: isMetricsLoading,
        }
    }, [gmvInfluencedRate, isMetricsLoading, trialAccess])
}

export const useShoppingAssistantPromoCard = (): PromoCardContent | null => {
    const { shopName: routeShopName } = useParams<{ shopName?: string }>()
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    // Fallback to first shop if shopName is undefined
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

    const isShoppingAssistantTrialImprovementEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
        false,
    )

    const account = useAppSelector(getCurrentAccountState)
    const accountDomain = account.get('domain')

    const trialAccess = useShoppingAssistantTrialAccess(shopName)

    const {
        isLoading: isMetricsLoading,
        gmvInfluencedRate,
        gmvInfluenced,
    } = useTrialMetrics()

    const { remainingDays } = useTrialEnding(shopName)

    const { gmvAboveThreshold, shouldShowGmvDescription, isLoadingMetrics } =
        useTrialMetricsStatus(gmvInfluencedRate, isMetricsLoading, trialAccess)

    const { storeActivations } = useStoreActivations({
        storeName: shopName,
    })

    const trialFlow = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        onUpgradeModalClose: () => {
            return
        },
        onSuccessModalOpen: () => {
            return
        },
    })

    const logShoppingAssistantEvent = useCallback(
        (eventType: ShoppingAssistantEventType) => {
            switch (eventType) {
                case ShoppingAssistantEventType.StartTrial:
                case ShoppingAssistantEventType.Demo:
                case ShoppingAssistantEventType.Learn:
                case ShoppingAssistantEventType.NotifyAdmin:
                    logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, {
                        CTA: eventType,
                    })
                    break
                default:
                    console.warn(
                        `Unsupported shopping assistant event type: ${eventType}`,
                    )
            }
        },
        [],
    )

    const handlePrimaryCTA = useCallback((): {
        button: ButtonConfig
        variant: PromoCardVariant
    } => {
        // During trial scenarios
        if (
            trialAccess.hasCurrentStoreTrialStarted ||
            trialAccess.hasAnyTrialStarted
        ) {
            const isAdmin = trialAccess.canSeeTrialCTA
            const isOptedOut =
                trialAccess.hasCurrentStoreTrialOptedOut ||
                trialAccess.hasAnyTrialOptedOut

            if (isAdmin) {
                // Admin cases - Show upgrade button if opted out or GMV above threshold
                if (isOptedOut || gmvAboveThreshold) {
                    return {
                        variant: PromoCardVariant.AdminTrialProgress,
                        button: {
                            label: 'Upgrade now',
                            onClick: () => {
                                return
                            },
                            disabled: isLoadingMetrics,
                        },
                    }
                }
                return {
                    variant: PromoCardVariant.AdminTrialProgress,
                    button: {
                        label: 'Set Up Sales Strategy',
                        onClick: () => {
                            return
                        },
                        disabled: false,
                    },
                }
            }
            // Lead cases
            if (isOptedOut || gmvAboveThreshold) {
                // Lead opted out OR GMV > threshold: no CTAs
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
                    onClick: () => {
                        return
                    },
                    disabled: false,
                },
            }
        }

        if (trialAccess.canSeeTrialCTA) {
            return {
                variant: PromoCardVariant.AdminTrial,
                button: {
                    label: `Try for ${TRIAL_DURATION_DAYS} days`,
                    onClick: () => {
                        logShoppingAssistantEvent(
                            ShoppingAssistantEventType.StartTrial,
                        )
                        trialFlow.onConfirmTrial()
                    },
                    disabled: false,
                },
            }
        }

        if (trialAccess.canNotifyAdmin && trialAccess.canBookDemo) {
            return {
                variant: PromoCardVariant.LeadNotify,
                button: {
                    label: 'Notify admin',
                    onClick: () => {
                        logShoppingAssistantEvent(
                            ShoppingAssistantEventType.NotifyAdmin,
                        )
                    },
                    disabled: false,
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
                        logShoppingAssistantEvent(
                            ShoppingAssistantEventType.Demo,
                        ),
                    disabled: false,
                },
            }
        }

        if (trialAccess.canNotifyAdmin) {
            return {
                variant: PromoCardVariant.LeadNotify,
                button: {
                    label: 'Notify admin',
                    onClick: () => {
                        logShoppingAssistantEvent(
                            ShoppingAssistantEventType.NotifyAdmin,
                        )
                    },
                    disabled: false,
                },
            }
        }

        // Default case
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
    }, [
        trialAccess,
        logShoppingAssistantEvent,
        trialFlow,
        gmvAboveThreshold,
        isLoadingMetrics,
    ])

    const handleSecondaryCTA = useCallback(
        (variant: PromoCardVariant): ButtonConfig | undefined => {
            if (variant === PromoCardVariant.AdminTrialProgress) {
                // Hide secondary button when customer opts out of trial
                if (
                    trialAccess.hasCurrentStoreTrialOptedOut ||
                    trialAccess.hasAnyTrialOptedOut
                ) {
                    return undefined
                }

                return {
                    label: 'Manage Trial',
                    onClick: () => {
                        return
                    },
                    disabled: false,
                }
            }

            // No secondary CTAs for lead trial progress
            if (variant === PromoCardVariant.LeadTrialProgress) {
                return undefined
            }

            if (trialAccess.canNotifyAdmin && trialAccess.canBookDemo) {
                return {
                    label: 'Book a demo',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
                    onClick: () =>
                        logShoppingAssistantEvent(
                            ShoppingAssistantEventType.Demo,
                        ),
                    disabled: false,
                }
            }

            // Default case
            return {
                label: 'Learn more',
                href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                onClick: () =>
                    logShoppingAssistantEvent(ShoppingAssistantEventType.Learn),
                disabled: false,
            }
        },
        [trialAccess, logShoppingAssistantEvent],
    )

    const getTrialProgress = useCallback((): {
        progressPercentage: number
        progressText: string
    } => {
        const progressPercentage = Math.max(
            0,
            Math.min(
                100,
                Math.round((remainingDays / TRIAL_DURATION_DAYS) * 100),
            ),
        )

        // Format progress text
        let progressText: string
        if (remainingDays === 0) {
            progressText = 'Trial ends today'
        } else if (remainingDays === 1) {
            progressText = '1 day left'
        } else {
            progressText = `${remainingDays} days left`
        }

        return {
            progressPercentage,
            progressText,
        }
    }, [remainingDays])

    const getTrialDescription = useCallback((): {
        description: string
        shouldShowDescriptionIcon: boolean
    } => {
        // During trial scenarios
        if (
            trialAccess.hasCurrentStoreTrialStarted ||
            trialAccess.hasAnyTrialStarted
        ) {
            if (shouldShowGmvDescription) {
                return {
                    description: isLoadingMetrics
                        ? ''
                        : `${gmvInfluenced} GMV influenced`,
                    shouldShowDescriptionIcon: true,
                }
            }

            // GMV <= threshold: hide description (both admin and lead)
            return {
                description: '',
                shouldShowDescriptionIcon: false,
            }
        }

        // Default case: Pre-trial description
        return {
            description:
                'Track your trial progress and see the benefits of our AI assistant',
            shouldShowDescriptionIcon: false,
        }
    }, [trialAccess, gmvInfluenced, shouldShowGmvDescription, isLoadingMetrics])

    const promoCardContent = useMemo((): PromoCardContent | null => {
        if (!isShoppingAssistantTrialImprovementEnabled) {
            return null
        }

        // Check if user has any access to show promo card (including trial progress)
        const hasAnyAccess =
            trialAccess.canSeeTrialCTA ||
            trialAccess.canBookDemo ||
            trialAccess.canNotifyAdmin ||
            trialAccess.hasCurrentStoreTrialStarted ||
            trialAccess.hasAnyTrialStarted

        if (!hasAnyAccess) {
            return null
        }

        const { button: primaryButton, variant } = handlePrimaryCTA()
        const secondaryButton = handleSecondaryCTA(variant)

        const isTrialProgress =
            variant === PromoCardVariant.AdminTrialProgress ||
            variant === PromoCardVariant.LeadTrialProgress

        // Different content for trial progress vs pre-trial
        const title = isTrialProgress
            ? 'Shopping Assistant trial'
            : 'Unlock new AI Agent skills'

        const { description, shouldShowDescriptionIcon } = isTrialProgress
            ? getTrialDescription()
            : {
                  description: 'Go beyond automation and grow revenue by 1.5%.',
                  shouldShowDescriptionIcon: false,
              }

        const videoModalButton: ButtonConfig | undefined =
            trialAccess.canSeeTrialCTA && !isTrialProgress
                ? {
                      label: primaryButton.label,
                      onClick: () => {
                          logShoppingAssistantEvent(
                              ShoppingAssistantEventType.StartTrial,
                          )
                          trialFlow.onConfirmTrial()
                      },
                      disabled: false,
                  }
                : undefined

        // Get dynamic trial progress data
        const { progressPercentage, progressText } = isTrialProgress
            ? getTrialProgress()
            : { progressPercentage: 0, progressText: '' }

        return {
            variant,
            title,
            description,
            shouldShowDescriptionIcon,
            showVideo: !isTrialProgress,
            shouldShowNotificationIcon: primaryButton.label.includes('Notify'),
            primaryButton,
            secondaryButton,
            videoModalButton,
            showProgressBar: isTrialProgress,
            progressPercentage: isTrialProgress
                ? progressPercentage
                : undefined,
            progressText: isTrialProgress ? progressText : undefined,
        }
    }, [
        isShoppingAssistantTrialImprovementEnabled,
        trialAccess,
        handlePrimaryCTA,
        handleSecondaryCTA,
        trialFlow,
        getTrialDescription,
        getTrialProgress,
    ])

    useEffect(() => {
        if (promoCardContent) {
            let eventType: string | null = null

            if (trialAccess.canSeeTrialCTA) {
                eventType = 'Trial'
            } else if (trialAccess.canBookDemo) {
                eventType = 'Demo'
            } else if (trialAccess.canNotifyAdmin) {
                eventType = 'Notify'
            }

            if (eventType) {
                logEvent(SegmentEvent.TrialBannerOverviewViewed, {
                    type: eventType,
                })
            }
        }
    }, [
        trialAccess.canNotifyAdmin,
        trialAccess.canBookDemo,
        trialAccess.canSeeTrialCTA,
        promoCardContent,
    ])
    return promoCardContent
}
