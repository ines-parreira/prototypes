import React from 'react'

import {AutoQA} from 'auto_qa'
import AIAgentFeedbackBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar'
import TicketListInfo from 'ticket-list-view/components/TicketListInfo'

import useHasAIAgent from './hooks/useHasAIAgent'
import useHasAutoQA from './hooks/useHasAutoQA'
import css from './TicketFeedback.less'

export default function TicketFeedback() {
    const hasAIAgent = useHasAIAgent()
    const hasAutoQA = useHasAutoQA()

    return (
        <div className={css.container}>
            {!hasAutoQA && !hasAIAgent && (
                <TicketListInfo
                    text="Unauthorized"
                    subText="You do not have permission to view ticket feedback."
                />
            )}
            {hasAutoQA && <AutoQA />}
            {hasAutoQA && hasAIAgent && <div className={css.lineSeparator} />}
            {hasAIAgent && <AIAgentFeedbackBar />}
        </div>
    )
}
