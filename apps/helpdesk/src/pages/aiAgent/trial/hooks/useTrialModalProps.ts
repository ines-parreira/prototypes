import React, { useCallback, useMemo } from 'react'

import { SegmentEvent } from 'common/segment'
import { logEvent } from 'common/segment/segment'
import useAppSelector from 'hooks/useAppSelector'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { getAutomateEarlyAccessPricesFormatted } from 'models/billing/utils'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialActivatedModalProps } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModalProps } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import {
    TrialAccess,
    useTrialAccess,
} from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import {
    TrialMetrics,
    useTrialMetrics,
} from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { RequestTrialModalProps } from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import { TrialFinishSetupModalProps } from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import { TrialTryModalProps } from 'pages/common/components/TrialTryModal/TrialTryModal'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { useNotifyAdmins } from './useNotifyAdmins'

export const EXTERNAL_URLS = {
    BOOK_DEMO:
        'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=shop_assistant_paywall',
    SHOPPING_ASSISTANT_INFO:
        'https://www.gorgias.com/ai-agent/shopping-assistant',
    // Shopping Assistant trial specific URLs with sidebar UTM parameters
    SHOPPING_ASSISTANT_TRIAL_LEARN_MORE:
        'https://www.gorgias.com/ai-agent/shopping-assistant?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_sidebar',
    SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO:
        'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_sidebar',
    AI_AGENT_TRIAL_LEARN_MORE:
        'https://www.gorgias.com/ai-agent?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_sidebar',
    AI_AGENT_TRIAL_BOOK_DEMO:
        'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_sidebar',
} as const

export type TrialModalProps = {
    trialUpgradePlanModal: Pick<
        UpgradePlanModalProps,
        'title' | 'currentPlan' | 'newPlan'
    >
    upgradePlanModal: Pick<
        UpgradePlanModalProps,
        'title' | 'currentPlan' | 'newPlan'
    >
    trialActivatedModal: Pick<TrialActivatedModalProps, 'title'>
    trialStartedBanner: Pick<
        TrialAlertBannerProps,
        'title' | 'description' | 'primaryAction' | 'secondaryAction'
    >
    trialAlertBanner: Pick<
        TrialAlertBannerProps,
        'title' | 'description' | 'primaryAction' | 'secondaryAction'
    >
    trialEndingModal: Pick<
        TrialManageModalProps,
        'title' | 'description' | 'advantages' | 'secondaryDescription'
    >
    trialEndedModal: Pick<
        TrialManageModalProps,
        'title' | 'description' | 'advantages' | 'secondaryDescription'
    >
    trialFinishSetupModal: Pick<
        TrialFinishSetupModalProps,
        'title' | 'subtitle' | 'content' | 'primaryAction'
    >
    newTrialUpgradePlanModal: Pick<
        TrialTryModalProps,
        | 'title'
        | 'subtitle'
        | 'currentPlan'
        | 'newPlan'
        | 'primaryAction'
        | 'secondaryAction'
        | 'onClose'
    >
    trialRequestModal: Pick<
        RequestTrialModalProps,
        | 'title'
        | 'subtitle'
        | 'primaryCTALabel'
        | 'accountAdmins'
        | 'onPrimaryAction'
    >
}

type PlanDetails = {
    currentPlanAmount: number
    currency: string
    currentPlanAmountFormatted: string
    helpdeskPlanTicketCost: string
    earlyAccessPlanAmount: string
    numQuotaTickets: number
    currentPlanCadence: Cadence
    earlyAccessPlanCadence: Cadence
}

