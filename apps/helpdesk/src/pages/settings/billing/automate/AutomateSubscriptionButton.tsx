import type { ComponentProps } from 'react'
import React, { useMemo } from 'react'

import UpgradeButton from 'pages/common/components/UpgradeButton'

export default function AutomateSubscriptionButton({
    state,
    label,
    onClick,
    position = 'left',
    ...rest
}: ComponentProps<typeof UpgradeButton>) {
    const automateState = useMemo<typeof state>(() => {
        return state as unknown
    }, [state])

    return (
        <UpgradeButton
            {...rest}
            label={label}
            onClick={onClick}
            state={automateState}
            position={position}
        />
    )
}
