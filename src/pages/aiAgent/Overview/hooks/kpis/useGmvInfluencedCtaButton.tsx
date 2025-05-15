import React, { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { useAtLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import AIAgentTrialSuccessModal from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentType } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

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
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const history = useHistory()

    const { storeActivations } = useStoreActivations({
        pageName: window.location.pathname,
        withPublicResources: false,
    })

    const atLeastOneStoreHasActiveTrial =
        useAtLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)

    const hasSales = aiAgentType === 'mixed' || aiAgentType === 'sales'

    const [isModalOpen, setIsModalOpen] = useState(false)

    const onSuccess = () => {
        setIsModalOpen(true)
    }

    const { routes, startTrial, isLoading, canStartTrial } =
        useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess,
        })

    let button: React.ReactNode | undefined = undefined

    if (
        gmvInfluencedLoading ||
        gmvInfluenced !== 0 ||
        hasSales ||
        atLeastOneStoreHasActiveTrial ||
        isLoading ||
        Object.keys(storeActivations).length === 0
    ) {
        button = undefined
    } else {
        button = (
            <CtaButton
                isOnNewPlan={isOnNewPlan}
                canStartTrial={canStartTrial}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
                startTrial={startTrial}
            />
        )
    }

    return (
        <>
            {button}
            <AIAgentTrialSuccessModal
                isOpen={isModalOpen}
                onClick={() => {
                    history.push(routes.customerEngagement)
                    setIsModalOpen(false)
                }}
                onClose={() => {
                    setIsModalOpen(false)
                }}
            />
        </>
    )
}

export const CtaButton = ({
    isOnNewPlan,
    canStartTrial,
    showActivationModal,
    showEarlyAccessModal,
    startTrial,
}: {
    isOnNewPlan: boolean
    canStartTrial: boolean
    showActivationModal: () => void
    showEarlyAccessModal: () => void
    startTrial: () => void
}) => {
    if (isOnNewPlan) {
        return <AIButton onClick={showActivationModal}>Activate</AIButton>
    }
    if (canStartTrial) {
        return <AIButton onClick={startTrial}>Try Shopping Assistant</AIButton>
    }
    return <AIButton onClick={showEarlyAccessModal}>Upgrade</AIButton>
}
