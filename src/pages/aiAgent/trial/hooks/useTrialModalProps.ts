import { useMemo } from 'react'

import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getAutomateEarlyAccessPricesFormatted } from 'models/billing/utils'
import { TrialAlertBannerProps } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModalProps } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

export type TrialModalProps = {
    upgradePlanModal: Pick<
        UpgradePlanModalProps,
        'title' | 'currentPlan' | 'newPlan'
    >
    trialActivatedModal: {
        title: string
    }
    trialStartedBanner: {
        title: string
        description: string
    }
    trialAlertBanner: Pick<
        TrialAlertBannerProps,
        'title' | 'description' | 'primaryAction' | 'secondaryAction'
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

    return useMemo(
        () => ({
            title: `Shopping Assistant trial ends in ${remainingDays} days.`,
            description: `So far, it's generated ${gmv} in added GMV for your store.`,
        }),
        [remainingDays, gmv],
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

    return useMemo(
        () => ({
            upgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
        }),
        [
            upgradePlanModal,
            trialActivatedModal,
            trialStartedBanner,
            trialAlertBanner,
        ],
    )
}
