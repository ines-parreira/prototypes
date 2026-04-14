import { useEffect, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import type { LANGUAGE } from 'constants/languages'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { CancelOrderConfiguration } from './components/CancelOrderConfiguration'
import { useCancelOrderFlow } from './hooks/useCancelOrderFlow'

export const CancelOrderFlowView = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const [selectedChannelId, setSelectedChannelId] = useState<
        number | undefined
    >(() => chatChannels[0]?.value.id)

    const selectedChannel =
        chatChannels.find((c) => c.value.id === selectedChannelId) ??
        chatChannels[0]

    const appId = selectedChannel?.value.meta.app_id ?? null

    const selectedChannelLanguage = useMemo(() => {
        const primaryLanguage: LANGUAGE | undefined =
            selectedChannel?.value?.meta?.languages?.find((lang) => {
                return lang.primary === true
            })?.language

        return primaryLanguage
    }, [selectedChannel])

    const PreviewPanelHeaderActions = useMemo(() => {
        return chatChannels.length > 0 ? (
            <ChatChannelSelector
                chatChannels={chatChannels}
                selectedChannelId={selectedChannelId}
                onSelect={setSelectedChannelId}
            />
        ) : undefined
    }, [selectedChannelId, chatChannels])

    const { showPreviewPanel, chatPreviewPortal } = useChatPreviewPanel({
        headerActions: PreviewPanelHeaderActions,
        locale: selectedChannelLanguage,
    })

    useEffect(() => {
        showPreviewPanel(appId)
    }, [showPreviewPanel, appId])

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
            {chatPreviewPortal}
        </>
    )
}
