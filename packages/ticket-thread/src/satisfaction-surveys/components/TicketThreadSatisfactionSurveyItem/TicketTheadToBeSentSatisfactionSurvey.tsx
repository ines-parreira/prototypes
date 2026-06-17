import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import type { TicketThreadSatisfactionSurveyItemByStatus } from '#satisfaction-surveys/types'

type TicketThreadToBeSentSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItemByStatus<'to-be-sent'>
}

export function TicketThreadToBeSentSatisfactionSurvey({
    item,
}: TicketThreadToBeSentSatisfactionSurveyProps) {
    return (
        <TicketThreadEventContainer>
            <Icon name="star" size="sm" />
            <Text size="sm">
                CSAT review to be sent to {item.data.authorLabel}
            </Text>
        </TicketThreadEventContainer>
    )
}
