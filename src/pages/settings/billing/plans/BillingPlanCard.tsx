import React, {ComponentProps} from 'react'
import {useSelector} from 'react-redux'

import {RootState} from '../../../../state/types'
import {PlanWithCurrencySign} from '../../../../state/billing/types'
import {hasLegacyPlan} from '../../../../state/billing/selectors'
import LegacyPlanBadge from '../../../common/components/LegacyPlanBadge'

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
    isCurrentPlan: boolean
} & Omit<ComponentProps<typeof PlanCard>, 'planName' | 'features' | 'price'>

export default function BillingPlanCard({
    plan,
    theme,
    isCurrentPlan,
    headerBadge,
    ...planCardProps
}: Props) {
    const currentAccount = useSelector(
        (state: RootState) => state.currentAccount
    )
    const accountHasLegacyPlan = useSelector(hasLegacyPlan)
    const accountHasLegacyFeatures = currentAccount.getIn(
        ['meta', 'has_legacy_features'],
        false
    )
    const badge =
        isCurrentPlan && accountHasLegacyPlan ? (
            <LegacyPlanBadge />
        ) : (
            headerBadge
        )
    return (
        <PlanCard
            {...planCardProps}
            theme={
                theme ||
                (isCurrentPlan && accountHasLegacyFeatures
                    ? PlanCardTheme.Grey
                    : PLAN_THEMES[plan.name])
            }
            planName={plan.name}
            headerBadge={badge}
            features={getPlanCardFeaturesForPlan(
                plan,
                isCurrentPlan && accountHasLegacyFeatures
            )}
            price={
                plan.amount
                    ? `${plan.currencySign}${plan.amount} / ${
                          plan.interval === 'month' ? 'mo' : 'yr'
                      }`
                    : undefined
            }
        />
    )
}
