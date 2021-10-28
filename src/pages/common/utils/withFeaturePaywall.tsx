import React, {ComponentProps, ComponentType} from 'react'
import {useSelector} from 'react-redux'

import {AccountFeature} from '../../../state/currentAccount/types'
import {RootState} from '../../../state/types'
import {currentAccountHasFeature} from '../../../state/currentAccount/selectors'
import Paywall from '../components/Paywall/Paywall'
import {paywallConfigs as defaultPaywallConfigs} from '../../../config/paywalls'

export const withFeaturePaywall = (
    feature: AccountFeature,
    CustomPaywall?: ComponentType<any>,
    paywallConfigs?: typeof defaultPaywallConfigs
) => {
    return (Component: ComponentType<Record<string, unknown>>) => {
        return (ownProps: ComponentProps<typeof Component>) => {
            const hasFeature = useSelector<RootState, boolean>(
                currentAccountHasFeature(feature)
            )
            return hasFeature ? (
                <Component {...ownProps} />
            ) : CustomPaywall ? (
                <CustomPaywall />
            ) : (
                <Paywall feature={feature} paywallConfigs={paywallConfigs} />
            )
        }
    }
}

export default withFeaturePaywall