const usePlanDetails = (): PlanDetails => {
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const { amount: earlyAccessPlanAmount, cadence: earlyAccessPlanCadence } =
        getAutomateEarlyAccessPricesFormatted(earlyAccessAutomatePlanQuery.data)
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate
    const helpdeskPlan = billingState?.data?.current_plans?.helpdesk

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'
    const currentPlanCadence = currentPlan?.cadence ?? Cadence.Month
    const currentPlanAmountFormatted = formatAmount(currentPlanAmount, currency)
    const helpdeskPlanTicketCost = formatAmount(
        (helpdeskPlan?.amount ?? 0) /
            (helpdeskPlan?.num_quota_tickets ?? 1) /
            100,
        currency,
    )
    const numQuotaTickets = currentPlan?.num_quota_tickets ?? 1

    return {
        currentPlanAmount,
        currentPlanCadence,
        currency,
        currentPlanAmountFormatted,
        helpdeskPlanTicketCost,
        earlyAccessPlanAmount,
        earlyAccessPlanCadence,
        numQuotaTickets,
    }
}

const createPlanModalData = (
    title: string,
    planDetails: PlanDetails,
    buttonTexts: { current: string; new: string },
    isTrial = false,
    isMultiStore = false,
) => ({
    title,
    currentPlan: {
        title: 'AI Agent',
        description: 'Provide best-in-class automated support',
        price: planDetails.currentPlanAmountFormatted,
        billingPeriod: planDetails.currentPlanCadence,
        features: [
            {
                label: `${planDetails.numQuotaTickets} automated interactions`,
                isError: false,
            },
            {
                label: 'Deliver instant answers to repetitive questions and improve customer satisfaction',
                isError: false,
            },
            {
                label: 'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                isError: false,
            },
            {
                label: 'Advanced sales skills',
                isError: true,
            },
        ],
        buttonText: buttonTexts.current,
    },
    newPlan: {
        title: 'AI Agent + Shopping Assistant',
        description: 'Add powerful conversion features to your support flow',
        price: planDetails.earlyAccessPlanAmount,
        billingPeriod: `${planDetails.earlyAccessPlanCadence}${isTrial ? ' after trial ends' : ''}`,
        features: [
            {
                label: 'Everything in your current plan',
                isError: false,
            },
            {
                label: 'Proactively engage with shoppers at key moments',
                isError: false,
            },
            {
                label: 'Personalize product recommendations powered by rich customer insights',
                isError: false,
            },
            {
                label: 'Maximize cart size with intelligent upsells',
                isError: false,
            },
            {
                label: 'Offer discounts based on purchase intent',
                isError: false,
            },
        ],
        buttonText: buttonTexts.new,
        priceTooltipText: `Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a ${planDetails.helpdeskPlanTicketCost} helpdesk fee.${
            isMultiStore ? ' Upgrade will apply to all stores.' : ''
        }`,
    },
})

const useUpgradePlanModal = (): TrialModalProps['upgradePlanModal'] => {
    const planDetails = usePlanDetails()

    return useMemo(
        () =>
            createPlanModalData(
                'Turn every interaction into a sale opportunity',
                planDetails,
                { current: 'Keep current plan', new: 'Upgrade AI Agent' },
            ),
        [planDetails],
    )
}

const useTrialUpgradePlanModal =
    (): TrialModalProps['trialUpgradePlanModal'] => {
        const planDetails = usePlanDetails()

        return useMemo(
            () =>
                createPlanModalData(
                    `Try the full power of AI Agent for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days at no additional cost`,
                    planDetails,
                    {
                        current: 'Keep current plan',
                        new: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                    },
                    true,
                ),
            [planDetails],
        )
    }

const useNewTrialUpgradePlanModal = (
    storeName?: string,
): TrialModalProps['newTrialUpgradePlanModal'] => {
    const planDetails = usePlanDetails()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })

    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const isMultiStore = allShopifyIntegrations.length > 1

    const {
        revampStartTrial,
        onDismissTrialUpgradeModal,
        closeTrialUpgradeModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })
    return useMemo(
        () => ({
            ...createPlanModalData(
                'Unlock new AI Agent skills at no extra cost',
                planDetails,
                {
                    current: 'Keep current plan',
                    new: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                },
                false,
                isMultiStore,
            ),
            title: 'Unlock new AI Agent skills at no extra cost',
            subtitle:
                "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
            primaryAction: {
                label: 'Start trial now',
                onClick: revampStartTrial,
            },
            secondaryAction: {
                label: 'No, thanks',
                onClick: onDismissTrialUpgradeModal,
            },
            onClose: closeTrialUpgradeModal,
        }),
        [
            planDetails,
            revampStartTrial,
            onDismissTrialUpgradeModal,
            closeTrialUpgradeModal,
            isMultiStore,
        ],
    )
}

