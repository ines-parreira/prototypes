import React from 'react'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import {
    getAutomationPrices,
    getHelpdeskPrices,
    getIsCurrentHelpdeskLegacy,
    getIsCurrentHelpdeskCustom,
    getCurrentHelpdeskName,
} from 'state/billing/selectors'
import {getCheapestPriceNameForFeature} from 'utils/paywalls'

import Paywall, {PaywallTheme, UpgradeType} from '../Paywall/Paywall'

type Props = {
    feature: AccountFeature
    paywallConfigs?: typeof defaultPaywallConfigs
}

const FeaturePaywall = ({
    feature,
    paywallConfigs = defaultPaywallConfigs,
}: Props) => {
    const automationPrices = useAppSelector(getAutomationPrices)
    const helpdeskPrices = useAppSelector(getHelpdeskPrices)
    const isProductLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const isProductCustom = useAppSelector(getIsCurrentHelpdeskCustom)
    const helpdeskName = useAppSelector(getCurrentHelpdeskName)

    const prices = [...automationPrices, ...helpdeskPrices]

    const shouldKeepPrice =
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
    const requiredPriceName = isProductCustom
        ? 'Enterprise'
        : shouldKeepPrice
        ? helpdeskName?.split(' ')[0]
        : getCheapestPriceNameForFeature(feature, prices || {})
    const config = paywallConfigs[feature]!

    return config && requiredPriceName ? (
        <Paywall
            pageHeader={config.pageHeader}
            requiredUpgrade={requiredPriceName}
            upgradeType={UpgradeType.Plan}
            header={config.header}
            description={config.description}
            previewImage={config.preview}
            shouldKeepPrice={shouldKeepPrice}
            paywallTheme={requiredPriceName as PaywallTheme}
            showUpgradeCta
            testimonial={config.testimonial}
        />
    ) : (
        <></>
    )
}

export default FeaturePaywall
