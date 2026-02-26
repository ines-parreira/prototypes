import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useHistory } from 'react-router-dom'

import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import type { AgentMessage } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/AgentMessages'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/MessageContent'
import { getCurrentUser } from 'state/currentUser/selectors'

import { SELF_SERVICE_PREVIEW_ROUTES } from './constants'
import useOrderDates from './hooks/useOrderDates'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceChatIntegrationReportIssuePage.less'

type Props = {
    integration: GorgiasChatIntegration
}

enum PreviewStep {
    REQUEST,
    RESPONSE,
    WAS_THIS_HELPFUL,
    REPLIES,
}

const DELAY_BETWEEN_STEPS = 800

const SelfServiceChatIntegrationReportIssuePage = ({ integration }: Props) => {
    const history = useHistory()
    const currentUser = useAppSelector(getCurrentUser)
    const [previewStep, setPreviewStep] = useState(PreviewStep.REQUEST)
    const timeout = useRef<number>()
    const ref = useRef<HTMLDivElement>(null)

    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const { decoration } = integration
    const { reportOrderIssueReason } = useSelfServicePreviewContext()
    const { orderPlacedDate } = useOrderDates(language)

    const hasResponseMessageText = Boolean(
        reportOrderIssueReason?.action?.responseMessageContent.text,
    )
    const showHelpfulPrompt = reportOrderIssueReason?.action?.showHelpfulPrompt

    useEffect(() => {
        if (!reportOrderIssueReason) {
            history.replace(SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE_REASONS)
        }
    }, [history, reportOrderIssueReason])

    useEffect(() => {
        setPreviewStep(PreviewStep.REQUEST)

        if (hasResponseMessageText) {
            timeout.current = window.setTimeout(() => {
                setPreviewStep(PreviewStep.RESPONSE)
            }, 500)
        }

        return () => {
            clearTimeout(timeout.current)

            timeout.current = undefined
        }
    }, [
        reportOrderIssueReason?.reasonKey,
        integration.id,
        hasResponseMessageText,
    ])
    useEffect(() => {
        if (previewStep < PreviewStep.RESPONSE) {
            return
        }

        if (showHelpfulPrompt) {
            switch (previewStep) {
                case PreviewStep.RESPONSE:
                    timeout.current = window.setTimeout(() => {
                        setPreviewStep(PreviewStep.WAS_THIS_HELPFUL)
                    }, DELAY_BETWEEN_STEPS)
                    break
                case PreviewStep.WAS_THIS_HELPFUL:
                    timeout.current = window.setTimeout(() => {
                        setPreviewStep(PreviewStep.REPLIES)
                    }, DELAY_BETWEEN_STEPS)
            }
        } else if (hasResponseMessageText) {
            setPreviewStep(PreviewStep.RESPONSE)
        }
    }, [previewStep, showHelpfulPrompt, hasResponseMessageText])
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [previewStep])

    const agentMessages = useMemo<AgentMessage[]>(() => {
        const agentMessages: AgentMessage[] = []

        if (!reportOrderIssueReason) {
            return agentMessages
        }

        if (previewStep >= PreviewStep.RESPONSE) {
            agentMessages.push({
                content:
                    reportOrderIssueReason.action?.responseMessageContent
                        .html || '',
                isHtml: true,
                attachments: [],
            })
        }

        if (previewStep >= PreviewStep.WAS_THIS_HELPFUL) {
            agentMessages.push({
                content: sspTexts.wasThisHelpful,
                isHtml: false,
                attachments: [],
            })
        }

        return agentMessages
    }, [previewStep, reportOrderIssueReason, sspTexts])

    if (!reportOrderIssueReason) {
        return null
    }

    const templatedMessage = (
        <>
            <b>{sspTexts[reportOrderIssueReason.reasonKey]}:</b>
            <div>&nbsp;</div>
            <div>
                {sspTexts.order}: <b>#3089</b>
            </div>
            <div>
                {sspTexts.fulfillment}: <b>#3089-F1</b>
            </div>
            <div>
                {sspTexts.itemNames}: <b>Graphic T-Shirt, Chain Bracelet</b>
            </div>
            <div>
                {sspTexts.trackingNumber}: <b>654756</b>
            </div>
            <div>
                {sspTexts.orderPlaced}:{' '}
                <b>{orderPlacedDate.format('L HH:mm')}</b>
            </div>
            <div>
                {sspTexts.shippingAddress}: <b>52 Washburn, SF, CA, 94027</b>
            </div>
        </>
    )

    return (
        <MessageContent
            innerRef={ref}
            className={css.container}
            conversationColor={integration.decoration.conversation_color}
            currentUser={currentUser}
            customerInitialMessages={[templatedMessage]}
            agentMessages={agentMessages}
            hideConversationTimestamp
            enableAgentMessagesAnimations
        >
            {previewStep === PreviewStep.REPLIES && (
                <div className={css.repliesContainer}>
                    {[sspTexts.yesCloseMyRequest, sspTexts.noINeedMoreHelp].map(
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
                        ),
                    )}
                </div>
            )}
        </MessageContent>
    )
}

export default SelfServiceChatIntegrationReportIssuePage
