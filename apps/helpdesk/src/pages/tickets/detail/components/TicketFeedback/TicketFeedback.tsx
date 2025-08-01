import { useCallback } from 'react'

import { AutoQA } from 'auto_qa'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import AIAgentFeedbackBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentFeedbackBar'
import AIAgentSimplifiedFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback'
import useAiAgentMessageFeedback from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useAiAgentMessageFeedback'
import { getTicketState } from 'state/ticket/selectors'
import { changeTicketMessage } from 'state/ui/ticketAIAgentFeedback'
import TicketListInfo from 'ticket-list-view/components/TicketListInfo'

import useHasAIAgent from './hooks/useHasAIAgent'

import css from './TicketFeedback.less'

export default function TicketFeedback() {
    const dispatch = useAppDispatch()
    const hasAIAgent = useHasAIAgent()
    const hasAgentPrivileges = useHasAgentPrivileges()
    const messageFeedback = useAiAgentMessageFeedback()
    const ticket = useAppSelector(getTicketState)
    const ticketId = ticket.get('id')
    const isAfterFeedbackCollectionPeriod =
        useTicketIsAfterFeedbackCollectionPeriod()
    const isSimplifiedFeedbackCollectionEnabled =
        useFlag(FeatureFlagKey.SimplifyAiAgentFeedbackCollection) &&
        isAfterFeedbackCollectionPeriod

    const handleClickBack = useCallback(() => {
        dispatch(changeTicketMessage({ message: undefined }))
    }, [dispatch])

    if (!hasAgentPrivileges && !hasAIAgent) {
        return (
            <div className={css.container}>
                <TicketListInfo
                    text="Unauthorized"
                    subText="You do not have permission to view ticket feedback."
                />
            </div>
        )
    }

    if (isSimplifiedFeedbackCollectionEnabled) {
        return <AIAgentSimplifiedFeedback key={ticketId} />
    }

    return (
        <div className={css.container}>
            {hasAgentPrivileges &&
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
            {hasAgentPrivileges && hasAIAgent && !messageFeedback && (
                <div className={css.lineSeparator} />
            )}
            {hasAIAgent && <AIAgentFeedbackBar />}
        </div>
    )
}