const useTrialFinishSetupModal = (
    storeName?: string,
): TrialModalProps['trialFinishSetupModal'] => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })

    const { closeTrialFinishSetupModal } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })
    return useMemo(
        () => ({
            title: 'Ready. Set. Grow. Your 14-days trial starts now.',
            subtitle: "Let's unlock its full potential.",
            content:
                'Just two simple steps to increase conversions and make the most of your trial.',
            primaryAction: {
                label: 'Finish setup',
                onClick: closeTrialFinishSetupModal,
            },
        }),
        [closeTrialFinishSetupModal],
    )
}

const useTrialActivatedModal = () => ({
    title: 'Trial activated',
})

const useTrialStartedBanner = (
    trialMetrics: TrialMetrics,
    trialAccess: TrialAccess,
    storeName?: string,
    pageName?: 'Strategy' | 'Engagement',
): TrialModalProps['trialStartedBanner'] => {
    const {
        trialType,
        hasAnyTrialOptedIn,
        hasCurrentStoreTrialOptedOut,
        canBookDemo,
    } = trialAccess
    const { remainingDays } = useTrialEnding(storeName ?? '', trialType)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const trialMilestone = useSalesTrialRevampMilestone()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const { gmvInfluenced, gmvInfluencedRate } = trialMetrics

    const accountDomain = currentAccount.get('domain')

    const { openManageTrialModal, openUpgradePlanModal } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
        })

    const handleManageTrial = useCallback(() => {
        openManageTrialModal()
    }, [openManageTrialModal])

    const handleUpgradePlan = useCallback(async () => {
        if (hasAnyTrialOptedIn) {
            await upgradePlanAsync()
        } else {
            logEvent(SegmentEvent.TrialBannerSettingsClicked, {
                pageName,
            })
            openUpgradePlanModal(false)
        }
    }, [openUpgradePlanModal, pageName, hasAnyTrialOptedIn, upgradePlanAsync])

    const secondaryAction = useMemo(() => {
        if (!isRevampTrialMilestone1Enabled || hasCurrentStoreTrialOptedOut) {
            return undefined
        }

        return {
            label: 'Manage Trial',
            onClick: handleManageTrial,
            isLoading: isUpgradePlanLoading,
        }
    }, [
        handleManageTrial,
        isRevampTrialMilestone1Enabled,
        hasCurrentStoreTrialOptedOut,
        isUpgradePlanLoading,
    ])

    const { data: earlyAccessPlan } = useEarlyAccessAutomatePlan()
    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(EXTERNAL_URLS.BOOK_DEMO, '_blank')
                },
            }
        }

        if (!earlyAccessPlan) return undefined

        return {
            label: 'Upgrade Now',
            onClick: handleUpgradePlan,
            isLoading: isUpgradePlanLoading,
        }
    }, [canBookDemo, earlyAccessPlan, handleUpgradePlan, isUpgradePlanLoading])

    const description = useMemo(() => {
        if (gmvInfluencedRate > 0.005) {
            return `So far, it's influenced ${gmvInfluenced} of GMV for your store.`
        }
        return `Increase conversion by +50% by setting up your sales strategy and customer engagement tactics.`
    }, [gmvInfluenced, gmvInfluencedRate])

    const trialEndsText =
        remainingDays <= 0
            ? 'ends today'
            : remainingDays === 1
              ? 'ends in 1 day'
              : `ends in ${remainingDays} days`

    return useMemo(
        () => ({
            title: `Your Shopping Assistant trial ${trialEndsText}.`,
            description,
            primaryAction,
            secondaryAction,
        }),
        [trialEndsText, description, primaryAction, secondaryAction],
    )
}

