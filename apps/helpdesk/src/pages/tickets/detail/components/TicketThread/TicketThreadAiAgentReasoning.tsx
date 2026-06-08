import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { TicketThreadAiAgentReasoningParams } from '@repo/ticket-thread/legacy-bridge'

import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { useGetEarliestExecution } from 'models/knowledgeService/queries'
import type { TicketMessage } from 'models/ticket/types'
import {
    getAiAgentReasoningDisplayMode,
    getShouldTicketHaveReasoning,
} from 'pages/tickets/detail/components/TicketMessages/aiAgentReasoningDisplay'
import { AiAgentReasoningHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AiAgentReasoningHelpdeskV2'
import SimplifiedAIAgentBanner from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner'

export function TicketThreadAiAgentReasoning({
    message,
}: TicketThreadAiAgentReasoningParams) {
    const showAiReasoning = useFlag(FeatureFlagKey.ShowAiReasoningInTicket)
    const onlyShowReasoningWhileImpersonating = useFlag(
        FeatureFlagKey.OnlyShowReasoningWhileImpersonating,
    )
    const isTicketAfterFeedbackCollectionPeriod =
        useTicketIsAfterFeedbackCollectionPeriod()
    const { data: earliestExecution } = useGetEarliestExecution({
        refetchOnWindowFocus: false,
        cacheTime: Duration.hours(1),
        staleTime: Infinity,
    })

    const isImpersonated = useMemo(() => isSessionImpersonated(), [])
    const shouldTicketHaveReasoning = getShouldTicketHaveReasoning({
        earliestExecution,
        messageCreatedDatetime: message.created_datetime,
    })
    const displayMode = getAiAgentReasoningDisplayMode({
        isAIAgentMessage: true,
        isInternalNote: false,
        isTicketAfterFeedbackCollectionPeriod,
        shouldTicketHaveReasoning,
        showAiReasoning,
        onlyShowReasoningWhileImpersonating,
        isImpersonated,
        messageId: message.id,
        messageVia: message.via,
    })

    const legacyMessage = message as unknown as TicketMessage

    if (displayMode === 'reasoning') {
        return <AiAgentReasoningHelpdeskV2 message={legacyMessage} />
    }

    if (displayMode === 'simplified-banner') {
        return (
            <SimplifiedAIAgentBanner
                message={legacyMessage}
                messages={[legacyMessage]}
            />
        )
    }

    return null
}
