import { useMemo } from 'react'

import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getAutomateEarlyAccessPricesFormatted } from 'models/billing/utils'
import { TrialActivatedModalProps } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialManageModalProps } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModalProps } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

export type TrialModalProps = {
    upgradePlanModal: Pick<
        UpgradePlanModalProps,
        'title' | 'currentPlan' | 'newPlan'
    >
    trialActivatedModal: Pick<TrialActivatedModalProps, 'title'>
    trialStartedBanner: Pick<TrialAlertBannerProps, 'title' | 'description'>
    trialAlertBanner: Pick<
        TrialAlertBannerProps,
        'title' | 'description' | 'primaryAction' | 'secondaryAction'
    >
    manageTrialModal: Pick<
        TrialManageModalProps,
        'description' | 'advantages' | 'secondaryDescription'
    >
}

const useUpgradePlanModal = (): TrialModalProps['upgradePlanModal'] => {
    const earlyAccessAutomatePlanQuery = useEarlyAccessAutomatePlan()
    const { amount: earlyAccessPlanAmount } =
        getAutomateEarlyAccessPricesFormatted(earlyAccessAutomatePlanQuery.data)
    const billingState = useBillingState()
    const currentPlan = billingState?.data?.current_plans?.automate
    const helpdeskPlan = billingState?.data?.current_plans?.helpdesk

    const currentPlanAmount = (currentPlan?.amount ?? 0) / 100
    const currency = currentPlan?.currency ?? 'USD'

    const currentPlanAmountFormatted = formatAmount(currentPlanAmount, currency)

    const helpdeskPlanTicketCost = formatAmount(
        (helpdeskPlan?.amount ?? 0) /
            (helpdeskPlan?.num_quota_tickets ?? 1) /
            100,
        currency,
    )

    return useMemo(
        () => ({
            title: 'Try Shopping Assistant for 14 days at no additional cost',
            currentPlan: {
                title: 'Support Agent',
                description: 'Provide best-in-class automated support',
                price: currentPlanAmountFormatted,
                billingPeriod: 'month',
                features: [
                    '2000 automated interactions',
                    'Deliver instant answers to repetitive questions and improve customer satisfaction',
                    'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                ],
                buttonText: 'Keep current plan',
            },
            newPlan: {
                title: 'Support Agent and Shopping Assistant ',
                description: 'Unlock full potential to drive more sales',
                price: earlyAccessPlanAmount,
                billingPeriod: 'month after trial ends',
                features: [
                    'Everything in Support Agent skills',
                    'Proactively engage with customers to guide discovery',
                    'Personalize recommendations with rich customer insights',
                    'Intelligent upsell using customer input, not guesswork',
                    'Offer discounts based on purchase intent',
                ],
                buttonText: 'Try for 14 days',
                priceTooltipText: `Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a ${helpdeskPlanTicketCost} helpdesk fee.`,
            },
        }),
        [
            currentPlanAmountFormatted,
            earlyAccessPlanAmount,
            helpdeskPlanTicketCost,
        ],
    )
}

const useTrialActivatedModal = () => {
    return useMemo(
        () => ({
            title: 'Trial activated',
        }),
        [],
    )
}

const useTrialStartedBanner = (): TrialModalProps['trialStartedBanner'] => {
    const { remainingDays, gmv } = useTrialMetrics()

    const description = useMemo(() => {
        if (gmv > 0) {
            return `So far, it's generated ${gmv} in added GMV for your store.`
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.`
    }, [gmv])

    return useMemo(
        () => ({
            title: `Shopping Assistant trial ends in ${remainingDays} days.`,
            description,
        }),
        [remainingDays, description],
    )
}

const useTrialAlertBanner = ({
    onConfirmTrial,
}: {
    onConfirmTrial?: () => void
}): TrialModalProps['trialAlertBanner'] => {
    const { canBookDemo } = useShoppingAssistantTrialAccess()

    const secondaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(
                        'https://www.gorgias.com/demo/customers/automate',
                        '_blank',
                    )
                },
            }
        }

        return {
            label: 'How Shopping Assistant Accelerates Growth',
            onClick: () => {
                window.open(
                    'https://www.gorgias.com/ai-shopping-assistant',
                    '_blank',
                )
            },
        }
    }, [canBookDemo])

    return useMemo(
        () => ({
            title: 'Drive more revenue with Shopping Assistant',
            description:
                "Make every interaction personal. With AI Agent's new shopping assistant features, you can offer real-time recommendations powered by rich insights and persuasive selling skills that help customers buy with confidence.",
            primaryAction: {
                label: 'Try for 14 days',
                onClick: onConfirmTrial ?? (() => {}),
            },
            secondaryAction,
        }),
        [onConfirmTrial, secondaryAction],
    )
}

const useTrialEndedModal = (): TrialModalProps['manageTrialModal'] => {
    const { gmv } = useTrialMetrics()

    const description = useMemo(() => {
        if (gmv > 0) {
            return `Shopping Assistant boosted your GMV by +${gmv} during the trial. Keep the momentum going and turn even more visitors into buyers.`
        }
        return `Brands that unlock Shopping Assistant see ongoing performance improvements over time, leading to stronger results. Upgrade today to drive even greater impact.`
    }, [gmv])

    const advantages = useMemo(() => {
        if (gmv > 0) {
            return [`${gmv} GMV uplift`]
        }
        return [
            '10% average order value',
            '62% conversion rate',
            '1.5% revenue',
        ]
    }, [gmv])

    const secondaryDescription = useMemo(() => {
        if (gmv > 0) {
            return `After your trial, your plan will increase by $X/month.`
        }
        return `Typical results achieved by merchants. After upgrading, your plan will increase by $X/month.`
    }, [gmv])

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
    onConfirmTrial,
}: {
    onConfirmTrial?: () => void
}): TrialModalProps => {
    const upgradePlanModal = useUpgradePlanModal()
    const trialActivatedModal = useTrialActivatedModal()
    const trialStartedBanner = useTrialStartedBanner()
    const trialAlertBanner = useTrialAlertBanner({
        onConfirmTrial: onConfirmTrial,
    })
    const manageTrialModal = useTrialEndedModal()

    return useMemo(
        () => ({
            upgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            manageTrialModal,
        }),
        [
            upgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
            manageTrialModal,
        ],
    )
}
