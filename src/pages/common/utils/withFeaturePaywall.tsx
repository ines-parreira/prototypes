import _memoize from 'lodash/memoize'
import React, {ComponentType} from 'react'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'

export function withFeaturePaywall<P extends Record<string, unknown>>(
    feature: AccountFeature,
    CustomPaywall?: ComponentType<any>,
    paywallConfigs?: typeof defaultPaywallConfigs
) {
    return (Component: ComponentType<P>) => {
        return (ownProps: P) => {
            const hasFeature = useAppSelector<boolean>(
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

export const memoizedWithFeaturePaywall = _memoize(
    withFeaturePaywall
) as typeof withFeaturePaywall

export default memoizedWithFeaturePaywall
