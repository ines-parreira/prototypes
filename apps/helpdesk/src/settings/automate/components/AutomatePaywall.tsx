import React from 'react'
import type { ReactNode } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { getHasAutomate } from 'state/billing/selectors'

type Props = {
    children: ReactNode
}

export function AutomatePaywall({ children }: Props) {
    const hasAutomate = useAppSelector(getHasAutomate)

    if (!hasAutomate) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )
    }

    return <>{children}</>
}
