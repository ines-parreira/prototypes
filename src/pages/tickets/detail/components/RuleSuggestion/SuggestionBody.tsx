import React, {useEffect, CSSProperties} from 'react'
import {fromJS} from 'immutable'
import {Collapse} from 'reactstrap'
import TicketReplyAction from 'pages/tickets/detail/components/ReplyArea/TicketReplyAction'
import {MacroAction} from 'models/macroAction/types'
import useMeasure from 'hooks/useMeasure'
import css from './SuggestionBody.less'
import {SuggestionStates} from './InTicketSuggestion'

type Props = {
    __html?: string
    actions?: MacroAction[]
    ticketId: number
    state: SuggestionStates
    setSuggestionState: (state: SuggestionStates) => void
}

const PREVIEW_HEIGHT = 175

export default function SuggestionBody({
    __html,
    actions,
    ticketId,
    state,
    setSuggestionState,
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

    return (
        <Collapse
            className={css.container}
            isOpen={state === 'expand'}
            style={style}
        >
            <div ref={innerRef}>
                <div className={css.text}>
                    {__html ? (
                        <div dangerouslySetInnerHTML={{__html}} />
                    ) : (
                        '(No reply will be sent)'
                    )}
                </div>

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
