import React, {ComponentProps, useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    getAutomationPricesMap,
    getCurrentHelpdeskAddons,
} from 'state/billing/selectors'
import {PlanName} from 'utils/paywalls'
import UpgradeButton from 'pages/common/components/UpgradeButton'

export default function AutomationSubscriptionButton({
    state,
    label,
    onClick,
    ...rest
}: ComponentProps<typeof UpgradeButton>) {
    const addons = useAppSelector(getCurrentHelpdeskAddons)
    const automationPrices = useAppSelector(getAutomationPricesMap)
    const automationAddOnAvailable = !!addons?.some(
        (priceId) => !!automationPrices[priceId]
    )
    const automationAddOnState = useMemo<typeof state>(() => {
        return !automationAddOnAvailable
            ? {
                  openedPlanModal: PlanName.Basic,
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
        />
    )
}