const useTrialAlertBanner = ({
    onConfirmTrial,
}: {
    onConfirmTrial?: () => void
}): TrialModalProps['trialAlertBanner'] => {
    const { canBookDemo } = useTrialAccess()

    const secondaryAction = useMemo(() => {
        return {
            label: 'How AI Agent can 2x conversion rate',
            onClick: () => {
                window.open(EXTERNAL_URLS.SHOPPING_ASSISTANT_INFO, '_blank')
                logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, {
                    CTA: 'Learn',
                })
            },
        }
    }, [])

    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(EXTERNAL_URLS.BOOK_DEMO, '_blank')
                    logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, {
                        CTA: 'Demo',
                    })
                },
            }
        }

        return {
            label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            onClick: () => {
                onConfirmTrial?.()
                logEvent(SegmentEvent.TrialBannerOverviewCTAClicked, {
                    CTA: 'Start Trial',
                })
            },
        }
    }, [canBookDemo, onConfirmTrial])

    return useMemo(
        () => ({
            title: 'Influence +1.5% GMV with Shopping Assistant',
            description:
                'Increase customer engagement and turn every interaction into a sale. With AI Agent’s new shopping assistant features, you can deliver personalized recommendations and offer intent-based discounts that convert.',
            primaryAction,
            secondaryAction,
        }),
        [secondaryAction, primaryAction],
    )
}

const useTrialEndedModal = (
    trialMetrics: TrialMetrics,
): TrialModalProps['trialEndedModal'] => {
    const { gmvInfluenced, gmvInfluencedRate } = trialMetrics
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const earlyAccessPlanPrice =
        (earlyAccessAutomatePlanQuery?.data?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const cadence = earlyAccessAutomatePlanQuery?.data?.cadence ?? Cadence.Month

    const hasSignificantGmvImpact = gmvInfluencedRate > 0.005

    const description = useMemo(() => {
        if (gmvInfluencedRate > 0.005) {
            return React.createElement('span', {}, [
                'Shopping Assistant drove ',
                React.createElement('strong', { key: 'gmv' }, gmvInfluenced),
                ' uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow.',
            ])
        }
        return 'Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. To keep the momentum going, you will be upgraded automatically tomorrow.'
    }, [gmvInfluenced, gmvInfluencedRate])

    const advantages = useMemo(() => {
        if (hasSignificantGmvImpact) {
            return [`${gmvInfluenced} GMV uplift`]
        }
        return [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ]
    }, [gmvInfluenced, hasSignificantGmvImpact])

    const secondaryDescription = useMemo(() => {
        const increaseAmount = formatAmount(difference, currency)
        if (gmvInfluencedRate > 0.005) {
            if (difference > 0) {
                return `After your trial, your plan will increase by ${increaseAmount}/${cadence}.`
            }
            return 'The price of your plan remains the same after the upgrade.'
        }
        if (difference > 0) {
            return `Typical results achieved by merchants. After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
        }
        return `Typical results achieved by merchants. The price of your plan remains the same after the upgrade.`
    }, [difference, currency, gmvInfluencedRate, cadence])

    return useMemo(
        () => ({
            title: hasSignificantGmvImpact
                ? 'Your trial has ended — and it made an impact.'
                : 'Your trial ended — but it’s just the beginning.',
            description,
            secondaryDescription,
            advantages,
        }),
        [
            hasSignificantGmvImpact,
            description,
            secondaryDescription,
            advantages,
        ],
    )
}

const useTrialEndingModal = (
    trialMetrics: TrialMetrics,
): TrialModalProps['trialEndingModal'] => {
    const { gmvInfluenced, gmvInfluencedRate } = trialMetrics
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const earlyAccessPlanPrice =
        (earlyAccessAutomatePlanQuery?.data?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const hasSignificantGmvImpact = gmvInfluencedRate > 0.005
    const hasPriceIncrease = difference > 0
    const increaseAmount = formatAmount(difference, currency)
    const cadence = earlyAccessAutomatePlanQuery?.data?.cadence ?? Cadence.Month

    const description = useMemo(() => {
        if (hasSignificantGmvImpact) {
            return React.createElement('span', {}, [
                'Shopping Assistant drove ',
                React.createElement('strong', { key: 'gmv' }, gmvInfluenced),
                " uplift in GMV. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).",
            ])
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).`
    }, [gmvInfluenced, hasSignificantGmvImpact])

    const advantages = useMemo(() => {
        if (hasSignificantGmvImpact) {
            return [`${gmvInfluenced} GMV uplift`]
        }
        return [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ]
    }, [gmvInfluenced, hasSignificantGmvImpact])

    const secondaryDescription = useMemo(() => {
        if (hasSignificantGmvImpact) {
            const priceMessage = hasPriceIncrease
                ? `your plan will increase by ${increaseAmount}/${cadence}`
                : 'the price of your plan remains the same'
            return `With the upgrade, ${priceMessage}.`
        }

        const priceMessage = hasPriceIncrease
            ? `After upgrading, your plan will increase by ${increaseAmount}/${cadence}`
            : 'The price of your plan remains the same after the upgrade'
        return `Typical results achieved by merchants. ${priceMessage}.`
    }, [hasSignificantGmvImpact, hasPriceIncrease, increaseAmount, cadence])

    return useMemo(
        () => ({
            title: 'Shopping Assistant trial ends tomorrow',
            description,
            secondaryDescription,
            advantages,
        }),
        [description, secondaryDescription, advantages],
    )
}

const useTrialRequestModal = (storeName?: string) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })

    const { closeTrialRequestModal } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const { handleNotifyAdmins, accountAdmins } = useNotifyAdmins(
        storeName,
        closeTrialRequestModal,
    )
    return useMemo(
        () => ({
            title: 'Request your admin to start trial',
            subtitle:
                'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.',
            primaryCTALabel: 'Notify Admins',
            accountAdmins,
            onPrimaryAction: handleNotifyAdmins,
        }),
        [handleNotifyAdmins, accountAdmins],
    )
}

