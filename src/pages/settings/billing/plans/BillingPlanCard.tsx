import React, {ComponentProps} from 'react'
import {useSelector} from 'react-redux'

import {PlanWithCurrencySign} from '../../../../state/billing/types'
import {hasLegacyPlan} from '../../../../state/billing/selectors'
import LegacyPlanBadge from '../../../common/components/LegacyPlanBadge'
import SubscriptionAmount from '../../common/SubscriptionAmount'

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
    isCurrentPlan?: boolean
} & Omit<ComponentProps<typeof PlanCard>, 'planName' | 'features' | 'price'>

export default function BillingPlanCard({
    plan,
    theme,
    isCurrentPlan = false,
    headerBadge,
    ...planCardProps
}: Props) {
    const accountHasLegacyPlan = useSelector(hasLegacyPlan)
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
                plan,
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
