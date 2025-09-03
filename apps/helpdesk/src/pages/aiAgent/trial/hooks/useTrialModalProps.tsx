import { useCallback, useMemo } from 'react'

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
import {
    AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD,
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
} from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialActivatedModalProps } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { TrialOptOutModalProps } from 'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal'
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
import {
    TrialFeature,
    TrialTryModalProps,
} from 'pages/common/components/TrialTryModal/TrialTryModal'
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
    SHOPPING_ASSISTANT_TRIAL_LEARN_MORE_PAYWALL:
        'https://www.gorgias.com/ai-agent/shopping-assistant?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
    AI_AGENT_TRIAL_LEARN_MORE_PAYWALL:
        'https://www.gorgias.com/ai-agent?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
    BOOK_DEMO_PAYWALL:
        'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
} as const

export const SHOPPING_ASSISTANT_ADVANTAGES = [
    '10% average order value',
    '62% conversion rate',
    '1.5% revenue',
]

export const AI_AGENT_ADVANTAGES = [
    '60% support inquiries',
    '35% faster ticket handling',
    '62% conversion rate',
]

const AI_AGENT_TRIAL_FEATURES: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. All features are unlocked, so you can start seeing impact today.',
    },
    {
        icon: 'notifications_none',
        title: 'Day 7',
        description: 'We’ll remind you when you’re halfway through your trial.',
    },
    {
        icon: 'star_outline',
        title: 'Day 14',
        description:
            'Your new AI Agent plan kicks in automatically after the trial so you can keep automating support and growing revenue.',
    },
]

const SHOPPING_ASSISTANT_TRIAL_FEATURES: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. All shopping assistant features are unlocked, so you can start boosting conversions today.',
    },
    {
        icon: 'notifications_none',
        title: 'Day 7',
        description:
            'Mid-trial reminder: optimize your conversion strategies and explore advanced shopping features.',
    },
    {
        icon: 'star_outline',
        title: 'Day 14',
        description:
            'Your new AI Agent plan with shopping assistant features kicks in automatically to keep growing revenue.',
    },
]

export type TrialModalProps = {
    trialUpgradePlanModal: Pick<
        UpgradePlanModalProps,
        'title' | 'currentPlan' | 'newPlan'
    >
    upgradePlanModal: Pick<
        UpgradePlanModalProps,
        | 'title'
        | 'currentPlan'
        | 'newPlan'
        | 'onClose'
        | 'onConfirm'
        | 'onDismiss'
        | 'isLoading'
    > & {
        isOpen: boolean
    }
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
    trialManageModal: TrialManageModalProps & {
        isOpen: boolean
    }
    trialOptOutModal: TrialOptOutModalProps
    trialFinishSetupModal: Pick<
        TrialFinishSetupModalProps,
        | 'title'
        | 'subtitle'
        | 'content'
        | 'primaryAction'
        | 'isOpen'
        | 'onClose'
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
        | 'features'
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
    isMultiStore = false,
) => ({
    title,
    currentPlan: {
        title: 'AI Agent',
        description: 'Provide best-in-class automated support',
        price: planDetails.currentPlanAmountFormatted,
        currency: planDetails.currency,
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
        currency: planDetails.currency,
        billingPeriod: planDetails.earlyAccessPlanCadence,
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

const useUpgradePlanModal = (
    trialType: TrialType,
    storeName?: string,
): TrialModalProps['upgradePlanModal'] => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const accountDomain = currentAccount.get('domain')

    const planDetails = usePlanDetails()

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const {
        isUpgradePlanModalOpen,
        closeUpgradePlanModal,
        closeAllTrialModals,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    const onUpgradeClick = useCallback(async () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
            trialType,
        })
        await upgradePlanAsync()
        closeAllTrialModals()
    }, [upgradePlanAsync, closeAllTrialModals, trialType])

    return useMemo(
        () => ({
            ...createPlanModalData(
                'Turn every interaction into a sale opportunity',
                planDetails,
                { current: 'Keep current plan', new: 'Upgrade AI Agent' },
            ),
            isOpen: isUpgradePlanModalOpen,
            onDismiss: closeUpgradePlanModal,
            onClose: closeUpgradePlanModal,
            onConfirm: onUpgradeClick,
            isLoading: isUpgradePlanLoading,
        }),
        [
            planDetails,
            isUpgradePlanModalOpen,
            onUpgradeClick,
            closeUpgradePlanModal,
            isUpgradePlanLoading,
        ],
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
                ),
            [planDetails],
        )
    }

