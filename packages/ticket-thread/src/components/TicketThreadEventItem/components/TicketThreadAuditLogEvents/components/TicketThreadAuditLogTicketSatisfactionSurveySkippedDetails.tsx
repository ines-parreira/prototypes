import { Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'

type TicketThreadAuditLogTicketSatisfactionSurveySkippedDetailsProps = {
    item: TicketThreadAuditLogEventByType<'ticket-satisfaction-survey-skipped'>
}

export function TicketThreadAuditLogTicketSatisfactionSurveySkippedDetails({
    item,
}: TicketThreadAuditLogTicketSatisfactionSurveySkippedDetailsProps) {
    const event = item.data
    const reasons = event.data?.reasons ?? []

    if (reasons.length === 0) {
        return null
    }

    return (
        <TicketThreadEventContainer>
            <Text size="sm" variant="medium">
                Missing requirements:
            </Text>
            {reasons.map((reason) => (
                <Text key={reason} size="sm">
                    - {reason}
                </Text>
            ))}
        </TicketThreadEventContainer>
    )
}
