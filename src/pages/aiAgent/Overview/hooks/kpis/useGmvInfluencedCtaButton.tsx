import React from 'react'

import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { AIButton } from 'pages/common/components/AIButton/AIButton'

export const useGmvInfluencedCtaButton = ({
    aiAgentType,
    gmvInfluenced,
    gmvInfluencedLoading,
    isOnNewPlan,
    showEarlyAccessModal,
    showActivationModal,
}: {
    aiAgentType?: AiAgentType
    gmvInfluenced: number | null | undefined
    gmvInfluencedLoading: boolean
    isOnNewPlan: boolean
    showEarlyAccessModal: () => void
    showActivationModal: () => void
}): React.ReactNode => {
    const hasSales = aiAgentType === 'mixed' || aiAgentType === 'sales'

    if (gmvInfluencedLoading || gmvInfluenced !== 0 || hasSales) {
        return undefined
    }

    return !isOnNewPlan ? (
        <AIButton onClick={showEarlyAccessModal}>Upgrade</AIButton>
    ) : (
        <AIButton onClick={showActivationModal}>Activate</AIButton>
    )
}
