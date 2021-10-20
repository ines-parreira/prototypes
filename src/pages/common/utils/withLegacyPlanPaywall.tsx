import React, {ComponentProps, ComponentType} from 'react'
import {useSelector} from 'react-redux'

import {hasLegacyPlan as hasLegacyPlanSelector} from '../../../state/billing/selectors'

const withLegacyPlanPaywall = (Paywall: ComponentType<any>) => {
    return (Component: ComponentType<Record<string, unknown>>) => {
        return (ownProps: ComponentProps<typeof Component>) => {
            const hasLegacyPlan = useSelector(hasLegacyPlanSelector)

            return hasLegacyPlan ? <Paywall /> : <Component {...ownProps} />
        }
    }
}

export default withLegacyPlanPaywall
