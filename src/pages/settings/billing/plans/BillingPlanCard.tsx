import React, {ComponentProps} from 'react'

import {PlanWithCurrencySign} from 'state/billing/types'
import {hasLegacyPlan} from 'state/billing/selectors'
import LegacyPlanBadge from 'pages/common/components/LegacyPlanBadge'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import useAppSelector from 'hooks/useAppSelector'

import PlanCard, {PlanCardTheme} from './PlanCard'
import {getPlanCardFeaturesForPlan} from './billingPlanFeatures'

const PLAN_THEMES: Partial<Record<string, PlanCardTheme>> = {
    Basic: PlanCardTheme.Blue,
    Pro: PlanCardTheme.Navy,
    Advanced: PlanCardTheme.Green,
    Custom: PlanCardTheme.Gold,
    Enterprise: PlanCardTheme.Gold,
}

type Props = {
    plan: PlanWithCurrencySign
    featuresPlan: PlanWithCurrencySign
    isCurrentPlan?: boolean
} & Omit<ComponentProps<typeof PlanCard>, 'planName' | 'features' | 'price'>

export default function BillingPlanCard({
    plan,
    featuresPlan,
    theme,
    isCurrentPlan = false,
    headerBadge,
    ...planCardProps
}: Props) {
    const accountHasLegacyPlan = useAppSelector(hasLegacyPlan)
    const badge =
        isCurrentPlan && accountHasLegacyPlan ? (
            <LegacyPlanBadge />
        ) : (
            headerBadge
        )
    return (
        <PlanCard
            {...planCardProps}
            theme={theme || PLAN_THEMES[plan.name]}
            planName={plan.name}
            headerBadge={badge}
            features={getPlanCardFeaturesForPlan({
                plan: featuresPlan,
                enableHardCodedFeatures: !(
                    isCurrentPlan && accountHasLegacyPlan
                ),
            })}
            price={
                <SubscriptionAmount
                    amount={plan.amount}
                    currency={plan.currency}
                    interval={plan.interval}
                />
            }
        />
    )
}
