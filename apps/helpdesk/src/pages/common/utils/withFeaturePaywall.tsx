import type { ComponentType } from 'react'
import React from 'react'
import { memoize } from '@gorgias/toolkit'
import type { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import { useAppSelector } from 'hooks/useAppSelector'
import { FeaturePaywall } from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { currentAccountHasFeature } from 'state/currentAccount/selectors'
import type { AccountFeature } from 'state/currentAccount/types'

export function withFeaturePaywall<P extends Record<string, unknown>>(
    feature: AccountFeature,
    CustomPaywall?: ComponentType<any>,
    paywallConfigs?: typeof defaultPaywallConfigs,
) {
    return (Component: ComponentType<P>) => {
        return (ownProps: P) => {
            const hasFeature = useAppSelector<boolean>(
                currentAccountHasFeature(feature),
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

export const memoizedWithFeaturePaywall = memoize(
    withFeaturePaywall,
) as typeof withFeaturePaywall
