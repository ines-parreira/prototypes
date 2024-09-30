import React, {ComponentType} from 'react'
import _memoize from 'lodash/memoize'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {currentAccountHasFeature} from 'state/currentAccount/selectors'
import {AccountFeature} from 'state/currentAccount/types'
import useAppSelector from 'hooks/useAppSelector'

export function withFeaturePaywall<P extends Record<string, unknown>>(
    feature?: AccountFeature,
    CustomPaywall?: ComponentType<any>,
    paywallConfigs?: typeof defaultPaywallConfigs
) {
    return (Component: ComponentType<P>) => {
        return (ownProps: P) => {
            if (!feature) return <Component {...ownProps} />
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
