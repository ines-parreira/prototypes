import React from 'react'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'
import {
    getAvailableAutomatePlans,
    getAvailableHelpdeskPlans,
    getIsCurrentHelpdeskLegacy,
    getIsCurrentHelpdeskCustom,
    getCurrentHelpdeskPlanName,
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
    const automateAvailablePlans = useAppSelector(getAvailableAutomatePlans)
    const helpdeskAvailablePlans = useAppSelector(getAvailableHelpdeskPlans)
    const isLegacyPlan = useAppSelector(getIsCurrentHelpdeskLegacy)
    const isCustomPlan = useAppSelector(getIsCurrentHelpdeskCustom)
    const currentHelpdeskPlanName = useAppSelector(getCurrentHelpdeskPlanName)

    const availablePlans = [
        ...automateAvailablePlans,
        ...helpdeskAvailablePlans,
    ]

    const shouldKeepPlan =
        isCustomPlan ||
        (isLegacyPlan &&
            !!availablePlans.find(
                (price) =>
                    price.name.split(' ')[0] ===
                        currentHelpdeskPlanName?.split(' ')[0] &&
                    (
                        price.features as Record<
                            AccountFeature,
                            AccountFeatureMetadata
                        >
                    )[feature]?.enabled
            ))
    const requiredPlanName = isCustomPlan
        ? 'Enterprise'
        : shouldKeepPlan
        ? currentHelpdeskPlanName?.split(' ')[0]
        : getCheapestPriceNameForFeature(feature, availablePlans || {})
    const config = paywallConfigs[feature]!

    return config && requiredPlanName ? (
        <Paywall
            pageHeader={config.pageHeader}
            requiredUpgrade={config.requiredUpgrade ?? requiredPlanName}
            upgradeType={config.upgradeType ?? UpgradeType.Plan}
            header={config.header}
            description={config.description}
            previewImage={config.preview}
            shouldKeepPrice={shouldKeepPlan}
            paywallTheme={
                config.paywallTheme ?? (requiredPlanName as PaywallTheme)
            }
            showUpgradeCta
            customCta={config.customCta}
            testimonial={config.testimonial}
        />
    ) : (
        <></>
    )
}

export default FeaturePaywall
