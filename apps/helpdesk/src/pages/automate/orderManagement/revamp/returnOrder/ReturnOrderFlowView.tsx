import { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { useParams } from 'react-router-dom'

import { Heading } from '@gorgias/axiom'

import type { LANGUAGE } from 'constants/languages'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { ChatChannelSelector } from 'pages/automate/connectedChannels/revamp/components/ChatChannelSelector/ChatChannelSelector'
import { useChatPreviewPanel } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { ReturnOrderAction } from './components/ReturnOrderAction'
import { ReturnOrderEligibility } from './components/ReturnOrderEligibility'
import { ReturnOrderFlowViewSkeleton } from './components/ReturnOrderFlowViewSkeleton'
import { useReturnOrderFlow } from './hooks/useReturnOrderFlow'
import type { ReturnOrderFlowViewContextType } from './ReturnOrderFlowViewContext'
import ReturnOrderFlowViewContext from './ReturnOrderFlowViewContext'

import css from './ReturnOrderFlowView.less'

export const ReturnOrderFlowView = () => {
    const {
        isLoading,
        isUpdatePending,
        isDirty,
        storeIntegration,
        eligibility,
        action,
        handleEligibilityChange,
        handleActionChange,
        handleSave,
    } = useReturnOrderFlow()
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { hasAccess } = useAiAgentAccess(shopName)

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

    const { showPreviewPanel, chatPreviewPortal } = useChatPreviewPanel(
        PreviewPanelHeaderActions,
        selectedChannelLanguage,
    )

    useEffect(() => {
        showPreviewPanel(appId)
    }, [showPreviewPanel, appId])

    const [errors, setErrors] = useState<Record<string, true>>({})

    const hasError = Object.keys(errors).length > 0
    const returnOrderFlowViewContext: ReturnOrderFlowViewContextType = useMemo(
        () => ({
            storeIntegration,
            setError: (path, hasError) => {
                setErrors((prevErrors) => {
                    const nextErrors = { ...prevErrors }

                    if (hasError) {
                        nextErrors[path] = true
                    } else {
                        delete nextErrors[path]
                    }

                    return _isEqual(prevErrors, nextErrors)
                        ? prevErrors
                        : nextErrors
                })
            },
        }),
        [storeIntegration],
    )

    const isSaveDisabled = !isDirty || isUpdatePending || hasError

    return (
        <>
            <OrderManagementFlowHeader
                title="Return order"
                onSave={handleSave}
                isSaveDisabled={isSaveDisabled}
            />
            <div className={css.content}>
                {isLoading ? (
                    <ReturnOrderFlowViewSkeleton />
                ) : (
                    <ReturnOrderFlowViewContext.Provider
                        value={returnOrderFlowViewContext}
                    >
                        <Heading size="md">
                            Allow customers to request a return if an order was
                            delivered.
                        </Heading>
                        <ReturnOrderEligibility
                            eligibility={eligibility}
                            onChange={handleEligibilityChange}
                        />
                        {hasAccess && (
                            <ReturnOrderAction
                                action={action}
                                onChange={handleActionChange}
                            />
                        )}
                    </ReturnOrderFlowViewContext.Provider>
                )}
            </div>
            {chatPreviewPortal}
        </>
    )
}
