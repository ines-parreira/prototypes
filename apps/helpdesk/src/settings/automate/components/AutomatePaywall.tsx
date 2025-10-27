import type { ReactNode } from 'react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'

type Props = {
    children: ReactNode
}

export function AutomatePaywall({ children }: Props) {
    const { hasAccess } = useAiAgentAccess()

    if (!hasAccess) {
        return (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.TrialSetup}
            />
        )
    }

    return <>{children}</>
}
