import type { ComponentProps, ComponentType } from 'react'
import React from 'react'

import type { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import type { ProductType } from 'models/billing/types'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { currentAccountHasProduct } from 'state/billing/selectors'
import type { AccountFeature } from 'state/currentAccount/types'

export const withProductEnabledPaywall = (
    product: ProductType,
    feature: AccountFeature,
    CustomPaywall?: ComponentType<any>,
    paywallConfigs?: typeof defaultPaywallConfigs,
) => {
    return (Component: ComponentType<Record<string, unknown>>) => {
        return (ownProps: ComponentProps<typeof Component>) => {
            const hasProduct = useAppSelector<boolean>(
                currentAccountHasProduct(product),
            )

            return hasProduct ? (
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

export default withProductEnabledPaywall
