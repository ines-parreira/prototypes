import React, {ComponentProps, ComponentType} from 'react'
import {useSelector} from 'react-redux'

import {
    hasLegacyPlan as hasLegacyPlanSelector,
    currentPlanId as currentPlanIdSelector,
} from '../../../state/billing/selectors'

const withLegacyPlanPaywall = (Paywall: ComponentType<any>) => {
    return (Component: ComponentType<Record<string, unknown>>) => {
        return (ownProps: ComponentProps<typeof Component>) => {
            const hasLegacyPlan = useSelector(hasLegacyPlanSelector)
            const currentPlanId = useSelector(currentPlanIdSelector)
            const hasInternalPlan =
                currentPlanId &&
                ['free', 'free-gorgias-internal'].includes(currentPlanId)

            return hasLegacyPlan && !hasInternalPlan ? (
                <Paywall />
            ) : (
                <Component {...ownProps} />
            )
        }
    }
}

export default withLegacyPlanPaywall