const useNewTrialUpgradePlanModal = (
    trialType: TrialType,
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

    const { startTrial, onDismissTrialUpgradeModal, closeTrialUpgradeModal } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
        })

    const aiAgentProps = useMemo(() => {
        const planModalData = createPlanModalData(
            '',
            planDetails,
            {
                current: '',
                new: '',
            },
            isMultiStore,
        )

        let tooltip = `You’ll be moved from Helpdesk to Helpdesk + AI Agent plan. Once you upgrade, each support or sales resolution will cost $1, plus a ${planDetails.helpdeskPlanTicketCost} helpdesk fee.`
        if (isMultiStore) {
            tooltip += ' Upgrade will apply to all stores.'
        }

        return {
            ...planModalData,
            currentPlan: null,
            newPlan: {
                ...planModalData.newPlan,
                priceTooltipText: tooltip,
            },
            title: 'Try AI Agent for free',
            subtitle:
                'Unlock powerful automation with Gorgias AI Agent. Resolve 60% of support inquiries, proactively engage shoppers, and convert more visitors with 24/7 assistance in your brand voice.',
            primaryAction: {
                label: 'Start Free Trial Now',
                onClick: (optedInForUpgrade?: boolean) =>
                    startTrial(optedInForUpgrade),
            },
            secondaryAction: {
                label: 'No, thanks',
                onClick: onDismissTrialUpgradeModal,
            },
            onClose: closeTrialUpgradeModal,
            features: AI_AGENT_TRIAL_FEATURES,
        }
    }, [
        planDetails,
        startTrial,
        onDismissTrialUpgradeModal,
        closeTrialUpgradeModal,
        isMultiStore,
    ])

    const shoppingAssistantProps = useMemo(
        () => ({
            ...createPlanModalData(
                'Unlock new AI Agent skills at no extra cost',
                planDetails,
                {
                    current: 'Keep current plan',
                    new: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                },
                isMultiStore,
            ),
            title: 'Unlock new AI Agent skills at no extra cost',
            subtitle:
                "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
            primaryAction: {
                label: 'Start trial now',
                onClick: (optedInForUpgrade?: boolean) =>
                    startTrial(optedInForUpgrade),
            },
            secondaryAction: {
                label: 'No, thanks',
                onClick: onDismissTrialUpgradeModal,
            },
            onClose: closeTrialUpgradeModal,
            features: SHOPPING_ASSISTANT_TRIAL_FEATURES,
        }),
        [
            planDetails,
            startTrial,
            onDismissTrialUpgradeModal,
            closeTrialUpgradeModal,
            isMultiStore,
        ],
    )

    return trialType === TrialType.AiAgent
        ? aiAgentProps
        : shoppingAssistantProps
}

