import { useEffect, useMemo } from 'react'

import { useParams } from 'react-router-dom'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { CancelOrderConfiguration } from './components/CancelOrderConfiguration'
import { useCancelOrderFlow } from './hooks/useCancelOrderFlow'
import { buildCancelOrderSimulationMessages } from './utils/buildCancelOrderSimulationMessages'

export const CancelOrderFlowView = () => {
    const { shopName } = useParams<{
        shopName: string
        shopType: string
    }>()

    const {
        updateQuickReplies,
        setConversationMessages,
        onChatPreviewLoaded,
        displayPage,
    } = useChatPreviewPanelContext()

    const {
        isLoading,
        isDirty,
        isUpdatePending,
        eligibility,
        responseMessageContent,
        handleEligibilityChange,
        handleResponseMessageChange,
        handleSave,
    } = useCancelOrderFlow()

    const simulationMessages = useMemo(
        () => buildCancelOrderSimulationMessages(responseMessageContent),
        [responseMessageContent],
    )

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateQuickReplies({ enabled: false, replies: [] })
            setConversationMessages(simulationMessages)
            displayPage('conversation')
        }, true)
    }, [
        onChatPreviewLoaded,
        updateQuickReplies,
        setConversationMessages,
        simulationMessages,
        displayPage,
    ])

    useEffect(() => {
        setConversationMessages(simulationMessages)
    }, [setConversationMessages, simulationMessages])

    const isSaveDisabled = !isDirty || isUpdatePending

    return (
        <>
            <OrderManagementFlowHeader
                title="Cancel order"
                onSave={handleSave}
                isSaveDisabled={isSaveDisabled}
            />
            <CancelOrderConfiguration
                shopName={shopName}
                isLoading={isLoading}
                eligibility={eligibility}
                responseMessageContent={responseMessageContent}
                onEligibilityChange={handleEligibilityChange}
                onResponseMessageChange={handleResponseMessageChange}
            />
        </>
    )
}
