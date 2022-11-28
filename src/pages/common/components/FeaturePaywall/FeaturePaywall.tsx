import React from 'react'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import {
    getPrices,
    getIsCurrentHelpdeskLegacy,
    getIsCurrentHelpdeskCustom,
    getCurrentHelpdeskName,
} from 'state/billing/selectors'
import {getCheapestPriceNameForFeature} from 'utils/paywalls'
import useAppSelector from 'hooks/useAppSelector'

import Paywall, {PaywallTheme, UpgradeType} from '../Paywall/Paywall'

type Props = {
    feature: AccountFeature
    paywallConfigs?: typeof defaultPaywallConfigs
}

const FeaturePaywall = ({
    feature,
    paywallConfigs = defaultPaywallConfigs,
}: Props) => {
    const prices = useAppSelector(getPrices)
    const isProductLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const isProductCustom = useAppSelector(getIsCurrentHelpdeskCustom)
    const helpdeskName = useAppSelector(getCurrentHelpdeskName)

    const shouldKeepPlan =
        isProductCustom ||
        (isProductLegacy &&
            !!prices.find(
                (price) =>
                    price.name.split(' ')[0] === helpdeskName?.split(' ')[0] &&
                    (
                        price.features as Record<
                            AccountFeature,
                            AccountFeatureMetadata
                        >
                    )[feature]?.enabled
            ))
    const requiredPlanName = isProductCustom
        ? 'Enterprise'
        : shouldKeepPlan
        ? helpdeskName?.split(' ')[0]
        : getCheapestPriceNameForFeature(feature, prices || {})
    const config = paywallConfigs[feature]!

    return config && requiredPlanName ? (
        <Paywall
            pageHeader={config.pageHeader}
            requiredUpgrade={requiredPlanName}
            upgradeType={UpgradeType.Plan}
            header={config.header}
            description={config.description}
            previewImage={config.preview}
            shouldKeepPlan={shouldKeepPlan}
            paywallTheme={requiredPlanName as PaywallTheme}
            showUpgradeCta
            testimonial={config.testimonial}
        />
    ) : (
        <></>
    )
}

export default FeaturePaywall
