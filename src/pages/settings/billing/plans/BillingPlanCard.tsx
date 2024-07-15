import React, {ComponentProps} from 'react'

import {PlanInterval} from 'models/billing/types'
import {getIsCurrentHelpdeskLegacy} from 'state/billing/selectors'
import LegacyPlanBadge from 'pages/common/components/LegacyPlanBadge'
import SubscriptionAmount from 'pages/settings/common/SubscriptionAmount'
import useAppSelector from 'hooks/useAppSelector'

import PlanCard, {PlanCardFeature, PlanCardTheme} from './PlanCard'

const PLAN_THEMES: Partial<Record<string, PlanCardTheme>> = {
    Basic: PlanCardTheme.Blue,
    Pro: PlanCardTheme.Navy,
    Advanced: PlanCardTheme.Green,
    Custom: PlanCardTheme.Gold,
    Enterprise: PlanCardTheme.Gold,
}

type Props = {
    amount: number
    currency: string
    features: PlanCardFeature[]
    interval: PlanInterval
    isCurrentPlan?: boolean
    name: string
} & Omit<ComponentProps<typeof PlanCard>, 'planName' | 'features' | 'price'>

export default function BillingPlanCard({
    amount,
    currency,
    features,
    interval,
    theme,
    isCurrentPlan = false,
    headerBadge,
    name,
    ...planCardProps
}: Props) {
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const badge =
        isCurrentPlan && isCurrentHelpdeskLegacy ? (
            <LegacyPlanBadge />
        ) : (
            headerBadge
        )
    return (
        <PlanCard
            {...planCardProps}
            theme={theme || PLAN_THEMES[name]}
            planName={name}
            headerBadge={badge}
            features={features}
            price={
                <SubscriptionAmount
                    amount={amount}
                    currency={currency}
                    interval={interval}
                />
            }
        />
    )
}
