import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useBillingState } from 'models/billing/queries'
import { Cadence } from 'models/billing/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    AI_AGENT_ADVANTAGES,
    AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD,
    SHOPPING_ASSISTANT_ADVANTAGES,
    SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS,
    SHOPPING_ASSISTANT_TRIAL_GMV_INFLUENCED_THRESHOLD,
    TYPICAL_RESULTS_TEXT,
} from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import {
    TrialEventType,
    TrialType,
} from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { logTrialBannerEvent } from 'pages/aiAgent/components/ShoppingAssistant/utils/eventLogger'
import { OPPORTUNITIES } from 'pages/aiAgent/constants'
import type { TrialActivatedModalProps } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import type { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import type { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import type { TrialOptOutModalProps } from 'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal'
import type { UpgradePlanModalProps } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import type { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { toPercentage } from 'pages/aiAgent/trial/utils/utils'
import { isAiAgentEnabledForStore } from 'pages/aiAgent/utils/store-configuration.utils'
import type { RequestTrialModalProps } from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import type { TrialFinishSetupModalProps } from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import type {
    TrialFeature,
    TrialTryModalProps,
} from 'pages/common/components/TrialTryModal/TrialTryModal'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { useAiAgentTrialOnboarding } from './useAiAgentTrialOnboarding'
import { useNotifyAdmins } from './useNotifyAdmins'
import { useTrialEndingModal } from './useTrialEndingModal/useTrialEndingModal'
import { useTrialFinishSetupModal } from './useTrialFinishSetupModal'

export const EXTERNAL_URLS = {
    BOOK_DEMO_SHOPPING_ASSISTANT:
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
    BOOK_DEMO_AIAGENT:
        'https://www.gorgias.com/demo/customers/automate?utm_source=product&utm_medium=in_product&utm_campaign=ai_agent_paywall',
} as const

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
            'Your new AI Agent plan kicks in automatically after the trial so you can keep automating support and growing revenue, unless you cancel during your trial.',
    },
]

const SHOPPING_ASSISTANT_TRIAL_FEATURES: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. Automated interactions from shopping assistant capabilities count toward your current AI Agent usage, with no additional cost.',
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
            'Your AI Agent plan will automatically update to the new pricing which includes shopping assistant skills, unless you cancel before your trial ends.',
    },
]

const SHOPPING_ASSISTANT_TRIAL_AI_AGENT_NOT_ONBOARDED: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. Automated interactions from shopping assistant capabilities count toward your current AI Agent usage, with no additional cost.',
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
            'Your AI Agent plan will automatically update to the new pricing which includes shopping assistant skills, unless you cancel before your trial ends.',
    },
]

