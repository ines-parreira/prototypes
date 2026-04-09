import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'

import type { TicketMessage } from 'models/ticket/types'

import InTicketSuggestion from '../RuleSuggestion/InTicketSuggestion'
import { useAiAgentDraftMessage } from './useAiAgentDraftMessage'

import css from './AIAgentDraftMessage.less'

export type Props = {
    ticketId: number
    message: TicketMessage
    isTrial?: boolean
}

/**
 * The Helpdesk V2 version of this component is located in
 * AiAgentDraftMessageHelpdeskV2.tsx. Please update the Helpdesk V2 version if
 * you make any changes to this component.
 */
const AIAgentDraftMessage = ({ ticketId, message, isTrial }: Props) => {
    const {
        draftMessage,
        executionId,
        feedback,
        handleCopyToEditor,
        isLoading,
        summary,
    } = useAiAgentDraftMessage({
        ticketId,
        message,
        isTrial,
    })

    if (isLoading) {
        return (
            <InTicketSuggestion
                isAIAgentDraftMessage
                ticketId={ticketId}
                message={message}
                actionsContent={<></>}
                infoContent={
                    <div className={css.skeletonWrapper}>
                        <Skeleton height={20} width="60%" />
                        <Skeleton height={20} width="40%" />
                    </div>
                }
                text={
                    <div className={css.skeletonWrapper}>
                        {Array.from({ length: 10 })
                            .fill(null)
                            .map((_, index) => (
                                <Skeleton
                                    key={index}
                                    height={20}
                                    width="100%"
                                />
                            ))}
                    </div>
                }
                hideExpandButton
            />
        )
    }

    if (!feedback || !draftMessage) {
        return null
    }

    return (
        <InTicketSuggestion
            isAIAgentDraftMessage
            ticketId={ticketId}
            message={message}
            actionsContent={
                <Button
                    intent="primary"
                    size="small"
                    onClick={handleCopyToEditor}
                >
                    Copy to Editor
                </Button>
            }
            infoContent={
                <div
                    dangerouslySetInnerHTML={{
                        __html: summary,
                    }}
                />
            }
            text={draftMessage.content || ''}
            macroActions={draftMessage.ticketActions || []}
            isTrialMessage={isTrial}
            executionId={executionId}
        />
    )
}

export default AIAgentDraftMessage
