import React, { useEffect, useState } from 'react'

import { useMeasure } from '@repo/hooks'

import { Button } from '@gorgias/axiom'

import { useTheme } from 'core/theme'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { MacroAction } from 'models/macroAction/types'
import { TicketMessage } from 'models/ticket/types'
import { setInTicketSuggestionState } from 'state/ticket/actions'

import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionBody from './SuggestionBody'
import SuggestionHeader from './SuggestionHeader'

import css from './InTicketSuggestion.less'

type Props = {
    ticketId: number
    text?: string | React.ReactNode
    macroActions?: MacroAction[]
    isCollapsed?: boolean
    actionsContent: React.ReactNode
    infoContent: React.ReactNode
    isAIAgentDraftMessage?: boolean
    message?: TicketMessage
    messages?: TicketMessage[]
    hideExpandButton?: boolean
    isTrialMessage?: boolean
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
    message,
    messages,
    hideExpandButton = false,
    isTrialMessage,
}: Props) {
    const dispatch = useAppDispatch()
    const [suggestionState, setSuggestionState] =
        useState<SuggestionStates>(null)
    const { isFocused } = useAppSelector((state) => state.ui.editor)
    const isPartialUpdating = useAppSelector(
        (state) =>
            state.ticket.getIn(['_internal', 'isPartialUpdating']) as boolean,
    )

    useEffect(() => {
        if (suggestionState === null) {
            dispatch(setInTicketSuggestionState('pending'))
        } else if (suggestionState === 'collapse') {
            dispatch(setInTicketSuggestionState('ignored'))
        }
    }, [suggestionState, dispatch])

    const [headerRef, { height: headerHeight }] = useMeasure<HTMLDivElement>()
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
                        state === 'expand' ? 'collapse' : 'expand',
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
                text={text}
                ticketId={ticketId}
                setSuggestionState={setSuggestionState}
                isAIAgentDraftMessage={isAIAgentDraftMessage}
                message={message}
                messages={messages}
                isTrialMessage={isTrialMessage}
            />
            {suggestionState === 'preview' ? (
                <FadeLayer
                    onClick={() => setSuggestionState('expand')}
                    isAIAgentDraftMessage={isAIAgentDraftMessage}
                    gradientStart={headerHeight}
                    hideExpandButton={hideExpandButton}
                />
            ) : null}
        </InTicketSuggestionContainer>
    )
}

function FadeLayer({
    gradientStart,
    isAIAgentDraftMessage,
    onClick,
    hideExpandButton,
}: {
    gradientStart: number
    isAIAgentDraftMessage: boolean
    onClick: () => void
    hideExpandButton: boolean
}) {
    const theme = useTheme()

    return (
        <div
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) ${gradientStart}px, ${
                    theme.tokens.Neutral.Grey_0.value ?? '#fff'
                } 100%)`,
            }}
            className={css.fadeLayer}
        >
            {!hideExpandButton && (
                <div onClick={onClick} className={css.expandButton}>
                    <Button
                        fillStyle="ghost"
                        intent={isAIAgentDraftMessage ? `primary` : `secondary`}
                    >
                        Expand
                        <i className="material-icons-round">expand_more</i>
                    </Button>
                </div>
            )}
        </div>
    )
}
