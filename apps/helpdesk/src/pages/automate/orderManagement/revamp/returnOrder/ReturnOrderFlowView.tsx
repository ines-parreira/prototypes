import { useEffect, useMemo, useState } from 'react'

import _isEqual from 'lodash/isEqual'
import { useParams } from 'react-router-dom'

import { Heading } from '@gorgias/axiom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { ReturnActionType } from 'models/selfServiceConfiguration/types'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { ReturnOrderAction } from './components/ReturnOrderAction'
import { ReturnOrderEligibility } from './components/ReturnOrderEligibility'
import { ReturnOrderFlowViewSkeleton } from './components/ReturnOrderFlowViewSkeleton'
import { useReturnOrderFlow } from './hooks/useReturnOrderFlow'
import type { ReturnOrderFlowViewContextType } from './ReturnOrderFlowViewContext'
import ReturnOrderFlowViewContext from './ReturnOrderFlowViewContext'
import { buildReturnOrderSimulationMessages } from './utils/buildReturnOrderSimulationMessages'

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
    const { shopName } = useParams<{
        shopName: string
        shopType: string
    }>()
    const { hasAccess } = useAiAgentAccess(shopName)

    const [errors, setErrors] = useState<Record<string, true>>({})

    const {
        updateQuickReplies,
        setConversationMessages,
        onChatPreviewLoaded,
        displayPage,
    } = useChatPreviewPanelContext()

    const responseMessageContent =
        action.type === ReturnActionType.AutomatedResponse
            ? action.responseMessageContent
            : undefined

    const simulationMessages = useMemo(
        () => buildReturnOrderSimulationMessages(responseMessageContent),
        [responseMessageContent],
    )

    useEffect(() => {
        setConversationMessages(simulationMessages)
    }, [setConversationMessages, simulationMessages])

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateQuickReplies({ enabled: false, replies: [] })
            setConversationMessages(simulationMessages)
            displayPage('conversation')
        }, true)
    }, [
        updateQuickReplies,
        onChatPreviewLoaded,
        setConversationMessages,
        simulationMessages,
        displayPage,
    ])

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
        </>
    )
}
