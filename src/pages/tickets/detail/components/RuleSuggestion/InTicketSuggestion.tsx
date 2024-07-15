import React, {useState, useEffect} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import {setInTicketSuggestionState} from 'state/ticket/actions'
import Button from 'pages/common/components/button/Button'
import {MacroAction} from 'models/macroAction/types'
import useAppDispatch from 'hooks/useAppDispatch'
import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionHeader from './SuggestionHeader'
import SuggestionBody from './SuggestionBody'

import css from './InTicketSuggestion.less'

type Props = {
    ticketId: number
    text?: string
    macroActions?: MacroAction[]
    isCollapsed?: boolean
    actionsContent: React.ReactNode
    infoContent: React.ReactNode
    isAIAgentDraftMessage?: boolean
    messageId?: number
}

export type SuggestionStates = 'collapse' | 'expand' | 'preview' | null

export default function InTicketSuggestion({
    ticketId,
    isCollapsed,
    text,
    macroActions,
    actionsContent,
    infoContent,
    isAIAgentDraftMessage = false,
    messageId,
}: Props) {
    const dispatch = useAppDispatch()
    const [suggestionState, setSuggestionState] =
        useState<SuggestionStates>(null)
    const {isFocused} = useAppSelector((state) => state.ui.editor)
    const isPartialUpdating = useAppSelector(
        (state) =>
            state.ticket.getIn(['_internal', 'isPartialUpdating']) as boolean
    )

    useEffect(() => {
        if (suggestionState === null) {
            dispatch(setInTicketSuggestionState('pending'))
        } else if (suggestionState === 'collapse') {
            dispatch(setInTicketSuggestionState('ignored'))
        }
    }, [suggestionState, dispatch])

    const [headerRef, {height: headerHeight}] = useMeasure<HTMLDivElement>()
    useEffect(() => {
        if (isFocused || isPartialUpdating) setSuggestionState('collapse')
    }, [isFocused, isPartialUpdating])

    useEffect(() => {
        if (isCollapsed) setSuggestionState('collapse')
    }, [isCollapsed])

    if (!text && !macroActions?.length) return null

    return (
        <InTicketSuggestionContainer isAIAgent={isAIAgentDraftMessage}>
            <SuggestionHeader
                onChevronToggle={() =>
                    setSuggestionState((state) =>
                        state === 'collapse' ? 'expand' : 'collapse'
                    )
                }
                infoContent={infoContent}
                innerRef={headerRef}
                state={suggestionState}
                actionsContent={actionsContent}
                isAIAgent={isAIAgentDraftMessage}
            />

            <SuggestionBody
                state={suggestionState}
                actions={macroActions}
                __html={text}
                ticketId={ticketId}
                setSuggestionState={setSuggestionState}
                isAIAgentDraftMessage={isAIAgentDraftMessage}
                messageId={messageId}
            />

            {suggestionState === 'preview' ? (
                <FadeLayer
                    onClick={() => setSuggestionState('expand')}
                    gradientStart={headerHeight}
                />
            ) : null}
        </InTicketSuggestionContainer>
    )
}

function FadeLayer({
    gradientStart,
    onClick,
}: {
    gradientStart: number
    onClick: () => void
}) {
    return (
        <div
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) ${gradientStart}px, rgba(255, 255, 255, 1) 100%)`,
            }}
            className={css.fadeLayer}
        >
            <div onClick={onClick} className={css.expandButton}>
                <Button fillStyle="ghost" intent="secondary">
                    Expand
                    <i className="material-icons-round">expand_more</i>
                </Button>
            </div>
        </div>
    )
}
