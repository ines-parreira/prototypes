import React from 'react'

import {paywallConfigs as defaultPaywallConfigs} from 'config/paywalls'
import {AccountFeature} from 'state/currentAccount/types'
import {hasLegacyPlan, DEPRECATED_getCurrentPlan} from 'state/billing/selectors'
import {BillingImmutableState} from 'state/billing/types'
import {Plan} from 'models/billing/types'
import {toJS} from 'utils'
import {getCheapestPlanNameForFeature} from 'utils/paywalls'
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
    const billingState = useAppSelector<BillingImmutableState>(
        (state) => state.billing
    )
    const isLegacyPlan = useAppSelector(hasLegacyPlan)
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const plans: Record<string, Plan> | undefined = toJS(
        billingState.get('plans')
    )
    const shouldKeepPlan =
        currentPlan.get('custom') ||
        (isLegacyPlan &&
            plans &&
            !!Object.values(plans).find(
                (plan) =>
                    plan.name.split(' ')[0] ===
                        (currentPlan.get('name') as string | undefined)?.split(
                            ' '
                        )[0] && plan.features[feature]?.enabled
            ))
    const requiredPlanName = currentPlan.get('custom')
        ? 'Enterprise'
        : shouldKeepPlan
        ? (currentPlan.get('name') as string)?.split(' ')[0]
        : getCheapestPlanNameForFeature(feature, plans || {})
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
