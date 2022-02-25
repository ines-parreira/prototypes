import React, {ComponentProps, ComponentType} from 'react'
import {useSelector} from 'react-redux'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import {RootState} from 'state/types'

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
                <FeaturePaywall
                    feature={feature}
                    paywallConfigs={paywallConfigs}
                />
            )
        }
    }
}

export default withFeaturePaywall
