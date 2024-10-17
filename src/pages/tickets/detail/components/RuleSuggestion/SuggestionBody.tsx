import React, {useEffect, CSSProperties, useMemo} from 'react'
import {fromJS} from 'immutable'
import {Collapse} from 'reactstrap'
import TicketReplyAction from 'pages/tickets/detail/components/ReplyArea/TicketReplyAction'
import AIAgentUsedData from 'pages/tickets/detail/components/TicketMessages/AIAgentUsedData'
import {MacroAction} from 'models/macroAction/types'
import useMeasure from 'hooks/useMeasure'
import css from './SuggestionBody.less'
import {SuggestionStates} from './InTicketSuggestion'

type Props = {
    text?: string | React.ReactNode
    actions?: MacroAction[]
    ticketId: number
    state: SuggestionStates
    setSuggestionState: (state: SuggestionStates) => void
    isAIAgentDraftMessage?: boolean
    messageId?: number
}

const PREVIEW_HEIGHT = 110

export default function SuggestionBody({
    text,
    actions,
    ticketId,
    state,
    setSuggestionState,
    isAIAgentDraftMessage = false,
    messageId,
}: Props) {
    const [innerRef, {height}] = useMeasure<HTMLDivElement>()

    useEffect(() => {
        if (state || height === 0) return

        if (height < PREVIEW_HEIGHT) {
            setSuggestionState('expand')
        } else {
            setSuggestionState('preview')
        }
    }, [height, setSuggestionState, state])

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
            return <div dangerouslySetInnerHTML={{__html: text}} />

        return text
    }, [text])

    return (
        <Collapse
            className={css.container}
            isOpen={state === 'expand'}
            style={style}
        >
            <div ref={innerRef}>
                <div className={css.text}>{content}</div>
                {isAIAgentDraftMessage && !!messageId && (
                    <AIAgentUsedData messageId={messageId} />
                )}

                <div>
                    {actions?.map((action, index) => {
                        return (
                            <TicketReplyAction
                                key={action.name + 'suggestion'}
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
        </Collapse>
    )
}
