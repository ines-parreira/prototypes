import { useMemo } from 'react'

import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getAutomateEarlyAccessPricesFormatted } from 'models/billing/utils'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'

export interface TrialModalProps {
    upgradePlanModal: {
        title: string
        currentPlan: {
            title: string
            description: string
            price: string
            billingPeriod: string
            features: string[]
            buttonText: string
        }
        newPlan: {
            title: string
            description: string
            price: string
            billingPeriod: string
            features: string[]
            buttonText: string
            priceTooltipText: string
        }
    }
    trialActivatedModal: {
        title: string
    }
}

const useUpgradePlanModal = () => {
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

export const useTrialModalProps = (): TrialModalProps => {
    const upgradePlanModal = useUpgradePlanModal()
    const trialActivatedModal = useTrialActivatedModal()

    return useMemo(
        () => ({
            upgradePlanModal,
            trialActivatedModal,
        }),
        [upgradePlanModal, trialActivatedModal],
    )
}
