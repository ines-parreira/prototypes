import React from 'react'
import type { ReactNode } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'
import { getHasAutomate } from 'state/billing/selectors'

type Props = {
    children: ReactNode
}

export function AutomatePaywall({ children }: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)
    if (!hasAutomate) {
        return (
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
    }

    return <>{children}</>
}
