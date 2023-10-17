import React, {ComponentProps, useMemo} from 'react'

import UpgradeButton from 'pages/common/components/UpgradeButton'

export default function AutomationSubscriptionButton({
    state,
    label,
    onClick,
    position = 'left',
    ...rest
}: ComponentProps<typeof UpgradeButton>) {
    const automationAddOnState = useMemo<typeof state>(() => {
        return state as unknown
    }, [state])

    return (
        <UpgradeButton
            {...rest}
            label={label}
            onClick={onClick}
            state={automationAddOnState}
            position={position}
        />
    )
}
