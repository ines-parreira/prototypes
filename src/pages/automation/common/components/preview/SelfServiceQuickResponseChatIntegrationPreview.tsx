import React, {useCallback, useEffect, useRef, useState} from 'react'

import {QuickResponsePolicy} from 'models/selfServiceConfiguration/types'
import {GorgiasChatIntegration} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import MessageContent, {
    AgentMessages,
} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import {toJS} from 'utils'

import css from './SelfServiceQuickResponseChatIntegrationPreview.less'

type Props = {
    integration: GorgiasChatIntegration
    quickResponse: QuickResponsePolicy
}

enum PreviewStep {
    QUESTION,
    RESPONSE,
    WAS_THIS_RELEVANT,
    REPLIES,
}

const DELAY_BETWEEN_STEPS = 800

const SelfServiceQuickResponseChatIntegrationPreview = ({
    integration,
    quickResponse,
}: Props) => {
    const {decoration, meta} = integration

    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[meta.language || 'en-US']

    const currentUser = useAppSelector(getCurrentUser)
    const [previewStep, setPreviewStep] = useState(PreviewStep.QUESTION)
    const timeout = useRef<number>()
    const ref = useRef<HTMLDivElement>(null)

    const hasResponseMessageText = Boolean(
        quickResponse.response_message_content.text
    )

    const handlePreviewStepAnimation = useCallback((initialDelay = 0) => {
        timeout.current = window.setTimeout(() => {
            setPreviewStep(PreviewStep.RESPONSE)

            timeout.current = window.setTimeout(() => {
                setPreviewStep(PreviewStep.WAS_THIS_RELEVANT)

                timeout.current = window.setTimeout(() => {
                    setPreviewStep(PreviewStep.REPLIES)
                }, DELAY_BETWEEN_STEPS)
            }, DELAY_BETWEEN_STEPS)
        }, initialDelay)
    }, [])

    useEffect(() => {
        setPreviewStep(PreviewStep.QUESTION)

        if (hasResponseMessageText) {
            handlePreviewStepAnimation(500)
        }

        return () => {
            clearTimeout(timeout.current)

            timeout.current = undefined
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quickResponse.id, integration.id, handlePreviewStepAnimation])
    useEffect(() => {
        if (!hasResponseMessageText) {
            clearTimeout(timeout.current)
            setPreviewStep(PreviewStep.QUESTION)

            timeout.current = undefined
        } else if (!timeout.current) {
            handlePreviewStepAnimation()
        }
    }, [hasResponseMessageText, handlePreviewStepAnimation])
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [previewStep])

    const agentMessages: AgentMessages = []

    if (previewStep >= PreviewStep.RESPONSE) {
        agentMessages.push({
            content: quickResponse.response_message_content.html,
            isHtml: true,
            attachments:
                toJS(quickResponse.response_message_content.attachments) || [],
        })
    }
    if (previewStep >= PreviewStep.WAS_THIS_RELEVANT) {
        agentMessages.push({
            content: sspTexts.wasThisRelevant,
            isHtml: false,
            attachments: [],
        })
    }

    return (
        <ChatIntegrationPreview
            name={integration.name}
            introductionText={decoration.introduction_text}
            mainColor={decoration.main_color}
            avatarType={decoration.avatar_type}
            avatarTeamPictureUrl={decoration.avatar_team_picture_url}
            isOnline
            language={meta.language}
            renderFooter={false}
            renderPoweredBy
            autoResponderEnabled={meta.preferences?.auto_responder?.enabled}
            autoResponderReply={meta.preferences?.auto_responder?.reply}
            hideButton
            showGoBackButton
            enableAnimations
        >
            <MessageContent
                key={quickResponse.id}
                className={css.contentContainer}
                innerRef={ref}
                conversationColor={decoration.conversation_color}
                currentUser={currentUser}
                customerInitialMessages={[
                    quickResponse.title || (
                        <span className={css.titlePlaceholder}>
                            Button clicked by shopper
                        </span>
                    ),
                ]}
                agentMessages={agentMessages}
                hideConversationTimestamp
                hideMessageTimestamp
                enableAgentMessagesAnimations
            >
                {previewStep === PreviewStep.REPLIES && (
                    <div className={css.repliesContainer}>
                        {[sspTexts.yesThankYou, sspTexts.noINeedMoreHelp].map(
                            (reply) => (
                                <div
                                    key={reply}
                                    className={css.reply}
                                    style={{
                                        color: decoration.main_color,
                                        borderColor: decoration.main_color,
                                    }}
                                >
                                    {reply}
                                </div>
                            )
                        )}
                    </div>
                )}
            </MessageContent>
        </ChatIntegrationPreview>
    )
}

export default SelfServiceQuickResponseChatIntegrationPreview
