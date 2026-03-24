import { getCheapestPlanNameForFeature } from '@repo/billing'

import { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import {
    getAvailableAutomatePlans,
    getAvailableHelpdeskPlans,
    getCurrentHelpdeskPlanName,
    getIsCurrentHelpdeskCustom,
    getIsCurrentHelpdeskLegacy,
} from 'state/billing/selectors'
import type {
    AccountFeature,
    AccountFeatureMetadata,
} from 'state/currentAccount/types'

import type { PaywallTheme } from '../Paywall/Paywall'
import Paywall, { UpgradeType } from '../Paywall/Paywall'

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
                (plan) =>
                    plan.name.split(' ')[0] ===
                        currentHelpdeskPlanName?.split(' ')[0] &&
                    (
                        plan.features as Record<
                            AccountFeature,
                            AccountFeatureMetadata
                        >
                    )[feature]?.enabled,
            ))
    const requiredPlanName = isCustomPlan
        ? 'Enterprise'
        : shouldKeepPlan
          ? currentHelpdeskPlanName?.split(' ')[0]
          : getCheapestPlanNameForFeature(feature, availablePlans || {})
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
