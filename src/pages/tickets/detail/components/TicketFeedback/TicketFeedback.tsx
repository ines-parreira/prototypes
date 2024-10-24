import React, {useCallback} from 'react'

import {AutoQA} from 'auto_qa'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import AIAgentFeedbackBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar'
import useAiAgentMessageFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback'
import {changeTicketMessage} from 'state/ui/ticketAIAgentFeedback'
import TicketListInfo from 'ticket-list-view/components/TicketListInfo'

import useHasAIAgent from './hooks/useHasAIAgent'
import useHasAutoQA from './hooks/useHasAutoQA'
import css from './TicketFeedback.less'

export default function TicketFeedback() {
    const dispatch = useAppDispatch()
    const hasAIAgent = useHasAIAgent()
    const hasAutoQA = useHasAutoQA()
    const messageFeedback = useAiAgentMessageFeedback()

    const handleClickBack = useCallback(() => {
        dispatch(changeTicketMessage({message: undefined}))
    }, [dispatch])

    return (
        <div className={css.container}>
            {!hasAutoQA && !hasAIAgent && (
                <TicketListInfo
                    text="Unauthorized"
                    subText="You do not have permission to view ticket feedback."
                />
            )}
            {hasAutoQA &&
                (messageFeedback ? (
                    <div className={css.back}>
                        <Button
                            className={css.backButton}
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={handleClickBack}
                        >
                            <ButtonIconLabel
                                iconClassName="material-icons-round"
                                icon="arrow_back"
                            >
                                Back
                            </ButtonIconLabel>
                        </Button>
                    </div>
                ) : (
                    <AutoQA />
                ))}
            {hasAutoQA && hasAIAgent && !messageFeedback && (
                <div className={css.lineSeparator} />
            )}
            {hasAIAgent && <AIAgentFeedbackBar />}
        </div>
    )
}
