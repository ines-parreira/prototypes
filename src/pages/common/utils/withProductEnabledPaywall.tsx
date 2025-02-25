import React, { ComponentProps, ComponentType } from 'react'

import { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import { currentAccountHasProduct } from 'state/billing/selectors'
import { AccountFeature } from 'state/currentAccount/types'

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
