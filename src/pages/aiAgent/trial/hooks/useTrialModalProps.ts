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
import { TrialActivatedModalProps } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModalProps } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import {
    TrialMetrics,
    useTrialMetrics,
} from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const EXTERNAL_URLS = {
    BOOK_DEMO: 'https://www.gorgias.com/demo/customers/automate',
    SHOPPING_ASSISTANT_INFO: 'https://www.gorgias.com/ai-shopping-assistant',
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
    manageTrialModal: Pick<
        TrialManageModalProps,
        'description' | 'advantages' | 'secondaryDescription'
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
) => ({
    title,
    currentPlan: {
        title: 'Support Agent',
        description: 'Provide best-in-class automated support',
        price: planDetails.currentPlanAmountFormatted,
        billingPeriod: planDetails.currentPlanCadence,
        features: [
            `${planDetails.numQuotaTickets} automated interactions`,
            'Deliver instant answers to repetitive questions and improve customer satisfaction',
            'Automatically handle orders, returns, and subscriptions quickly, 24/7',
        ],
        buttonText: buttonTexts.current,
    },
    newPlan: {
        title: 'Support Agent and Shopping Assistant ',
        description: 'Unlock full potential to drive more sales',
        price: planDetails.earlyAccessPlanAmount,
        billingPeriod: `${planDetails.earlyAccessPlanCadence}${isTrial ? ' after trial ends' : ''}`,
        features: [
            'Everything in Support Agent skills',
            'Proactively engage with customers to guide discovery',
            'Personalize recommendations with rich customer insights',
            'Intelligent upsell using customer input, not guesswork',
            'Offer discounts based on purchase intent',
        ],
        buttonText: buttonTexts.new,
        priceTooltipText: `Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a ${planDetails.helpdeskPlanTicketCost} helpdesk fee.`,
    },
})

const useUpgradePlanModal = (): TrialModalProps['upgradePlanModal'] => {
    const planDetails = usePlanDetails()

    return useMemo(
        () =>
            createPlanModalData(
                'Upgrade your AI Agent with new skills to drive more sales',
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
                    'Try Shopping Assistant for 14 days at no additional cost',
                    planDetails,
                    { current: 'Keep current plan', new: 'Try for 14 days' },
                    true,
                ),
            [planDetails],
        )
    }

const useTrialActivatedModal = () => ({
    title: 'Trial activated',
})

const useTrialStartedBanner = (
    trialMetrics: TrialMetrics,
    storeName?: string,
    pageName?: 'Strategy' | 'Engagement',
): TrialModalProps['trialStartedBanner'] => {
    const { remainingDays } = useTrialEnding(storeName ?? '')
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const trialMilestone = useSalesTrialRevampMilestone()

    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const { gmvInfluenced, gmvInfluencedRate } = trialMetrics
    const { canBookDemo, hasCurrentStoreTrialOptedOut, hasAnyTrialOptedIn } =
        useShoppingAssistantTrialAccess(storeName)
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
            openUpgradePlanModal()
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

    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(EXTERNAL_URLS.BOOK_DEMO, '_blank')
                },
            }
        }

        return {
            label: 'Upgrade Now',
            onClick: handleUpgradePlan,
            isLoading: isUpgradePlanLoading,
        }
    }, [canBookDemo, handleUpgradePlan, isUpgradePlanLoading])

    const description = useMemo(() => {
        if (gmvInfluencedRate > 0.01) {
            return `So far, it's generated ${gmvInfluenced} in added GMV for your store.`
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.`
    }, [gmvInfluenced, gmvInfluencedRate])

    const trialEndsText =
        remainingDays <= 0
            ? 'is ending today'
            : remainingDays === 1
              ? 'ends in 1 day'
              : `ends in ${remainingDays} days`

    return useMemo(
        () => ({
            title: `Shopping Assistant trial ${trialEndsText}.`,
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
    const { canBookDemo } = useShoppingAssistantTrialAccess()

    const secondaryAction = useMemo(() => {
        return {
            label: 'How Shopping Assistant Accelerates Growth',
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
            label: 'Try for 14 days',
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
            title: 'Drive more revenue with Shopping Assistant',
            description:
                "Make every interaction personal. With AI Agent's new shopping assistant features, you can offer real-time recommendations powered by rich insights and persuasive selling skills that help customers buy with confidence.",
            primaryAction,
            secondaryAction,
        }),
        [secondaryAction, primaryAction],
    )
}

const useTrialEndedModal = (
    trialMetrics: TrialMetrics,
): TrialModalProps['manageTrialModal'] => {
    const { gmvInfluenced, gmvInfluencedRate } = trialMetrics
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const earlyAccessPlanPrice =
        (earlyAccessAutomatePlanQuery?.data?.amount ?? 0) / 100
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const difference = earlyAccessPlanPrice - currentPlanAmount

    const description = useMemo(() => {
        if (gmvInfluencedRate > 0.01) {
            return `Shopping Assistant boosted your GMV by +${gmvInfluenced} during the trial. Keep the momentum going and turn even more visitors into buyers.`
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.`
    }, [gmvInfluenced, gmvInfluencedRate])

    const advantages = useMemo(() => {
        if (gmvInfluencedRate > 0.01) {
            return [`${gmvInfluenced} GMV uplift`]
        }
        return [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ]
    }, [gmvInfluenced, gmvInfluencedRate])

    const secondaryDescription = useMemo(() => {
        if (gmvInfluencedRate > 0.01) {
            return `After your trial, your plan will increase by ${formatAmount(difference, currency)}.`
        }
        return `Typical results achieved by merchants. After upgrading, your plan will increase by ${formatAmount(difference, currency)}.`
    }, [gmvInfluencedRate, difference, currency])

    return useMemo(
        () => ({
            title: 'Your trial has ended — and it made an impact.',
            description,
            secondaryDescription,
            advantages,
        }),
        [description, secondaryDescription, advantages],
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
    const trialMetrics = useTrialMetrics()
    const upgradePlanModal = useUpgradePlanModal()
    const trialUpgradePlanModal = useTrialUpgradePlanModal()
    const trialActivatedModal = useTrialActivatedModal()
    const trialStartedBanner = useTrialStartedBanner(
        trialMetrics,
        storeName,
        pageName,
    )
    const trialAlertBanner = useTrialAlertBanner({
        onConfirmTrial: onConfirmTrial,
    })
    const manageTrialModal = useTrialEndedModal(trialMetrics)

    return useMemo(
        () => ({
            upgradePlanModal,
            trialUpgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            manageTrialModal,
        }),
        [
            upgradePlanModal,
            trialUpgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            manageTrialModal,
        ],
    )
}