export const useTrialModalProps = ({
    storeName,
    onConfirmTrial,
    pageName,
}: {
    storeName?: string
    onConfirmTrial?: () => void
    pageName?: 'Strategy' | 'Engagement'
}): TrialModalProps => {
    const trialAccess = useTrialAccess(storeName)
    const trialMetrics = useTrialMetrics()
    const upgradePlanModal = useUpgradePlanModal()
    const trialUpgradePlanModal = useTrialUpgradePlanModal()
    const newTrialUpgradePlanModal = useNewTrialUpgradePlanModal(storeName)
    const trialFinishSetupModal = useTrialFinishSetupModal(storeName)
    const trialActivatedModal = useTrialActivatedModal()
    const trialStartedBanner = useTrialStartedBanner(
        trialMetrics,
        trialAccess,
        storeName,
        pageName,
    )
    const trialAlertBanner = useTrialAlertBanner({
        onConfirmTrial: onConfirmTrial,
    })
    const trialEndingModal = useTrialEndingModal(trialMetrics)
    const trialEndedModal = useTrialEndedModal(trialMetrics)
    const trialRequestModal = useTrialRequestModal(storeName)

    return useMemo(
        () => ({
            upgradePlanModal,
            trialUpgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            trialFinishSetupModal,
            newTrialUpgradePlanModal,
            trialEndingModal,
            trialEndedModal,
            trialRequestModal,
        }),
        [
            upgradePlanModal,
            trialUpgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            trialFinishSetupModal,
            newTrialUpgradePlanModal,
            trialEndingModal,
            trialEndedModal,
            trialRequestModal,
        ],
    )
}
