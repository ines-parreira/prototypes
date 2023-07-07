import React, {ComponentProps, useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import {
    getAutomationPricesMap,
    getCurrentHelpdeskAddons,
} from 'state/billing/selectors'
import {PlanName} from 'utils/paywalls'
import {FeatureFlagKey} from 'config/featureFlags'
import UpgradeButton from 'pages/common/components/UpgradeButton'

export default function AutomationSubscriptionButton({
    state,
    label,
    onClick,
    position = 'left',
    ...rest
}: ComponentProps<typeof UpgradeButton>) {
    const addons = useAppSelector(getCurrentHelpdeskAddons)
    const automationPrices = useAppSelector(getAutomationPricesMap)
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    const automationAddOnAvailable = hasAccessToNewBilling
        ? true
        : !!addons?.some((priceId) => !!automationPrices[priceId])
    const automationAddOnState = useMemo<typeof state>(() => {
        return !automationAddOnAvailable
            ? {
                  openedPriceModal: PlanName.Basic,
                  isAutomationAddOnChecked: true,
              }
            : (state as unknown)
    }, [automationAddOnAvailable, state])

    return (
        <UpgradeButton
            {...rest}
            label={automationAddOnAvailable ? label : 'Upgrade'}
            onClick={automationAddOnAvailable ? onClick : undefined}
            state={automationAddOnState}
            position={position}
        />
    )
}