const SHOPPING_ASSISTANT_TRIAL_WITH_OPPORTUNITIES: TrialFeature[] = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. Get full access to Opportunities and Shopping Assistant skills at no additional cost during the trial.',
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
            'Your AI Agent plan will automatically update to the new pricing, unless you cancel before your trial ends.',
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
        | 'features'
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
    const { data: upgradePlanData } = useAiAgentUpgradePlan()

    const upgradePlanAmount = upgradePlanData
        ? formatAmount(upgradePlanData.amount / 100, upgradePlanData.currency)
        : '$0'
    const upgradePlanCadence = upgradePlanData?.cadence ?? Cadence.Month
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

    const numQuotaTickets = upgradePlanData?.num_quota_tickets ?? 1
    return {
        currentPlanAmount,
        currentPlanCadence,
        currency,
        currentPlanAmountFormatted,
        helpdeskPlanTicketCost,
        earlyAccessPlanAmount: upgradePlanAmount,
        earlyAccessPlanCadence: upgradePlanCadence,
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
    isOnboarded: boolean | undefined,
    storeName?: string,
    source?: string,
): TrialModalProps['newTrialUpgradePlanModal'] => {
    const isExpandingTrialExperienceMilestone2Enabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceMilestone2,
        false,
    )
    const { startOnboardingWizard } = useAiAgentTrialOnboarding({
        shopName: storeName || '',
    })
    const planDetails = usePlanDetails()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { storeActivations } = useStoreActivations({ storeName })
    const [, setShoppingAssistantTrialOptin] = useLocalStorage<boolean>(
        `${storeName}-shopping-assistant-trial-optin`,
        false,
    )

    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )

    const isMultiStore = allShopifyIntegrations.length > 1

    const {
        startTrial,
        onDismissTrialUpgradeModal,
        closeTrialUpgradeModal,
        openTrialFinishSetupModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    const validateTrialStartRequirements = useCallback(
        (onClose?: () => void) => {
            if (
                isOnboarded === false &&
                isExpandingTrialExperienceMilestone2Enabled
            ) {
                return { isValid: true }
            }

            const storeActivation = storeActivations[storeName ?? '']

            if (!storeActivation) {
                return {
                    isValid: false,
                    errorMessage: (
                        <span>
                            AI Agent must be set up for this store to start the
                            trial.
                        </span>
                    ),
                }
            }

            const aiAgentEnabled = isAiAgentEnabledForStore(
                storeActivation.configuration,
            )

            if (!aiAgentEnabled) {
                return {
                    isValid: false,
                    errorMessage: (
                        <span>
                            AI Agent must be set up for this store to start the
                            trial. Make sure AI agent is{' '}
                            <Link
                                to={`/app/ai-agent/shopify/${storeName}/deploy/chat`}
                                onClick={onClose}
                            >
                                deployed on at least one channel
                            </Link>
                            .
                        </span>
                    ),
                }
            }

            return { isValid: true }
        },
        [
            storeName,
            storeActivations,
            isOnboarded,
            isExpandingTrialExperienceMilestone2Enabled,
        ],
    )

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

        let tooltip = `You’ll be moved from Helpdesk to Helpdesk + AI Agent plan, which includes ${planDetails.numQuotaTickets} automated interactions. Once you upgrade, each support or sales resolution will cost $1, plus a ${planDetails.helpdeskPlanTicketCost} helpdesk fee.`
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
            title: 'Try AI Agent',
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

    const shoppingAssistantProps = useMemo(() => {
        const validationState = validateTrialStartRequirements(
            closeTrialUpgradeModal,
        )

        let props = {
            ...createPlanModalData(
                'Try out shopping assistant skills on your current plan',
                planDetails,
                {
                    current: 'Keep current plan',
                    new: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                },
                isMultiStore,
            ),
            title: 'Try out shopping assistant skills on your current plan',
            subtitle:
                "AI Agent's new shopping assistant capabilities guide shoppers from first click to checkout, boosting conversions by up to 62% and revenue per visitor by 10%.",
            primaryAction: {
                label: 'Start trial now',
                onClick: (optedInForUpgrade?: boolean) =>
                    startTrial(optedInForUpgrade),
                isDisabled: !validationState.isValid,
                errorMessage: validationState.errorMessage,
            },
            secondaryAction: {
                label: 'No, thanks',
                onClick: onDismissTrialUpgradeModal,
            },
            onClose: closeTrialUpgradeModal,
            features: SHOPPING_ASSISTANT_TRIAL_FEATURES,
        }
        if (
            isOnboarded === false &&
            isExpandingTrialExperienceMilestone2Enabled
        ) {
            props = {
                ...props,
                title: 'Try AI Agent with Shopping Assistant skills',
                subtitle:
                    'Unlock powerful automation. Resolve 60% of support inquiries, proactively engage shoppers, and convert more visitors with 24/7 assistance using your own brand voice.',
                primaryAction: {
                    ...props.primaryAction,
                    label: 'Start Trial now (AI Agent + Shopping Assistant)',
                    onClick: () => {
                        setShoppingAssistantTrialOptin(true)
                        openTrialFinishSetupModal()
                    },
                },
                secondaryAction: {
                    label: 'start AI Agent Only',
                    onClick: () => {
                        setShoppingAssistantTrialOptin(false)
                        startOnboardingWizard()
                        closeTrialUpgradeModal()
                    },
                },
                features: SHOPPING_ASSISTANT_TRIAL_AI_AGENT_NOT_ONBOARDED,
            }
        }
        if (source && source === OPPORTUNITIES) {
            props = {
                ...props,
                title: 'Unlock AI Agent Opportunities',
                subtitle:
                    'Your AI Agent analyzes its own conversations to surface knowledge gaps and conflicts — so you can fix what matters most and improve automation quality over time. Plus, unlock Shopping Assistant skills to turn support into sales.',
                primaryAction: {
                    ...props.primaryAction,
                    label: 'Start Trial now (Opportunities + Shopping Assistant)',
                    onClick: () => {
                        setShoppingAssistantTrialOptin(true)
                        openTrialFinishSetupModal()
                    },
                },
                secondaryAction: {
                    label: 'start AI Agent Only',
                    onClick: () => {
                        setShoppingAssistantTrialOptin(false)
                        startOnboardingWizard()
                        closeTrialUpgradeModal()
                    },
                },
                features: SHOPPING_ASSISTANT_TRIAL_WITH_OPPORTUNITIES,
            }
        }
        return props
    }, [
        planDetails,
        startTrial,
        onDismissTrialUpgradeModal,
        closeTrialUpgradeModal,
        isMultiStore,
        validateTrialStartRequirements,
        isOnboarded,
        isExpandingTrialExperienceMilestone2Enabled,
        startOnboardingWizard,
        setShoppingAssistantTrialOptin,
        openTrialFinishSetupModal,
        source,
    ])

    return trialType === TrialType.AiAgent
        ? aiAgentProps
        : shoppingAssistantProps
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
                trialType,
            })
            openUpgradePlanModal(false)
        }
    }, [
        openUpgradePlanModal,
        pageName,
        hasAnyTrialOptedIn,
        upgradePlanAsync,
        trialType,
    ])

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

    const upgradePlanData = useAiAgentUpgradePlan()
    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(
                        EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT,
                        '_blank',
                    )
                },
            }
        }

        if (!upgradePlanData?.data) return undefined

        return {
            label: 'Upgrade Now',
            onClick: handleUpgradePlan,
            isLoading: isUpgradePlanLoading,
        }
    }, [canBookDemo, upgradePlanData, handleUpgradePlan, isUpgradePlanLoading])

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
    const { canBookDemo, trialType } = useTrialAccess()

    const secondaryAction = useMemo(() => {
        return {
            label: 'How AI Agent can 2x conversion rate',
            onClick: () => {
                window.open(EXTERNAL_URLS.SHOPPING_ASSISTANT_INFO, '_blank')
                logTrialBannerEvent(TrialEventType.Learn, trialType)
            },
        }
    }, [trialType])

    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(
                        EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT,
                        '_blank',
                    )
                    logTrialBannerEvent(TrialEventType.Demo, trialType)
                },
            }
        }

        return {
            label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            onClick: () => {
                logTrialBannerEvent(TrialEventType.StartTrial, trialType)
                onConfirmTrial?.()
            },
        }
    }, [canBookDemo, onConfirmTrial, trialType])

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
    trialType: TrialType,
    trialMetrics: TrialMetrics,
    trialAccess: TrialAccess,
): TrialModalProps['trialEndedModal'] => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const { gmvInfluenced, gmvInfluencedRate, automationRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const { isAdminUser } = trialAccess

    const { data: upgradePlanData } = useAiAgentUpgradePlan()
    const earlyAccessPlanPrice = (upgradePlanData?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount
    const cadence = upgradePlanData?.cadence ?? Cadence.Month

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
                return isAdminUser
                    ? `After your trial, your plan will increase by ${increaseAmount}/${cadence}.`
                    : TYPICAL_RESULTS_TEXT
            }
            return isAdminUser
                ? `${TYPICAL_RESULTS_TEXT} After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
                : TYPICAL_RESULTS_TEXT
        }

        if (hasSignificantGmvImpact) {
            if (difference > 0) {
                return isAdminUser
                    ? `After your trial, your plan will increase by ${increaseAmount}/${cadence}.`
                    : TYPICAL_RESULTS_TEXT
            }
            return isAdminUser
                ? 'The price of your plan remains the same after the upgrade.'
                : TYPICAL_RESULTS_TEXT
        }
        if (difference > 0) {
            return isAdminUser
                ? `${TYPICAL_RESULTS_TEXT} After upgrading, your plan will increase by ${increaseAmount}/${cadence}.`
                : TYPICAL_RESULTS_TEXT
        }
        return isAdminUser
            ? `${TYPICAL_RESULTS_TEXT} The price of your plan remains the same after the upgrade.`
            : TYPICAL_RESULTS_TEXT
    }, [
        isAiAgentTrial,
        hasSignificantAutomationRateImpact,
        hasSignificantGmvImpact,
        difference,
        currency,
        cadence,
        isAdminUser,
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
    const { automationRate, gmvInfluencedRate } = trialMetrics
    const automationRateValue = automationRate?.value ?? 0
    const hasSignificantAutomationRateImpact =
        automationRateValue > AI_AGENT_TRIAL_AUTOMATION_RATE_THRESHOLD

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const { data: upgradePlanData } = useAiAgentUpgradePlan()

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
                        {toPercentage(automationRateValue)} of customer
                        inquiries
                    </b>{' '}
                    and automatically{' '}
                    <b>
                        drove a {toPercentage(gmvInfluencedRate)} lift in
                        revenue
                    </b>
                    . Don&apos;t lose momentum now - keep the gains going by
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
        gmvInfluencedRate,
    ])

    const modalProps: TrialManageModalProps = useMemo(
        () => ({
            ...trialEndingModalProps,
            title,
            description: !!aiAgentDescription
                ? aiAgentDescription
                : trialEndingModalProps.description,
            onClose: closeManageTrialModal,
            primaryAction: upgradePlanData
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
            upgradePlanData,
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
    source,
}: {
    storeName?: string
    onConfirmTrial?: () => void
    pageName?: 'Strategy' | 'Engagement'
    source?: string
}): TrialModalProps => {
    const trialAccess = useTrialAccess(storeName)
    const { trialType, isOnboarded } = trialAccess
    const trialMetrics = useTrialMetrics(trialType, storeName)
    const upgradePlanModal = useUpgradePlanModal(trialType, storeName)
    const trialUpgradePlanModal = useTrialUpgradePlanModal()
    const newTrialUpgradePlanModal = useNewTrialUpgradePlanModal(
        trialType,
        isOnboarded,
        storeName,
        source,
    )
    const trialFinishSetupModal = useTrialFinishSetupModal({
        trialType,
        isOnboarded,
        storeName,
    })
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
    const trialEndingModal = useTrialEndingModal({
        trialType,
        trialMetrics,
        trialAccess,
        storeName,
    })
    const trialEndedModal = useTrialEndedModal(
        trialType,
        trialMetrics,
        trialAccess,
    )
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
