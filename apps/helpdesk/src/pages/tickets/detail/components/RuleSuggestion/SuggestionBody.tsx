import React, { CSSProperties, useEffect, useMemo } from 'react'

import { useMeasure } from '@repo/hooks'
import { fromJS } from 'immutable'
import { Collapse } from 'reactstrap'

import { MacroAction } from 'models/macroAction/types'
import { TicketMessage } from 'models/ticket/types'
import TicketReplyAction from 'pages/tickets/detail/components/ReplyArea/TicketReplyAction'
import AIAgentUsedData from 'pages/tickets/detail/components/TicketMessages/AIAgentUsedData'

import AIAgentBanner from '../TicketMessages/AIAgentBanner'
import { SuggestionStates } from './InTicketSuggestion'

import css from './SuggestionBody.less'

type Props = {
    text?: string | React.ReactNode
    actions?: MacroAction[]
    ticketId: number
    state: SuggestionStates
    setSuggestionState: (state: SuggestionStates) => void
    isAIAgentDraftMessage?: boolean
    message?: TicketMessage
    messages?: TicketMessage[]
    isTrialMessage?: boolean
}

export const PREVIEW_HEIGHT = 110

export default function SuggestionBody({
    text,
    actions,
    ticketId,
    state,
    setSuggestionState,
    isAIAgentDraftMessage = false,
    message,
    messages,
    isTrialMessage,
}: Props) {
    const [innerRef, { height }] = useMeasure<HTMLDivElement>()

    useEffect(() => {
        if (isTrialMessage && state === 'preview') {
            setSuggestionState('expand')
        }

        if (state || height === 0) return

        if (height < PREVIEW_HEIGHT) {
            setSuggestionState('expand')
        } else {
            setSuggestionState('preview')
        }
    }, [height, isTrialMessage, setSuggestionState, state])

    const style: CSSProperties =
        state === null
            ? {
                  display: 'block',
                  position: 'absolute',
                  left: '-999px',
              }
            : state === 'preview'
              ? {
                    display: 'block',
                    height: PREVIEW_HEIGHT,
                }
              : {}

    const content = useMemo(() => {
        if (!text) {
            return '(No reply will be sent)'
        }

        if (typeof text === 'string')
            return <div dangerouslySetInnerHTML={{ __html: text }} />

        return text
    }, [text])

    return (
        <Collapse
            className={css.container}
            isOpen={state === 'expand'}
            style={style}
        >
            <div ref={innerRef} className={css.content}>
                <div className={css.text}>{content}</div>
                {isAIAgentDraftMessage && !!message?.id && (
                    <AIAgentUsedData messageId={message.id} />
                )}

                <div>
                    {actions?.map((action, index) => {
                        return (
                            <TicketReplyAction
                                key={action.name + 'suggestion' + index}
                                index={index}
                                action={fromJS(action)}
                                ticketId={ticketId}
                                disabled
                                className={css.action}
                            />
                        )
                    })}
                </div>
            </div>
            {isTrialMessage && message && messages?.length && (
                <AIAgentBanner
                    message={message}
                    messages={messages}
                    className={css.banner}
                />
            )}
        </Collapse>
    )
}