const useTrialFinishSetupModal = (
    trialType: TrialType,
    storeName?: string,
): TrialModalProps['trialFinishSetupModal'] => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })

    const { isTrialFinishSetupModalOpen, closeTrialFinishSetupModal } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
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
            isOpen: isTrialFinishSetupModalOpen,
            onClose: closeTrialFinishSetupModal,
        }),
        [closeTrialFinishSetupModal, isTrialFinishSetupModalOpen],
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
            trialType,
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
        if (
            gmvInfluencedRate >
            SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
        ) {
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

const toPercentage = (value: number, decimals = 1) => {
    const percentage = value * 100
    return `${parseFloat(percentage.toFixed(decimals))}%`
}

const useTrialEndedModal = (
    trialType: TrialType,
    trialMetrics: TrialMetrics,
): TrialModalProps['trialEndedModal'] => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const { gmvInfluenced, gmvInfluencedRate, automationRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const earlyAccessPlanPrice =
        (earlyAccessAutomatePlanQuery?.data?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const cadence = earlyAccessAutomatePlanQuery?.data?.cadence ?? Cadence.Month

    const hasSignificantGmvImpact =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
    const hasSignificantAutomationRateImpact =
        automationRateValue > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD

    const hasSignificantImpact = isAiAgentTrial
        ? hasSignificantAutomationRateImpact
        : hasSignificantGmvImpact

    const title = useMemo(() => {
        return hasSignificantImpact
            ? 'Your trial has ended — and it made an impact.'
            : "Your trial ended — but it's just the beginning."
    }, [hasSignificantImpact])

    const description = useMemo(() => {
        if (isAiAgentTrial) {
            if (hasSignificantAutomationRateImpact) {
                return (
                    <span>
                        AI Agent drove{' '}
                        <strong>{toPercentage(automationRateValue)}</strong>{' '}
                        automation rate. Upgrade today to drive even greater
                        impact.
                    </span>
                )
            }
            return 'Brands that unlock AI Agent see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.'
        }

        if (hasSignificantGmvImpact) {
            return (
                <span>
                    Shopping Assistant drove <strong>{gmvInfluenced}</strong>{' '}
                    uplift in GMV. Keep the momentum going and turn even more
                    visitors into buyers.
                </span>
            )
        }

        return 'Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.'
    }, [
        isAiAgentTrial,
        hasSignificantGmvImpact,
        gmvInfluenced,
        hasSignificantAutomationRateImpact,
        automationRateValue,
    ])

    const advantages = useMemo(() => {
        if (isAiAgentTrial) {
            return hasSignificantAutomationRateImpact
                ? [`${toPercentage(automationRateValue)} automation rate`]
                : [...AI_AGENT_ADVANTAGES]
        }

        return hasSignificantGmvImpact
            ? [`${gmvInfluenced} GMV uplift`]
            : [...SHOPPING_ASSISTANT_ADVANTAGES]
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        automationRateValue,
        hasSignificantGmvImpact,
        gmvInfluenced,
    ])

    const secondaryDescription = useMemo(() => {
        const increaseAmount = formatAmount(difference, currency)

        if (isAiAgentTrial) {
            if (hasSignificantAutomationRateImpact) {
                return `After your trial, your plan will increase by ${increaseAmount}/${cadence}.`
            }
            return `Typical results achieved by merchants. After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
        }

        if (hasSignificantGmvImpact) {
            if (difference > 0) {
                return `After your trial, your plan will increase by ${increaseAmount}/${cadence}.`
            }
            return 'The price of your plan remains the same after the upgrade.'
        }
        if (difference > 0) {
            return `Typical results achieved by merchants. After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
        }
        return `Typical results achieved by merchants. The price of your plan remains the same after the upgrade.`
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        hasSignificantGmvImpact,
        difference,
        currency,
        cadence,
    ])

    return {
        title,
        description,
        secondaryDescription,
        advantages,
    }
}

const useTrialEndingModal = (
    trialType: TrialType,
    trialMetrics: TrialMetrics,
): TrialModalProps['trialEndingModal'] => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const { gmvInfluenced, gmvInfluencedRate, automationRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const earlyAccessPlanPrice =
        (earlyAccessAutomatePlanQuery?.data?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const hasSignificantGmvImpact =
        gmvInfluencedRate > SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD
    const hasSignificantAutomationRateImpact =
        automationRateValue > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD
    const hasPriceIncrease = difference > 0
    const increaseAmount = formatAmount(difference, currency)
    const cadence = earlyAccessAutomatePlanQuery?.data?.cadence ?? Cadence.Month

    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const isMultiStore = allShopifyIntegrations.length > 1

    const title = isAiAgentTrial
        ? 'AI Agent trial ends tomorrow'
        : 'Shopping Assistant trial ends tomorrow'

    const description = useMemo(() => {
        if (isAiAgentTrial) {
            if (hasSignificantAutomationRateImpact) {
                return (
                    <span>
                        AI Agent handled{' '}
                        <strong>
                            {toPercentage(automationRateValue)} of customer
                            inquiries
                        </strong>{' '}
                        and automatically{' '}
                        <strong>
                            drove a {toPercentage(gmvInfluencedRate)} lift in
                            revenue
                        </strong>{' '}
                        in the last 13 days. To keep the momentum going, your
                        plan will be upgraded automatically (unless you&apos;ve
                        opted-out).
                    </span>
                )
            }
            return (
                <span>
                    AI Agent has been working behind the scenes to help your
                    team{' '}
                    <strong>
                        deliver faster, more efficient support and sales
                    </strong>
                    . To keep the momentum going, your plan will be upgraded
                    automatically tomorrow (unless you&apos;ve opted-out)
                    {isMultiStore
                        ? ` – giving you continued access to AI Agent across all your stores`
                        : ''}
                    .
                </span>
            )
        }

        if (hasSignificantGmvImpact) {
            return (
                <span>
                    Shopping Assistant drove <strong>{gmvInfluenced}</strong>{' '}
                    uplift in GMV. To keep the momentum going, you will be
                    upgraded automatically tomorrow (unless you&apos;ve
                    opted-out).
                </span>
            )
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. To keep the momentum going, you will be upgraded automatically tomorrow (unless you've opted-out).`
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        automationRateValue,
        gmvInfluenced,
        gmvInfluencedRate,
        hasSignificantGmvImpact,
        isMultiStore,
    ])

    const advantages = useMemo(() => {
        if (isAiAgentTrial) {
            return hasSignificantAutomationRateImpact
                ? [`${toPercentage(automationRateValue)} automation rate`]
                : [...AI_AGENT_ADVANTAGES]
        }

        return hasSignificantGmvImpact
            ? [`${gmvInfluenced} GMV uplift`]
            : [...SHOPPING_ASSISTANT_ADVANTAGES]
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        automationRateValue,
        hasSignificantGmvImpact,
        gmvInfluenced,
    ])

    const secondaryDescription = useMemo(() => {
        if (isAiAgentTrial) {
            if (hasSignificantAutomationRateImpact) {
                return `With the upgrade, your plan will increase by ${increaseAmount}/${cadence}.`
            }
            return `Typical results achieved by merchants. After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
        }

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
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        hasSignificantGmvImpact,
        hasPriceIncrease,
        increaseAmount,
        cadence,
    ])

    return {
        title,
        description,
        secondaryDescription,
        advantages,
    }
}

const useTrialManageModal = (
    trialType: TrialType,
    trialMetrics: TrialMetrics,
    trialEndingModalProps: TrialModalProps['trialEndingModal'],
    storeName?: string,
): TrialModalProps['trialManageModal'] => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const accountDomain = currentAccount.get('domain')
    const { automationRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const hasSignificantAutomationRateImpact =
        automationRateValue > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const { data: futurePlan } = useEarlyAccessAutomatePlan()

    const {
        isManageTrialModalOpen,
        closeManageTrialModal,
        closeAllTrialModals,
        openTrialOptOutModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    const onUpgradeClick = useCallback(async () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
            trialType,
        })
        await upgradePlanAsync()
        closeAllTrialModals()
    }, [trialType, upgradePlanAsync, closeAllTrialModals])

    const title = isAiAgentTrial
        ? 'Manage AI Agent trial'
        : 'Manage Shopping Assistant trial'

    const aiAgentDescription = useMemo(() => {
        if (!isAiAgentTrial) {
            return null
        }

        if (hasSignificantAutomationRateImpact) {
            return (
                <span>
                    AI Agent handled{' '}
                    <b>
                        {toPercentage(automationRateValue)}% of customer
                        inquiries
                    </b>{' '}
                    and automatically <b>drove a xx% lift in revenue</b>.
                    Don&apos;t lose momentum now - keep the gains going by
                    upgrading today.
                </span>
            )
        }

        return (
            <span>
                AI Agent has been working behind the scenes to help your team{' '}
                <b>deliver faster, more efficient support and sales</b>. Upgrade
                today to drive even greater impact.
            </span>
        )
    }, [
        isAiAgentTrial,
        automationRateValue,
        hasSignificantAutomationRateImpact,
    ])

    const modalProps: TrialManageModalProps = useMemo(
        () => ({
            ...trialEndingModalProps,
            title,
            description: !!aiAgentDescription
                ? aiAgentDescription
                : trialEndingModalProps.description,
            onClose: closeManageTrialModal,
            primaryAction: futurePlan
                ? {
                      label: 'Upgrade Now',
                      onClick: onUpgradeClick,
                      isLoading: isUpgradePlanLoading,
                  }
                : undefined,
            secondaryAction: {
                label: 'Opt Out',
                onClick: () => {
                    closeManageTrialModal()
                    openTrialOptOutModal()
                },
            },
        }),
        [
            title,
            aiAgentDescription,
            trialEndingModalProps,
            closeManageTrialModal,
            futurePlan,
            onUpgradeClick,
            isUpgradePlanLoading,
            openTrialOptOutModal,
        ],
    )

    return useMemo(
        () => ({
            ...modalProps,
            isOpen: isManageTrialModalOpen,
        }),
        [modalProps, isManageTrialModalOpen],
    )
}

const useTrialOptOutModal = (
    trialType: TrialType,
    storeName?: string,
): TrialModalProps['trialOptOutModal'] => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const accountDomain = currentAccount.get('domain')

    const { trialEndDatetime, isTrialExtended } = useTrialEnding(
        storeName ?? '',
        trialType,
    )

    const {
        isTrialOptOutModalOpen,
        closeTrialOptOutModal,
        onRequestTrialExtension,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    return useMemo(
        () => ({
            isOpen: isTrialOptOutModalOpen,
            isTrialExtended,
            trialType,
            onClose: closeTrialOptOutModal,
            onRequestTrialExtension: () =>
                onRequestTrialExtension(trialEndDatetime),
        }),
        [
            isTrialOptOutModalOpen,
            closeTrialOptOutModal,
            onRequestTrialExtension,
            trialEndDatetime,
            isTrialExtended,
            trialType,
        ],
    )
}

const useTrialRequestModal = (trialType: TrialType, storeName?: string) => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })

    const { closeTrialRequestModal } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    const { handleNotifyAdmins, accountAdmins } = useNotifyAdmins(
        storeName,
        trialType,
        closeTrialRequestModal,
    )

    return useMemo(
        () => ({
            title: isAiAgentTrial
                ? 'Request your admin to activate AI Agent trial'
                : 'Request your admin to start trial',
            subtitle: isAiAgentTrial
                ? 'Your Gorgias admins will be notified of your request via both email and an in-app notification.'
                : 'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.',
            primaryCTALabel: 'Notify Admins',
            accountAdmins,
            onPrimaryAction: handleNotifyAdmins,
        }),
        [handleNotifyAdmins, accountAdmins, isAiAgentTrial],
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
    const trialType = trialAccess.trialType
    const trialMetrics = useTrialMetrics(trialType, storeName)
    const upgradePlanModal = useUpgradePlanModal(trialType, storeName)
    const trialUpgradePlanModal = useTrialUpgradePlanModal()
    const newTrialUpgradePlanModal = useNewTrialUpgradePlanModal(
        trialType,
        storeName,
    )
    const trialFinishSetupModal = useTrialFinishSetupModal(trialType, storeName)
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
    const trialEndingModal = useTrialEndingModal(trialType, trialMetrics)
    const trialEndedModal = useTrialEndedModal(trialType, trialMetrics)
    const trialManageModal = useTrialManageModal(
        trialType,
        trialMetrics,
        trialEndingModal,
        storeName,
    )
    const trialRequestModal = useTrialRequestModal(trialType, storeName)
    const trialOptOutModal = useTrialOptOutModal(trialType, storeName)

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
            trialManageModal,
            trialRequestModal,
            trialOptOutModal,
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
            trialManageModal,
            trialRequestModal,
            trialOptOutModal,
        ],
    )
}
