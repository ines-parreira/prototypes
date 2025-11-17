import type { Ref } from 'react'
import type React from 'react'

import type { SuggestionStates } from './InTicketSuggestion'

import css from './SuggestionHeader.less'

type Props = {
    innerRef?: Ref<HTMLElement>
    state?: SuggestionStates
    onChevronToggle?: () => void
    actionsContent: React.ReactNode
    infoContent: React.ReactNode
    isAIAgent?: boolean
    executionId?: string
}

export default function SuggestionHeader({
    innerRef,
    state,
    onChevronToggle,
    actionsContent,
    infoContent,
    isAIAgent,
    executionId,
}: Props) {
    return (
        <header
            ref={innerRef}
            className={css.container}
            style={{ paddingBottom: !!onChevronToggle ? '8px' : 0 }}
        >
            <div className={css.infoContainer}>
                <div className={css.title}>
                    {isAIAgent ? (
                        <span className={css.aiAgentHeaderName}>AI Agent</span>
                    ) : (
                        <span>Gorgias Tips</span>
                    )}
                    <span>Only visible to you</span>
                </div>
                {infoContent}
                {isAIAgent && executionId && (
                    <div className={css.executionId}>
                        {`Execution ID: ${executionId}`}
                    </div>
                )}
            </div>
            <div className={css.actionsContainer}>{actionsContent}</div>
            {onChevronToggle && (
                <div className={css.chevron} onClick={onChevronToggle}>
                    <i className="material-icons-round">
                        {state === 'expand' ? 'expand_less' : 'expand_more'}
                    </i>
                </div>
            )}
        </header>
    )
}
