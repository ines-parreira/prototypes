import React, {useMemo, useState} from 'react'
import {fromJS} from 'immutable'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import Button from 'pages/common/components/button/Button'
import {MacroActionName, MacroActionType} from 'models/macroAction/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    applyMacro,
    applyMacroAction,
    updateTicketMessage,
} from 'state/ticket/actions'
import {TicketMessage} from 'models/ticket/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import InTicketSuggestion from '../RuleSuggestion/InTicketSuggestion'

import css from './AIAgentDraftMessage.less'

export type Props = {
    ticketId: number
    message: TicketMessage
}

const AIAgentDraftMessage = ({ticketId, message}: Props) => {
    const {data, isLoading} = useGetAiAgentFeedback()
    const dispatch = useAppDispatch()
    const [hideMessage, setHideMessage] = useState(false)

    const feedback = data?.data

    const draftMessage = useMemo(
        () =>
            feedback?.messages.find((m) => m.messageId === message.id)
                ?.draftMessage,
        [feedback, message]
    )

    const handleCopyToEditor = () => {
        void dispatch(
            updateTicketMessage(ticketId, message.id!, {
                meta: {hidden: true},
            })
        )
        setHideMessage(true)

        if (draftMessage) {
            dispatch(
                applyMacroAction(
                    fromJS({
                        arguments: {
                            body_html: draftMessage.content,
                        },
                        name: MacroActionName.SetResponseText,
                        title: 'Set Response Text',
                        type: MacroActionType.User,
                    })
                )
            )

            if (draftMessage.ticketActions) {
                void dispatch(
                    applyMacro(
                        fromJS({
                            actions: draftMessage.ticketActions,
                        }),
                        ticketId
                    )
                )
            }
        }
    }

    if (isLoading) {
        return (
            <InTicketSuggestion
                isAIAgentDraftMessage
                ticketId={ticketId}
                messageId={message.id}
                actionsContent={<></>}
                infoContent={
                    <div className={css.skeletonWrapper}>
                        <Skeleton height={20} width="60%" />
                        <Skeleton height={20} width="40%" />
                    </div>
                }
                text={
                    <div className={css.skeletonWrapper}>
                        {new Array(10).fill(null).map((_, index) => (
                            <Skeleton key={index} height={20} width="100%" />
                        ))}
                    </div>
                }
                hideExpandButton
            />
        )
    }

    if (!feedback || !draftMessage || hideMessage) {
        return null
    }

    return (
        <InTicketSuggestion
            isAIAgentDraftMessage
            ticketId={ticketId}
            messageId={message.id}
            actionsContent={
                <Button
                    intent="primary"
                    size="small"
                    onClick={handleCopyToEditor}
                >
                    Copy to Editor
                </Button>
            }
            infoContent={
                <div
                    dangerouslySetInnerHTML={{
                        __html: feedback.messages[0].summary,
                    }}
                />
            }
            text={draftMessage.content || ''}
            macroActions={draftMessage.ticketActions || []}
        />
    )
}

export default AIAgentDraftMessage
