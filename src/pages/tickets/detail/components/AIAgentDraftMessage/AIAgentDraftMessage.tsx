import React, {useMemo, useState} from 'react'
import {fromJS} from 'immutable'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import Button from 'pages/common/components/button/Button'
import {MacroActionName, MacroActionType} from 'models/macroAction/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {
    applyMacro,
    applyMacroAction,
    updateTicketMessage,
} from 'state/ticket/actions'
import {TicketMessage} from 'models/ticket/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {SegmentEvent, logEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import InTicketSuggestion from '../RuleSuggestion/InTicketSuggestion'

import css from './AIAgentDraftMessage.less'

export type Props = {
    ticketId: number
    message: TicketMessage
    isTrial?: boolean
}

const AIAgentDraftMessage = ({ticketId, message, isTrial}: Props) => {
    const accountId = useAppSelector(getCurrentAccountId)
    const {data, isLoading} = useGetAiAgentFeedback()
    const dispatch = useAppDispatch()
    const [hideMessage, setHideMessage] = useState(false)

    const feedback = data?.data

    const feedbackMessage = useMemo(
        () => feedback?.messages.find((m) => m.messageId === message.id),
        [feedback, message]
    )

    const draftMessage = feedbackMessage?.draftMessage

    const handleCopyToEditor = () => {
        void dispatch(
            updateTicketMessage(ticketId, message.id!, {
                meta: {hidden: true},
            })
        )
        setHideMessage(true)

        logEvent(SegmentEvent.AiAgentCopiedToEditor, {
            accountId,
            banner: isTrial ? 'trial' : 'qa_failed',
        })

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
                        __html: feedbackMessage.summary,
                    }}
                />
            }
            text={draftMessage.content || ''}
            macroActions={draftMessage.ticketActions || []}
        />
    )
}

export default AIAgentDraftMessage
