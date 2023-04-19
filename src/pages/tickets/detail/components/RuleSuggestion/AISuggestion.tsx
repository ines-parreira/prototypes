import {fromJS} from 'immutable'
import React, {useState} from 'react'
import {Modifier} from 'draft-js'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Ticket} from 'models/ticket/types'
import Button from 'pages/common/components/button/Button'
import {setMeta, setResponseText} from 'state/newMessage/actions'
import {textToHTML} from 'utils/html'
import {getNewMessageContentState} from 'state/newMessage/selectors'

import InTicketSuggestion from './InTicketSuggestion'
import css from './RuleSuggestion.less'

type Props = {
    ticket: Ticket
    isCollapsed?: boolean
}

type AISuggestionData = {
    body_text: string
}

export default function AISuggestion({ticket, isCollapsed: collapsed}: Props) {
    const dispatch = useAppDispatch()
    const [isCollapsed, setCollapsed] = useState(collapsed)
    let contentState = useAppSelector(getNewMessageContentState)

    const suggestion = ticket.meta?.['ai_suggestion'] as AISuggestionData
    if (!suggestion) return null

    contentState = Modifier.replaceText(
        contentState,
        contentState.getSelectionAfter(),
        suggestion.body_text
    )

    const header = (
        <>
            <div className={css.infoContainer}>
                <div className={css.title}>
                    <span>Gorgias Tips</span>
                    <span>Only visible to you</span>
                </div>
                <div className={css.info}>
                    <span>Gorgias AI wrote a suggested answer for you!</span>
                </div>
            </div>
            <div className={css.buttonsContainer}>
                <div className={css.buttons}>
                    <Button
                        size="small"
                        onClick={() => {
                            setCollapsed(true)
                            dispatch(
                                setResponseText(
                                    fromJS({
                                        contentState: contentState,
                                        forceFocus: true,
                                        forceUpdate: true,
                                    })
                                )
                            )
                            dispatch(setMeta({ai_suggestion: true}))
                        }}
                    >
                        Copy suggestion & Edit
                    </Button>
                </div>
            </div>
        </>
    )

    return (
        <InTicketSuggestion
            ticket={ticket}
            isCollapsed={isCollapsed}
            text={textToHTML(suggestion.body_text)}
            header={header}
        />
    )
}
