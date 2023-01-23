import React, {useState, useEffect} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import classnames from 'classnames'
import {useMeasure} from 'react-use'
import {assetsUrl} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import {Ticket} from 'models/ticket/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {MacroAction} from 'models/macroAction/types'

import SuggestionHeader from './SuggestionHeader'
import SuggestionBody from './SuggestionBody'

import css from './InTicketSuggestion.less'

type Props = {
    ticket: Ticket
    text?: string
    actions?: MacroAction[]
    isCollapsed?: boolean
    header: React.ReactNode
}

export type SuggestionStates = 'collapse' | 'expand' | 'preview' | null

export default function InTicketSuggestion({
    ticket,
    isCollapsed,
    text,
    actions,
    header,
}: Props) {
    const [suggestionState, setSuggestionState] =
        useState<SuggestionStates>(null)
    const {isFocused} = useAppSelector((state) => state.ui.editor)
    const isPartialUpdating = useAppSelector(
        (state) =>
            state.ticket.getIn(['_internal', 'isPartialUpdating']) as boolean
    )
    const isVirtualizationEnabled =
        useFlags()[FeatureFlagKey.TicketMessagesVirtualization]

    const [headerRef, {height: headerHeight}] = useMeasure<HTMLDivElement>()
    useEffect(() => {
        if (isFocused || isPartialUpdating) setSuggestionState('collapse')
    }, [isFocused, isPartialUpdating])

    useEffect(() => {
        if (isCollapsed) setSuggestionState('collapse')
    }, [isCollapsed])

    if (!text && !actions?.length) return null

    return (
        <div
            className={classnames(css.container, {
                [css.isVirtualized]: isVirtualizationEnabled,
            })}
        >
            <div className={css.avatar}>
                <Avatar
                    name="Gorgias Tips"
                    size={36}
                    url={assetsUrl('/img/icons/gorgias-icon-logo-white.png')}
                />
            </div>

            <SuggestionHeader
                onChevronToggle={() =>
                    setSuggestionState((state) =>
                        state === 'collapse' ? 'expand' : 'collapse'
                    )
                }
                innerRef={headerRef}
                state={suggestionState}
                content={header}
            />

            <SuggestionBody
                state={suggestionState}
                actions={actions}
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
        </div>
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
