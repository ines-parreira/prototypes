import React, {useState, useEffect} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useMeasure} from 'react-use'
import useAppSelector from 'hooks/useAppSelector'
import {setInTicketSuggestionState} from 'state/ticket/actions'
import Button from 'pages/common/components/button/Button'
import {Ticket} from 'models/ticket/types'
import {MacroAction} from 'models/macroAction/types'
import useAppDispatch from 'hooks/useAppDispatch'
import InTicketSuggestionContainer from './InTicketSuggestionContainer'
import SuggestionHeader from './SuggestionHeader'
import SuggestionBody from './SuggestionBody'

import css from './InTicketSuggestion.less'

type Props = {
    ticket: Ticket
    text?: string
    macroActions?: MacroAction[]
    isCollapsed?: boolean
    actionsContent: React.ReactNode
    infoContent: React.ReactNode
}

export type SuggestionStates = 'collapse' | 'expand' | 'preview' | null

export default function InTicketSuggestion({
    ticket,
    isCollapsed,
    text,
    macroActions,
    actionsContent,
    infoContent,
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
        <InTicketSuggestionContainer>
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
            />

            <SuggestionBody
                state={suggestionState}
                actions={macroActions}
                __html={text}
                ticketId={ticket.id}
                setSuggestionState={setSuggestionState}
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
