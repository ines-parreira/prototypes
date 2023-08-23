import React, {Ref} from 'react'
import {SuggestionStates} from './InTicketSuggestion'
import css from './SuggestionHeader.less'

type Props = {
    innerRef?: Ref<HTMLElement>
    state?: SuggestionStates
    onChevronToggle?: () => void
    actionsContent: React.ReactNode
    infoContent: React.ReactNode
}

export default function SuggestionHeader({
    innerRef,
    state,
    onChevronToggle,
    actionsContent,
    infoContent,
}: Props) {
    return (
        <header
            ref={innerRef}
            className={css.container}
            style={{paddingBottom: !!onChevronToggle ? '8px' : 0}}
        >
            <div className={css.infoContainer}>
                <div className={css.title}>
                    <span>Gorgias Tips</span>
                    <span>Only visible to you</span>
                </div>
                {infoContent}
            </div>
            <div className={css.actionsContainer}>{actionsContent}</div>
            {onChevronToggle && (
                <div className={css.chevron} onClick={onChevronToggle}>
                    <i className="material-icons-round">
                        {state === 'preview' || state === 'expand'
                            ? 'expand_less'
                            : 'expand_more'}
                    </i>
                </div>
            )}
        </header>
    )
}
